
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
    
    // ВАЖНО: Жестко фиксируем интервал обновления на 1000 мс (1 секунда)
    // Это гарантирует, что скорость накопления ресурсов точно соответствует отображаемым значениям
    const fixedDeltaTime = 1000;
    
    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Изменяем способ вызова обновления ресурсов
    // Отправляем действие для обновления ресурсов с фиксированным временным интервалом
    dispatch({ 
      type: 'UPDATE_RESOURCES',
      payload: { deltaTime: fixedDeltaTime }
    });
    
    // Обновляем время последнего обновления
    lastUpdateRef.current = now;
  };
  
  // Эффект для настройки интервала обновления состояния
  useEffect(() => {
    if (!state.gameStarted) return;
    
    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Добавляем подробное логирование
    console.log('useGameStateUpdateService: Настраиваем интервал обновления ресурсов');
    console.log('Текущее состояние ресурсов:', {
      knowledge: state.resources.knowledge?.perSecond || 0,
      practice: state.buildings.practice?.count || 0
    });
    
    // Всегда используем строго фиксированный интервал в 1000 мс
    // Этот интервал задает частоту обновления ресурсов и соответствует отображаемому значению "/сек"
    const updateInterval = 1000;
    
    // Очищаем предыдущий интервал, если он был
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
    }
    
    // Устанавливаем новый интервал для обновления ресурсов - строго 1 раз в секунду
    intervalIdRef.current = window.setInterval(updateResources, updateInterval);
    
    // Выполняем начальное обновление
    updateResources();
    
    // Логирование для отладки
    console.log(`useGameStateUpdateService: Интервал обновления установлен строго на ${updateInterval}мс для точного соответствия отображению`);
    
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
      
      console.log("useGameStateUpdateService: Обновление ресурсов при возвращении на страницу");
    }
  }, [isPageVisible]);
};
