
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

// УЛУЧШЕННАЯ проверка наличия Telegram WebApp API с детальным логированием
export const isTelegramWebAppAvailable = (): boolean => {
  // Сначала проверяем, выполняется ли код в Telegram WebApp
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
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

// Принудительное сохранение в Telegram CloudStorage
export const forceTelegramCloudSave = async (data: string, key: string): Promise<boolean> => {
  if (!isTelegramCloudStorageAvailable()) {
    console.warn('⚠️ Принудительное сохранение в CloudStorage невозможно - API недоступен');
    return false;
  }
  
  try {
    console.log(`🔄 Сохранение в Telegram CloudStorage (${data.length} байт)...`);
    
    // Принудительное разделение данных на части, если размер превышает 4KB (документация Telegram)
    const MAX_SIZE = 4000; // 4KB limit for Telegram CloudStorage
    
    if (data.length > MAX_SIZE) {
      console.log(`⚠️ Данные слишком большие (${data.length} байт), разбиваем на части`);
      
      // Сохраняем метаданные
      const chunksCount = Math.ceil(data.length / MAX_SIZE);
      const metaData = JSON.stringify({
        total: chunksCount,
        timestamp: Date.now(),
        totalSize: data.length
      });
      
      await window.Telegram.WebApp.CloudStorage.setItem(`${key}_meta`, metaData);
      console.log(`✅ Сохранены метаданные: части=${chunksCount}`);
      
      // Сохраняем по частям
      let saved = 0;
      for (let i = 0; i < chunksCount; i++) {
        const chunk = data.substring(i * MAX_SIZE, (i + 1) * MAX_SIZE);
        await window.Telegram.WebApp.CloudStorage.setItem(`${key}_${i}`, chunk);
        saved += chunk.length;
        console.log(`✅ Сохранена часть ${i+1}/${chunksCount} (${chunk.length} байт)`);
      }
      
      console.log(`✅ Все данные сохранены (${saved}/${data.length} байт)`);
      return true;
    } else {
      // Сохраняем как один блок
      await window.Telegram.WebApp.CloudStorage.setItem(key, data);
      console.log(`✅ Данные успешно сохранены (${data.length} байт)`);
      
      // Удаляем метаданные, если они существовали
      try {
        await window.Telegram.WebApp.CloudStorage.removeItem(`${key}_meta`);
      } catch (e) {
        // Игнорируем ошибки удаления
      }
      
      return true;
    }
  } catch (error) {
    console.error('❌ Ошибка при сохранении в Telegram CloudStorage:', error);
    return false;
  }
};

// Принудительная загрузка из Telegram CloudStorage
export const forceTelegramCloudLoad = async (key: string): Promise<string | null> => {
  if (!isTelegramCloudStorageAvailable()) {
    console.warn('⚠️ Загрузка из CloudStorage невозможна - API недоступен');
    return null;
  }
  
  try {
    console.log(`🔄 Загрузка из Telegram CloudStorage (ключ: ${key})...`);
    
    // Сначала пробуем загрузить метаданные
    const metaDataStr = await window.Telegram.WebApp.CloudStorage.getItem(`${key}_meta`);
    
    // Если есть метаданные, значит данные разделены на части
    if (metaDataStr) {
      try {
        const metaData = JSON.parse(metaDataStr);
        console.log(`✅ Найдены метаданные: части=${metaData.total}, размер=${metaData.totalSize}`);
        
        // Собираем все части
        let fullData = "";
        for (let i = 0; i < metaData.total; i++) {
          const chunk = await window.Telegram.WebApp.CloudStorage.getItem(`${key}_${i}`);
          if (chunk === null) {
            console.error(`❌ Часть ${i+1}/${metaData.total} не найдена!`);
            return null; // Если часть отсутствует, данные повреждены
          }
          fullData += chunk;
          console.log(`✅ Загружена часть ${i+1}/${metaData.total} (${chunk.length} байт)`);
        }
        
        console.log(`✅ Все данные собраны (${fullData.length}/${metaData.totalSize} байт)`);
        return fullData;
      } catch (e) {
        console.error('❌ Ошибка при обработке разделенных данных:', e);
        // Если не удалось обработать разделенные данные, попробуем обычный способ
      }
    }
    
    // Обычный способ загрузки
    const data = await window.Telegram.WebApp.CloudStorage.getItem(key);
    console.log(`✅ Данные загружены (${data?.length || 0} байт)`);
    return data;
  } catch (error) {
    console.error('❌ Ошибка при загрузке из Telegram CloudStorage:', error);
    return null;
  }
};

// Получение информации о платформе
export const getPlatformInfo = (): string => {
  if (isTelegramWebAppAvailable()) {
    const platform = window.Telegram.WebApp.platform || 'неизвестно';
    const version = window.Telegram.WebApp.version || 'неизвестно';
    const initDataLength = window.Telegram.WebApp.initData?.length || 0;
    return `Telegram WebApp (${platform}, v${version})`;
  }
  
  if (typeof navigator !== 'undefined') {
    return `Browser: ${navigator.userAgent}`;
  }
  
  return 'Unknown platform';
};
