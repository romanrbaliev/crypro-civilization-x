
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
      cancelAnimationFrame(animationRef.current);
    }
    
    // Если значение не изменилось, не запускаем анимацию
    if (actualValue === prevValueRef.current) {
      return;
    }

    // Если это прямое действие пользователя (большое изменение), сразу обновляем значение
    const diff = Math.abs(actualValue - prevValueRef.current);
    const isUserAction = diff > 1; // Предполагаем, что большие изменения - это действия пользователя
    
    if (isUserAction) {
      setDisplayValue(actualValue);
      prevValueRef.current = actualValue;
      return;
    }
    
    // Текущее отображаемое значение
    let currentDisplayValue = prevValueRef.current;
    let lastTimestamp = performance.now();
    
    // Функция анимации
    const animate = (timestamp: number) => {
      // Вычисляем прошедшее время с последнего кадра
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      
      // Получаем разницу между текущим и целевым значением
      const diff = actualValue - currentDisplayValue;
      
      // Скорость изменения пропорциональна разнице и прошедшему времени
      // Чем больше разница, тем быстрее изменение
      const speed = Math.max(Math.abs(diff) * 0.1, 0.001);
      
      // Определяем шаг с учетом направления изменения и прошедшего времени
      const step = Math.sign(diff) * speed * (deltaTime / 16); // Нормализуем по 60fps
      
      // Если мы почти достигли целевого значения или перешагнули его, устанавливаем точное значение
      if (Math.abs(diff) < Math.abs(step) || 
          (diff > 0 && currentDisplayValue + step > actualValue) || 
          (diff < 0 && currentDisplayValue + step < actualValue)) {
        currentDisplayValue = actualValue;
        setDisplayValue(actualValue);
        animationRef.current = null;
      } else {
        // Иначе делаем шаг к целевому значению
        currentDisplayValue += step;
        setDisplayValue(currentDisplayValue);
        // Продолжаем анимацию
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    // Запускаем анимацию
    animationRef.current = requestAnimationFrame(animate);
    
    // Обновляем предыдущее значение
    prevValueRef.current = actualValue;
    
    // Очистка при размонтировании
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [actualValue, resourceId]);
  
  return displayValue;
};
