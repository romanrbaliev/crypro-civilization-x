
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
    
    // КРИТИЧЕСКОЕ ИЗМЕНЕНИЕ: Вместо обновления ресурсов здесь, отправляем действие TICK
    // Это предотвращает дублирование обновления ресурсов между системами
    dispatch({ 
      type: 'TICK', 
      payload: { 
        currentTime: Date.now(), 
        skipResourceUpdate: false,
        debug: true // Добавляем флаг для детального логирования
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
  }, [dispatch]);
  
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
        production: b.production[resourceId] * b.count
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
    getResourceDiagnostics, // Новая функция для диагностики
    resourceSystem,
    resourceFormatter
  };
};
