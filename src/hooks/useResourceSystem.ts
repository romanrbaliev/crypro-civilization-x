
import { useCallback, useMemo } from 'react';
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
    
    // Шаг 1: Обновляем производство и потребление
    let updatedState = resourceSystem.updateProductionConsumption(state);
    
    // Шаг 2: Обновляем максимальные значения ресурсов
    updatedState = resourceSystem.updateResourceMaxValues(updatedState);
    
    // Шаг 3: Обновляем значения ресурсов на основе прошедшего времени
    updatedState = resourceSystem.updateResources(updatedState, deltaTime);
    
    // Обновляем состояние через диспетчер
    dispatch({ type: 'FORCE_RESOURCE_UPDATE', payload: updatedState });
    
    // Периодически выводим отладочную информацию
    if (Math.random() < 0.01) { // 1% шанс вывода в консоль
      const logData = Object.entries(updatedState.resources)
        .filter(([_, r]) => r.unlocked && (r.perSecond !== 0))
        .map(([id, r]) => `${id}: ${formatValue(r.value, id)} (+${formatValue(r.perSecond || 0, id)}/сек)`);
      
      if (logData.length > 0) {
        console.log(`[ResourceUpdate] Ресурсы обновлены (Δt=${deltaTime}мс):`, logData);
      }
    }
  }, [state, dispatch, resourceSystem]);
  
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
    const updatedState = resourceSystem.updateResourceMaxValues(state);
    dispatch({ type: 'FORCE_RESOURCE_UPDATE', payload: updatedState });
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
   * Форматирует значение ресурса
   * @param value Числовое значение
   * @param resourceId ID ресурса
   * @returns Отформатированное значение
   */
  const formatValue = useCallback((value: number | null | undefined, resourceId: string): string => {
    return resourceFormatter.formatValue(value, resourceId);
  }, [resourceFormatter]);
  
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
    
    // Отправляем событие об изменении ресурса
    safeDispatchGameEvent({
      message: `Получено: ${formatValue(amount, resourceId)} ${state.resources[resourceId]?.name || resourceId}`,
      type: 'info'
    });
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
    canAfford: useCallback((cost: Record<string, number>): boolean => {
      return resourceSystem.checkAffordability(state, cost);
    }, [state, resourceSystem]),
    
    getMissingResources: useCallback((cost: Record<string, number>): Record<string, number> => {
      return resourceSystem.getMissingResources(state, cost);
    }, [state, resourceSystem]),
    
    updateResourceMaxValues: useCallback(() => {
      const updatedState = resourceSystem.updateResourceMaxValues(state);
      dispatch({ type: 'FORCE_RESOURCE_UPDATE', payload: updatedState });
    }, [state, dispatch, resourceSystem]),
    
    formatCost: useCallback((cost: any, language: string = 'ru'): string => {
      return resourceFormatter.formatCost(cost, language);
    }, [resourceFormatter]),
    
    formatValue,
    incrementResource,
    unlockResource,
    resourceSystem,
    resourceFormatter
  };
};
