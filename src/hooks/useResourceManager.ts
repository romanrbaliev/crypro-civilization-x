
import { useCallback } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { ResourceManager } from '@/managers/ResourceManager';
import { formatResourceValue } from '@/utils/resourceFormatConfig';

/**
 * Хук для работы с ресурсами
 */
export const useResourceManager = () => {
  const { state, dispatch } = useGame();
  
  /**
   * Обновляет ресурсы в зависимости от прошедшего времени
   */
  const updateResources = useCallback((deltaTime: number) => {
    if (deltaTime <= 0) return;
    
    const updatedState = ResourceManager.updateResources(state, deltaTime);
    dispatch({ type: 'UPDATE_RESOURCES', payload: updatedState });
  }, [state, dispatch]);
  
  /**
   * Пересчитывает производство всех ресурсов
   */
  const recalculateProduction = useCallback(() => {
    const updatedState = ResourceManager.recalculateAllProduction(state);
    dispatch({ type: 'UPDATE_PRODUCTION', payload: updatedState });
  }, [state, dispatch]);
  
  /**
   * Проверяет, достаточно ли ресурсов для покупки
   */
  const canAfford = useCallback((cost: Record<string, number>) => {
    return ResourceManager.canAfford(state, cost);
  }, [state]);
  
  /**
   * Возвращает список недостающих ресурсов
   */
  const getMissingResources = useCallback((cost: Record<string, number>) => {
    return ResourceManager.getMissingResources(state, cost);
  }, [state]);
  
  /**
   * Списывает ресурсы при покупке
   */
  const spendResources = useCallback((cost: Record<string, number>) => {
    const updatedState = ResourceManager.spendResources(state, cost);
    dispatch({ type: 'SPEND_RESOURCES', payload: updatedState });
    return updatedState;
  }, [state, dispatch]);
  
  /**
   * Обновляет максимальные значения ресурсов
   */
  const updateMaxValues = useCallback(() => {
    const updatedState = ResourceManager.updateResourceMaxValues(state);
    dispatch({ type: 'UPDATE_MAX_VALUES', payload: updatedState });
  }, [state, dispatch]);
  
  /**
   * Форматирует значение ресурса
   */
  const formatValue = useCallback((value: number | null | undefined, resourceId: string) => {
    if (value === null || value === undefined) return "0";
    return formatResourceValue(value, resourceId);
  }, []);
  
  /**
   * Применяет знания
   */
  const applyKnowledge = useCallback((efficiency: number = 0) => {
    const updatedState = ResourceManager.applyKnowledge(state, efficiency);
    dispatch({ type: 'APPLY_KNOWLEDGE_COMPLETE', payload: updatedState });
    return updatedState;
  }, [state, dispatch]);
  
  /**
   * Применяет все знания
   */
  const applyAllKnowledge = useCallback((efficiency: number = 0) => {
    const updatedState = ResourceManager.applyKnowledge(state, efficiency);
    dispatch({ type: 'APPLY_ALL_KNOWLEDGE_COMPLETE', payload: updatedState });
    return updatedState;
  }, [state, dispatch]);
  
  /**
   * Разблокирует ресурс
   */
  const unlockResource = useCallback((resourceId: string) => {
    const updatedState = ResourceManager.unlockResource(state, resourceId);
    dispatch({ type: 'UNLOCK_RESOURCE_COMPLETE', payload: { state: updatedState, resourceId } });
  }, [state, dispatch]);
  
  /**
   * Инкрементирует ресурс
   */
  const incrementResource = useCallback((resourceId: string, amount: number = 1) => {
    const updatedState = ResourceManager.incrementResource(state, resourceId, amount);
    dispatch({ type: 'INCREMENT_RESOURCE_COMPLETE', payload: { state: updatedState, resourceId, amount } });
  }, [state, dispatch]);
  
  return {
    updateResources,
    recalculateProduction,
    canAfford,
    getMissingResources,
    spendResources,
    updateMaxValues,
    formatValue,
    applyKnowledge,
    applyAllKnowledge,
    unlockResource,
    incrementResource
  };
};
