
import { useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { UnlockService } from '@/services/UnlockService';
import { useResourceSystem } from './useResourceSystem';

export const useGameStateUpdateService = () => {
  const { state, dispatch, isPageVisible } = useGame();
  const { updateResources } = useResourceSystem();
  const unlockService = new UnlockService();
  const lastUpdateTimeRef = useRef<number>(Date.now());
  
  const updateGameState = useCallback(() => {
    if (isPageVisible && state.gameStarted) {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastUpdateTimeRef.current;
      
      // Обновляем ресурсы с учетом прошедшего времени, только если прошло не менее 50мс
      if (deltaTime >= 50) {
        updateResources(deltaTime);
        lastUpdateTimeRef.current = currentTime;
        
        // Обновляем lastUpdate в состоянии
        dispatch({ type: 'TICK', payload: { currentTime } });
      }
    }
  }, [isPageVisible, state.gameStarted, dispatch, updateResources]);
  
  useEffect(() => {
    // Запускаем таймер для обновления ресурсов каждые 100 миллисекунд
    const updateInterval = setInterval(updateGameState, 100);
    
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
