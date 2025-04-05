
/**
 * Форматирует числовое значение с указанным количеством десятичных знаков
 * @param value Значение для форматирования
 * @param precision Количество десятичных знаков (по умолчанию 2)
 * @returns Отформатированное значение
 */
export function formatNumber(value: number, precision: number = 2): string {
  if (value === 0) return '0';
  
  if (Math.abs(value) < 0.01) {
    return value.toExponential(precision);
  }
  
  return value.toFixed(precision);
}

/**
 * Проверяет, достаточно ли ресурсов для покупки
 * @param available Доступные ресурсы
 * @param required Требуемые ресурсы
 * @returns true, если достаточно ресурсов
 */
export function hasEnoughResources(
  available: { [key: string]: number },
  required: { [key: string]: number }
): boolean {
  return Object.entries(required).every(
    ([resourceId, amount]) => available[resourceId] >= amount
  );
}

/**
 * Применяет множитель к стоимости в зависимости от уровня
 * @param baseCost Базовая стоимость
 * @param multiplier Множитель
 * @param level Текущий уровень
 * @returns Скорректированная стоимость
 */
export function calculateScaledCost(
  baseCost: { [key: string]: number },
  multiplier: number,
  level: number
): { [key: string]: number } {
  const result: { [key: string]: number } = {};
  
  for (const [resourceId, cost] of Object.entries(baseCost)) {
    result[resourceId] = cost * Math.pow(multiplier, level);
  }
  
  return result;
}

/**
 * Проверяет, доступен ли Telegram WebApp
 * @returns true, если доступен Telegram WebApp
 */
export function isTelegramWebAppAvailable(): boolean {
  return typeof window !== 'undefined' && 
         !!window.Telegram && 
         !!window.Telegram.WebApp;
}

/**
 * Генерирует уникальный код реферала на основе timestamp и случайных чисел
 * @returns Сгенерированный код реферала
 */
export function generateReferralCode(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 7);
  return `${timestamp}${randomPart}`.toUpperCase();
}

/**
 * Проверяет, является ли пользователь помощником для указанного здания
 * @param referralHelpers Массив помощников
 * @param referralId ID реферала
 * @param buildingId ID здания
 * @returns true, если пользователь является помощником для здания
 */
export function isReferralHelperForBuilding(
  referralHelpers: any[],
  referralId: string,
  buildingId: string
): boolean {
  return referralHelpers.some(
    helper => helper.helperId === referralId && 
              helper.buildingId === buildingId && 
              helper.status === 'accepted'
  );
}

/**
 * Получает ID запроса на помощь
 * @param referralHelpers Массив помощников
 * @param referralId ID реферала
 * @param buildingId ID здания
 * @returns ID запроса на помощь или null
 */
export function getHelperRequestId(
  referralHelpers: any[],
  referralId: string,
  buildingId: string
): string | null {
  const helper = referralHelpers.find(
    h => h.helperId === referralId && 
         h.buildingId === buildingId
  );
  return helper ? helper.id : null;
}

/**
 * Проверяет, может ли игрок позволить себе покупку
 * @param state Состояние игры
 * @param cost Стоимость
 * @returns true, если игрок может позволить себе покупку
 */
export function canAfford(state: any, cost: { [key: string]: number }): boolean {
  return Object.entries(cost).every(
    ([resourceId, amount]) => {
      const resource = state.resources[resourceId];
      return resource && resource.value >= amount;
    }
  );
}

/**
 * Рассчитывает стоимость здания с учетом уровня
 * @param building Здание
 * @returns Скорректированная стоимость
 */
export function calculateCost(building: any): { [key: string]: number } {
  const baseCost = building.cost || {};
  const multiplier = building.costMultiplier || 1.1;
  const level = building.count || 0;
  
  return calculateScaledCost(baseCost, multiplier, level);
}

/**
 * Рассчитывает время, необходимое для достижения указанного значения ресурса
 * @param current Текущее значение
 * @param target Целевое значение
 * @param perSecond Прирост за секунду
 * @returns Время в секундах или Infinity, если невозможно достичь
 */
export function calculateTimeToReach(
  current: number,
  target: number,
  perSecond: number
): number {
  if (perSecond <= 0) return Infinity;
  if (current >= target) return 0;
  
  return (target - current) / perSecond;
}

// Объект для работы с Telegram WebApp API, если доступен
declare global {
  interface Window {
    Telegram?: {
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
        colorScheme?: string;
        themeParams?: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
        onEvent?: (eventType: string, callback: Function) => void;
        offEvent?: (eventType: string, callback: Function) => void;
        share?: (url: string) => void;
      };
    };
  }
}
