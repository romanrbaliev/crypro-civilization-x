
import { formatNumber } from './helpers';
import { useTranslation } from '@/i18n';

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
