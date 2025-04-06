
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
  const lastLogTimeRef = useRef<number>(Date.now());
  
  // Добавляем механизм троттлинга для предотвращения слишком частых обновлений
  const throttleRef = useRef({
    lastUpdateCall: Date.now(),
    throttleTime: 16, // ~60 FPS
    frameCount: 0
  });
  
  /**
   * Обновляет игровое состояние с учетом прошедшего времени
   * С использованием троттлинга для предотвращения перегрузки браузера
   */
  const updateGameState = useCallback(() => {
    if (!isPageVisible || !state.gameStarted) return;
    
    const now = Date.now();
    const timeSinceLastUpdate = now - throttleRef.current.lastUpdateCall;
    
    // Применяем троттлинг для предотвращения слишком частых обновлений
    if (timeSinceLastUpdate < throttleRef.current.throttleTime) {
      return;
    }
    
    // Обновляем счетчик кадров и адаптивно регулируем троттлинг при необходимости
    throttleRef.current.frameCount++;
    if (throttleRef.current.frameCount % 100 === 0) {
      // Каждые 100 кадров проверяем, не нужно ли увеличить интервал троттлинга
      const fps = 1000 / (timeSinceLastUpdate || 16);
      if (fps < 30) {
        // Если FPS падает ниже 30, увеличиваем интервал троттлинга
        throttleRef.current.throttleTime = Math.min(throttleRef.current.throttleTime * 1.2, 50);
        console.log(`[Perf] Увеличиваем интервал троттлинга до ${throttleRef.current.throttleTime.toFixed(1)}мс для стабилизации FPS`);
      } else if (fps > 55 && throttleRef.current.throttleTime > 16) {
        // Если FPS хороший, и мы ранее увеличивали интервал, снижаем его
        throttleRef.current.throttleTime = Math.max(throttleRef.current.throttleTime * 0.9, 16);
      }
    }
    
    // Обновляем время последнего вызова
    throttleRef.current.lastUpdateCall = now;
    
    const currentTime = now;
    const deltaTime = currentTime - lastUpdateTimeRef.current;
    
    try {
      // Обновляем ресурсы с учетом прошедшего времени
      updateResources(deltaTime);
      lastUpdateTimeRef.current = currentTime;
      
      // Обновляем lastUpdate в состоянии
      dispatch({ type: 'TICK', payload: { currentTime } });
      
      // Отладочная информация (реже, чем раньше)
      if (now - lastLogTimeRef.current > 5000) { // Логируем только раз в 5 секунд
        console.log(`[GameUpdate] Прошло ${deltaTime}мс. Интервал троттлинга: ${throttleRef.current.throttleTime.toFixed(1)}мс`);
        
        // Дополнительная отладочная информация о ресурсах (только основные)
        const activeResources = Object.entries(state.resources)
          .filter(([_, res]) => res.unlocked && Math.abs(res.perSecond) > 0.01)
          .slice(0, 5) // Ограничиваем количество выводимых ресурсов
          .map(([id, res]) => `${id}: ${res.value.toFixed(1)}/${res.max || '∞'} (${res.perSecond.toFixed(2)}/сек)`);
        
        if (activeResources.length > 0) {
          console.log('[ResourceDebug] Активные ресурсы (топ-5):', activeResources);
        }
        
        lastLogTimeRef.current = now;
      }
    } catch (error) {
      console.error('[GameStateUpdateService] Ошибка при обновлении состояния:', error);
      // Увеличиваем интервал троттлинга при ошибке для стабилизации
      throttleRef.current.throttleTime = Math.min(throttleRef.current.throttleTime * 1.5, 100);
    }
  }, [isPageVisible, state.gameStarted, dispatch, updateResources, state.resources]);
  
  /**
   * Проверяет все возможные разблокировки
   * Использует интервал с низкой частотой
   */
  const checkUnlocks = useCallback(() => {
    if (isPageVisible && state.gameStarted) {
      try {
        dispatch({ type: 'CHECK_UNLOCKS' });
      } catch (error) {
        console.error('[GameStateUpdateService] Ошибка при проверке разблокировок:', error);
      }
    }
  }, [isPageVisible, state.gameStarted, dispatch]);
  
  // Эффект для запуска таймеров обновления ресурсов и проверки разблокировок
  useEffect(() => {
    if (!state.gameStarted) return;
    
    // Используем requestAnimationFrame для синхронизации с частотой обновления экрана
    let animationFrameId: number;
    const updateFrame = () => {
      updateGameState();
      animationFrameId = requestAnimationFrame(updateFrame);
    };
    
    // Запускаем анимационный цикл
    animationFrameId = requestAnimationFrame(updateFrame);
    
    // Запускаем таймер для проверки разблокировок каждые 5 секунд
    const unlockCheckInterval = setInterval(checkUnlocks, 5000);
    
    // Логируем информацию о запуске системы обновления
    console.log(`🔄 Система обновления игрового состояния запущена. 
      Интервал троттлинга: ${throttleRef.current.throttleTime}мс, 
      Интервал проверки разблокировок: 5000мс`);
    
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
          try {
            // Обновляем состояние с учетом прошедшего времени
            updateResources(Math.min(offlineTime, 3600000)); // Ограничиваем максимальное время 1 часом
            lastUpdateTimeRef.current = currentTime;
            
            // Отправляем событие о возобновлении игры
            safeDispatchGameEvent({
              message: `Добро пожаловать обратно! Прошло ${Math.floor(offlineTime / 1000)} сек.`,
              type: 'info'
            });
            
            console.log(`[GameResume] Игра возобновлена после ${offlineTime}мс отсутствия.`);
          } catch (error) {
            console.error('[GameStateUpdateService] Ошибка при возобновлении игры:', error);
          }
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
