
import { GameState } from '../types';
import { initialState } from '../initialState';

// Константа с именем ключа локального хранилища
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

// Резервное in-memory хранилище для сред, где localStorage недоступен
let memoryStorage: Record<string, string> = {};

// Обертка для сохранения данных
const saveItem = (key: string, value: string): void => {
  try {
    if (isLocalStorageAvailable()) {
      localStorage.setItem(key, value);
    } else {
      memoryStorage[key] = value;
    }
  } catch (error) {
    console.error('Ошибка при сохранении данных:', error);
    memoryStorage[key] = value; // Пробуем сохранить в память как запасной вариант
  }
};

// Обертка для получения данных
const getItem = (key: string): string | null => {
  try {
    if (isLocalStorageAvailable()) {
      return localStorage.getItem(key);
    } else {
      return memoryStorage[key] || null;
    }
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    return memoryStorage[key] || null; // Пробуем получить из памяти как запасной вариант
  }
};

// Сохранение состояния игры
export function saveGameState(state: GameState): void {
  try {
    const serializedState = JSON.stringify(state);
    saveItem(GAME_STORAGE_KEY, serializedState);
    console.log('Игра успешно сохранена:', new Date().toLocaleTimeString());
  } catch (error) {
    console.error('Не удалось сохранить состояние игры:', error);
  }
}

// Рекурсивное объединение объектов для корректного сохранения вложенных структур
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

// Загрузка состояния игры
export function loadGameState(): GameState | null {
  try {
    const serializedState = getItem(GAME_STORAGE_KEY);
    if (serializedState === null) {
      console.log('Сохранение не найдено, начинаем новую игру');
      return null;
    }
    
    const loadedState = JSON.parse(serializedState) as GameState;
    
    // Используем глубокое объединение для правильного слияния всех вложенных объектов
    const mergedState = deepMerge(initialState, loadedState);
    
    // Обновляем timestamp последнего обновления
    mergedState.lastUpdate = Date.now();
    
    console.log('Игра успешно загружена:', new Date().toLocaleTimeString());
    return mergedState;
  } catch (error) {
    console.error('Не удалось загрузить состояние игры:', error);
    return null;
  }
}

// Удаление сохраненного состояния игры
export function clearGameState(): void {
  try {
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(GAME_STORAGE_KEY);
    }
    delete memoryStorage[GAME_STORAGE_KEY];
    console.log('Сохранение игры удалено');
  } catch (error) {
    console.error('Не удалось удалить сохранение игры:', error);
  }
}
