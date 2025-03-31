
import { useEffect } from 'react';
import { useGameState } from '../context/GameStateContext';
import { GameStateService } from '@/services/GameStateService';

/**
 * Хук для управления централизованным обновлением состояния игры
 */
export function useGameStateUpdateService() {
  const { state, dispatch } = useGameState();
  
  // Обновление ресурсов на регулярной основе
  useEffect(() => {
    if (!state.gameStarted) return;
    
    console.log('⚙️ Запуск сервиса обновления состояния игры');
    
    const intervalId = setInterval(() => {
      dispatch({ type: 'UPDATE_RESOURCES' });
      
      // Проверяем статусы оборудования, зависящего от электричества
      if (state.resources.electricity && state.resources.electricity.value <= 0) {
        // Если электричество закончилось, отправляем событие для проверки оборудования
        dispatch({ type: 'CHECK_EQUIPMENT_STATUS' });
      }
    }, 1000); // Полное обновление каждую секунду
    
    return () => {
      console.log('🛑 Остановка сервиса обновления состояния игры');
      clearInterval(intervalId);
    };
  }, [state.gameStarted, dispatch, state.resources.electricity]);
  
  // Обновление состояния при критических изменениях
  useEffect(() => {
    if (!state.gameStarted) return;
    
    console.log('🔄 Настройка периодической полной синхронизации состояния');
    
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
    }, 5000); // Каждые 5 секунд выполняем полную синхронизацию
    
    return () => {
      console.log('🛑 Остановка полной синхронизации состояния');
      clearInterval(syncIntervalId);
    };
  }, [state.gameStarted, dispatch]); 
  
  return null;
}
