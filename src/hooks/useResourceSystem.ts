
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
  
  // Кэш для форматированных значений чтобы избежать повторных вычислений
  const formattedValueCache = useRef<Record<string, Record<number, string>>>({});
  
  /**
   * Обновляет ресурсы на основе прошедшего времени
   * @param deltaTime Прошедшее время в миллисекундах
   */
  const updateResources = useCallback((deltaTime: number) => {
    try {
      // Шаг 1: Обновляем производство и потребление
      let updatedState = resourceSystem.updateProductionConsumption(state);
      
      // Шаг 2: Обновляем максимальные значения ресурсов
      updatedState = resourceSystem.updateResourceMaxValues(updatedState);
      
      // Шаг 3: Обновляем значения ресурсов на основе прошедшего времени
      updatedState = resourceSystem.updateResources(updatedState, deltaTime);
      
      // Обновляем состояние через диспетчер
      dispatch({ type: 'FORCE_RESOURCE_UPDATE', payload: updatedState });
      
      // Сбрасываем кэш форматированных значений при существенном изменении ресурсов
      if (deltaTime > 1000) {
        formattedValueCache.current = {};
      }
      
      // Периодически выводим отладочную информацию (только 1% времени)
      if (Math.random() < 0.01) {
        const logData = Object.entries(updatedState.resources)
          .filter(([_, r]) => r.unlocked && (Math.abs(r.perSecond) > 0.01))
          .slice(0, 3) // Ограничиваем количество выводимых ресурсов
          .map(([id, r]) => `${id}: ${formatValue(r.value, id)} (+${formatValue(r.perSecond || 0, id)}/сек)`);
        
        if (logData.length > 0) {
          console.log(`[ResourceUpdate] Ресурсы обновлены (Δt=${deltaTime}мс):`, logData);
        }
      }
    } catch (error) {
      console.error('[ResourceSystem] Ошибка при обновлении ресурсов:', error);
    }
  }, [state, dispatch, resourceSystem]);
  
  /**
   * Проверяет, достаточно ли ресурсов для покупки
   * @param cost Стоимость покупки
   * @returns true, если ресурсов достаточно
   */
  const canAfford = useCallback((cost: Record<string, number>): boolean => {
    try {
      return resourceSystem.checkAffordability(state, cost);
    } catch (error) {
      console.error('[ResourceSystem] Ошибка при проверке доступности ресурсов:', error);
      return false;
    }
  }, [state, resourceSystem]);
  
  /**
   * Возвращает список недостающих ресурсов
   * @param cost Стоимость покупки
   * @returns Объект с недостающими ресурсами
   */
  const getMissingResources = useCallback((cost: Record<string, number>): Record<string, number> => {
    try {
      return resourceSystem.getMissingResources(state, cost);
    } catch (error) {
      console.error('[ResourceSystem] Ошибка при получении недостающих ресурсов:', error);
      return {};
    }
  }, [state, resourceSystem]);
  
  /**
   * Обновляет максимальные значения ресурсов
   */
  const updateResourceMaxValues = useCallback(() => {
    try {
      const updatedState = resourceSystem.updateResourceMaxValues(state);
      dispatch({ type: 'FORCE_RESOURCE_UPDATE', payload: updatedState });
    } catch (error) {
      console.error('[ResourceSystem] Ошибка при обновлении максимальных значений ресурсов:', error);
    }
  }, [state, dispatch, resourceSystem]);
  
  /**
   * Форматирует стоимость
   * @param cost Стоимость
   * @param language Код языка
   * @returns Отформатированная строка стоимости
   */
  const formatCost = useCallback((cost: any, language: string = 'ru'): string => {
    try {
      return resourceFormatter.formatCost(cost, language);
    } catch (error) {
      console.error('[ResourceSystem] Ошибка при форматировании стоимости:', error);
      return '';
    }
  }, [resourceFormatter]);
  
  /**
   * Форматирует значение ресурса с использованием кэша
   * @param value Числовое значение
   * @param resourceId ID ресурса
   * @returns Отформатированное значение
   */
  const formatValue = useCallback((value: number | null | undefined, resourceId: string): string => {
    try {
      // Проверяем, определены ли значения
      if (value === null || value === undefined) {
        return "0";
      }
      
      // Округляем значение до 3 знаков для кэширования
      const roundedValue = Math.round(value * 1000) / 1000;
      
      // Используем кэш для предотвращения повторного форматирования одинаковых значений
      if (!formattedValueCache.current[resourceId]) {
        formattedValueCache.current[resourceId] = {};
      }
      
      if (formattedValueCache.current[resourceId][roundedValue] !== undefined) {
        return formattedValueCache.current[resourceId][roundedValue];
      }
      
      // Форматируем значение и сохраняем в кэше
      const formatted = resourceFormatter.formatValue(roundedValue, resourceId);
      formattedValueCache.current[resourceId][roundedValue] = formatted;
      
      return formatted;
    } catch (error) {
      console.error('[ResourceSystem] Ошибка при форматировании значения:', error);
      return value?.toString() || "0";
    }
  }, [resourceFormatter]);
  
  /**
   * Инкрементирует ресурс
   * @param resourceId ID ресурса
   * @param amount Количество
   */
  const incrementResource = useCallback((resourceId: string, amount: number = 1) => {
    try {
      dispatch({
        type: 'INCREMENT_RESOURCE',
        payload: { resourceId, amount }
      });
      
      // Отправляем событие об изменении ресурса только для значительных изменений
      if (amount > 0.1) {
        safeDispatchGameEvent({
          message: `Получено: ${formatValue(amount, resourceId)} ${state.resources[resourceId]?.name || resourceId}`,
          type: 'info'
        });
      }
    } catch (error) {
      console.error('[ResourceSystem] Ошибка при инкременте ресурса:', error);
    }
  }, [dispatch, formatValue, state.resources]);
  
  /**
   * Разблокирует ресурс
   * @param resourceId ID ресурса
   */
  const unlockResource = useCallback((resourceId: string) => {
    try {
      dispatch({
        type: 'UNLOCK_RESOURCE',
        payload: { resourceId }
      });
      
      // Отправляем событие о разблокировке ресурса
      safeDispatchGameEvent({
        message: `Разблокирован новый ресурс: ${state.resources[resourceId]?.name || resourceId}!`,
        type: 'success'
      });
    } catch (error) {
      console.error('[ResourceSystem] Ошибка при разблокировке ресурса:', error);
    }
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
