
/**
 * Форматирует числовое значение для отображения
 * @param value Значение для форматирования
 * @returns Отформатированная строка
 */
export function formatNumber(value: number): string {
  if (value === undefined || value === null) return '0';
  
  // Для больших чисел используем сокращения
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(2) + 'B';
  }
  if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(2) + 'K';
  }
  
  // Форматируем дробные числа до 2 знаков после запятой
  if (Math.floor(value) !== value) {
    return parseFloat(value.toFixed(2)).toString();
  }
  
  return value.toString();
}
