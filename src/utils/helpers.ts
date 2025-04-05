
/**
 * Проверяет доступность Telegram WebApp
 * @returns true если Telegram WebApp доступен
 */
export const isTelegramWebAppAvailable = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    return Boolean(
      window.Telegram && 
      window.Telegram.WebApp && 
      typeof window.Telegram.WebApp.ready === 'function'
    );
  } catch (error) {
    console.error('Ошибка при проверке Telegram WebApp:', error);
    return false;
  }
};

/**
 * Форматирует число с указанной точностью
 * @param value Число для форматирования
 * @param precision Количество знаков после запятой
 * @returns Отформатированное число
 */
export const formatNumber = (value: number, precision: number = 2): string => {
  if (value === undefined || value === null) return '0';
  
  if (value === 0) return '0';
  
  if (value < 0.0001 && value > 0) {
    return value.toExponential(precision);
  }
  
  if (value >= 1e6) {
    return (value / 1e6).toFixed(precision) + 'M';
  }
  
  if (value >= 1e3) {
    return (value / 1e3).toFixed(precision) + 'K';
  }
  
  if (Number.isInteger(value)) {
    return value.toString();
  }
  
  return value.toFixed(precision);
};

/**
 * Вычисляет стоимость следующего уровня здания
 * @param baseCost Базовая стоимость
 * @param multiplier Множитель стоимости
 * @param level Текущий уровень
 * @returns Стоимость следующего уровня
 */
export const calculateCost = (
  baseCost: number,
  multiplier: number,
  level: number
): number => {
  return Math.floor(baseCost * Math.pow(multiplier, level));
};

/**
 * Проверяет, есть ли у пользователя достаточно ресурсов для покупки
 * @param currentResources Текущие ресурсы
 * @param cost Стоимость
 * @returns true если достаточно ресурсов
 */
export const canAfford = (
  currentResources: { [key: string]: number },
  cost: { [key: string]: number }
): boolean => {
  return Object.entries(cost).every(
    ([resource, amount]) => 
      (currentResources[resource] || 0) >= amount
  );
};

/**
 * Вычисляет прогресс до следующего значения
 * @param current Текущее значение
 * @param target Целевое значение
 * @returns Процент прогресса (0-100)
 */
export const calculateProgress = (current: number, target: number): number => {
  if (target <= 0) return 0;
  const progress = (current / target) * 100;
  return Math.min(100, Math.max(0, progress));
};

/**
 * Генерирует уникальный ID
 * @returns Уникальный ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Глобальные типы для Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
          };
        };
      };
    };
    __game_user_id?: string;
    __lastSaveErrorTime?: number;
    __cloudflareRetryCount?: number;
    __FORCE_TELEGRAM_MODE?: boolean;
  }
}
