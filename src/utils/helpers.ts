
/**
 * Форматирует число для отображения, добавляя суффиксы K, M, B и т.д.
 */
export function formatNumber(num: number, precision: number = 0): string {
  if (num === 0) return '0';
  
  if (num < 0.0001 && num > 0) {
    return num.toExponential(precision);
  }
  
  if (num < 1000) {
    if (Number.isInteger(num)) {
      return num.toString();
    }
    return num.toFixed(precision);
  }
  
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  
  // Находим необходимый суффикс
  const magnitude = Math.floor(Math.log10(num) / 3);
  const suffix = suffixes[magnitude] || '';
  
  // Масштабируем число для суффикса
  const scaled = num / Math.pow(1000, magnitude);
  
  // Округляем до заданной точности
  return scaled.toFixed(precision) + suffix;
}

/**
 * Проверяет, можно ли позволить себе покупку
 */
export function canAfford(cost: { [key: string]: number }, resources: { [key: string]: any }): boolean {
  return Object.entries(cost).every(([resourceId, amount]) => {
    const resource = resources[resourceId];
    return resource && resource.unlocked && resource.value >= amount;
  });
}

/**
 * Рассчитывает стоимость с учетом множителя
 */
export function calculateCost(baseCost: number, multiplier: number, count: number): number {
  return baseCost * Math.pow(multiplier, count);
}

/**
 * Проверяет доступность Telegram WebApp
 */
export function isTelegramWebAppAvailable(): boolean {
  return !!(window.Telegram && window.Telegram.WebApp);
}

/**
 * Рассчитывает время до достижения определенного значения ресурса
 */
export function calculateTimeToReach(current: number, target: number, perSecond: number): number | null {
  if (perSecond <= 0) return null;
  
  const remainingAmount = target - current;
  if (remainingAmount <= 0) return 0;
  
  return remainingAmount / perSecond;
}

/**
 * Форматирует время в секундах в читаемый формат
 */
export function formatTime(seconds: number): string {
  if (seconds === Infinity || seconds === null) return '∞';
  if (seconds < 0) return '0с';
  
  if (seconds < 60) {
    return `${Math.ceil(seconds)}с`;
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}м ${Math.ceil(seconds % 60)}с`;
  } else if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}ч ${Math.floor((seconds % 3600) / 60)}м`;
  } else {
    return `${Math.floor(seconds / 86400)}д ${Math.floor((seconds % 86400) / 3600)}ч`;
  }
}

// Объявление глобальных типов для Telegram WebApp
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
        onEvent?: (eventType: string, eventHandler: Function) => void;
        offEvent?: (eventType: string, eventHandler: Function) => void;
        sendData?: (data: string) => void;
        openTelegramLink?: (url: string) => void;
        openInvoice?: (url: string, callback: Function) => void;
        showPopup?: (params: any, callback: Function) => void;
        showAlert?: (message: string, callback: Function) => void;
        showConfirm?: (message: string, callback: Function) => void;
        share?: (url: string) => void;
      };
    };
    __game_user_id?: string;
    __game_state?: any;
    __cloudflareRetryCount?: number;
  }
}
