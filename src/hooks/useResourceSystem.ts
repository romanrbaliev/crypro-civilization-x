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
    
    // Прямое обновление ресурсов через ResourceSystem для исключения любых побочных эффектов
    const updatedState = resourceSystem.updateResources(state, deltaTime);
    
    // Отправляем обновленное состояние непосредственно, пропуская стандартный цикл TICK
    dispatch({ 
      type: 'DIRECT_RESOURCE_UPDATE', 
      payload: { 
        updatedState,
        deltaTime
      } 
    });
  }, [dispatch, state, resourceSystem]);
  
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
    const updatedState = resourceSystem.updateResourceMaxValues(state);
    
    // Отправляем обновленное состояние в редьюсер
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
    console.log(`useResourceSystem: Увеличение ресурса ${resourceId} на ${amount}`);
    
    // Получаем текущее значение для отправки события
    const currentValue = state.resources[resourceId]?.value || 0;
    
    // Создаем новый объект состояния с обновленным ресурсом
    const newState = resourceSystem.incrementResource(state, { resourceId, amount });
    
    // Отправляем действие с обновленным состоянием
    dispatch({
      type: 'DIRECT_RESOURCE_UPDATE',
      payload: { updatedState: newState, deltaTime: 0 }
    });
    
    // Отправляем событие обновления значения
    const newValue = newState.resources[resourceId]?.value || 0;
    try {
      window.dispatchEvent(new CustomEvent('knowledge-value-updated', { 
        detail: { 
          oldValue: currentValue,
          newValue: newValue,
          delta: amount
        }
      }));
      console.log(`useResourceSystem: Отправлено событие обновления ${resourceId}: ${currentValue} → ${newValue}`);
    } catch (e) {
      console.error("useResourceSystem: Ошибка при отправке события:", e);
    }
  }, [dispatch, state, resourceSystem]);
  
  /**
   * Пересчитывает всё производство ресурсов
   */
  const recalculateAllProduction = useCallback(() => {
    console.log("useResourceSystem: Пересчет всего производства ресурсов");
    
    // Напрямую вычисляем новое состояние с обновленным производством
    const updatedState = resourceSystem.recalculateAllResourceProduction(state);
    
    // Отправляем обновленное состояние напрямую
    dispatch({ 
      type: 'DIRECT_RESOURCE_UPDATE', 
      payload: { updatedState, deltaTime: 0 } 
    });
    
    return updatedState;
  }, [dispatch, state, resourceSystem]);
  
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
  
  /**
   * Применяет знания (конвертирует в USDT)
   */
  const applyKnowledge = useCallback(() => {
    console.log("Применение знаний...");
    dispatch({ type: 'APPLY_KNOWLEDGE' });
  }, [dispatch]);
  
  /**
   * Применяет все доступные знания
   */
  const applyAllKnowledge = useCallback(() => {
    console.log("Применение всех знаний...");
    dispatch({ type: 'APPLY_ALL_KNOWLEDGE' });
  }, [dispatch]);
  
  /**
   * Обменивает Bitcoin на USDT
   */
  const exchangeBitcoin = useCallback(() => {
    dispatch({ type: 'EXCHANGE_BTC' });
  }, [dispatch]);
  
  /**
   * Получает диагностическую информацию о ресурсе
   * @param resourceId ID ресурса
   * @returns Объект с диагностической информацией
   */
  const getResourceDiagnostics = useCallback((resourceId: string) => {
    const resource = state.resources[resourceId];
    if (!resource) return null;
    
    // Производство от зданий
    const buildingProduction = Object.values(state.buildings)
      .filter(b => b.count > 0 && b.production && b.production[resourceId])
      .map(b => ({
        name: b.name,
        count: b.count,
        production: (b.production[resourceId] || 0) * b.count
      }));
    
    // Бонусы от улучшений
    const upgradeBonuses = Object.values(state.upgrades)
      .filter(u => u.purchased && u.effects)
      .map(u => ({
        name: u.name,
        effects: u.effects
      }));
    
    return {
      resource,
      baseProduction: resource.baseProduction || 0,
      currentProduction: resource.production || 0,
      perSecond: resource.perSecond || 0,
      buildingProduction,
      upgradeBonuses,
      max: resource.max || 0
    };
  }, [state.resources, state.buildings, state.upgrades]);
  
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
    applyKnowledge,
    applyAllKnowledge,
    exchangeBitcoin,
    getResourceDiagnostics,
    resourceSystem,
    resourceFormatter
  };
};
