
import { useCallback, useMemo } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { formatResourceValue, formatCost } from '@/utils/resourceFormatter';
import { ResourceMetrics } from '@/types/resources';

/**
 * Хук для работы с ресурсами игры
 */
export const useResources = () => {
  const { state, dispatch } = useGame();
  
  /**
   * Форматирует значение ресурса
   */
  const formatValue = useCallback((value: number | null | undefined, resourceId: string): string => {
    return formatResourceValue(value, resourceId);
  }, []);
  
  /**
   * Обновляет ресурсы на основе прошедшего времени
   */
  const updateResources = useCallback((deltaTime: number) => {
    if (deltaTime <= 0) return;
    
    dispatch({ 
      type: 'UPDATE_RESOURCES', 
      payload: { deltaTime }
    });
  }, [dispatch]);
  
  /**
   * Проверяет, достаточно ли ресурсов для покупки
   */
  const canAfford = useCallback((cost: Record<string, number>): boolean => {
    for (const resourceId in cost) {
      const resource = state.resources[resourceId];
      if (!resource || !resource.unlocked || resource.value < cost[resourceId]) {
        return false;
      }
    }
    return true;
  }, [state.resources]);
  
  /**
   * Возвращает список недостающих ресурсов
   */
  const getMissingResources = useCallback((cost: Record<string, number>): Record<string, number> => {
    const missing: Record<string, number> = {};
    
    for (const resourceId in cost) {
      const resource = state.resources[resourceId];
      if (!resource || !resource.unlocked) {
        missing[resourceId] = cost[resourceId];
      } else if (resource.value < cost[resourceId]) {
        missing[resourceId] = cost[resourceId] - resource.value;
      }
    }
    
    return missing;
  }, [state.resources]);
  
  /**
   * Пересчитывает производство ресурсов
   */
  const recalculateProduction = useCallback(() => {
    dispatch({ type: 'RECALCULATE_PRODUCTION' });
  }, [dispatch]);
  
  /**
   * Разблокирует ресурс
   */
  const unlockResource = useCallback((resourceId: string) => {
    dispatch({
      type: 'UNLOCK_RESOURCE',
      payload: { resourceId }
    });
  }, [dispatch]);
  
  /**
   * Увеличивает количество ресурса
   */
  const incrementResource = useCallback((resourceId: string, amount: number = 1) => {
    dispatch({
      type: 'INCREMENT_RESOURCE',
      payload: { resourceId, amount }
    });
  }, [dispatch]);
  
  /**
   * Применяет знания (конвертирует в USDT)
   */
  const applyKnowledge = useCallback(() => {
    dispatch({ type: 'APPLY_KNOWLEDGE' });
  }, [dispatch]);
  
  /**
   * Применяет все доступные знания
   */
  const applyAllKnowledge = useCallback(() => {
    dispatch({ type: 'APPLY_ALL_KNOWLEDGE' });
  }, [dispatch]);
  
  /**
   * Обменивает Bitcoin на USDT
   */
  const exchangeBitcoin = useCallback(() => {
    dispatch({ type: 'EXCHANGE_BITCOIN' });
  }, [dispatch]);
  
  /**
   * Получает метрики для ресурса
   */
  const getResourceMetrics = useCallback((resourceId: string): ResourceMetrics => {
    const resource = state.resources[resourceId];
    if (!resource) {
      return { production: 0, consumption: 0, netPerSecond: 0 };
    }
    
    return {
      production: resource.production || 0,
      consumption: resource.consumption || 0,
      netPerSecond: resource.perSecond || 0
    };
  }, [state.resources]);
  
  /**
   * Преобразует название ресурса в зависимости от языка
   */
  const getResourceName = useCallback((resourceId: string, name: string): string => {
    // Здесь можно добавить логику для перевода имени ресурса
    return name;
  }, []);
  
  return {
    resources: state.resources,
    formatValue,
    formatCost,
    updateResources,
    canAfford,
    getMissingResources,
    recalculateProduction,
    unlockResource,
    incrementResource,
    applyKnowledge,
    applyAllKnowledge,
    exchangeBitcoin,
    getResourceMetrics,
    getResourceName
  };
};
