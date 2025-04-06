
import { useCallback, useMemo, useRef } from 'react';
import { ResourceSystem } from '@/systems/ResourceSystem';
import { useGame } from '@/context/hooks/useGame';
import { ResourceFormatter } from '@/formatters/ResourceFormatter';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Хук для работы с системой ресурсов
 */
export const useResourceSystem = () => {
  const { state, dispatch } = useGame();
  const resourceSystem = useMemo(() => new ResourceSystem(), []);
  const resourceFormatter = useMemo(() => new ResourceFormatter(), []);
  
  // Кэш форматированных значений
  const formatCache = useRef<Map<string, string>>(new Map());
  
  // Очистка кэша форматированных значений
  const clearFormatCache = useCallback(() => {
    formatCache.current.clear();
  }, []);
  
  // Регулярная очистка кэша
  useMemo(() => {
    const intervalId = setInterval(clearFormatCache, 10000); // Каждые 10 секунд
    return () => clearInterval(intervalId);
  }, [clearFormatCache]);
  
  /**
   * Обновляет ресурсы на основе прошедшего времени
   * @param deltaTime Прошедшее время в миллисекундах
   */
  const updateResources = useCallback((deltaTime: number) => {
    // Важная проверка: пропускаем отрицательное время (может случиться из-за ошибок в Date.now())
    if (deltaTime < 0) {
      console.warn(`[ResourceSystem] Попытка обновления с отрицательным временем: ${deltaTime}мс`);
      return;
    }
    
    // Если слишком большое deltaTime, ограничиваем его
    const safeDeltatime = Math.min(deltaTime, 300000); // Максимум 5 минут
    
    try {
      // Шаг 1: Обновляем производство и потребление
      let updatedState = resourceSystem.updateProductionConsumption(state);
      
      // Шаг 2: Обновляем максимальные значения ресурсов
      updatedState = resourceSystem.updateResourceMaxValues(updatedState);
      
      // Шаг 3: Обновляем значения ресурсов на основе прошедшего времени
      updatedState = resourceSystem.updateResources(updatedState, safeDeltatime);
      
      // Обновляем состояние через диспетчер
      dispatch({ type: 'FORCE_RESOURCE_UPDATE', payload: updatedState });
      
      // Очищаем кэш форматированных значений при существенном обновлении
      if (Math.random() < 0.05) { // 5% шанс очистки кэша
        clearFormatCache();
      }
    } catch (error) {
      console.error('Ошибка при обновлении ресурсов:', error);
    }
  }, [state, dispatch, resourceSystem, clearFormatCache]);
  
  /**
   * Проверяет, достаточно ли ресурсов для покупки
   * @param cost Стоимость покупки
   * @returns true, если ресурсов достаточно
   */
  const canAfford = useCallback((cost: Record<string, number>): boolean => {
    return resourceSystem.checkAffordability(state, cost);
  }, [state, resourceSystem]);
  
  /**
   * Возвращает список недостающих ресурсов
   * @param cost Стоимость покупки
   * @returns Объект с недостающими ресурсами
   */
  const getMissingResources = useCallback((cost: Record<string, number>): Record<string, number> => {
    return resourceSystem.getMissingResources(state, cost);
  }, [state, resourceSystem]);
  
  /**
   * Обновляет максимальные значения ресурсов
   */
  const updateResourceMaxValues = useCallback(() => {
    try {
      const updatedState = resourceSystem.updateResourceMaxValues(state);
      dispatch({ type: 'FORCE_RESOURCE_UPDATE', payload: updatedState });
    } catch (error) {
      console.error('Ошибка при обновлении максимальных значений ресурсов:', error);
    }
  }, [state, dispatch, resourceSystem]);
  
  /**
   * Форматирует стоимость
   * @param cost Стоимость
   * @param language Код языка
   * @returns Отформатированная строка стоимости
   */
  const formatCost = useCallback((cost: any, language: string = 'ru'): string => {
    return resourceFormatter.formatCost(cost, language);
  }, [resourceFormatter]);
  
  /**
   * Форматирует значение ресурса с использованием кэша
   * @param value Числовое значение
   * @param resourceId ID ресурса
   * @returns Отформатированное значение
   */
  const formatValue = useCallback((value: number | null | undefined, resourceId: string): string => {
    if (value === null || value === undefined) return '0';
    
    // Округляем для кэширования
    const roundedValue = Math.round(value * 100) / 100;
    const cacheKey = `${resourceId}_${roundedValue}`;
    
    // Проверяем кэш
    if (formatCache.current.has(cacheKey)) {
      return formatCache.current.get(cacheKey) as string;
    }
    
    // Форматируем значение
    const formatted = resourceFormatter.formatValue(roundedValue, resourceId);
    
    // Сохраняем в кэш только если кэш не слишком большой
    if (formatCache.current.size < 1000) {
      formatCache.current.set(cacheKey, formatted);
    } else if (Math.random() < 0.01) {
      // Если кэш слишком большой, с небольшой вероятностью очищаем его
      clearFormatCache();
    }
    
    return formatted;
  }, [resourceFormatter, clearFormatCache]);
  
  /**
   * Инкрементирует ресурс
   * @param resourceId ID ресурса
   * @param amount Количество
   */
  const incrementResource = useCallback((resourceId: string, amount: number = 1) => {
    dispatch({
      type: 'INCREMENT_RESOURCE',
      payload: { resourceId, amount }
    });
    
    // Отправляем событие об изменении ресурса только для значительных изменений
    if (amount > 1 || Math.random() < 0.1) {
      safeDispatchGameEvent({
        message: `Получено: ${formatValue(amount, resourceId)} ${state.resources[resourceId]?.name || resourceId}`,
        type: 'info'
      });
    }
  }, [dispatch, formatValue, state.resources]);
  
  /**
   * Разблокирует ресурс
   * @param resourceId ID ресурса
   */
  const unlockResource = useCallback((resourceId: string) => {
    dispatch({
      type: 'UNLOCK_RESOURCE',
      payload: { resourceId }
    });
    
    // Отправляем событие о разблокировке ресурса
    safeDispatchGameEvent({
      message: `Разблокирован новый ресурс: ${state.resources[resourceId]?.name || resourceId}!`,
      type: 'success'
    });
  }, [dispatch, state.resources]);
  
  return {
    updateResources,
    canAfford,
    getMissingResources,
    updateResourceMaxValues,
    formatCost,
    formatValue,
    incrementResource,
    unlockResource,
    resourceSystem,
    resourceFormatter
  };
};
