
import { useState, useEffect } from 'react';
import { getResourceFormat } from '@/utils/resourceFormatConfig';

/**
 * Хук для плавной анимации изменения значения ресурса
 * @param targetValue Целевое значение
 * @param resourceId ID ресурса
 * @returns Текущее анимированное значение
 */
export const useResourceAnimation = (targetValue: number, resourceId: string): number => {
  const [displayValue, setDisplayValue] = useState(targetValue);
  
  // Получаем конфигурацию обновления для ресурса
  const resourceFormat = getResourceFormat(resourceId);
  const updateFrequency = resourceFormat.updateFrequency || 50; // По умолчанию 50мс (20 обновлений в секунду)
  
  useEffect(() => {
    // Если разница слишком маленькая, сразу обновляем значение
    if (Math.abs(targetValue - displayValue) < 0.01) {
      setDisplayValue(targetValue);
      return;
    }
    
    // Создаем интервал для плавной анимации
    const interval = setInterval(() => {
      setDisplayValue(prev => {
        // Вычисляем шаг изменения (10% от разницы)
        const step = (targetValue - prev) * 0.1;
        
        // Если шаг очень маленький, завершаем анимацию
        if (Math.abs(step) < 0.01) {
          clearInterval(interval);
          return targetValue;
        }
        
        return prev + step;
      });
    }, updateFrequency);
    
    // Очищаем интервал при размонтировании или изменении целевого значения
    return () => clearInterval(interval);
  }, [targetValue, displayValue, updateFrequency]);
  
  return displayValue;
};
