
import { useState, useEffect, useRef } from 'react';
import { getResourceFormat } from '@/utils/resourceFormatConfig';

/**
 * Хук для обновления значения ресурса с регулярным интервалом
 * @param targetValue Целевое значение
 * @param resourceId ID ресурса
 * @returns Текущее отображаемое значение
 */
export const useResourceAnimation = (targetValue: number, resourceId: string): number => {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const lastUpdateRef = useRef<number>(Date.now());
  
  // Получаем конфигурацию обновления для ресурса
  const resourceFormat = getResourceFormat(resourceId);
  // Устанавливаем частоту обновления на 5 раз в секунду (200мс)
  const updateFrequency = 200;
  
  useEffect(() => {
    // Обновляем значение сразу, если разница слишком маленькая
    if (Math.abs(targetValue - displayValue) < 0.001) {
      setDisplayValue(targetValue);
      return;
    }
    
    // Создаем интервал для регулярного обновления
    const interval = setInterval(() => {
      const currentTime = Date.now();
      // Проверяем, прошло ли достаточно времени с последнего обновления
      if (currentTime - lastUpdateRef.current >= updateFrequency) {
        // Прямое обновление без анимации
        setDisplayValue(targetValue);
        lastUpdateRef.current = currentTime;
      }
    }, updateFrequency);
    
    // Очищаем интервал при размонтировании или изменении целевого значения
    return () => clearInterval(interval);
  }, [targetValue, displayValue, updateFrequency]);
  
  return displayValue;
};
