
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

// Функция для сохранения игры
export const saveGame = (gameState: any) => {
  localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(gameState));
};

// Функция для загрузки игры
export const loadGame = (): any | null => {
  const savedGame = localStorage.getItem(GAME_STORAGE_KEY);
  if (!savedGame) return null;
  
  try {
    return JSON.parse(savedGame);
  } catch (error) {
    console.error("Ошибка загрузки игры:", error);
    return null;
  }
};

// Функция для сброса игры
export const resetGame = () => {
  localStorage.removeItem(GAME_STORAGE_KEY);
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

// Улучшенная проверка наличия Telegram WebApp API
export const isTelegramWebAppAvailable = (): boolean => {
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
    
    // Проверяем доступность основных методов
    const hasVersion = window.Telegram.WebApp.hasOwnProperty('version');
    const hasPlatform = window.Telegram.WebApp.hasOwnProperty('platform');
    const hasInitData = window.Telegram.WebApp.hasOwnProperty('initData');
    
    console.log(`Проверка методов Telegram WebApp: версия=${hasVersion}, платформа=${hasPlatform}, initData=${hasInitData}`);
    console.log('Telegram WebApp доступен, версия:', window.Telegram.WebApp.version || 'неизвестно');
    
    return true;
  } catch (error) {
    console.error('Ошибка при проверке доступности Telegram WebApp:', error);
    return false;
  }
};

// Получение информации о платформе
export const getPlatformInfo = (): string => {
  if (isTelegramWebAppAvailable()) {
    const platform = window.Telegram.WebApp.platform || 'неизвестно';
    const version = window.Telegram.WebApp.version || 'неизвестно';
    const initDataLength = window.Telegram.WebApp.initData?.length || 0;
    console.log(`Обнаружен Telegram WebApp. Платформа: ${platform}, версия: ${version}, длина initData: ${initDataLength}`);
    return `Telegram WebApp (${platform}, v${version})`;
  }
  
  if (typeof navigator !== 'undefined') {
    return `Browser: ${navigator.userAgent}`;
  }
  
  return 'Unknown platform';
};

// Проверить наличие CloudStorage в Telegram WebApp
export const isTelegramCloudStorageAvailable = (): boolean => {
  try {
    if (!isTelegramWebAppAvailable()) {
      return false;
    }
    
    if (!window.Telegram?.WebApp?.CloudStorage) {
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

// Принудительное сохранение в Telegram CloudStorage
export const forceTelegramCloudSave = async (data: string, key: string): Promise<boolean> => {
  try {
    if (!isTelegramCloudStorageAvailable()) {
      console.log('Telegram CloudStorage недоступен для принудительного сохранения');
      return false;
    }
    
    console.log(`Принудительное сохранение в Telegram CloudStorage, размер данных: ${data.length} байт`);
    await window.Telegram.WebApp.CloudStorage.setItem(key, data);
    console.log('Данные успешно сохранены в Telegram CloudStorage');
    return true;
  } catch (error) {
    console.error('Ошибка при принудительном сохранении в Telegram CloudStorage:', error);
    return false;
  }
};

// Принудительная загрузка из Telegram CloudStorage
export const forceTelegramCloudLoad = async (key: string): Promise<string | null> => {
  try {
    if (!isTelegramCloudStorageAvailable()) {
      console.log('Telegram CloudStorage недоступен для принудительной загрузки');
      return null;
    }
    
    console.log(`Принудительная загрузка из Telegram CloudStorage, ключ: ${key}`);
    const data = await window.Telegram.WebApp.CloudStorage.getItem(key);
    console.log(`Данные загружены из Telegram CloudStorage, размер: ${data?.length || 0} байт`);
    return data;
  } catch (error) {
    console.error('Ошибка при принудительной загрузке из Telegram CloudStorage:', error);
    return null;
  }
};
