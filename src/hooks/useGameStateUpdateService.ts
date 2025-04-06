
import { useEffect, useCallback } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { UnlockService } from '@/services/UnlockService';
import { useResourceSystem } from './useResourceSystem';

export const useGameStateUpdateService = () => {
  const { state, dispatch, isPageVisible } = useGame();
  const { updateResources } = useResourceSystem();
  const unlockService = new UnlockService();
  
  const updateGameState = useCallback(() => {
    if (isPageVisible && state.gameStarted) {
      const currentTime = Date.now();
      const deltaTime = currentTime - state.lastUpdate;
      
      // Обновляем ресурсы с учетом прошедшего времени
      updateResources(deltaTime);
      
      // Обновляем lastUpdate
      dispatch({ type: 'TICK', payload: { currentTime } });
    }
  }, [isPageVisible, state.gameStarted, state.lastUpdate, dispatch, updateResources]);
  
  useEffect(() => {
    // Запускаем таймер для обновления ресурсов каждую секунду
    const updateInterval = setInterval(updateGameState, 1000);
    
    // Запускаем таймер для проверки разблокировок каждые 5 секунд
    const unlockCheckInterval = setInterval(() => {
      if (isPageVisible && state.gameStarted) {
        dispatch({ type: 'CHECK_UNLOCKS' });
      }
    }, 5000);
    
    // Очистка таймеров при размонтировании
    return () => {
      clearInterval(updateInterval);
      clearInterval(unlockCheckInterval);
    };
  }, [updateGameState, isPageVisible, state.gameStarted, dispatch]);
  
  return null;
};
