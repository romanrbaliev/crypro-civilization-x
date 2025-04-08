
import { GameState } from '@/context/types';
import { ResourceSystem } from '@/systems/ResourceSystem';

// Создаем экземпляр системы ресурсов
const resourceSystem = new ResourceSystem();

/**
 * Проверяет, достаточно ли ресурсов для покупки
 */
export const checkResourceAvailability = (state: GameState, cost: Record<string, number>): boolean => {
  return resourceSystem.checkAffordability(state, cost);
};

/**
 * Вычитает ресурсы из текущего запаса
 */
export const deductResources = (state: GameState, cost: Record<string, number>): GameState => {
  let newState = { ...state };
  
  for (const resourceId in cost) {
    if (newState.resources[resourceId]) {
      newState.resources[resourceId] = {
        ...newState.resources[resourceId],
        value: Math.max(0, newState.resources[resourceId].value - cost[resourceId])
      };
    }
  }
  
  return newState;
};

/**
 * Добавляет ресурсы к текущему запасу
 */
export const addResources = (state: GameState, resources: Record<string, number>): GameState => {
  let newState = { ...state };
  
  for (const resourceId in resources) {
    if (newState.resources[resourceId]) {
      const resource = newState.resources[resourceId];
      newState.resources[resourceId] = {
        ...resource,
        value: Math.min(resource.value + resources[resourceId], resource.max)
      };
    }
  }
  
  return newState;
};
