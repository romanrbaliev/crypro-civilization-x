
import { formatNumber } from './helpers';
import { useTranslation } from '@/i18n';

/**
 * Форматирует стоимость здания для отображения с учетом языка
 */
export const formatCost = (cost: any, language: string = 'ru'): string => {
  if (!cost || Object.keys(cost).length === 0) {
    return language === 'ru' ? 'Стоимость не определена' : 'Cost not defined';
  }
  
  return Object.entries(cost)
    .map(([resourceId, amount]) => {
      // Получаем название ресурса с учетом языка
      const resourceName = getResourceName(resourceId, language);
      
      // Форматируем количество
      const formattedAmount = formatNumber(Number(amount));
      
      return `${formattedAmount} ${resourceName}`;
    })
    .join(', ');
};

/**
 * Возвращает название ресурса по его идентификатору с учетом языка
 */
const getResourceName = (resourceId: string, language: string = 'ru'): string => {
  // Используем словари для перевода
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
  
  // Выбираем словарь в зависимости от языка
  const names = language === 'ru' ? resourceNamesRu : resourceNamesEn;
  
  // Возвращаем перевод или ID ресурса, если перевод не найден
  return names[resourceId] || resourceId;
};
