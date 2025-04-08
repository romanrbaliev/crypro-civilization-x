
import { useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { useResources } from './useResources';

/**
 * Хук для обновления игрового состояния с постоянной частотой
 */
export const useGameUpdater = () => {
  const { state, dispatch, isPageVisible } = useGame();
  const { updateResources, recalculateProduction } = useResources();
  const lastTickTimeRef = useRef<number>(Date.now());
  
  // Обновление игрового состояния
  const updateGameState = useCallback(() => {
    if (!isPageVisible || !state.gameStarted) {
      return;
    }
    
    const currentTime = Date.now();
    const deltaTime = currentTime - lastTickTimeRef.current;
    
    // Если прошло слишком много времени, ограничиваем дельту
    const cappedDeltaTime = Math.min(deltaTime, 5000); // Ограничиваем 5 секундами
    
    // Обновляем состояние, если прошло достаточно времени (минимум 5мс)
    if (cappedDeltaTime > 5) { 
      // Обновляем ресурсы
      updateResources(cappedDeltaTime);
      lastTickTimeRef.current = currentTime;
    }
  }, [isPageVisible, state.gameStarted, updateResources]);
  
  // Эффект для инициализации и обновления игры
  useEffect(() => {
    if (state.gameStarted) {
      console.log("Инициализация игрового состояния");
      
      // Принудительно пересчитываем производство при запуске
      recalculateProduction();
      
      // Дополнительная проверка после небольшой задержки
      setTimeout(() => {
        recalculateProduction();
      }, 500);
    }
  }, [state.gameStarted, recalculateProduction]);
  
  // Главный эффект для обновления игры с частотой 5 раз в секунду (200мс)
  useEffect(() => {
    console.log("Запуск системы обновления ресурсов с частотой 5 раз/сек");
    
    // Обновление ресурсов каждые 200мс (5 раз в секунду)
    const updateInterval = setInterval(updateGameState, 200);
    
    // Проверка разблокировок каждые 5 секунд
    const unlockCheckInterval = setInterval(() => {
      if (isPageVisible && state.gameStarted) {
        dispatch({ type: 'CHECK_UNLOCKS' });
      }
    }, 5000);
    
    // Принудительное обновление производства каждые 3 секунды
    const forceUpdateInterval = setInterval(() => {
      if (isPageVisible && state.gameStarted) {
        recalculateProduction();
      }
    }, 3000);
    
    // Очистка таймеров
    return () => {
      clearInterval(updateInterval);
      clearInterval(unlockCheckInterval);
      clearInterval(forceUpdateInterval);
    };
  }, [updateGameState, isPageVisible, state.gameStarted, dispatch, recalculateProduction]);
  
  // Отслеживаем изменения зданий
  useEffect(() => {
    const buildingCounts = Object.values(state.buildings).map(b => b.count).join(',');
    if (buildingCounts !== '0,0,0,0,0,0,0,0,0,0') {
      console.log("Изменились количества зданий, пересчитываем производство");
      recalculateProduction();
    }
  }, [Object.values(state.buildings).map(b => b.count).join(','), recalculateProduction]);
  
  // Обновляем разблокировки при изменении ресурсов
  useEffect(() => {
    const resourceValues = Object.values(state.resources).map(r => r.value).join(',');
    dispatch({ type: 'CHECK_UNLOCKS' });
  }, [Object.values(state.resources).map(r => r.value).join(','), dispatch]);
  
  return null;
};
