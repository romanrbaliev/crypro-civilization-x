// ��орматирование чисел для отображения
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

// Генерация уникального реферального кода
export const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Проверка доступности Telegram WebApp API
export const isTelegramWebAppAvailable = () => {
  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    return true;
  }
  
  // Для тестирования вне Telegram или если Telegram WebApp недоступен
  if (typeof window !== 'undefined' && window.__FORCE_TELEGRAM_MODE) {
    return true;
  }
  
  return false;
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
    
    // Принудительное включение режима Telegram WebApp для локальной отладки
    window.__FORCE_TELEGRAM_MODE = true;
    
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
        console.log(`Telegram пользователь: ID=${user.id}, имя=${user.username || 'неизвестно'}`);
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

// Константы для работы с данными
const MAX_CHUNK_SIZE = 4000; // Максимальный размер части для Telegram CloudStorage
const RETRY_COUNT = 3; // Количество попыток сохранения/загрузки
const RETRY_DELAY = 500; // Задержка между попытками в мс

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
    
    // Реализация с повторными попытками
    for (let attempt = 1; attempt <= RETRY_COUNT; attempt++) {
      try {
        if (data.length > MAX_CHUNK_SIZE) {
          console.log(`⚠️ Данные слишком большие для Telegram CloudStorage (${data.length} байт), разбиваем на части`);
          
          // Сохраняем метаданные о разбиении
          const chunks = Math.ceil(data.length / MAX_CHUNK_SIZE);
          const meta = JSON.stringify({
            chunks: chunks,
            totalSize: data.length,
            timestamp: Date.now(),
            version: "1.0.2" // Версия формата данных
          });
          
          // Сначала сохраняем метаданные
          try {
            await window.Telegram.WebApp.CloudStorage.setItem(`${key}_meta`, meta);
            console.log(`✅ Метаданные сохранены: ${chunks} частей`);
          } catch (metaError) {
            if (attempt < RETRY_COUNT) {
              console.warn(`⚠️ Ошибка при сохранении метаданных (попытка ${attempt}/${RETRY_COUNT}):`, metaError);
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
              continue;
            }
            console.error('❌ Ошибка при сохранении метаданных:', metaError);
            cloudSaveOperations[key] = false;
            return false;
          }
          
          // Используем последовательные сохранения чтобы не перегружать CloudStorage
          let allChunksSaved = true;
          for (let i = 0; i < chunks; i++) {
            const start = i * MAX_CHUNK_SIZE;
            const end = Math.min((i + 1) * MAX_CHUNK_SIZE, data.length);
            const chunk = data.substring(start, end);
            
            let chunkSaved = false;
            // Повторные попытки для каждой части
            for (let chunkAttempt = 1; chunkAttempt <= RETRY_COUNT; chunkAttempt++) {
              try {
                await window.Telegram.WebApp.CloudStorage.setItem(`${key}_${i}`, chunk);
                console.log(`✅ Часть ${i+1}/${chunks} сохранена (${chunk.length} байт)`);
                chunkSaved = true;
                break;
              } catch (chunkError) {
                if (chunkAttempt < RETRY_COUNT) {
                  console.warn(`⚠️ Ошибка при сохранении части ${i+1}/${chunks} (попытка ${chunkAttempt}/${RETRY_COUNT}):`, chunkError);
                  await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                } else {
                  console.error(`❌ Ошибка при сохранении части ${i+1}/${chunks}:`, chunkError);
                  allChunksSaved = false;
                }
              }
            }
            
            if (!chunkSaved) {
              allChunksSaved = false;
              break;
            }
          }
          
          if (!allChunksSaved) {
            if (attempt < RETRY_COUNT) {
              console.warn(`⚠️ Не все части сохранены (попытка ${attempt}/${RETRY_COUNT}), повторяем...'`);
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
              continue;
            }
            console.error(`❌ Не удалось сохранить все части данных после ${RETRY_COUNT} попыток`);
            cloudSaveOperations[key] = false;
            return false;
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
            if (attempt < RETRY_COUNT) {
              console.warn(`⚠️ Ошибка при сохранении данных (попытка ${attempt}/${RETRY_COUNT}):`, error);
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
              continue;
            }
            console.error('❌ Ошибка при сохранении данных:', error);
            cloudSaveOperations[key] = false;
            return false;
          }
        }
      } catch (attemptError) {
        if (attempt < RETRY_COUNT) {
          console.warn(`⚠️ Ошибка при попытке ${attempt}/${RETRY_COUNT}:`, attemptError);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          console.error(`❌ Все ${RETRY_COUNT} попытки сохранения завершились с ошибкой:`, attemptError);
          cloudSaveOperations[key] = false;
          return false;
        }
      }
    }
    
    // Если дошли до этой точки, все попытки не удались
    cloudSaveOperations[key] = false;
    return false;
  } catch (error) {
    console.error('❌ Непредвиденная ошибка при сохранении в Telegram CloudStorage:', error);
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
    
    // Реализация с повторными попытками
    for (let attempt = 1; attempt <= RETRY_COUNT; attempt++) {
      try {
        // Сначала проверяем, есть ли метаданные о разбиении
        let metaData = null;
        try {
          const metaStr = await window.Telegram.WebApp.CloudStorage.getItem(`${key}_meta`);
          if (metaStr) {
            metaData = JSON.parse(metaStr);
            console.log(`✅ Найдены метаданные: ${metaData.chunks} частей, общий размер ${metaData.totalSize} байт, версия: ${metaData.version || 'неизвестно'}`);
          }
        } catch (metaError) {
          if (attempt < RETRY_COUNT) {
            console.warn(`⚠️ Ошибка при загрузке метаданных (попытка ${attempt}/${RETRY_COUNT}):`, metaError);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            continue;
          }
          console.warn('⚠️ Ошибка при загрузке метаданных:', metaError);
        }
        
        // Если есть метаданные, собираем части
        if (metaData && metaData.chunks) {
          let completeData = '';
          
          // Загружаем все части последовательно
          for (let i = 0; i < metaData.chunks; i++) {
            let chunkLoaded = false;
            // Повторные попытки для каждой части
            for (let chunkAttempt = 1; chunkAttempt <= RETRY_COUNT; chunkAttempt++) {
              try {
                const chunkKey = `${key}_${i}`;
                const chunk = await window.Telegram.WebApp.CloudStorage.getItem(chunkKey);
                
                if (chunk === null) {
                  if (chunkAttempt < RETRY_COUNT) {
                    console.warn(`⚠️ Часть ${i+1}/${metaData.chunks} не найдена (попытка ${chunkAttempt}/${RETRY_COUNT}), повторяем...`);
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                  } else {
                    console.error(`❌ Часть ${i+1}/${metaData.chunks} не найдена после ${RETRY_COUNT} попыток!`);
                    cloudLoadOperations[key] = false;
                    return null;
                  }
                } else {
                  completeData += chunk;
                  console.log(`✅ Загружена часть ${i+1}/${metaData.chunks} (${chunk.length} байт)`);
                  chunkLoaded = true;
                  break;
                }
              } catch (chunkError) {
                if (chunkAttempt < RETRY_COUNT) {
                  console.warn(`⚠️ Ошибка при загрузке части ${i+1}/${metaData.chunks} (попытка ${chunkAttempt}/${RETRY_COUNT}):`, chunkError);
                  await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                } else {
                  console.error(`❌ Ошибка при загрузке части ${i+1}/${metaData.chunks}:`, chunkError);
                  cloudLoadOperations[key] = false;
                  return null;
                }
              }
            }
            
            if (!chunkLoaded) {
              if (attempt < RETRY_COUNT) {
                console.warn(`⚠️ Не удалось загрузить часть, пробуем всё сначала (попытка ${attempt}/${RETRY_COUNT})...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                break;
              } else {
                console.error(`❌ Не удалось загрузить все части после ${RETRY_COUNT} попыток`);
                cloudLoadOperations[key] = false;
                return null;
              }
            }
          }
          
          if (completeData.length > 0 && completeData.length === metaData.totalSize) {
            console.log(`✅ Все данные успешно собраны (${completeData.length}/${metaData.totalSize} байт)`);
            cloudLoadOperations[key] = false;
            return completeData;
          } else if (completeData.length > 0) {
            console.warn(`⚠️ Данные собраны частично (${completeData.length}/${metaData.totalSize} байт)`);
            // Если размер не совпадает, но мы собрали что-то, всё равно возвращаем
            if (completeData.length > metaData.totalSize * 0.8) { // Если собрали более 80%
              console.log('✅ Возвращаем частично собранные данные (более 80% объема)');
              cloudLoadOperations[key] = false;
              return completeData;
            }
          }
          
          // Если не удалось полностью собрать данные и это не последняя попытка
          if (attempt < RETRY_COUNT) {
            console.warn(`⚠️ Данные собраны не полностью, повторяем попытку ${attempt+1}/${RETRY_COUNT}...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            continue;
          }
        }
        
        // Если нет метаданных или не удалось их загрузить, пробуем простую загрузку
        try {
          const data = await window.Telegram.WebApp.CloudStorage.getItem(key);
          
          if (data === null) {
            if (attempt < RETRY_COUNT) {
              console.warn(`⚠️ Данные не найдены (попытка ${attempt}/${RETRY_COUNT}), повторяем...`);
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
              continue;
            }
            console.log('❌ Данные не найдены после всех попыток');
            cloudLoadOperations[key] = false;
            return null;
          }
          
          console.log(`✅ Данные успешно загружены (${data.length} байт)`);
          cloudLoadOperations[key] = false;
          return data;
        } catch (error) {
          if (attempt < RETRY_COUNT) {
            console.warn(`⚠️ Ошибка при загрузке данных (попытка ${attempt}/${RETRY_COUNT}):`, error);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            continue;
          }
          console.error('❌ Ошибка при загрузке данных:', error);
          cloudLoadOperations[key] = false;
          return null;
        }
      } catch (attemptError) {
        if (attempt < RETRY_COUNT) {
          console.warn(`⚠️ Ошибка при попытке ${attempt}/${RETRY_COUNT}:`, attemptError);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          console.error(`❌ Все ${RETRY_COUNT} попытки загрузки завершились с ошибкой:`, attemptError);
          cloudLoadOperations[key] = false;
          return null;
        }
      }
    }
    
    // Если дошли до этой точки, все попытки не удались
    cloudLoadOperations[key] = false;
    return null;
  } catch (error) {
    console.error('❌ Непредвиденная ошибка при загрузке из Telegram CloudStorage:', error);
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
