
import { useEffect } from 'react';
import { useGameState } from '../context/GameStateContext';
import { GameStateService } from '@/services/GameStateService';

/**
 * Хук для управления централизованным обновлением состояния игры
 */
export function useGameStateUpdateService() {
  const { state, dispatch } = useGameState();
  
  // Обновление ресурсов каждые 0.05 секунд (увеличиваем частоту для максимально плавной анимации)
  useEffect(() => {
    if (!state.gameStarted) return;
    
    const intervalId = setInterval(() => {
      dispatch({ type: 'UPDATE_RESOURCES' });
      
      // Проверяем статусы оборудования, зависящего от электричества
      if (state.resources.electricity && state.resources.electricity.value <= 0) {
        // Если электричество закончилось, отправляем событие для проверки оборудования
        dispatch({ type: 'CHECK_EQUIPMENT_STATUS' });
      }
    }, 50); // Изменено для более плавного обновления
    
    return () => clearInterval(intervalId);
  }, [state.gameStarted, dispatch, state.resources.electricity]);
  
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
    
    // Дополнительно запускаем периодическую полную синхронизацию
    const syncIntervalId = setInterval(() => {
      dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
    }, 2000); // Каждые 2 секунды выполняем полную синхронизацию
    
    return () => clearInterval(syncIntervalId);
  }, [state.gameStarted, dispatch]); 
  
  return null;
}
