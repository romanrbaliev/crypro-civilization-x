
import { useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { useResourceSystem } from './useResourceSystem';

export const useGameStateUpdateService = () => {
  const { state, dispatch, isPageVisible } = useGame();
  const { updateResources, recalculateAllProduction } = useResourceSystem();
  const lastTickTimeRef = useRef<number>(Date.now());
  
  // Добавляем счетчик тиков для отладки
  const tickCountRef = useRef<number>(0);
  
  const updateGameState = useCallback(() => {
    if (!isPageVisible || !state.gameStarted) {
      return;
    }
    
    const currentTime = Date.now();
    const deltaTime = currentTime - state.lastUpdate;
    
    // Если прошло слишком много времени (например, более минуты),
    // ограничиваем дельту времени, чтобы не было резких скачков
    const cappedDeltaTime = Math.min(deltaTime, 60000);
    
    if (cappedDeltaTime > 0) {
      // Увеличиваем счетчик тиков и выводим лог каждые 10 тиков
      tickCountRef.current += 1;
      if (tickCountRef.current % 10 === 0) {
        console.log(`Тик #${tickCountRef.current}: Обновление состояния игры, прошло ${cappedDeltaTime}ms`);
      }
      
      // КРИТИЧЕСКОЕ ИЗМЕНЕНИЕ: Не обновляем ресурсы здесь напрямую, а передаем управление редьюсеру
      // Это устраняет дублирование обновления ресурсов между useGameStateUpdateService и gameReducer
      // Используем skipResourceUpdate: false, чтобы указать, что ресурсы должны обновляться в редьюсере
      dispatch({ 
        type: 'TICK', 
        payload: { 
          currentTime,
          skipResourceUpdate: false 
        } 
      });
      
      lastTickTimeRef.current = currentTime;
    }
  }, [isPageVisible, state.gameStarted, state.lastUpdate, dispatch]);
  
  // Инициализация игрового состояния при первой загрузке
  useEffect(() => {
    if (state.gameStarted) {
      console.log("Инициализация игрового состояния при первой загрузке");
      
      // Принудительно пересчитываем производство при запуске
      recalculateAllProduction();
      
      // Добавляем дополнительную проверку после небольшой задержки
      setTimeout(() => {
        console.log("Принудительный пересчет производства после инициализации");
        dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
      }, 500);
    }
  }, [state.gameStarted, recalculateAllProduction, dispatch]);
  
  // Главный эффект для обновления игры
  useEffect(() => {
    console.log("Запуск системы обновления ресурсов");
    
    // Запускаем таймер для обновления ресурсов каждые 100ms для более плавного обновления
    const updateInterval = setInterval(updateGameState, 100);
    
    // Запускаем таймер для проверки разблокировок каждые 5 секунд
    const unlockCheckInterval = setInterval(() => {
      if (isPageVisible && state.gameStarted) {
        dispatch({ type: 'CHECK_UNLOCKS' });
      }
    }, 5000);
    
    // Запускаем таймер для принудительного обновления ресурсов каждые 3 секунды
    const forceUpdateInterval = setInterval(() => {
      if (isPageVisible && state.gameStarted) {
        dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
        console.log("Принудительное обновление производства ресурсов");
      }
    }, 3000);
    
    // Очистка таймеров при размонтировании
    return () => {
      clearInterval(updateInterval);
      clearInterval(unlockCheckInterval);
      clearInterval(forceUpdateInterval);
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
  
  // Эффект для обновления разблокировок при изменении ресурсов
  useEffect(() => {
    // Отслеживаем изменения значений ресурсов
    const resourceValues = Object.values(state.resources).map(r => r.value).join(',');
    // Проверяем разблокировки при каждом изменении значений ресурсов
    dispatch({ type: 'CHECK_UNLOCKS' });
  }, [Object.values(state.resources).map(r => r.value).join(','), dispatch]);
  
  return null;
};
