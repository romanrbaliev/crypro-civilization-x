
// Конфигурация форматирования для ресурсов

export interface ResourceFormatConfig {
  decimalPlaces: number;  // Количество знаков после запятой
  useGrouping: boolean;   // Использовать разделители тысяч (1,000,000)
  minValue: number;       // Минимальное значение для отображения (меньшие будут показаны как 0)
  updateFrequency: number; // Частота обновления (мс) для визуальной анимации
}

// Настройки по умолчанию
const defaultConfig: ResourceFormatConfig = {
  decimalPlaces: 0,
  useGrouping: true,
  minValue: 0.001,
  updateFrequency: 100  // 10 обновлений в секунду
};

// Специфичные настройки для каждого ресурса
export const resourceFormats: { [key: string]: ResourceFormatConfig } = {
  // Основные ресурсы
  knowledge: {
    ...defaultConfig,
    decimalPlaces: 1,
  },
  usdt: {
    ...defaultConfig,
    decimalPlaces: 2,
  },
  electricity: {
    ...defaultConfig,
    decimalPlaces: 1,
  },
  computingPower: {
    ...defaultConfig,
    decimalPlaces: 0,
  },
  // Криптовалюты
  btc: {
    ...defaultConfig,
    decimalPlaces: 8,
    minValue: 0.00000001,
  },
  // Социальные
  reputation: {
    ...defaultConfig,
    decimalPlaces: 1,
  },
  influence: {
    ...defaultConfig,
    decimalPlaces: 1,
  },
  // Настройка по умолчанию для всех остальных ресурсов
  default: defaultConfig
};

/**
 * Получение настроек форматирования для конкретного ресурса
 */
export const getResourceFormat = (resourceId: string): ResourceFormatConfig => {
  return resourceFormats[resourceId] || resourceFormats.default;
};

/**
 * Форматирование числового значения ресурса
 */
export const formatResourceValue = (value: number, resourceId: string): string => {
  if (value === Infinity) return "∞";
  
  const format = getResourceFormat(resourceId);
  if (Math.abs(value) < format.minValue) return "0";
  
  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: format.decimalPlaces,
    maximumFractionDigits: format.decimalPlaces,
    useGrouping: format.useGrouping
  };
  
  return new Intl.NumberFormat('ru-RU', options).format(value);
};
