
import { formatNumber } from './helpers';
import { getResourceName } from '@/data/gameElements';

/**
 * Форматирует стоимость здания для отображения с учетом языка
 */
export const formatCost = (cost: any, language: string = 'ru'): string => {
  if (!cost || Object.keys(cost).length === 0) {
    return language === 'ru' ? 'Стоимость не определена' : 'Cost not defined';
  }
  
  return Object.entries(cost)
    .map(([resourceId, amount]) => {
      // Получаем название ресурса с учетом языка из единого источника данных
      const resourceName = getResourceName(resourceId, language);
      
      // Форматируем количество
      const formattedAmount = formatNumber(Number(amount));
      
      return `${formattedAmount} ${resourceName}`;
    })
    .join(', ');
};
