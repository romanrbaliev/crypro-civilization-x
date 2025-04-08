
import { GameState } from '@/context/types';
import { ResourceSystem } from '@/systems/ResourceSystem';

// Создаем экземпляр системы ресурсов
const resourceSystem = new ResourceSystem();

/**
 * Обновляет производство ресурсов
 */
export const recalculateResourceProduction = (state: GameState): GameState => {
  return resourceSystem.recalculateAllResourceProduction(state);
};

/**
 * Обновляет ресурсы на основе прошедшего времени
 */
export const updateResourceValues = (state: GameState, deltaTime: number): GameState => {
  return resourceSystem.updateResources(state, deltaTime);
};

/**
 * Расчет скорости производства ресурса
 */
export const calculateResourceProductionRate = (resourceId: string, state: GameState): number => {
  // Проверяем, есть ли ресурс
  if (!state.resources[resourceId]) {
    return 0;
  }
  
  // Базовое производство
  let productionRate = state.resources[resourceId].production || 0;
  
  // Применяем бонусы (если есть)
  if (state.effects && state.effects[`${resourceId}ProductionBoost`]) {
    productionRate *= (1 + state.effects[`${resourceId}ProductionBoost`]);
  }
  
  return productionRate;
};

/**
 * Расчет скорости потребления ресурса
 */
export const calculateResourceConsumptionRate = (resourceId: string, state: GameState): number => {
  // Проверяем, есть ли ресурс
  if (!state.resources[resourceId]) {
    return 0;
  }
  
  // Базовое потребление
  let consumptionRate = state.resources[resourceId].consumption || 0;
  
  // Применяем бонусы снижения потребления (если есть)
  if (state.effects && state.effects[`${resourceId}ConsumptionReduction`]) {
    const reduction = state.effects[`${resourceId}ConsumptionReduction`];
    consumptionRate *= (1 - Math.min(reduction, 0.9)); // Ограничиваем снижение до 90%
  }
  
  return consumptionRate;
};
