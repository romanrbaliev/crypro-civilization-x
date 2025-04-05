
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
