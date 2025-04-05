
/**
 * Форматирует число с разделителями тысяч
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

/**
 * Форматирует число с сокращением (k для тысяч, M для миллионов)
 */
export function formatNumberWithAbbreviation(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

/**
 * Добавляет разделители тысяч к числу
 */
export function numberWithCommas(x: string | number): string {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
