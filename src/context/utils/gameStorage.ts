
import { GameState } from '../types';
import { initialState } from '../initialState';
import { saveGameToServer, loadGameFromServer } from '@/api/gameDataService';

// Константа с именем ключа локального хранилища (для совместимости со старыми версиями)
export const GAME_STORAGE_KEY = 'cryptoCivilizationSave';

// Проверка доступности localStorage
const isLocalStorageAvailable = () => {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.warn('localStorage недоступен, будет использовано временное хранилище:', e);
    return false;
  }
};

// Глобальное постоянное хранилище для сред, где localStorage недоступен
let memoryStorage: Record<string, string> = {};

// Глубокое слияние объектов для корректного обновления
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        typeof source[key] === 'object' && 
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        if (key in target && typeof target[key] === 'object' && target[key] !== null) {
          output[key] = deepMerge(target[key], source[key]);
        } else {
          output[key] = { ...source[key] };
        }
      } else {
        output[key] = source[key];
      }
    }
  }
  
  return output;
}

// Сохранение состояния игры
export async function saveGameState(state: GameState): Promise<boolean> {
  try {
    // Обновляем timestamp перед сохранением
    const stateToSave = {
      ...state,
      lastSaved: Date.now()
    };
    
    console.log(`🔄 Сохранение игры (размер данных: ~${JSON.stringify(stateToSave).length} байт)`);
    
    // Сохраняем через gameDataService (который сейчас использует только локальное хранилище)
    const saved = await saveGameToServer(stateToSave);
    
    if (saved) {
      console.log('✅ Игра успешно сохранена');
    } else {
      console.warn('⚠️ Возникли проблемы при сохранении игры');
    }
    
    return saved;
  } catch (error) {
    console.error('❌ Критическая ошибка при сохранении состояния игры:', error);
    return false;
  }
}

// Загрузка состояния игры
export async function loadGameState(): Promise<GameState | null> {
  try {
    console.log('🔄 Начинаем загрузку сохраненной игры...');
    
    // Загружаем через gameDataService (который сейчас использует только локальное хранилище)
    const loadedState = await loadGameFromServer();
    
    if (loadedState) {
      console.log(`✅ Игра успешно загружена (lastSaved: ${new Date(loadedState.lastSaved || 0).toLocaleTimeString() || 'не задано'})`);
      
      // Используем глубокое объединение для правильного слияния всех вложенных объектов
      const mergedState = deepMerge(initialState, loadedState);
      
      // Обновляем timestamp последнего обновления
      mergedState.lastUpdate = Date.now();
      
      return mergedState;
    }
    
    console.log('❌ Не удалось загрузить сохранение игры');
    return null;
  } catch (error) {
    console.error('❌ Критическая ошибка при загрузке состояния игры:', error);
    return null;
  }
}

// Удаление сохраненного состояния игры
export async function clearGameState(): Promise<void> {
  try {
    console.log('🔄 Удаление всех сохранений игры...');
    
    // Удаляем из localStorage, если доступен (для совместимости)
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(GAME_STORAGE_KEY);
      console.log('✅ Старое сохранение удалено из localStorage');
    }
    
    // Удаляем из памяти
    delete memoryStorage[GAME_STORAGE_KEY];
    console.log('✅ Старое сохранение удалено из памяти');
    
    // Очищаем новое локальное хранилище через gameDataService
    import('@/api/gameDataService').then(module => {
      if (typeof module.clearAllSavedData === 'function') {
        module.clearAllSavedData();
      }
    });
    
    console.log('✅ Все сохранения игры успешно удалены');
  } catch (error) {
    console.error('❌ Не удалось удалить сохранение игры:', error);
  }
}
