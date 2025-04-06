
import { useEffect } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { ensureUnlocksExist } from '@/utils/unlockHelper';

/**
 * Хук для периодической проверки разблокировок элементов игры
 */
export const useUnlockChecker = () => {
  const { state, dispatch } = useGame();
  
  // Проверка разблокировок при первом рендере
  useEffect(() => {
    // Обеспечиваем обратную совместимость
    if (!state.unlocks) {
      const updatedState = ensureUnlocksExist(state);
      dispatch({ type: "LOAD_GAME", payload: updatedState });
    }
    
    dispatch({ type: "CHECK_UNLOCKS" });
    console.log("📊 useUnlockChecker: Первоначальная проверка разблокировок");
  }, [dispatch, state]);
  
  // Проверка разблокировок при изменении ключевых показателей
  useEffect(() => {
    const checkUnlocks = () => {
      dispatch({ type: "CHECK_UNLOCKS" });
    };
    
    // Проверяем разблокировки каждые 3 секунды (уменьшил интервал с 5 до 3 для более быстрой реакции)
    const intervalId = setInterval(checkUnlocks, 3000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [dispatch]);
  
  // Возвращаем пустой объект, просто для возможности использования хука
  return {};
};
