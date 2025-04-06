
import { useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { UnlockService } from '@/services/UnlockService';
import { useResourceSystem } from './useResourceSystem';
import { checkAllUnlocks } from '@/utils/unlockManager';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { clearEffectCache } from '@/utils/effects/effectApplication';

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
  const throttleRef = useRef<{ 
    lastResourceDebug: number,
    lastCacheCleanup: number,
    lastUnlockCheck: number,
    lastPerformanceCheck: number,
    frameTimings: number[]
  }>({ 
    lastResourceDebug: 0, 
    lastCacheCleanup: 0,
    lastUnlockCheck: 0,
    lastPerformanceCheck: 0,
    frameTimings: []
  });
  
  // Мониторинг производительности для выявления проблем
  const monitorPerformance = useCallback((frameTime: number) => {
    const { frameTimings } = throttleRef.current;
    
    // Добавляем время кадра в массив (не более 60 последних кадров)
    frameTimings.push(frameTime);
    if (frameTimings.length > 60) {
      frameTimings.shift();
    }
    
    // Проверяем производительность каждые 5 секунд
    const now = Date.now();
    if (now - throttleRef.current.lastPerformanceCheck > 5000) {
      throttleRef.current.lastPerformanceCheck = now;
      
      // Подсчитываем среднее время кадра
      const avgFrameTime = frameTimings.reduce((sum, time) => sum + time, 0) / frameTimings.length;
      
      // Если среднее время кадра слишком велико (> 50 мс, что меньше 20 FPS)
      if (avgFrameTime > 50 && frameTimings.length > 10) {
        console.warn(`[Performance] Высокое среднее время кадра: ${avgFrameTime.toFixed(2)}мс. Возможны проблемы с производительностью.`);
        
        // Очищаем кэши для предотвращения возможных проблем с памятью
        clearEffectCache();
        
        // Сбрасываем массив для нового измерения
        throttleRef.current.frameTimings = [];
      }
    }
  }, []);
  
  /**
   * Обновляет игровое состояние с учетом прошедшего времени
   */
  const updateGameState = useCallback(() => {
    frameCountRef.current += 1;
    
    if (isPageVisible && state.gameStarted) {
      const startTime = performance.now();
      const currentTime = Date.now();
      const deltaTime = currentTime - lastUpdateTimeRef.current;
      
      // Пропускаем обновление, если прошло слишком мало времени (меньше 16мс - ~60 fps)
      if (deltaTime < 16) {
        return;
      }
      
      // Ограничиваем максимальное обновление во времени для предотвращения скачков
      const safeDeltatime = Math.min(deltaTime, 1000); // Максимум 1 секунда
      
      try {
        // Обновляем ресурсы
        updateResources(safeDeltatime);
        lastUpdateTimeRef.current = currentTime;
        
        // Обновляем lastUpdate в состоянии
        dispatch({ type: 'TICK', payload: { currentTime } });
        
        // Очистка кэша эффектов периодически
        const now = Date.now();
        if (now - throttleRef.current.lastCacheCleanup > 30000) { // Каждые 30 секунд
          throttleRef.current.lastCacheCleanup = now;
          clearEffectCache();
        }
        
        // Проверка разблокировок реже, чем обновление ресурсов
        if (now - throttleRef.current.lastUnlockCheck > 2000) { // Каждые 2 секунды
          throttleRef.current.lastUnlockCheck = now;
          dispatch({ type: 'CHECK_UNLOCKS' });
        }
        
        // Измеряем производительность
        const frameTime = performance.now() - startTime;
        monitorPerformance(frameTime);
      } catch (error) {
        console.error('Ошибка при обновлении игрового состояния:', error);
      }
    }
  }, [isPageVisible, state.gameStarted, dispatch, updateResources, monitorPerformance]);
  
  // Эффект для запуска таймеров обновления ресурсов
  useEffect(() => {
    if (!state.gameStarted) return;
    
    // Запускаем интервал анимации для более плавного обновления
    let animationFrameId: number;
    
    const updateFrame = () => {
      try {
        updateGameState();
        animationFrameId = requestAnimationFrame(updateFrame);
      } catch (error) {
        console.error('Ошибка в цикле обновления игры:', error);
        // Перезапускаем цикл обновления при ошибке
        animationFrameId = requestAnimationFrame(updateFrame);
      }
    };
    
    animationFrameId = requestAnimationFrame(updateFrame);
    
    // Логируем информацию о запуске системы обновления
    console.log(`🔄 Система обновления игрового состояния запущена в режиме requestAnimationFrame`);
    
    // Очистка таймеров при размонтировании
    return () => {
      cancelAnimationFrame(animationFrameId);
      console.log('🛑 Система обновления игрового состояния остановлена');
    };
  }, [updateGameState, state.gameStarted]);
  
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
            // Для безопасности ограничиваем максимальное время отсутствия
            const safeOfflineTime = Math.min(offlineTime, 300000); // Не более 5 минут
            updateResources(safeOfflineTime);
            lastUpdateTimeRef.current = currentTime;
            
            // Отправляем событие о возобновлении игры
            safeDispatchGameEvent({
              message: `Добро пожаловать обратно! Прошло ${Math.floor(safeOfflineTime / 1000)} сек.`,
              type: 'info'
            });
            
            // Очищаем кэши
            clearEffectCache();
            
            console.log(`[GameResume] Игра возобновлена после ${safeOfflineTime}мс отсутствия.`);
          } catch (error) {
            console.error('Ошибка при возобновлении игры:', error);
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
