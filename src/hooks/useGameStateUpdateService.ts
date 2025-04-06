
import { useEffect, useCallback, useState, useRef } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { UnlockService } from '@/services/UnlockService';
import { useResourceSystem } from './useResourceSystem';

export const useGameStateUpdateService = () => {
  const { state, dispatch, isPageVisible } = useGame();
  const { updateResources } = useResourceSystem();
  const unlockService = new UnlockService();
  const lastTickTimeRef = useRef<number>(Date.now());
  
  const updateGameState = useCallback(() => {
    if (isPageVisible && state.gameStarted) {
      const currentTime = Date.now();
      const deltaTime = currentTime - state.lastUpdate;
      
      // Если прошло слишком много времени (например, более минуты),
      // ограничиваем дельту времени, чтобы не было резких скачков
      const cappedDeltaTime = Math.min(deltaTime, 60000);
      
      if (cappedDeltaTime > 0) {
        // Обновляем ресурсы с учетом прошедшего времени
        updateResources(cappedDeltaTime);
        
        // Обновляем lastUpdate
        dispatch({ type: 'TICK', payload: { currentTime } });
        
        console.log(`Тик игры: прошло ${cappedDeltaTime}ms, lastUpdate обновлен`);
        lastTickTimeRef.current = currentTime;
      }
    }
  }, [isPageVisible, state.gameStarted, state.lastUpdate, dispatch, updateResources]);
  
  useEffect(() => {
    // Запускаем таймер для обновления ресурсов каждые 500ms для более плавного обновления
    const updateInterval = setInterval(updateGameState, 500);
    
    // Запускаем таймер для проверки разблокировок каждые 5 секунд
    const unlockCheckInterval = setInterval(() => {
      if (isPageVisible && state.gameStarted) {
        dispatch({ type: 'CHECK_UNLOCKS' });
      }
    }, 5000);
    
    // Очистка таймеров при размонтировании
    return () => {
      clearInterval(updateInterval);
      clearInterval(unlockCheckInterval);
    };
  }, [updateGameState, isPageVisible, state.gameStarted, dispatch]);
  
  // Эффект для принудительного обновления производства при изменении зданий
  useEffect(() => {
    const buildingCounts = Object.values(state.buildings).map(b => b.count).join(',');
    if (buildingCounts !== '0,0,0,0,0,0,0,0,0,0') {
      console.log("Изменились количества зданий, пересчитываем производство");
      dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
    }
  }, [Object.values(state.buildings).map(b => b.count).join(','), dispatch]);
  
  return null;
};
