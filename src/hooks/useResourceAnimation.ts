
import { useState, useEffect, useRef } from 'react';

/**
 * Хук для плавной анимации изменения значений ресурсов
 * @param value текущее реальное значение ресурса
 * @param resourceId идентификатор ресурса (для оптимизации)
 * @returns анимированное значение ресурса
 */
export function useResourceAnimation(value: number, resourceId: string): number {
  const [animatedValue, setAnimatedValue] = useState(value);
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const startValueRef = useRef<number>(value);
  const targetValueRef = useRef<number>(value);
  const lastValueRef = useRef<number>(value);
  
  // Константа для определения скорости анимации
  const animationDuration = 300; // мс, более быстрая анимация для ощущения мгновенной реакции
  
  useEffect(() => {
    // Защита от null и undefined
    if (value === null || value === undefined) {
      setAnimatedValue(0);
      return;
    }
    
    // Проверяем, действительно ли изменилось значение
    if (Math.abs(value - lastValueRef.current) < 0.001) {
      return; // Пропускаем очень маленькие изменения
    }
    
    lastValueRef.current = value;
    
    // Если значение изменилось, запускаем анимацию
    if (value !== targetValueRef.current) {
      // Останавливаем предыдущую анимацию, если она была
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      // Запоминаем текущие значения для анимации
      startValueRef.current = animatedValue;
      targetValueRef.current = value;
      startTimeRef.current = performance.now();
      
      // Функция анимации
      const animate = (currentTime: number) => {
        // Рассчитываем прогресс
        const elapsedTime = currentTime - startTimeRef.current;
        const progress = Math.min(elapsedTime / animationDuration, 1);
        
        // Применяем плавность к прогрессу (easing function)
        const easedProgress = 1 - Math.pow(1 - progress, 2); // easeOutQuad для более плавного эффекта
        
        // Рассчитываем новое значение
        const newValue = startValueRef.current + (targetValueRef.current - startValueRef.current) * easedProgress;
        
        // Обновляем состояние
        setAnimatedValue(newValue);
        
        // Продолжаем анимацию, если она не завершена
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        }
      };
      
      // Запускаем анимацию
      frameRef.current = requestAnimationFrame(animate);
    }
    
    // Очистка при размонтировании
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, animatedValue, resourceId]);
  
  return animatedValue;
}
