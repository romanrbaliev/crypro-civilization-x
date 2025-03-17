// Форматирование чисел для отображения
export const formatNumber = (num: number): string => {
  if (num === Infinity) return "∞";
  
  if (num >= 1e12) {
    return Math.floor(num / 1e12) + "T";
  } else if (num >= 1e9) {
    return Math.floor(num / 1e9) + "B";
  } else if (num >= 1e6) {
    return Math.floor(num / 1e6) + "M";
  } else if (num >= 1e3) {
    return Math.floor(num / 1e3) + "K";
  } else if (num % 1 !== 0) {
    // Дополнительно проверяем, есть ли десятичная часть
    return num.toFixed(2);
  } else {
    return Math.floor(num).toString();
  }
};

// Расчет времени для достижения определенного значения ресурса
export const calculateTimeToReach = (
  currentValue: number,
  targetValue: number,
  perSecond: number
): string => {
  if (perSecond <= 0) return "∞";
  const seconds = (targetValue - currentValue) / perSecond;
  
  if (seconds < 60) {
    return `${Math.ceil(seconds)} сек`;
  } else if (seconds < 3600) {
    return `${Math.ceil(seconds / 60)} мин`;
  } else if (seconds < 86400) {
    return `${Math.ceil(seconds / 3600)} ч`;
  } else {
    return `${Math.ceil(seconds / 86400)} д`;
  }
};

// Импорт константы с ключом хранилища
import { GAME_STORAGE_KEY } from '@/context/utils/gameStorage';

// Функция для сохранения игры в localStorage
export const saveGame = (gameState: any) => {
  try {
    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(gameState));
    console.log('✅ Игра сохранена в localStorage через helpers.saveGame');
    return true;
  } catch (error) {
    console.error('❌ Ошибка при сохранении игры в localStorage:', error);
    return false;
  }
};

// Функция для загрузки игры из localStorage
export const loadGame = (): any | null => {
  try {
    const savedGame = localStorage.getItem(GAME_STORAGE_KEY);
    if (!savedGame) {
      console.log('❌ Сохранение не найдено в localStorage');
      return null;
    }
    
    const parsedGame = JSON.parse(savedGame);
    console.log('✅ Игра загружена из localStorage через helpers.loadGame');
    return parsedGame;
  } catch (error) {
    console.error("❌ Ошибка загрузки игры из localStorage:", error);
    return null;
  }
};

// Функция для сброса игры
export const resetGame = () => {
  try {
    localStorage.removeItem(GAME_STORAGE_KEY);
    console.log('✅ Сохранение удалено из localStorage через helpers.resetGame');
    return true;
  } catch (error) {
    console.error('❌ Ошибка при удалении сохранения из localStorage:', error);
    return false;
  }
};

// Генерация случайного ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Проверка условий для открытия нового контента
export const checkUnlockConditions = (
  resources: { [key: string]: number },
  requirements: { [key: string]: number }
): boolean => {
  for (const [resourceId, requiredAmount] of Object.entries(requirements)) {
    if (!resources[resourceId] || resources[resourceId] < requiredAmount) {
      return false;
    }
  }
  return true;
};

// Расчет эффективности производства с учетом бонусов
export const calculateEfficiency = (
  baseValue: number,
  boostPercent: number
): number => {
  return baseValue * (1 + boostPercent / 100);
};

// Функция для проверки, может ли игрок позволить себе покупку
export const canAfford = (
  resources: { [key: string]: number },
  costs: { [key: string]: number }
): boolean => {
  for (const [resourceId, cost] of Object.entries(costs)) {
    if (!resources[resourceId] || resources[resourceId] < cost) {
      return false;
    }
  }
  return true;
};

// Функция для получения следующего уровня прогресса
export const getNextMilestone = (currentScore: number, milestones: number[]): number => {
  for (const milestone of milestones) {
    if (milestone > currentScore) {
      return milestone;
    }
  }
  return Infinity;
};

// Улучшенная проверка наличия Telegram WebApp API с детальным логированием
export const isTelegramWebAppAvailable = (): boolean => {
  // Сначала проверяем, выполняется ли код в Telegram WebApp
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    // В режиме разработки можно использовать мокированный Telegram WebApp
    if (process.env.NODE_ENV === 'development' && !window.__FORCE_TELEGRAM_MODE) {
      console.log('ℹ️ Режим разработки: Telegram WebApp отключен');
      return false;
    }
    
    console.log('ВАЖНО: Telegram WebApp API обнаружен!');
    
    // Логирование информации о платформе и версии
    if (window.Telegram.WebApp.platform) {
      console.log(`Telegram платформа: ${window.Telegram.WebApp.platform}`);
    }
    
    if (window.Telegram.WebApp.version) {
      console.log(`Telegram версия: ${window.Telegram.WebApp.version}`);
    }
    
    // Проверка initData
    if (window.Telegram.WebApp.initData) {
      console.log(`Telegram initData длина: ${window.Telegram.WebApp.initData.length}`);
      
      // Проверка наличия информации о пользователе
      if (window.Telegram.WebApp.initDataUnsafe?.user) {
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        console.log(`Telegram пользователь: ID=${user.id}, имя=${user.first_name || 'неизвестно'}`);
      } else {
        console.warn('Telegram информация о пользователе отсутствует');
      }
    } else {
      console.warn('Telegram initData отсутствует или пуст');
    }
    
    // Проверка наличия CloudStorage
    if (window.Telegram.WebApp.CloudStorage) {
      console.log('Telegram CloudStorage API доступен!');
      
      // Проверка наличия методов CloudStorage
      if (typeof window.Telegram.WebApp.CloudStorage.getItem === 'function') {
        console.log('- метод getItem доступен');
      } else {
        console.warn('- метод getItem НЕДОСТУПЕН');
      }
      
      if (typeof window.Telegram.WebApp.CloudStorage.setItem === 'function') {
        console.log('- метод setItem доступен');
      } else {
        console.warn('- метод setItem НЕДОСТУПЕН');
      }
    } else {
      console.warn('Telegram CloudStorage API НЕДОСТУПЕН');
    }
    
    return true;
  }
  
  console.log('Telegram WebApp API не обнаружен - работаем в обычном браузере');
  return false;
};

// Улучшенная проверка доступности Telegram CloudStorage
export const isTelegramCloudStorageAvailable = (): boolean => {
  if (!isTelegramWebAppAvailable()) {
    console.log('Telegram WebApp недоступен, CloudStorage тоже недоступен');
    return false;
  }
  
  try {
    const hasCloudStorage = !!window.Telegram?.WebApp?.CloudStorage;
    const hasGetItem = typeof window.Telegram?.WebApp?.CloudStorage?.getItem === 'function';
    const hasSetItem = typeof window.Telegram?.WebApp?.CloudStorage?.setItem === 'function';
    
    const isAvailable = hasCloudStorage && hasGetItem && hasSetItem;
    
    if (isAvailable) {
      console.log('Telegram CloudStorage полностью ДОСТУПЕН');
    } else {
      console.warn('Telegram CloudStorage НЕ полностью доступен:', {
        hasCloudStorage,
        hasGetItem,
        hasSetItem
      });
    }
    
    return isAvailable;
  } catch (error) {
    console.error('Ошибка при проверке доступности Telegram CloudStorage:', error);
    return false;
  }
};

// Кэш для хранения статуса текущих операций сохранения
const cloudSaveOperations: Record<string, boolean> = {};

// Принудительное сохранение в Telegram CloudStorage с обработкой ошибок и разбиением на части
export const forceTelegramCloudSave = async (data: string, key: string): Promise<boolean> => {
  if (!isTelegramCloudStorageAvailable()) {
    console.warn('⚠️ Принудительное сохранение в CloudStorage невозможно - API недоступен');
    return false;
  }
  
  // Предотвращаем параллельные сохранения по одному ключу
  if (cloudSaveOperations[key]) {
    console.warn(`⚠️ Операция сохранения для ключа ${key} уже выполняется, пропускаем...`);
    return false;
  }
  
  cloudSaveOperations[key] = true;
  
  try {
    console.log(`🔄 Сохранение в Telegram CloudStorage (${data.length} байт)...`);
    
    // Максимальный размер данных для CloudStorage (около 4KB согласно документации)
    const MAX_CHUNK_SIZE = 4000;
    
    if (data.length > MAX_CHUNK_SIZE) {
      console.log(`⚠️ Данные слишком большие для Telegram CloudStorage (${data.length} байт), разбиваем на части`);
      
      // Сохраняем метаданные о разб��ении
      const chunks = Math.ceil(data.length / MAX_CHUNK_SIZE);
      const meta = JSON.stringify({
        chunks: chunks,
        totalSize: data.length,
        timestamp: Date.now()
      });
      
      // Сначала сохраняем метаданные
      try {
        await window.Telegram.WebApp.CloudStorage.setItem(`${key}_meta`, meta);
        console.log(`✅ Метаданные сохранены: ${chunks} частей`);
      } catch (metaError) {
        console.error('❌ Ошибка при сохранении метаданных:', metaError);
        cloudSaveOperations[key] = false;
        return false;
      }
      
      // Используем последовательные сохранения чтобы не перегружать CloudStorage
      for (let i = 0; i < chunks; i++) {
        const start = i * MAX_CHUNK_SIZE;
        const end = Math.min((i + 1) * MAX_CHUNK_SIZE, data.length);
        const chunk = data.substring(start, end);
        
        try {
          await window.Telegram.WebApp.CloudStorage.setItem(`${key}_${i}`, chunk);
          console.log(`✅ Часть ${i+1}/${chunks} сохранена (${chunk.length} байт)`);
        } catch (chunkError) {
          console.error(`❌ Ошибка при сохранении части ${i+1}/${chunks}:`, chunkError);
          cloudSaveOperations[key] = false;
          return false;
        }
      }
      
      console.log(`✅ Данные успешно сохранены с разбиением на ${chunks} частей`);
      cloudSaveOperations[key] = false;
      return true;
    } else {
      // Если данные маленькие, сохраняем обычным способом
      try {
        await window.Telegram.WebApp.CloudStorage.setItem(key, data);
        console.log(`✅ Данные успешно сохранены (${data.length} байт)`);
        
        // Удаляем метаданные, если они существуют
        try {
          await window.Telegram.WebApp.CloudStorage.removeItem(`${key}_meta`);
        } catch (cleanupError) {
          // Игнорируем ошибку при очистке
        }
        
        cloudSaveOperations[key] = false;
        return true;
      } catch (error) {
        console.error('❌ Ошибка при сохранении данных:', error);
        cloudSaveOperations[key] = false;
        return false;
      }
    }
  } catch (error) {
    console.error('❌ Ошибка при сохранении в Telegram CloudStorage:', error);
    cloudSaveOperations[key] = false;
    return false;
  }
};

// Кэш для хранения статуса текущих операций загрузки
const cloudLoadOperations: Record<string, boolean> = {};

// Принудительная загрузка из Telegram CloudStorage с обработкой ошибок и поддержкой разбиения
export const forceTelegramCloudLoad = async (key: string): Promise<string | null> => {
  if (!isTelegramCloudStorageAvailable()) {
    console.warn('⚠️ Загрузка из CloudStorage невозможна - API недоступен');
    return null;
  }
  
  // Предотвращаем параллельные загрузки по одному ключу
  if (cloudLoadOperations[key]) {
    console.warn(`⚠️ Операция загрузки для ключа ${key} уже выполняется, пропускаем...`);
    return null;
  }
  
  cloudLoadOperations[key] = true;
  
  try {
    console.log(`🔄 Загрузка из Telegram CloudStorage (ключ: ${key})...`);
    
    // Сначала проверяем, есть ли метаданные о разбиении
    let metaData = null;
    try {
      const metaStr = await window.Telegram.WebApp.CloudStorage.getItem(`${key}_meta`);
      if (metaStr) {
        metaData = JSON.parse(metaStr);
        console.log(`✅ Найдены метаданные: ${metaData.chunks} частей, общий размер ${metaData.totalSize} байт`);
      }
    } catch (metaError) {
      console.warn('⚠️ Ошибка при загрузке метаданных:', metaError);
    }
    
    // Если есть метаданные, собираем части
    if (metaData && metaData.chunks) {
      let completeData = '';
      
      // Загружаем все части последовательно
      for (let i = 0; i < metaData.chunks; i++) {
        try {
          const chunkKey = `${key}_${i}`;
          const chunk = await window.Telegram.WebApp.CloudStorage.getItem(chunkKey);
          
          if (chunk === null) {
            console.error(`❌ Часть ${i+1}/${metaData.chunks} не найдена!`);
            cloudLoadOperations[key] = false;
            return null;
          }
          
          completeData += chunk;
          console.log(`✅ Загружена часть ${i+1}/${metaData.chunks} (${chunk.length} байт)`);
        } catch (chunkError) {
          console.error(`❌ Ошибка при загрузке части ${i+1}/${metaData.chunks}:`, chunkError);
          cloudLoadOperations[key] = false;
          return null;
        }
      }
      
      console.log(`✅ Все данные успешно собраны (${completeData.length}/${metaData.totalSize} байт)`);
      cloudLoadOperations[key] = false;
      return completeData;
    }
    
    // Если нет метаданных или не удалось их загрузить, пробуем простую загрузку
    try {
      const data = await window.Telegram.WebApp.CloudStorage.getItem(key);
      
      if (data === null) {
        console.log('❌ Данные не найдены');
        cloudLoadOperations[key] = false;
        return null;
      }
      
      console.log(`✅ Данные успешно загружены (${data.length} байт)`);
      cloudLoadOperations[key] = false;
      return data;
    } catch (error) {
      console.error('❌ Ошибка при загрузке данных:', error);
      cloudLoadOperations[key] = false;
      return null;
    }
  } catch (error) {
    console.error('❌ Ошибка при загрузке из Telegram CloudStorage:', error);
    cloudLoadOperations[key] = false;
    return null;
  }
};

// Получение информации о платформе
export const getPlatformInfo = (): string => {
  if (isTelegramWebAppAvailable()) {
    const platform = window.Telegram.WebApp.platform || 'неизвестно';
    const version = window.Telegram.WebApp.version || 'неизвестно';
    return `Telegram WebApp (${platform}, v${version})`;
  }
  
  if (typeof navigator !== 'undefined') {
    return `Browser: ${navigator.userAgent}`;
  }
  
  return 'Unknown platform';
};

// Глобальное объявление типа для дополнительных свойств окна
declare global {
  interface Window {
    __FORCE_TELEGRAM_MODE?: boolean;
  }
}
