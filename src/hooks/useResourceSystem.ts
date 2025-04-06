
import { useCallback, useMemo } from 'react';
import { ResourceSystem } from '@/systems/ResourceSystem';
import { useGame } from '@/context/hooks/useGame';
import { ResourceFormatter } from '@/formatters/ResourceFormatter';

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
    if (deltaTime <= 0) return;
    
    console.log(`useResourceSystem: Обновление ресурсов, прошло ${deltaTime}ms`);
    
    // Применяем обновление ресурсов через TICK действие
    dispatch({ 
      type: 'TICK', 
      payload: { 
        currentTime: Date.now(),
        deltaTime: deltaTime
      } 
    });
  }, [dispatch]);
  
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
    // Обновляем максимальные значения ресурсов через ResourceSystem
    console.log("useResourceSystem: Обновление максимальных значений ресурсов");
    dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
  }, [dispatch]);
  
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
  }, [dispatch]);
  
  /**
   * Пересчитывает всё производство ресурсов
   */
  const recalculateAllProduction = useCallback(() => {
    console.log("useResourceSystem: Пересчет всего производства ресурсов");
    
    // Принудительно пересчитываем производство
    dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
    
    // Для отладки выводим состояние ключевых ресурсов
    console.log("useResourceSystem: Состояние после пересчета:", {
      knowledge: state.resources.knowledge?.perSecond,
      usdt: state.resources.usdt?.perSecond,
      electricity: state.resources.electricity?.perSecond
    });
  }, [dispatch, state.resources]);
  
  /**
   * Разблокирует ресурс
   * @param resourceId ID ресурса
   */
  const unlockResource = useCallback((resourceId: string) => {
    dispatch({
      type: 'UNLOCK_RESOURCE',
      payload: { resourceId }
    });
  }, [dispatch]);
  
  return {
    updateResources,
    canAfford,
    getMissingResources,
    updateResourceMaxValues,
    formatCost,
    formatValue,
    incrementResource,
    unlockResource,
    recalculateAllProduction,
    resourceSystem,
    resourceFormatter
  };
};
