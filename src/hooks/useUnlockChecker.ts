
import { useEffect } from 'react';
import { useGame } from '@/context/hooks/useGame';

/**
 * Хук для периодической проверки разблокировок элементов игры
 */
export const useUnlockChecker = () => {
  const { state, dispatch } = useGame();
  
  // Проверка разблокировок при первом рендере
  useEffect(() => {
    dispatch({ type: "CHECK_UNLOCKS" });
    console.log("📊 useUnlockChecker: Первоначальная проверка разблокировок");
  }, [dispatch]);
  
  // Проверка разблокировок при изменении ключевых показателей
  useEffect(() => {
    const checkUnlocks = () => {
      dispatch({ type: "CHECK_UNLOCKS" });
    };
    
    // Проверяем разблокировки каждые 5 секунд
    const intervalId = setInterval(checkUnlocks, 5000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [dispatch]);
  
  // Возвращаем пустой объект, просто для возможности использования хука
  return {};
};
