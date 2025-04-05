
import { useEffect } from 'react';
import { useGameState } from '../context/GameStateContext';
import { saveGame } from '@/utils/gameSaver';

/**
 * Хук для автоматического сохранения игры
 */
export function useGameSaver() {
  const { state } = useGameState();
  
  // Автосохранение каждые 30 секунд
  useEffect(() => {
    if (!state.gameStarted) return;
    
    const intervalId = setInterval(() => {
      saveGame(state, true);
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [state]);
  
  return null;
}
