
import { getResourceName } from '@/data/gameElements';
import { formatNumber } from '@/utils/helpers';
import { ResourceFormatConfig, resourceFormats, getResourceFormat } from '@/utils/resourceFormatConfig';

/**
 * Система форматирования ресурсов
 */
export class ResourceFormatter {
  private formatConfigs: { [key: string]: ResourceFormatConfig };

  constructor(configs?: { [key: string]: ResourceFormatConfig }) {
    this.formatConfigs = configs || resourceFormats;
  }

  /**
   * Форматирует стоимость здания для отображения с учетом языка
   * @param cost Объект стоимости
   * @param language Код языка
   * @returns Отформатированная строка стоимости
   */
  public formatCost(cost: any, language: string = 'ru'): string {
    // Проверка на null, undefined или пустой объект
    if (!cost || typeof cost !== 'object' || Object.keys(cost).length === 0) {
      return language === 'ru' ? 'Стоимость не определена' : 'Cost not defined';
    }
    
    // Фильтруем только действительные пары ключ-значение, где значение - число
    const validCostEntries = Object.entries(cost)
      .filter(([_, amount]) => amount !== undefined && amount !== null && !isNaN(Number(amount)) && Number(amount) > 0);
    
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
  }

  /**
   * Форматирует числовое значение ресурса
   * @param value Числовое значение
   * @param resourceId ID ресурса
   * @returns Отформатированное значение
   */
  public formatValue(value: number | null | undefined, resourceId: string): string {
    // Проверка на null или undefined
    if (value === null || value === undefined) return "0";
    if (value === Infinity) return "∞";
    if (isNaN(value)) return "0";
    
    const format = this.getResourceFormat(resourceId);
    if (Math.abs(value) < format.minValue) return "0";
    
    // Используем форматирование с буквами K и M для больших чисел
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1).replace('.0', '') + "M";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1).replace('.0', '') + "K";
    } else {
      const options: Intl.NumberFormatOptions = {
        minimumFractionDigits: format.decimalPlaces,
        maximumFractionDigits: format.decimalPlaces,
        useGrouping: format.useGrouping
      };
      
      return new Intl.NumberFormat('ru-RU', options).format(value);
    }
  }

  /**
   * Получение конфигурации форматирования для ресурса
   * @param resourceId ID ресурса
   * @returns Конфигурация форматирования
   */
  public getResourceFormat(resourceId: string): ResourceFormatConfig {
    return this.formatConfigs[resourceId] || this.formatConfigs.default;
  }

  /**
   * Преобразует название ресурса для отображения
   * @param resourceId ID ресурса
   * @param name Оригинальное название
   * @returns Преобразованное название
   */
  public getDisplayName(resourceId: string, name: string): string {
    // Преобразуем название ресурса для отображения
    const resourceMap: Record<string, string> = {
      'usdt': 'USDT',
      'bitcoin': 'Bitcoin',
      'knowledge': 'Знания',
      'electricity': 'Электричество',
      'computingPower': 'Вычисл. мощность'
    };
    
    return resourceMap[resourceId] || name;
  }
}
