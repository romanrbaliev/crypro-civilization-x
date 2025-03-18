import { GameState } from '../types';
import { initialState } from '../initialState';
import { saveGameToServer, loadGameFromServer, checkSupabaseConnection, clearAllSavedDataForAllUsers } from '@/api/gameDataService';
import { safeDispatchGameEvent } from './eventBusUtils';
import { toast } from '@/hooks/use-toast';

// Сохранение состояния игры только в серверном хранилище
export async function saveGameState(state: GameState): Promise<boolean> {
  try {
    console.log('🔄 Сохранение игры в облачное хранилище...');
    
    // Проверка подключения к Supabase перед сохранением
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.warn('⚠️ Нет соединения с сервером, сохранение невозможно');
      toast({
        title: "Ошибка соединения",
        description: "Нет соединения с сервером. Проверьте подключение к интернету.",
        variant: "destructive",
      });
      safeDispatchGameEvent(
        "Нет соединения с сервером. Проверьте подключение к интернету.",
        "error"
      );
      return false;
    }
    
    // Обновляем timestamp перед сохранением
    const stateToSave = {
      ...state,
      lastSaved: Date.now()
    };
    
    // Сохраняем через gameDataService
    const saved = await saveGameToServer(stateToSave);
    
    if (saved) {
      console.log('✅ Игра успешно сохранена в облаке');
      return true;
    } else {
      console.warn('⚠️ Возникли проблемы при сохранении игры в облаке');
      safeDispatchGameEvent(
        "Не удалось сохранить прогресс в облаке",
        "warning"
      );
      return false;
    }
  } catch (error) {
    console.error('❌ Критическая ошибка при сохранении состояния игры:', error);
    
    safeDispatchGameEvent(
      "Произошла ошибка при сохранении. Проверьте подключение к интернету.",
      "error"
    );
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
      
      // Проверяем целостность загруженных данных
      if (!loadedState.resources || !loadedState.buildings || !loadedState.upgrades) {
        console.warn('⚠️ Загруженные данные повреждены, выполняем восстановление...');
        safeDispatchGameEvent(
          "Загруженные данные повреждены, выполняем восстановле��ие",
          "warning"
        );
        
        // Восстанавливаем недостающие данные из initialState
        const restoredState = {
          ...initialState,
          ...loadedState,
          resources: { ...initialState.resources, ...(loadedState.resources || {}) },
          buildings: { ...initialState.buildings, ...(loadedState.buildings || {}) },
          upgrades: { ...initialState.upgrades, ...(loadedState.upgrades || {}) },
          unlocks: { ...initialState.unlocks, ...(loadedState.unlocks || {}) },
          specializationSynergies: { ...initialState.specializationSynergies, ...(loadedState.specializationSynergies || {}) },
          counters: { ...initialState.counters, ...(loadedState.counters || {}) },
          eventMessages: { ...initialState.eventMessages, ...(loadedState.eventMessages || {}) }
        };
        
        // Обновляем timestamp последнего обновления
        restoredState.lastUpdate = Date.now();
        restoredState.lastSaved = Date.now();
        
        return restoredState;
      }
      
      // Проверка и добавление новых полей, которых могло не быть в сохранении
      if (!loadedState.specializationSynergies) {
        loadedState.specializationSynergies = { ...initialState.specializationSynergies };
        console.log('✅ Добавлены отсутствующие данные о синергиях специализаций');
      }

      // Проверка и инициализация реферальных систем
      if (!loadedState.referrals) {
        loadedState.referrals = [];
        console.log('✅ Инициализирован пустой массив рефералов');
      }
      
      if (!loadedState.referralHelpers) {
        loadedState.referralHelpers = [];
        console.log('✅ Инициализирован пустой массив помощников');
      }
      
      // Проверка наличия счетчиков
      if (!loadedState.counters) {
        loadedState.counters = { ...initialState.counters };
        console.log('✅ Добавлены отсутствующие счетчики');
      }
      
      // Проверка наличия событий
      if (!loadedState.eventMessages) {
        loadedState.eventMessages = { ...initialState.eventMessages };
        console.log('✅ Добавлены отсутствующие сообщения о событиях');
      }
      
      // Обновляем timestamp последнего обновления
      loadedState.lastUpdate = Date.now();
      
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
export async function clearAllSavedDataForAllUsers(): Promise<void> {
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
