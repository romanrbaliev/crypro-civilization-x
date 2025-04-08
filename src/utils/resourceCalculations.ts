
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
