
/**
 * Форматирует число с разделителями тысяч
 */
export function numberWithCommas(x: string | number): string {
  const num = typeof x === 'string' ? parseFloat(x) : x;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Форматирует число с сокращениями (K, M, B)
 */
export function formatNumberWithAbbreviation(num: number): string {
  if (num < 1000) {
    return num.toFixed(num % 1 === 0 ? 0 : 1);
  } else if (num < 1000000) {
    return (num / 1000).toFixed(1) + 'K';
  } else if (num < 1000000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else {
    return (num / 1000000000).toFixed(1) + 'B';
  }
}
