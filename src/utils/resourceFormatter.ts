
import { ResourceFormatConfig } from '../types/resources';
import { getResourceName } from '@/data/gameElements';

/**
 * Конфигурация форматирования различных ресурсов
 */
const FORMAT_CONFIG: Record<string, ResourceFormatConfig> = {
  // Знания форматируем с 1 десятичным знаком
  knowledge: {
    decimalPlaces: 1,
    useShortFormat: true,
    minValueForShort: 10000
  },
  // USDT форматируем с 2 десятичными знаками
  usdt: {
    decimalPlaces: 2,
    useShortFormat: true,
    minValueForShort: 10000
  },
  // Электричество форматируем с 1 десятичным знаком
  electricity: {
    decimalPlaces: 1,
    useShortFormat: true,
    minValueForShort: 10000
  },
  // Вычислительная мощность форматируется без десятичных знаков
  computingPower: {
    decimalPlaces: 0,
    useShortFormat: true,
    minValueForShort: 1000
  },
  // Bitcoin форматируем с 8 десятичными знаками
  bitcoin: {
    decimalPlaces: 8,
    useShortFormat: false,
    minValueForShort: Infinity
  },
  // Значения по умолчанию для других ресурсов
  default: {
    decimalPlaces: 0,
    useShortFormat: true,
    minValueForShort: 1000
  }
};

/**
 * Форматирует число для сокращенного отображения
 * @param value Значение для форматирования
 * @returns Отформатированная строка (например, "1.2K" или "3.5M")
 */
export function formatShortNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return value.toString();
}

/**
 * Форматирует значение ресурса на основе его типа
 * @param value Значение ресурса
 * @param resourceId ID ресурса
 * @returns Отформатированная строка
 */
export function formatResourceValue(value: number | null | undefined, resourceId: string): string {
  if (value === null || value === undefined) {
    return '0';
  }
  
  // Получаем настройки форматирования для ресурса
  const config = FORMAT_CONFIG[resourceId] || FORMAT_CONFIG.default;
  
  // Применяем специальное форматирование, если оно определено
  if (config.specialFormat) {
    return config.specialFormat(value);
  }
  
  // Для маленьких значений Bitcoin показываем в научной нотации
  if (resourceId === 'bitcoin' && value > 0 && value < 0.000001) {
    return value.toExponential(4);
  }
  
  // Применяем сокращенный формат для больших чисел
  if (config.useShortFormat && value >= config.minValueForShort) {
    return formatShortNumber(value);
  }
  
  // Форматируем с учетом десятичных знаков
  return value.toFixed(config.decimalPlaces).replace(/\.0+$/, '');
}

/**
 * Форматирует стоимость для отображения
 * @param cost Объект со стоимостью
 * @param language Код языка
 * @returns Отформатированная строка стоимости
 */
export function formatCost(cost: Record<string, number>, language: string = 'ru'): string {
  return Object.entries(cost)
    .map(([resourceId, amount]) => {
      const formattedAmount = formatResourceValue(amount, resourceId);
      const resourceName = getResourceName(resourceId, language);
      return `${formattedAmount} ${resourceName}`;
    })
    .join(', ');
}
