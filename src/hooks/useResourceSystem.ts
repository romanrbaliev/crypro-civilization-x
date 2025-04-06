
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
    const updatedState = resourceSystem.updateResources(state, deltaTime);
    
    // Отправляем событие только если есть фактические изменения в ресурсах
    const hasChanges = Object.keys(updatedState.resources).some(
      resId => updatedState.resources[resId].value !== state.resources[resId].value
    );
    
    if (hasChanges) {
      // Обновляем состояние через диспетчер
      dispatch({ type: 'FORCE_RESOURCE_UPDATE', payload: updatedState });
      
      // Выводим отладочную информацию
      console.log(`Ресурсы обновлены после ${deltaTime}мс`, 
        Object.entries(updatedState.resources)
          .filter(([_, r]) => r.unlocked)
          .map(([id, r]) => `${id}: ${r.value?.toFixed(2)} (+${r.perSecond?.toFixed(2)}/сек)`)
      );
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
    canAfford,
    getMissingResources,
    updateResourceMaxValues,
    formatCost,
    formatValue,
    incrementResource,
    unlockResource,
    resourceSystem, // Экспортируем сам класс для сложных операций
    resourceFormatter // Экспортируем форматтер для сложных операций
  };
};
