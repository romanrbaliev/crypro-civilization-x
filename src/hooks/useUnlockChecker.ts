
import { useEffect } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { ensureUnlocksExist } from '@/utils/unlockHelper';

/**
 * Хук для периодической проверки разблокировок элементов игры и при действиях пользователя
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
    
    // Проверяем разблокировки каждые 3 секунды
    const intervalId = setInterval(checkUnlocks, 3000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [dispatch]);
  
  // Проверка разблокировок при изменении важных частей состояния
  useEffect(() => {
    dispatch({ type: "CHECK_UNLOCKS" });
    console.log("📊 useUnlockChecker: Проверка разблокировок при изменении ресурсов");
  }, [
    state.resources.knowledge?.value, 
    state.resources.usdt?.value, 
    state.resources.electricity?.value,
    dispatch
  ]);
  
  // Проверка разблокировок при изменении счетчиков
  useEffect(() => {
    dispatch({ type: "CHECK_UNLOCKS" });
    console.log("📊 useUnlockChecker: Проверка разблокировок при изменении счетчиков");
  }, [state.counters, dispatch]);
  
  // Проверка разблокировок при изменении зданий
  useEffect(() => {
    dispatch({ type: "CHECK_UNLOCKS" });
    console.log("📊 useUnlockChecker: Проверка разблокировок при изменении зданий");
  }, [
    Object.values(state.buildings).map(b => b.count).join(','), 
    dispatch
  ]);
  
  // Проверка разблокировок при изменении исследований
  useEffect(() => {
    dispatch({ type: "CHECK_UNLOCKS" });
    console.log("📊 useUnlockChecker: Проверка разблокировок при изменении исследований");
  }, [
    Object.values(state.upgrades).map(u => u.purchased).join(','), 
    dispatch
  ]);
  
  // Возвращаем пустой объект, просто для возможности использования хука
  return {};
};
