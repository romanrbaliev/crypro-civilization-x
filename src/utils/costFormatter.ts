
import { formatNumber } from './helpers';
import { getResourceName } from '@/data/gameElements';

/**
 * Форматирует стоимость здания для отображения с учетом языка
 */
export const formatCost = (cost: any, language: string = 'ru'): string => {
  // Проверка на null, undefined или пустой объект
  if (!cost || typeof cost !== 'object' || Object.keys(cost).length === 0) {
    return language === 'ru' ? 'Стоимость не определена' : 'Cost not defined';
  }
  
  // Фильтруем только действительные пары ключ-значение, где значение - число
  const validCostEntries = Object.entries(cost)
    .filter(([_, amount]) => amount !== undefined && amount !== null && !isNaN(Number(amount)));
  
  // Если после фильтрации нет валидных элементов, возвращаем сообщение об ошибке
  if (validCostEntries.length === 0) {
    return language === 'ru' ? 'Стоимость не определена' : 'Cost not defined';
  }
  
  // Форматирование валидных элементов стоимости
  return validCostEntries
    .map(([resourceId, amount]) => {
      // Получаем название ресурса с учетом языка из единого источника данных
      const resourceName = getResourceName(resourceId, language);
      
      // Форматируем количество
      const formattedAmount = formatNumber(Number(amount));
      
      return `${formattedAmount} ${resourceName}`;
    })
    .join(', ');
};
