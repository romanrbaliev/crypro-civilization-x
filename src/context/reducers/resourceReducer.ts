
import { GameState } from '../types';
import { ResourceSystem } from '@/systems/ResourceSystem';

// Создаем статический экземпляр для использования вне компонентов
const resourceSystem = new ResourceSystem();

export const processIncrementResource = (
  state: GameState, 
  payload: { resourceId: string; amount?: number }
): GameState => {
  return resourceSystem.incrementResource(state, payload);
};

export const processUnlockResource = (
  state: GameState, 
  payload: { resourceId: string }
): GameState => {
  return resourceSystem.unlockResource(state, payload);
};
