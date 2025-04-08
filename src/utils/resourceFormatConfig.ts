
import { ResourceFormatter } from '@/formatters/ResourceFormatter';

// Создаем экземпляр форматтера
const resourceFormatter = new ResourceFormatter();

/**
 * Форматирует значение ресурса для отображения
 */
export const formatResourceValue = (
  value: number | null | undefined, 
  resourceId: string
): string => {
  return resourceFormatter.formatResourceValue(Number(value) || 0, resourceId);
};

/**
 * Форматирует стоимость для отображения
 */
export const formatResourceCost = (
  cost: Record<string, number>, 
  language: string = 'ru'
): string => {
  return resourceFormatter.formatCost(cost, language);
};
