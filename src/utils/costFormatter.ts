
import { formatNumber } from './helpers';

/**
 * Форматирует стоимость здания для отображения
 * @param cost Объект со стоимостями ресурсов
 * @returns Отформатированная строка стоимости
 */
export const formatCost = (cost: Record<string, number>) => {
  if (!cost || Object.keys(cost).length === 0) {
    return 'Стоимость не определена';
  }
  
  const costParts: string[] = [];
  
  // Обрабатываем каждый ресурс в стоимости
  Object.entries(cost).forEach(([resourceId, amount]) => {
    if (amount <= 0) return;
    
    // Форматируем значение с учетом типа ресурса
    let formattedValue = formatNumber(amount);
    
    // Добавляем префикс в зависимости от типа ресурса
    switch (resourceId) {
      case 'usdt':
        costParts.push(`${formattedValue} USDT`);
        break;
      case 'knowledge':
        costParts.push(`${formattedValue} знаний`);
        break;
      case 'electricity':
        costParts.push(`${formattedValue} эл.`);
        break;
      case 'computingPower':
        costParts.push(`${formattedValue} выч.`);
        break;
      case 'bitcoin':
        costParts.push(`${formattedValue} BTC`);
        break;
      default:
        costParts.push(`${formattedValue} ${resourceId}`);
    }
  });
  
  return costParts.join(', ');
};
