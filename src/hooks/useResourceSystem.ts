
import { useCallback } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { formatResourceValue } from '@/utils/resourceFormatConfig';

/**
 * Хук для работы с системой ресурсов
 * Предоставляет функции форматирования и работы с ресурсами
 */
export const useResourceSystem = () => {
  const { state } = useGame();
  
  /**
   * Форматирует значение ресурса для отображения
   */
  const formatValue = useCallback((value: number | null | undefined, resourceId: string) => {
    if (value === null || value === undefined) return "0";
    return formatResourceValue(value, resourceId);
  }, []);
  
  /**
   * Объект с методами форматирования ресурсов
   */
  const resourceFormatter = {
    /**
     * Преобразует ID ресурса в отображаемое имя
     */
    getDisplayName: (id: string, fallbackName?: string): string => {
      const resourceNameMap: Record<string, string> = {
        'knowledge': 'Знания',
        'usdt': 'USDT',
        'electricity': 'Электричество', 
        'computingPower': 'Вычисл. мощность',
        'bitcoin': 'Bitcoin'
      };
      
      return resourceNameMap[id] || fallbackName || id;
    }
  };
  
  return {
    formatValue,
    resourceFormatter,
    resources: state.resources
  };
};

export default useResourceSystem;
