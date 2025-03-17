
import { GameState } from '../types';
import { initialState } from '../initialState';
import { isTelegramCloudStorageAvailable, forceTelegramCloudSave, forceTelegramCloudLoad } from '@/utils/helpers';

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

// Обертка для сохранения данных с ретраями для Telegram
const saveItem = async (key: string, value: string, retries = 3): Promise<boolean> => {
  try {
    console.log(`🔄 Попытка сохранения игры (размер: ${value.length} байт)...`);
    
    // Сначала пробуем Telegram Cloud Storage, если доступен
    if (isTelegramCloudStorageAvailable()) {
      try {
        console.log('🔄 Сохранение в Telegram CloudStorage...');
        const saved = await forceTelegramCloudSave(value, key);
        
        if (saved) {
          console.log('✅ Данные успешно сохранены в Telegram CloudStorage');
          // Дублируем в localStorage для резервного копирования
          if (isLocalStorageAvailable()) {
            try {
              localStorage.setItem(key, value);
              console.log('✅ Данные также дублированы в localStorage');
            } catch (e) {
              console.warn('⚠️ Не удалось дублировать в localStorage:', e);
            }
          }
          return true;
        } else if (retries > 0) {
          console.warn(`⚠️ Не удалось сохранить в Telegram, повторная попытка (осталось ${retries})...`);
          // Пауза перед следующей попыткой
          await new Promise(resolve => setTimeout(resolve, 500));
          return saveItem(key, value, retries - 1);
        }
      } catch (telegramError) {
        console.error('❌ Ошибка при сохранении в Telegram CloudStorage:', telegramError);
        if (retries > 0) {
          console.warn(`⚠️ Повторная попытка сохранения (осталось ${retries})...`);
          // Пауза перед следующей попыткой
          await new Promise(resolve => setTimeout(resolve, 500));
          return saveItem(key, value, retries - 1);
        }
      }
    }
    
    // Затем пробуем localStorage
    if (isLocalStorageAvailable()) {
      try {
        localStorage.setItem(key, value);
        console.log('✅ Данные сохранены в localStorage');
        return true;
      } catch (localStorageError) {
        console.error('❌ Ошибка при сохранении в localStorage:', localStorageError);
      }
    }

    // Если ничего не работает, используем память
    memoryStorage[key] = value;
    console.log('✅ Данные сохранены в памяти (временное хранилище)');
    return true;
  } catch (error) {
    console.error('❌ Критическая ошибка при сохранении данных:', error);
    // В крайнем случае сохраняем в память
    try {
      memoryStorage[key] = value;
      console.log('✅ Данные сохранены в памяти (аварийное сохранение)');
      return true;
    } catch (e) {
      console.error('❌ Не удалось сохранить даже в память:', e);
      return false;
    }
  }
};

// Обертка для получения данных с ретраями для Telegram
const getItem = async (key: string, retries = 3): Promise<string | null> => {
  try {
    console.log(`🔄 Попытка загрузки игры (ключ: ${key})...`);
    
    // Сначала пробуем Telegram Cloud Storage, если доступен
    if (isTelegramCloudStorageAvailable()) {
      try {
        console.log('🔄 Загрузка из Telegram CloudStorage...');
        const telegramData = await forceTelegramCloudLoad(key);
        
        if (telegramData !== null && telegramData !== '') {
          console.log(`✅ Данные получены из Telegram CloudStorage (${telegramData.length} байт)`);
          
          // Дублируем в localStorage для резервного копирования
          if (isLocalStorageAvailable()) {
            try {
              localStorage.setItem(key, telegramData);
            } catch (e) {
              console.warn('⚠️ Не удалось дублировать в localStorage:', e);
            }
          }
          
          return telegramData;
        } else if (retries > 0) {
          console.warn(`⚠️ Данные из Telegram не получены, повторная попытка (осталось ${retries})...`);
          // Пауза перед следующей попыткой
          await new Promise(resolve => setTimeout(resolve, 500));
          return getItem(key, retries - 1);
        }
      } catch (telegramError) {
        console.error('❌ Ошибка при загрузке из Telegram CloudStorage:', telegramError);
        if (retries > 0) {
          console.warn(`⚠️ Повторная попытка загрузки (осталось ${retries})...`);
          // Пауза перед следующей попыткой
          await new Promise(resolve => setTimeout(resolve, 500));
          return getItem(key, retries - 1);
        }
      }
    }
    
    // Затем пробуем localStorage
    if (isLocalStorageAvailable()) {
      try {
        const localData = localStorage.getItem(key);
        if (localData !== null && localData !== '') {
          console.log(`✅ Данные получены из localStorage (${localData.length} байт)`);
          return localData;
        }
      } catch (localStorageError) {
        console.error('❌ Ошибка при загрузке из localStorage:', localStorageError);
      }
    }

    // Если ничего не работает, используем память
    if (memoryStorage[key]) {
      console.log(`✅ Данные получены из памяти (${memoryStorage[key].length} байт)`);
      return memoryStorage[key];
    }
    
    console.log('❌ Данные не найдены ни в одном хранилище');
    return null;
  } catch (error) {
    console.error('❌ Критическая ошибка при получении данных:', error);
    
    // В крайнем случае пробуем получить из памяти
    try {
      if (memoryStorage[key]) {
        console.log('✅ Данные получены из памяти (аварийное восстановление)');
        return memoryStorage[key];
      }
    } catch (e) {
      console.error('❌ Не удалось получить даже из памяти:', e);
    }
    
    return null;
  }
};

// Сохранение состояния игры
export async function saveGameState(state: GameState): Promise<boolean> {
  try {
    // Обновляем timestamp перед сохранением
    const stateToSave = {
      ...state,
      lastSaved: Date.now() // Добавляем метку времени сохранения
    };
    
    const serializedState = JSON.stringify(stateToSave);
    console.log(`🔄 Сохранение игры (размер данных: ${serializedState.length} байт)`);
    
    const success = await saveItem(GAME_STORAGE_KEY, serializedState);
    
    if (success) {
      console.log('✅ Игра успешно сохранена:', new Date().toLocaleTimeString());
      return true;
    } else {
      console.error('❌ Не удалось сохранить игру');
      return false;
    }
  } catch (error) {
    console.error('❌ Критическая ошибка при сохранении состояния игры:', error);
    return false;
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
    console.log('🔄 Начинаем загрузку сохраненной игры...');
    const serializedState = await getItem(GAME_STORAGE_KEY);
    
    if (serializedState === null || serializedState === '') {
      console.log('❌ Сохранение не найдено, начинаем новую игру');
      return null;
    }
    
    try {
      const loadedState = JSON.parse(serializedState) as GameState;
      console.log(`✅ Загружено состояние игры (lastSaved: ${new Date(loadedState.lastSaved || 0).toLocaleTimeString() || 'не задано'})`);
      
      // Используем глубокое объединение для правильного слияния всех вложенных объектов
      const mergedState = deepMerge(initialState, loadedState);
      
      // Обновляем timestamp последнего обновления
      mergedState.lastUpdate = Date.now();
      
      console.log('✅ Игра успешно загружена:', new Date().toLocaleTimeString());
      return mergedState;
    } catch (parseError) {
      console.error('❌ Ошибка при разборе JSON данных:', parseError);
      
      // В случае ошибки парсинга, попробуем восстановить данные
      try {
        console.log('🔄 Попытка восстановления поврежденных данных...');
        
        // Удаляем возможно поврежденное сохранение
        await clearGameState();
        
        return null;
      } catch (e) {
        console.error('❌ Не удалось восстановить данные:', e);
        return null;
      }
    }
  } catch (error) {
    console.error('❌ Критическая ошибка при загрузке состояния игры:', error);
    return null;
  }
}

// Удаление сохраненного состояния игры
export async function clearGameState(): Promise<void> {
  try {
    console.log('🔄 Удаление всех сохранений игры...');
    
    if (isTelegramCloudStorageAvailable()) {
      try {
        console.log('🔄 Удаление сохранения из Telegram CloudStorage...');
        
        // Сначала проверяем наличие метаданных
        const metaDataStr = await window.Telegram.WebApp.CloudStorage.getItem(`${GAME_STORAGE_KEY}_meta`);
        
        if (metaDataStr) {
          try {
            const metaData = JSON.parse(metaDataStr);
            console.log(`Найдены метаданные для удаления: части=${metaData.total}`);
            
            // Удаляем все части
            for (let i = 0; i < metaData.total; i++) {
              await window.Telegram.WebApp.CloudStorage.removeItem(`${GAME_STORAGE_KEY}_${i}`);
              console.log(`Удалена часть ${i+1}/${metaData.total}`);
            }
            
            // Удаляем метаданные
            await window.Telegram.WebApp.CloudStorage.removeItem(`${GAME_STORAGE_KEY}_meta`);
            console.log('Метаданные удалены');
          } catch (e) {
            console.error('Ошибка при удалении частей:', e);
          }
        }
        
        // Удаляем основной ключ
        await window.Telegram.WebApp.CloudStorage.removeItem(GAME_STORAGE_KEY);
        console.log('✅ Сохранение удалено из Telegram CloudStorage');
      } catch (telegramError) {
        console.warn('⚠️ Не удалось удалить из Telegram CloudStorage:', telegramError);
      }
    }
    
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(GAME_STORAGE_KEY);
      console.log('✅ Сохранение удалено из localStorage');
    }
    
    delete memoryStorage[GAME_STORAGE_KEY];
    console.log('✅ Сохранение удалено из памяти');
    
    console.log('✅ Все сохранения игры успешно удалены');
  } catch (error) {
    console.error('❌ Не удалось удалить сохранение игры:', error);
  }
}
