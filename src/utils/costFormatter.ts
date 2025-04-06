
import { formatNumber } from './helpers';
import { useTranslation } from '@/i18n';

/**
 * Форматирует стоимость здания для отображения
 */
export const formatCost = (cost: any, language: string = 'ru'): string => {
  if (!cost || Object.keys(cost).length === 0) {
    return language === 'ru' ? 'Стоимость не определена' : 'Cost not defined';
  }
  
  return Object.entries(cost)
    .map(([resourceId, amount]) => {
      // Получаем название ресурса
      const resourceName = getResourceName(resourceId, language);
      
      // Форматируем количество
      const formattedAmount = formatNumber(Number(amount));
      
      return `${resourceName}: ${formattedAmount}`;
    })
    .join(', ');
};

/**
 * Возвращает название ресурса по его идентификатору с учетом языка
 */
const getResourceName = (resourceId: string, language: string = 'ru'): string => {
  const resourceNamesRu: {[key: string]: string} = {
    knowledge: 'Знания',
    usdt: 'USDT',
    electricity: 'Электричество',
    computingPower: 'Вычисл. мощность',
    bitcoin: 'Bitcoin'
  };
  
  const resourceNamesEn: {[key: string]: string} = {
    knowledge: 'Knowledge',
    usdt: 'USDT',
    electricity: 'Electricity',
    computingPower: 'Computing Power',
    bitcoin: 'Bitcoin'
  };
  
  const names = language === 'ru' ? resourceNamesRu : resourceNamesEn;
  return names[resourceId] || resourceId;
};
