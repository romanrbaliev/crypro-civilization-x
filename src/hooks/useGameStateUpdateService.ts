
import { useEffect } from 'react';
import { useGameState } from '@/context/GameStateContext';
import { GameStateService } from '@/services/GameStateService';

/**
 * Хук для управления централизованным обновлением состояния игры
 */
export function useGameStateUpdateService() {
  const { state, dispatch } = useGameState();
  
  // Обновление ресурсов каждую секунду
  useEffect(() => {
    if (!state.gameStarted) return;
    
    const intervalId = setInterval(() => {
      dispatch({ type: 'UPDATE_RESOURCES' });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [state.gameStarted, dispatch]);
  
  // Обновление состояния при критических изменениях
  useEffect(() => {
    if (!state.gameStarted) return;
    
    // При загрузке игры проводим полную синхронизацию состояния
    const gameStateService = new GameStateService();
    const syncedState = gameStateService.performFullStateSync(state);
    
    // Если состояние изменилось, применяем изменения
    if (syncedState !== state) {
      dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
    }
  }, [state.gameStarted]); // Запускаем только при изменении статуса игры
  
  return null;
}
