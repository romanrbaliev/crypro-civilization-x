
import { useEffect, useRef } from 'react';
import { useGameState } from '../context/GameStateContext';
import { GameStateService } from '@/services/GameStateService';

/**
 * Хук для управления централизованным обновлением состояния игры
 */
export function useGameStateUpdateService() {
  const { state, dispatch } = useGameState();
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalIdRef = useRef<NodeJS.Timeout | null>(null);
  
  // Обновление ресурсов на регулярной основе
  useEffect(() => {
    if (!state.gameStarted) return;
    
    console.log('⚙️ Запуск сервиса обновления состояния игры');
    
    // Очищаем предыдущий интервал, если он был
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    
    intervalIdRef.current = setInterval(() => {
      // Проверяем статусы оборудования, зависящего от электричества
      if (state.resources.electricity && state.resources.electricity.value <= 0) {
        // Если электричество закончилось, отправляем событие для проверки оборудования
        dispatch({ type: 'CHECK_EQUIPMENT_STATUS' });
      }
    }, 1000); // Проверка оборудования каждую секунду
    
    return () => {
      console.log('🛑 Остановка сервиса обновления состояния игры');
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
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
    
    // Очищаем предыдущий интервал синхронизации, если он был
    if (syncIntervalIdRef.current) {
      clearInterval(syncIntervalIdRef.current);
      syncIntervalIdRef.current = null;
    }
    
    // Дополнительно запускаем периодическую полную синхронизацию
    syncIntervalIdRef.current = setInterval(() => {
      dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
    }, 5000); // Каждые 5 секунд выполняем полную синхронизацию
    
    return () => {
      console.log('🛑 Остановка полной синхронизации состояния');
      if (syncIntervalIdRef.current) {
        clearInterval(syncIntervalIdRef.current);
        syncIntervalIdRef.current = null;
      }
    };
  }, [state.gameStarted, dispatch]); 
  
  return null;
}
