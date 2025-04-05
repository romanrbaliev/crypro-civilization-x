
import { useState, useEffect } from 'react';

/**
 * Хук для оптимизации обновлений игры в зависимости от видимости страницы
 * @returns Видима ли страница
 */
const useVisibilityOptimizer = (): boolean => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    // Установка первоначального значения
    setIsVisible(document.visibilityState === 'visible');
    
    // Обработчик изменения видимости
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
      console.log(`Видимость страницы изменилась: ${document.visibilityState === 'visible' ? 'видима' : 'скрыта'}`);
    };
    
    // Регистрация обработчика
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Очистка обработчика при размонтировании
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  return isVisible;
};

export default useVisibilityOptimizer;
