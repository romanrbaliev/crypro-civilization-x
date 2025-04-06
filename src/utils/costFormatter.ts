
/**
 * Форматирует стоимость здания для отображения
 */
export const formatCost = (cost: any): string => {
  if (!cost || Object.keys(cost).length === 0) {
    return 'Стоимость не определена';
  }
  
  return Object.entries(cost)
    .map(([resourceId, amount]) => {
      // Получаем название ресурса
      const resourceName = getResourceName(resourceId);
      
      // Форматируем количество
      const formattedAmount = formatNumber(Number(amount));
      
      return `${resourceName}: ${formattedAmount}`;
    })
    .join(', ');
};

/**
 * Форматирует число для удобочитаемого отображения
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K';
  } else if (typeof num === 'number' && num !== Math.floor(num)) {
    // Для дробных чисел проверяем степень малости
    if (num < 0.01) {
      return num.toFixed(8);
    } else {
      return num.toFixed(2);
    }
  } else {
    return num.toString();
  }
};

/**
 * Возвращает название ресурса по его идентификатору
 */
const getResourceName = (resourceId: string): string => {
  const resourceNames: {[key: string]: string} = {
    knowledge: 'Знания',
    usdt: 'USDT',
    electricity: 'Электричество',
    computingPower: 'Вычисл. мощность',
    bitcoin: 'Bitcoin'
  };
  
  return resourceNames[resourceId] || resourceId;
};
