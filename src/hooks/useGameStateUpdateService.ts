
import { useEffect, useCallback, useState, useRef } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { UnlockService } from '@/services/UnlockService';
import { useResourceSystem } from './useResourceSystem';

export const useGameStateUpdateService = () => {
  const { state, dispatch, isPageVisible } = useGame();
  const { updateResources, recalculateAllProduction } = useResourceSystem();
  const unlockService = new UnlockService();
  const lastTickTimeRef = useRef<number>(Date.now());
  const lastRecalculationRef = useRef<number>(Date.now());
  
  // Функция для обновления игрового состояния (тик)
  const updateGameState = useCallback(() => {
    if (!isPageVisible || !state.gameStarted) {
      console.log("Игра не запущена или вкладка не активна, пропускаем тик");
      return;
    }
    
    const currentTime = Date.now();
    const deltaTime = currentTime - state.lastUpdate;
    
    // Если прошло слишком много времени (например, более минуты),
    // ограничиваем дельту времени, чтобы не было резких скачков
    const cappedDeltaTime = Math.min(deltaTime, 60000);
    
    if (cappedDeltaTime > 0) {
      console.log(`Обновление состояния игры: прошло ${cappedDeltaTime}ms`);
      
      // Отправляем действие TICK для обновления ресурсов
      dispatch({ 
        type: 'TICK', 
        payload: { 
          currentTime,
          deltaTime: cappedDeltaTime 
        } 
      });
      
      lastTickTimeRef.current = currentTime;
    }
  }, [isPageVisible, state.gameStarted, state.lastUpdate, dispatch]);
  
  // Принудительно пересчитываем производство каждые 5 секунд
  // для обеспечения синхронизации даже если случаются ошибки
  const forceRecalculateProduction = useCallback(() => {
    if (!isPageVisible || !state.gameStarted) return;
    
    const currentTime = Date.now();
    const timeSinceLastRecalculation = currentTime - lastRecalculationRef.current;
    
    // Пересчитываем производство каждые 5 секунд для надежности
    if (timeSinceLastRecalculation > 5000) {
      console.log("Принудительный пересчет производства ресурсов по таймеру");
      recalculateAllProduction();
      lastRecalculationRef.current = currentTime;
    }
  }, [isPageVisible, state.gameStarted, recalculateAllProduction]);
  
  // Инициализация игрового состояния при первой загрузке
  useEffect(() => {
    if (state.gameStarted) {
      console.log("Инициализация игрового состояния при первой загрузке");
      recalculateAllProduction();
      lastRecalculationRef.current = Date.now();
    }
  }, [state.gameStarted, recalculateAllProduction]);
  
  useEffect(() => {
    // Запускаем таймер для обновления ресурсов каждые 500ms для более плавного обновления
    const updateInterval = setInterval(updateGameState, 500);
    
    // Запускаем таймер для проверки разблокировок каждые 5 секунд
    const unlockCheckInterval = setInterval(() => {
      if (isPageVisible && state.gameStarted) {
        dispatch({ type: 'CHECK_UNLOCKS' });
      }
    }, 5000);
    
    // Запускаем таймер для принудительного пересчета производства
    const recalculateInterval = setInterval(forceRecalculateProduction, 2500);
    
    // Очистка таймеров при размонтировании
    return () => {
      clearInterval(updateInterval);
      clearInterval(unlockCheckInterval);
      clearInterval(recalculateInterval);
    };
  }, [updateGameState, forceRecalculateProduction, isPageVisible, state.gameStarted, dispatch]);
  
  // Эффект для принудительного обновления производства при изменении зданий
  useEffect(() => {
    const buildingCounts = Object.values(state.buildings).map(b => b.count).join(',');
    
    // Если изменились количества зданий, пересчитываем производство
    if (buildingCounts !== '0,0,0,0,0,0,0,0,0,0') {
      console.log("Изменились количества зданий, пересчитываем производство");
      recalculateAllProduction();
      lastRecalculationRef.current = Date.now();
    }
  }, [Object.values(state.buildings).map(b => b.count).join(','), recalculateAllProduction]);
  
  return null;
};
