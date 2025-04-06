
import { formatNumber } from './helpers';
import { getResourceName } from '@/data/gameElements';
import { ResourceFormatter } from '@/formatters/ResourceFormatter';

// Создаем статический экземпляр для использования без хука
const resourceFormatter = new ResourceFormatter();

/**
 * Форматирует стоимость здания для отображения с учетом языка
 */
export const formatCost = (cost: any, language: string = 'ru'): string => {
  return resourceFormatter.formatCost(cost, language);
};
