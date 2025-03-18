
import { GameState } from '../types';
import { initialState } from '../initialState';
import { saveGameToServer, loadGameFromServer, checkSupabaseConnection } from '@/api/gameDataService';
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
      toast({
        title: "Проблема с сохранением",
        description: "Не удалось сохранить прогресс в облаке. Проверьте подключение к интернету.",
        variant: "warning",
      });
      safeDispatchGameEvent(
        "Не удалось сохранить прогресс в облаке",
        "warning"
      );
      return false;
    }
  } catch (error) {
    console.error('❌ Критическая ошибка при сохранении состояния игры:', error);
    
    toast({
      title: "Ошибка сохранения",
      description: "Произошла ошибка при сохранении. Проверьте подключение к интернету.",
      variant: "destructive",
    });
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
      toast({
        title: "Ошибка соединения",
        description: "Нет соединения с сервером. Проверьте подключение к интернету.",
        variant: "destructive",
      });
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
          "Загруженные данные повреждены, выполняем восстановление",
          "warning"
        );
        
        // Восстанавливаем недостающие данные из initialState
        const restoredState = {
          ...initialState,
          ...loadedState,
          resources: { ...initialState.resources, ...(loadedState.resources || {}) },
          buildings: { ...initialState.buildings, ...(loadedState.buildings || {}) },
          upgrades: { ...initialState.upgrades, ...(loadedState.upgrades || {}) },
          unlocks: { ...initialState.unlocks, ...(loadedState.unlocks || {}) }
        };
        
        // Обновляем timestamp последнего обновления
        restoredState.lastUpdate = Date.now();
        
        return restoredState;
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
