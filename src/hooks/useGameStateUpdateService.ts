
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
  const frameCountRef = useRef<number>(0);
  
  /**
   * Обновляет игровое состояние с учетом прошедшего времени
   */
  const updateGameState = useCallback(() => {
    frameCountRef.current += 1;
    
    if (isPageVisible && state.gameStarted) {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastUpdateTimeRef.current;
      
      // Всегда обновляем ресурсы, даже если прошло мало времени
      // Это устраняет проблему с неплавным обновлением ресурсов
      updateResources(deltaTime);
      lastUpdateTimeRef.current = currentTime;
      
      // Обновляем lastUpdate в состоянии
      dispatch({ type: 'TICK', payload: { currentTime } });
      
      // Отладочная информация - примерно каждые 3 секунды
      if (frameCountRef.current % 100 === 0) {
        console.log(`[GameUpdate] Кадр #${frameCountRef.current}, Δt=${deltaTime}мс`);
        
        // Дополнительная отладочная информация о ресурсах
        const activeResources = Object.entries(state.resources)
          .filter(([_, res]) => res.unlocked && res.perSecond !== 0)
          .map(([id, res]) => `${id}: ${res.value?.toFixed(2) || 0}/${res.max || '∞'} (${res.perSecond?.toFixed(2) || 0}/сек)`);
        
        if (activeResources.length > 0) {
          console.log('[ResourceDebug] Активные ресурсы:', activeResources);
        }
      }
    }
  }, [isPageVisible, state.gameStarted, dispatch, updateResources, state.resources]);
  
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
    
    // Запускаем интервал анимации для более плавного обновления
    let animationFrameId: number;
    
    const updateFrame = () => {
      updateGameState();
      animationFrameId = requestAnimationFrame(updateFrame);
    };
    
    animationFrameId = requestAnimationFrame(updateFrame);
    
    // Запускаем таймер для проверки разблокировок каждые 5 секунд
    const unlockCheckInterval = setInterval(checkUnlocks, 5000);
    
    // Логируем информацию о запуске системы обновления
    console.log(`🔄 Система обновления игрового состояния запущена в режиме requestAnimationFrame`);
    
    // Очистка таймеров при размонтировании
    return () => {
      cancelAnimationFrame(animationFrameId);
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
