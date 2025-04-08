
// Конфигурация форматирования для ресурсов

export interface ResourceFormatConfig {
  decimalPlaces: number;  // Количество знаков после запятой
  useGrouping: boolean;   // Использовать разделители тысяч (1,000,000)
  minValue: number;       // Минимальное значение для отображения (меньшие будут показаны как 0)
  updateFrequency: number; // Частота обновления (мс) для визуальной анимации
}

// Настройки по умолчанию
const defaultConfig: ResourceFormatConfig = {
  decimalPlaces: 2,
  useGrouping: true,
  minValue: 0.001,
  updateFrequency: 50  // 20 обновлений в секунду
};

// Специфичные настройки для каждого ресурса
export const resourceFormats: { [key: string]: ResourceFormatConfig } = {
  // Основные ресурсы
  knowledge: {
    ...defaultConfig,
    decimalPlaces: 2,
  },
  usdt: {
    ...defaultConfig,
    decimalPlaces: 2,
  },
  electricity: {
    ...defaultConfig,
    decimalPlaces: 2,
  },
  computingPower: {
    ...defaultConfig,
    decimalPlaces: 2,
  },
  // Криптовалюты
  bitcoin: {
    ...defaultConfig,
    decimalPlaces: 6,
    minValue: 0.000001,
  },
  // Социальные
  reputation: {
    ...defaultConfig,
    decimalPlaces: 2,
  },
  influence: {
    ...defaultConfig,
    decimalPlaces: 2,
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
export const formatResourceValue = (value: number | null | undefined, resourceId: string): string => {
  // Проверка на null или undefined
  if (value === null || value === undefined) return "0";
  if (value === Infinity) return "∞";
  if (isNaN(value)) return "0";
  
  const format = getResourceFormat(resourceId);
  if (Math.abs(value) < format.minValue) return "0";
  
  // Используем форматирование с буквами K и M для больших чисел
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1).replace('.0', '') + "M";
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1).replace('.0', '') + "K";
  } else {
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: format.decimalPlaces,
      maximumFractionDigits: format.decimalPlaces,
      useGrouping: format.useGrouping
    };
    
    return new Intl.NumberFormat('ru-RU', options).format(value);
  }
};
