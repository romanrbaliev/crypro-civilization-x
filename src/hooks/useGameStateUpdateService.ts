
import { useEffect, useRef } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { unlockSystemService } from '@/services/UnlockSystemService';

// Интервал обновления состояния игры в миллисекундах
const UPDATE_INTERVAL = 1000;

export const useGameStateUpdateService = () => {
  const { state, dispatch, isPageVisible } = useGame();
  const lastUpdateRef = useRef(Date.now());
  
  useEffect(() => {
    // Функция обновления игрового состояния
    const updateGameState = () => {
      const now = Date.now();
      const delta = now - lastUpdateRef.current;
      
      // Обновляем состояние только если прошло нужное количество времени и вкладка видима
      if (delta >= UPDATE_INTERVAL && isPageVisible !== false) {
        dispatch({ 
          type: 'UPDATE_RESOURCES',
          payload: { deltaTime: delta }
        });
        
        lastUpdateRef.current = now;
      }
    };
    
    // Устанавливаем интервал обновления
    const intervalId = setInterval(updateGameState, 100);
    
    // При первой загрузке форсированно проверяем все разблокировки
    if (state.gameStarted) {
      // Форсированно проверяем все разблокировки
      setTimeout(() => {
        dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
      }, 500);
    }
    
    // Очищаем интервал при размонтировании
    return () => clearInterval(intervalId);
  }, [dispatch, isPageVisible, state.gameStarted]);
  
  // Производим принудительное обновление при изменении флага видимости
  useEffect(() => {
    if (isPageVisible && state.gameStarted) {
      const now = Date.now();
      const timeSinceLastUpdate = now - state.lastUpdate;
      
      // Если прошло больше 1 секунды с последнего обновления
      if (timeSinceLastUpdate > 1000) {
        dispatch({ 
          type: 'UPDATE_RESOURCES',
          payload: { deltaTime: timeSinceLastUpdate }
        });
        
        lastUpdateRef.current = now;
      }
    }
  }, [isPageVisible, dispatch, state.lastUpdate, state.gameStarted]);
  
  return null;
};
