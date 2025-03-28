
import { useState, useEffect, useRef } from 'react';
import { getResourceFormat } from '@/utils/resourceFormatConfig';

/**
 * Хук для анимации изменения значений ресурсов
 * для создания эффекта плавного обновления
 */
export const useResourceAnimation = (
  actualValue: number,
  resourceId: string
): number => {
  const [displayValue, setDisplayValue] = useState(actualValue);
  const prevValueRef = useRef(actualValue);
  
  useEffect(() => {
    // Если разница между предыдущим и текущим значением небольшая,
    // сразу устанавливаем новое значение без анимации
    if (Math.abs(actualValue - prevValueRef.current) < 0.01) {
      setDisplayValue(actualValue);
      prevValueRef.current = actualValue;
      return;
    }
    
    // Иначе устанавливаем новое значение с небольшой задержкой
    const timeout = setTimeout(() => {
      setDisplayValue(actualValue);
      prevValueRef.current = actualValue;
    }, 50);
    
    return () => clearTimeout(timeout);
  }, [actualValue]);
  
  return displayValue;
};

export default useResourceAnimation;
