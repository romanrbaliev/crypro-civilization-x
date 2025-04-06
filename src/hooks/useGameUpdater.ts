
import { useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { UnlockService } from '@/services/UnlockService';
import { useResourceManager } from './useResourceManager';

/**
 * Хук для обновления игрового состояния
 */
export const useGameUpdater = () => {
  const { state, dispatch, isPageVisible } = useGame();
  const { updateResources, recalculateProduction } = useResourceManager();
  const unlockService = new UnlockService();
  const lastTickTimeRef = useRef<number>(Date.now());
  
  // Функция для обновления состояния игры
  const updateGameState = useCallback(() => {
    if (!isPageVisible || !state.gameStarted) {
      return;
    }
    
    const currentTime = Date.now();
    const deltaTime = currentTime - state.lastUpdate;
    
    // Ограничиваем дельту времени для предотвращения резких скачков
    const cappedDeltaTime = Math.min(deltaTime, 60000);
    
    if (cappedDeltaTime > 0) {
      console.log(`useGameUpdater: Обновление состояния игры, прошло ${cappedDeltaTime}ms`);
      
      // Отправляем тик в редьюсер
      dispatch({ 
        type: 'TICK', 
        payload: { currentTime } 
      });
      
      lastTickTimeRef.current = currentTime;
    }
  }, [isPageVisible, state.gameStarted, state.lastUpdate, dispatch]);
  
  // Инициализация игрового состояния при загрузке
  useEffect(() => {
    if (state.gameStarted) {
      console.log("useGameUpdater: Инициализация игрового состояния");
      recalculateProduction();
    }
  }, [state.gameStarted, recalculateProduction]);
  
  // Обновление игрового состояния каждые 500мс
  useEffect(() => {
    const updateInterval = setInterval(updateGameState, 500);
    
    // Проверка разблокировок каждые 5 секунд
    const unlockCheckInterval = setInterval(() => {
      if (isPageVisible && state.gameStarted) {
        dispatch({ type: 'CHECK_UNLOCKS' });
      }
    }, 5000);
    
    return () => {
      clearInterval(updateInterval);
      clearInterval(unlockCheckInterval);
    };
  }, [updateGameState, isPageVisible, state.gameStarted, dispatch]);
  
  // Пересчет производства при изменении зданий
  useEffect(() => {
    const buildingCounts = Object.values(state.buildings).map(b => b.count).join(',');
    
    if (buildingCounts !== '0,0,0,0,0,0,0,0,0,0') {
      console.log("useGameUpdater: Изменение количества зданий, пересчитываем производство");
      recalculateProduction();
    }
  }, [Object.values(state.buildings).map(b => b.count).join(','), recalculateProduction]);
  
  return null;
};
