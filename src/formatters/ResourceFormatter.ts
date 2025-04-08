
import { formatNumber } from '@/utils/helpers';

export class ResourceFormatter {
  /**
   * Форматирует стоимость для отображения
   */
  formatCost(cost: any, language: string = 'ru'): string {
    if (!cost || typeof cost !== 'object') {
      return '';
    }
    
    const entries = Object.entries(cost);
    if (entries.length === 0) {
      return '';
    }
    
    return entries.map(([resourceId, amount]) => {
      return `${formatNumber(amount as number, resourceId)} ${resourceId}`;
    }).join(', ');
  }
  
  /**
   * Форматирует значение ресурса
   */
  formatResourceValue(value: number | null | undefined, resourceId: string): string {
    if (value === null || value === undefined) {
      return '0';
    }
    
    // Правила форматирования для разных типов ресурсов
    if (resourceId === 'bitcoin') {
      return value.toFixed(8);
    } else if (['knowledge', 'electricity', 'computingPower'].includes(resourceId)) {
      return value.toFixed(1);
    } else if (value > 1000000) {
      return (value / 1000000).toFixed(2) + 'M';
    } else if (value > 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    
    return value.toFixed(0);
  }
}
