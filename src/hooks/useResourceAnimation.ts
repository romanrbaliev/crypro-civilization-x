
import { useState, useEffect, useRef } from 'react';
import { getResourceFormat } from '@/utils/resourceFormatConfig';

/**
 * Хук для анимации плавного изменения значения ресурса
 */
export const useResourceAnimation = (
  actualValue: number,
  resourceId: string
): number => {
  const [displayValue, setDisplayValue] = useState(actualValue);
  const prevValueRef = useRef(actualValue);
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Получаем конфигурацию обновления для ресурса
    const { updateFrequency } = getResourceFormat(resourceId);
    
    // Останавливаем предыдущую анимацию, если она есть
    if (animationRef.current !== null) {
      clearInterval(animationRef.current);
    }
    
    // Если значение не изменилось, не запускаем анимацию
    if (actualValue === prevValueRef.current) {
      return;
    }
    
    // Текущее отображаемое значение
    let currentDisplayValue = prevValueRef.current;
    
    // Запускаем интервал для анимации
    animationRef.current = window.setInterval(() => {
      // Получаем инкремент для плавного обновления
      // Чем больше разница, тем быстрее будет изменяться значение
      const diff = actualValue - currentDisplayValue;
      // Минимальное изменение за шаг анимации
      const minStep = Math.max(Math.abs(diff) * 0.1, 0.001);
      // Определяем размер шага
      const step = Math.sign(diff) * minStep;
      
      // Если мы почти достигли целевого значения, устанавливаем его точно
      if (Math.abs(diff) < minStep) {
        currentDisplayValue = actualValue;
        setDisplayValue(actualValue);
        clearInterval(animationRef.current!);
        animationRef.current = null;
      } else {
        // Иначе приближаемся к цели постепенно
        currentDisplayValue += step;
        setDisplayValue(currentDisplayValue);
      }
    }, updateFrequency);
    
    // Обновляем предыдущее значение
    prevValueRef.current = actualValue;
    
    // Очистка при размонтировании
    return () => {
      if (animationRef.current !== null) {
        clearInterval(animationRef.current);
      }
    };
  }, [actualValue, resourceId]);
  
  return displayValue;
};
