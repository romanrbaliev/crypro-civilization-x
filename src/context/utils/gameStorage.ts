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
const isTelegramCloudStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined') {
      console.log('window не определен, Telegram недоступен');
      return false;
    }
    
    if (!window.Telegram) {
      console.log('window.Telegram недоступен');
      return false;
    }
    
    if (!window.Telegram.WebApp) {
      console.log('window.Telegram.WebApp недоступен');
      return false;
    }
    
    if (!window.Telegram.WebApp.CloudStorage) {
      console.log('window.Telegram.WebApp.CloudStorage недоступен');
      return false;
    }
    
    const hasGetItem = typeof window.Telegram.WebApp.CloudStorage.getItem === 'function';
    const hasSetItem = typeof window.Telegram.WebApp.CloudStorage.setItem === 'function';
    
    if (!hasGetItem || !hasSetItem) {
      console.log(`Методы CloudStorage недоступны: getItem=${hasGetItem}, setItem=${hasSetItem}`);
      return false;
    }
    
    console.log('Telegram CloudStorage полностью доступен!');
    return true;
  } catch (error) {
    console.error('Ошибка при проверке доступности Telegram CloudStorage:', error);
    return false;
  }
};

// Обертка для сохранения данных
const saveItem = async (key: string, value: string): Promise<void> => {
  try {
    // Сначала пробуем Telegram Cloud Storage, если доступен
    if (isTelegramCloudStorageAvailable()) {
      try {
        console.log('Попытка сохранения в Telegram CloudStorage...');
        await window.Telegram.WebApp.CloudStorage.setItem(key, value);
        console.log('Данные успешно сохранены в Telegram CloudStorage');
        return;
      } catch (telegramError) {
        console.error('Не удалось сохранить в Telegram CloudStorage:', telegramError);
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
        console.log('Попытка получения данных из Telegram CloudStorage...');
        const telegramData = await window.Telegram.WebApp.CloudStorage.getItem(key);
        console.log('Получены данные из Telegram CloudStorage:', telegramData ? 'данные есть' : 'данных нет');
        if (telegramData !== null && telegramData !== '') {
          return telegramData;
        }
      } catch (telegramError) {
        console.error('Не удалось получить данные из Telegram CloudStorage:', telegramError);
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
    console.log(`Сохранение игры (размер данных: ${serializedState.length} байт)`);
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
    console.log('Попытка загрузки игры...');
    const serializedState = await getItem(GAME_STORAGE_KEY);
    if (serializedState === null || serializedState === '') {
      console.log('Сохранение не найдено, начинаем новую игру');
      return null;
    }
    
    const loadedState = JSON.parse(serializedState) as GameState;
    console.log('Загружено состояние игры, слияние с начальным состоянием...');
    
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
        console.log('Удаление сохранения из Telegram CloudStorage...');
        await window.Telegram.WebApp.CloudStorage.removeItem(GAME_STORAGE_KEY);
        console.log('Сохранение удалено из Telegram CloudStorage');
      } catch (telegramError) {
        console.warn('Не удалось удалить из Telegram CloudStorage:', telegramError);
      }
    }
    
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(GAME_STORAGE_KEY);
      console.log('Сохранение удалено из localStorage');
    }
    
    delete memoryStorage[GAME_STORAGE_KEY];
    console.log('Сохранение игры удалено');
  } catch (error) {
    console.error('Не удалось удалить сохранение игры:', error);
  }
}
