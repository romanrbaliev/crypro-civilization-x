
import { useEffect, useRef } from 'react';
import { useGame } from '@/context/hooks/useGame';

/**
 * Хук для управления обновлением состояния игры на основе прошедшего времени
 */
export const useGameStateUpdateService = () => {
  const { state, dispatch, isPageVisible } = useGame();
  const lastUpdateRef = useRef<number>(Date.now());
  const intervalIdRef = useRef<number | null>(null);
  
  // Функция обновления ресурсов
  const updateResources = () => {
    // Если страница не видима, не обновляем ресурсы слишком часто
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    
    // Ограничиваем скорость обновления ресурсов
    if (timeSinceLastUpdate < 1000) {
      return; // Обновление происходит не чаще раза в секунду
    }
    
    // Отправляем действие для обновления ресурсов
    dispatch({ 
      type: 'UPDATE_RESOURCES',
      payload: { deltaTime: timeSinceLastUpdate }
    });
    
    // Обновляем время последнего обновления
    lastUpdateRef.current = now;
  };
  
  // Эффект для настройки интервала обновления состояния
  useEffect(() => {
    if (!state.gameStarted) return;
    
    // Определяем частоту обновления в зависимости от видимости страницы
    const updateInterval = isPageVisible ? 1000 : 5000; // 1 секунда при видимости, 5 секунд в фоне
    
    // Очищаем предыдущий интервал, если он был
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
    }
    
    // Устанавливаем новый интервал для обновления ресурсов
    intervalIdRef.current = window.setInterval(updateResources, updateInterval);
    
    // Выполняем начальное обновление
    updateResources();
    
    return () => {
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [state.gameStarted, isPageVisible]);
  
  // Эффект для обработки изменения видимости страницы
  useEffect(() => {
    if (!state.gameStarted) return;
    
    // При возвращении на страницу, немедленно обновляем ресурсы
    if (isPageVisible) {
      updateResources();
      
      // Проверяем статус оборудования
      dispatch({ type: 'CHECK_EQUIPMENT_STATUS' });
    }
  }, [isPageVisible]);
};
