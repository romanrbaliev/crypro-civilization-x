import { GameState } from '../types';
import { initialState } from '../initialState';
import { saveGameToServer, loadGameFromServer, checkSupabaseConnection } from '@/api/gameDataService';
import { safeDispatchGameEvent } from './eventBusUtils';
import { toast } from '@/hooks/use-toast';
import { syncHelperDataWithGameState } from '@/api/referral/referralHelpers';
import { getUserIdentifier } from '@/api/gameDataService';

// Сохранение состояния игры только в серверном хранилище
export async function saveGameState(state: GameState): Promise<boolean> {
  try {
    console.log('🔄 Сохранение игры в облачное хранилище...');
    
    // Проверка подключения к Supabase перед сохранением, но даже при ошибке пытаемся сохранить
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.warn('⚠️ Возможны проблемы с соединением, но пытаемся сохранить');
      // Не показываем уведомление об ошибке, чтобы не беспокоить пользователя
    }
    
    // Убеждаемся что флаг gameStarted установлен
    const stateToSave = {
      ...state,
      gameStarted: true,
      lastSaved: Date.now()
    };
    
    // Сохраняем через gameDataService
    const saved = await saveGameToServer(stateToSave);
    
    if (saved) {
      console.log('✅ Игра успешно сохранена в облаке');
      return true;
    } else {
      console.warn('⚠️ Возникли проблемы при сохранении игры в облаке, но продолжаем игру');
      // Ограничиваем частоту показа уведомлений об ошибках сохранения
      const now = Date.now();
      const lastErrorTime = window.__lastSaveErrorTime || 0;
      
      // Показываем уведомление не чаще чем раз в 5 минут
      if (now - lastErrorTime > 5 * 60 * 1000) {
        window.__lastSaveErrorTime = now;
        safeDispatchGameEvent(
          "Возникли проблемы при сохранении прогресса в облаке. Это не повлияет на игру.",
          "warning"
        );
      }
      
      return false;
    }
  } catch (error) {
    console.warn('⚠️ Ошибка при сохранении состояния игры, но продолжаем игру:', error);
    return false;
  }
}

// Загрузка состояния игры только из серверного хранилища
export async function loadGameState(): Promise<GameState | null> {
  try {
    console.log('🔄 Начинаем загрузку сохраненной игры из облака...');
    
    // Проверка подключения к Supabase перед загрузкой
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.warn('⚠️ Нет соединения с сервером, загрузка невозможна');
      safeDispatchGameEvent(
        "Нет соединения с сервером. Проверьте подключение к интернету.",
        "error"
      );
      return null;
    }
    
    // Загружаем через gameDataService
    const loadedState = await loadGameFromServer();
    
    if (loadedState) {
      console.log(`✅ Игра успешно загружена из облака (lastSaved: ${new Date(loadedState.lastSaved || 0).toLocaleTimeString() || 'не задано'})`);
      
      // После загрузки состояния игры, синхронизируем данные о помощниках с базой данных
      try {
        const userId = await getUserIdentifier();
        if (userId) {
          // Создаем функцию обновления состояния специально для помощников
          const updateReferralHelpers = (helperRequests: any[]) => {
            if (loadedState && Array.isArray(helperRequests) && helperRequests.length > 0) {
              loadedState.referralHelpers = helperRequests;
              console.log(`✅ Данные помощников обновлены при загрузке игры:`, helperRequests);
            }
          };
          
          // Синхронизируем данные о помощниках
          await syncHelperDataWithGameState(userId, updateReferralHelpers);
        }
      } catch (syncError) {
        console.error('❌ Ошибка при синхронизации данных помощников при загрузке игры:', syncError);
      }
      
      return loadedState;
    }
    
    console.log('❌ Не удалось загрузить сохранение игры из облака');
    safeDispatchGameEvent(
      "Не удалось загрузить сохранение игры, начинаем новую игру",
      "info"
    );
    // Если не смогли загрузить из облака, начинаем новую игру
    return null;
  } catch (error) {
    console.error('❌ Критическая ошибка при загрузке состояния игры:', error);
    safeDispatchGameEvent(
      "Критическая ошибка при загрузке состояния игры, начинаем новую игру",
      "error"
    );
    // При ошибке также начинаем новую игру
    return null;
  }
}

// Удаление сохраненного состояния игры
export async function clearGameState(): Promise<void> {
  try {
    console.log('🔄 Удаление сохранения игры из облака...');
    
    // Проверка подключения к Supabase перед удалением
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.warn('⚠️ Нет соединения с сервером, удаление невозможно');
      toast({
        title: "Ошибка соединения",
        description: "Нет соединения с сервером. Проверьте подключение к интернету.",
        variant: "destructive",
      });
      return;
    }
    
    // Очищаем через gameDataService
    try {
      await import('@/api/gameDataService').then(module => {
        if (typeof module.clearAllSavedData === 'function') {
          module.clearAllSavedData();
        }
      });
      console.log('✅ Серверное сохранение запрошено на удаление');
      
      toast({
        title: "Сохранения очищены",
        description: "Все сохранения игры успешно удалены",
        variant: "success",
      });
      safeDispatchGameEvent(
        "Все сохранения игры успешно удалены",
        "success"
      );
    } catch (serviceError) {
      console.error('❌ Ошибка при обращении к сервису данных:', serviceError);
      
      toast({
        title: "Ошибка очистки",
        description: "Произошла ошибка при удалении сохранений",
        variant: "destructive",
      });
      safeDispatchGameEvent(
        "Произошла ошибка при удалении сохранений",
        "error"
      );
    }
  } catch (error) {
    console.error('❌ Не удалось удалить сохранение игры:', error);
    safeDispatchGameEvent(
      "Не удалось удалить сохранение игры",
      "error"
    );
  }
}

// Удаление всех сохранений для всех пользователей
export async function resetAllGameData(): Promise<void> {
  try {
    console.log('🔄 Удаление ВСЕХ сохранений игры из облака...');
    
    // Проверка подключения к Supabase перед удалением
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.warn('⚠️ Нет соединения с сервером, удаление невозможно');
      toast({
        title: "Ошибка соединения",
        description: "Нет соединения с сервером. Проверьте подключение к интернету.",
        variant: "destructive",
      });
      return;
    }
    
    // Очищаем все сохранения через gameDataService
    await import('@/api/gameDataService').then(module => {
      if (typeof module.clearAllSavedDataForAllUsers === 'function') {
        module.clearAllSavedDataForAllUsers();
      }
    });
    console.log('✅ Запрос на удаление ВСЕХ сохранений отправлен');
    
    toast({
      title: "Все сохранения очищены",
      description: "Все сохранения игры для всех пользователей успешно удалены",
      variant: "success",
    });
    safeDispatchGameEvent(
      "Все сохранения игры для всех пользователей успешно удалены",
      "success"
    );
  } catch (error) {
    console.error('❌ Не удалось удалить все сохранения игры:', error);
    safeDispatchGameEvent(
      "Не удалось удалить все сохранения игры",
      "error"
    );
  }
}

// Объявление глобальной переменной для контроля частоты ошибок
declare global {
  interface Window {
    __lastSaveErrorTime?: number;
  }
}
