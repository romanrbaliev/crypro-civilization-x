
import { useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { UnlockService } from '@/services/UnlockService';
import { useResourceSystem } from './useResourceSystem';
import { checkAllUnlocks } from '@/utils/unlockManager';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Хук для централизованного обновления игрового состояния
 * Объединяет логику обновления ресурсов и проверки разблокировок
 */
export const useGameStateUpdateService = () => {
  const { state, dispatch, isPageVisible } = useGame();
  const { updateResources } = useResourceSystem();
  const unlockService = new UnlockService();
  const lastUpdateTimeRef = useRef<number>(Date.now());
  
  /**
   * Обновляет игровое состояние с учетом прошедшего времени
   */
  const updateGameState = useCallback(() => {
    if (isPageVisible && state.gameStarted) {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastUpdateTimeRef.current;
      
      // Обновляем ресурсы с учетом прошедшего времени, только если прошло не менее 50мс
      if (deltaTime >= 50) {
        // Обновляем ресурсы через ResourceSystem
        updateResources(deltaTime);
        lastUpdateTimeRef.current = currentTime;
        
        // Обновляем lastUpdate в состоянии
        dispatch({ type: 'TICK', payload: { currentTime } });
        
        // Отладочная информация каждые 5 секунд
        if (Math.random() < 0.02) { // ~2% шанс вывода в консоль
          console.log(`[GameUpdate] Прошло ${deltaTime}мс. Ресурсы обновлены.`);
        }
      }
    }
  }, [isPageVisible, state.gameStarted, dispatch, updateResources]);
  
  /**
   * Проверяет все возможные разблокировки
   */
  const checkUnlocks = useCallback(() => {
    if (isPageVisible && state.gameStarted) {
      dispatch({ type: 'CHECK_UNLOCKS' });
    }
  }, [isPageVisible, state.gameStarted, dispatch]);
  
  // Эффект для запуска таймеров обновления ресурсов и проверки разблокировок
  useEffect(() => {
    if (!state.gameStarted) return;
    
    // Запускаем таймер для обновления ресурсов каждые 100 миллисекунд
    const updateInterval = setInterval(updateGameState, 100);
    
    // Запускаем таймер для проверки разблокировок каждые 5 секунд
    const unlockCheckInterval = setInterval(checkUnlocks, 5000);
    
    // Логируем информацию о запуске системы обновления
    console.log(`🔄 Система обновления игрового состояния запущена. 
      Интервал обновления: 100мс, 
      Интервал проверки разблокировок: 5000мс`);
    
    // Очистка таймеров при размонтировании
    return () => {
      clearInterval(updateInterval);
      clearInterval(unlockCheckInterval);
      console.log('🛑 Система обновления игрового состояния остановлена');
    };
  }, [updateGameState, checkUnlocks, state.gameStarted]);
  
  // Эффект для обработки возобновления активности вкладки
  useEffect(() => {
    if (!state.gameStarted) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentTime = Date.now();
        const offlineTime = currentTime - lastUpdateTimeRef.current;
        
        if (offlineTime > 1000) { // Если прошло более 1 секунды
          // Обновляем состояние с учетом прошедшего времени
          updateResources(offlineTime);
          lastUpdateTimeRef.current = currentTime;
          
          // Отправляем событие о возобновлении игры
          safeDispatchGameEvent({
            message: `Добро пожаловать обратно! Прошло ${Math.floor(offlineTime / 1000)} сек.`,
            type: 'info'
          });
          
          console.log(`[GameResume] Игра возобновлена после ${offlineTime}мс отсутствия.`);
        }
      }
    };
    
    // Добавляем слушатель события изменения видимости
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Удаляем слушатель при размонтировании
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.gameStarted, updateResources]);
  
  return null;
};
