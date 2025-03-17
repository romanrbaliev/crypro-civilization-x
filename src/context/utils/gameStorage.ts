
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

// Глобальное постоянное хранилище для сред, где localStorage недоступен
// Сделано глобальным для всего приложения, чтобы сохранялось даже при перезагрузках компонентов
let memoryStorage: Record<string, string> = {};

// Проверка доступности window.Telegram API и использование его хранилища
const isTelegramCloudStorageAvailable = () => {
  return window.Telegram && 
         window.Telegram.WebApp && 
         typeof window.Telegram.WebApp.CloudStorage === 'object';
};

// Обертка для сохранения данных
const saveItem = async (key: string, value: string): Promise<void> => {
  try {
    // Сначала пробуем Telegram Cloud Storage, если доступен
    if (isTelegramCloudStorageAvailable()) {
      try {
        await window.Telegram.WebApp.CloudStorage.setItem(key, value);
        console.log('Данные сохранены в Telegram CloudStorage');
        return;
      } catch (telegramError) {
        console.warn('Не удалось сохранить в Telegram CloudStorage:', telegramError);
      }
    }
    
    // Затем пробуем localStorage
    if (isLocalStorageAvailable()) {
      localStorage.setItem(key, value);
      console.log('Данные сохранены в localStorage');
      return;
    }

    // Если ничего не работает, используем память
    memoryStorage[key] = value;
    console.log('Данные сохранены в памяти');
  } catch (error) {
    console.error('Ошибка при сохранении данных:', error);
    // В крайнем случае сохраняем в память
    memoryStorage[key] = value;
  }
};

// Обертка для получения данных
const getItem = async (key: string): Promise<string | null> => {
  try {
    // Сначала пробуем Telegram Cloud Storage, если доступен
    if (isTelegramCloudStorageAvailable()) {
      try {
        const telegramData = await window.Telegram.WebApp.CloudStorage.getItem(key);
        if (telegramData !== null) {
          console.log('Данные получены из Telegram CloudStorage');
          return telegramData;
        }
      } catch (telegramError) {
        console.warn('Не удалось получить данные из Telegram CloudStorage:', telegramError);
      }
    }
    
    // Затем пробуем localStorage
    if (isLocalStorageAvailable()) {
      const localData = localStorage.getItem(key);
      if (localData !== null) {
        console.log('Данные получены из localStorage');
        return localData;
      }
    }

    // Если ничего не работает, используем память
    if (memoryStorage[key]) {
      console.log('Данные получены из памяти');
      return memoryStorage[key];
    }
    
    return null;
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    // В крайнем случае пробуем получить из памяти
    return memoryStorage[key] || null;
  }
};

// Сохранение состояния игры
export async function saveGameState(state: GameState): Promise<void> {
  try {
    const serializedState = JSON.stringify(state);
    await saveItem(GAME_STORAGE_KEY, serializedState);
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
export async function loadGameState(): Promise<GameState | null> {
  try {
    const serializedState = await getItem(GAME_STORAGE_KEY);
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
export async function clearGameState(): Promise<void> {
  try {
    if (isTelegramCloudStorageAvailable()) {
      try {
        await window.Telegram.WebApp.CloudStorage.removeItem(GAME_STORAGE_KEY);
      } catch (telegramError) {
        console.warn('Не удалось удалить из Telegram CloudStorage:', telegramError);
      }
    }
    
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(GAME_STORAGE_KEY);
    }
    
    delete memoryStorage[GAME_STORAGE_KEY];
    console.log('Сохранение игры удалено');
  } catch (error) {
    console.error('Не удалось удалить сохранение игры:', error);
  }
}
