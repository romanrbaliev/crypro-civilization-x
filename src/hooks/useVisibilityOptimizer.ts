
import { useEffect, useState } from 'react';

/**
 * Хук для оптимизации обновлений в зависимости от видимости вкладки
 */
export const useVisibilityOptimizer = (initialValue: boolean = true) => {
  const [isVisible, setIsVisible] = useState(initialValue);
  
  useEffect(() => {
    // Функция для определения видимости страницы
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    
    // Регистрируем обработчик события видимости страницы
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Установка начального состояния
    setIsVisible(!document.hidden);
    
    // Очистка при размонтировании
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  
  return isVisible;
};

export default useVisibilityOptimizer;
