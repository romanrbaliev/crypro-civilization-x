
import { ReferralHelper } from '@/context/types';

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

/**
 * Генерирует реферальный код
 * @param length Длина реферального кода
 * @returns Реферальный код
 */
export function generateReferralCode(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Проверяет, является ли реферал помощником для указанного здания
 * @param helperId ID помощника
 * @param buildingId ID здания
 * @param helpers список всех помощников
 * @returns true, если реферал является помощником для здания
 */
export const isReferralHelperForBuilding = (
  helperId: string,
  buildingId: string,
  helpers: ReferralHelper[]
): boolean => {
  return helpers.some(
    (helper) => 
      helper.helperId === helperId && 
      helper.buildingId === buildingId && 
      helper.status === 'accepted'
  );
};

/**
 * Получает ID запроса на помощь для указанного реферала и здания
 * @param helperId ID помощника
 * @param buildingId ID здания
 * @param helpers список всех помощников
 * @returns ID запроса или undefined, если запрос не найден
 */
export const getHelperRequestId = (
  helperId: string,
  buildingId: string,
  helpers: ReferralHelper[]
): string | undefined => {
  const helper = helpers.find(
    (h) => h.helperId === helperId && h.buildingId === buildingId
  );
  return helper?.id;
};

/**
 * Рассчитывает время, необходимое для достижения целевого значения ресурса
 * @param currentValue текущее значение ресурса
 * @param targetValue целевое значение ресурса
 * @param perSecond скорость производства ресурса в секунду
 * @returns время в секундах или Infinity, если невозможно достичь
 */
export const calculateTimeToReach = (
  currentValue: number,
  targetValue: number,
  perSecond: number
): number => {
  if (perSecond <= 0) return Infinity;
  
  const remainingValue = targetValue - currentValue;
  if (remainingValue <= 0) return 0;
  
  return remainingValue / perSecond;
};

// Глобальные типы для Telegram WebApp
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        platform: string;
        version: string;
        initData?: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          start_param?: string;
          startapp?: string;
        };
        showScanQrPopup?: (params: any) => void;
        closeScanQrPopup?: () => void;
        BackButton?: any;
        MainButton?: any;
        HapticFeedback?: any;
        openLink?: (url: string) => void;
        share?: (url: string) => void;
      };
    };
    __game_user_id?: string;
    __cloudflareRetryCount?: number;
    __lastSaveErrorTime?: number;
  }
}
