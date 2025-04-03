
/**
 * Форматирует число для отображения с сокращениями (K, M и т.д.)
 */
export const formatNumber = (value: number): string => {
  if (value === undefined || value === null) return '0';
  
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  
  if (Number.isInteger(value)) {
    return value.toString();
  }
  
  if (value < 0.01) {
    return value.toExponential(2);
  }
  
  return value.toFixed(2);
};

/**
 * Форматирует время в секундах в формат минуты:секунды
 */
export const formatTime = (seconds: number): string => {
  if (seconds <= 0) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Форматирует валюту с заданным символом
 */
export const formatCurrency = (value: number, symbol: string = '$'): string => {
  return `${symbol}${formatNumber(value)}`;
};

/**
 * Форматирует проценты
 */
export const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

/**
 * Возвращает цветовой класс в зависимости от значения
 */
export const getValueColorClass = (current: number, max: number): string => {
  const ratio = current / max;
  
  if (ratio >= 0.8) return 'text-green-500';
  if (ratio >= 0.5) return 'text-yellow-500';
  if (ratio >= 0.25) return 'text-orange-500';
  return 'text-red-500';
};
