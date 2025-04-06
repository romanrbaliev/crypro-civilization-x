
import { GameState } from '../types';
import { ResourceSystem } from '@/systems/ResourceSystem';

// Создаем статический экземпляр для использования вне компонентов
const resourceSystem = new ResourceSystem();

export const processIncrementResource = (
  state: GameState, 
  payload: { resourceId: string; amount?: number }
): GameState => {
  // Используем метод ResourceSystem для инкремента ресурса
  return resourceSystem.incrementResource(state, payload);
};

export const processUnlockResource = (
  state: GameState, 
  payload: { resourceId: string }
): GameState => {
  // Используем метод ResourceSystem для разблокировки ресурса
  return resourceSystem.unlockResource(state, payload);
};
