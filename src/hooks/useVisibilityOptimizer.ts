
import { useState, useEffect } from 'react';

/**
 * Хук для определения видимости страницы и оптимизации производительности
 * @returns Булево значение, указывающее видима ли страница
 */
const useVisibilityOptimizer = (): boolean => {
  const [isPageVisible, setIsPageVisible] = useState(true);
  
  useEffect(() => {
    // Обработчик изменения видимости страницы
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
      console.log(`Видимость страницы изменена: ${!document.hidden}`);
    };
    
    // Обработчик фокуса окна
    const handleFocus = () => {
      setIsPageVisible(true);
      console.log('Окно в фокусе');
    };
    
    // Обработчик потери фокуса окна
    const handleBlur = () => {
      setIsPageVisible(false);
      console.log('Окно потеряло фокус');
    };
    
    // Регистрируем события
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    // Очистка при размонтировании
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);
  
  return isPageVisible;
};

export default useVisibilityOptimizer;
