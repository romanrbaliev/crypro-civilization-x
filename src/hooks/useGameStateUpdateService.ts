import { useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { useResourceSystem } from './useResourceSystem';

export const useGameStateUpdateService = () => {
  const { state, dispatch, isPageVisible } = useGame();
  const { updateResources, recalculateAllProduction } = useResourceSystem();
  const lastTickTimeRef = useRef<number>(Date.now());
  
  // Добавляем счетчик тиков для отладки
  const tickCountRef = useRef<number>(0);
  // Флаг, указывающий, что монитор знаний открыт
  const monitorIsOpenRef = useRef<boolean>(false);
  // Счетчик успешных обновлений знаний
  const successfulUpdatesRef = useRef<number>(0);
  
  const updateGameState = useCallback(() => {
    if (!isPageVisible || !state.gameStarted) {
      return;
    }
    
    const currentTime = Date.now();
    const deltaTime = currentTime - lastTickTimeRef.current;
    
    // Если прошло слишком много времени (например, более минуты),
    // ограничиваем дельту времени, чтобы не было резких скачков
    const cappedDeltaTime = Math.min(deltaTime, 5000); // Ограничиваем 5 секундами
    
    // Снижаем порог обновления до 5мс для более частых обновлений
    if (cappedDeltaTime > 5) { 
      // Увеличиваем счетчик тиков и выводим лог каждые 100 тиков
      tickCountRef.current += 1;
      if (tickCountRef.current % 100 === 0) {
        console.log(`Тик #${tickCountRef.current}: Обновление состояния игры, прошло ${cappedDeltaTime}ms`);
      }
      
      // Отправка TICK с deltaTime
      dispatch({ 
        type: 'TICK', 
        payload: { 
          currentTime,
          forcedUpdate: true,
          deltaTime: cappedDeltaTime
        } 
      });
      
      // Отслеживаем успешные обновления
      const knowledgeBefore = state.resources.knowledge?.value || 0;
      setTimeout(() => {
        const knowledgeAfter = state.resources.knowledge?.value || 0;
        if (knowledgeAfter > knowledgeBefore) {
          successfulUpdatesRef.current += 1;
          if (successfulUpdatesRef.current % 10 === 0) {
            console.log(`✅ Успешное обновление знаний: ${knowledgeBefore.toFixed(2)} -> ${knowledgeAfter.toFixed(2)} (всего успешных: ${successfulUpdatesRef.current})`);
          }
        }
      }, 10); // Уменьшаем задержку проверки
      
      lastTickTimeRef.current = currentTime;
    }
  }, [isPageVisible, state.gameStarted, state.resources.knowledge?.value, dispatch]);
  
  // Инициализация игрового состояния при первой загрузке
  useEffect(() => {
    if (state.gameStarted) {
      console.log("Инициализация игрового состояния при первой загрузке");
      
      // Принудительно пересчитываем производство при запуске
      recalculateAllProduction();
      
      // Добавляем дополнительную проверку после небольшой задержки
      setTimeout(() => {
        console.log("Принудительный пересчет производства после инициализации");
        recalculateAllProduction();
      }, 500);
    }
  }, [state.gameStarted, recalculateAllProduction]);
  
  // Добавляем эффект для обработки событий от монитора знаний
  useEffect(() => {
    // Функция-обработчик события открытия монитора знаний
    const handleKnowledgeMonitorOpen = () => {
      monitorIsOpenRef.current = true;
      console.log("Монитор знаний открыт, включаем режим расширенного логирования");
      
      // Принудительно обновляем производство при открытии монитора
      recalculateAllProduction();
    };
    
    // Функция-обработчик события принудительного обновления
    const handleForceUpdate = () => {
      if (monitorIsOpenRef.current) {
        // Принудительно обновляем ресурсы, когда монитор открыт
        const currentTime = Date.now();
        const deltaTime = currentTime - lastTickTimeRef.current;
        
        if (deltaTime > 10) { // Снижаем порог до 10мс
          dispatch({ 
            type: 'TICK', 
            payload: { 
              currentTime,
              forcedUpdate: true,
              deltaTime
            } 
          });
          lastTickTimeRef.current = currentTime;
          
          console.log(`Принудительное обновление через TICK: прошло ${deltaTime}ms`);
        }
      }
    };
    
    // Слушаем событие открытия монитора
    window.addEventListener('open-knowledge-monitor', handleKnowledgeMonitorOpen);
    
    // Слушаем событие принудительного обновления от монитора
    window.addEventListener('monitor-force-update', handleForceUpdate);
    
    // Очищаем обработчики при размонтировании
    return () => {
      window.removeEventListener('open-knowledge-monitor', handleKnowledgeMonitorOpen);
      window.removeEventListener('monitor-force-update', handleForceUpdate);
    };
  }, [recalculateAllProduction, dispatch]);
  
  // Главный эффект для обновления игры с частотой 5 раз в секунду (200мс)
  useEffect(() => {
    console.log("Запуск системы обновления ресурсов с повышенной частотой (5 раз/сек)");
    
    // Запускаем таймер для обновления ресурсов каждые 200мс (5 раз в секунду)
    const updateInterval = setInterval(updateGameState, 200);
    
    // Запускаем таймер для проверки разблокировок каждые 5 секунд
    const unlockCheckInterval = setInterval(() => {
      if (isPageVisible && state.gameStarted) {
        dispatch({ type: 'CHECK_UNLOCKS' });
      }
    }, 5000);
    
    // Запускаем таймер для принудительного обновления ресурсов каждые 3 секунды
    const forceUpdateInterval = setInterval(() => {
      if (isPageVisible && state.gameStarted) {
        recalculateAllProduction();
      }
    }, 3000);
    
    // Очистка таймеров при размонтировании
    return () => {
      clearInterval(updateInterval);
      clearInterval(unlockCheckInterval);
      clearInterval(forceUpdateInterval);
    };
  }, [updateGameState, isPageVisible, state.gameStarted, dispatch, recalculateAllProduction]);
  
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
