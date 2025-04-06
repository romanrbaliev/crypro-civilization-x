
import { useEffect, useCallback } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { GameStateService } from '@/services/GameStateService';
import { UnlockService } from '@/services/UnlockService';

export const useGameStateUpdateService = () => {
  const { state, dispatch, isPageVisible } = useGame();
  const gameStateService = new GameStateService();
  const unlockService = new UnlockService();
  
  const updateGameState = useCallback(() => {
    if (isPageVisible && state.gameStarted) {
      dispatch({ type: 'UPDATE_RESOURCES' });
    }
  }, [isPageVisible, state.gameStarted, dispatch]);
  
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
