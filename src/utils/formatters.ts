
/**
 * Форматирует числовое значение для отображения
 */
export const formatNumber = (value: number | undefined): string => {
  if (value === undefined || value === null) return "0";
  if (value === Infinity) return "∞";
  if (isNaN(value)) return "0";
  
  // Используем форматирование с буквами K и M для больших чисел
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1).replace('.0', '') + "M";
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1).replace('.0', '') + "K";
  } else {
    return value.toFixed(Math.abs(value) < 0.1 && value !== 0 ? 2 : 0).replace('.00', '');
  }
};
