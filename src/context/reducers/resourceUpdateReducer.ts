
import { GameState } from '../types';

/**
 * Обновляет значения ресурсов на основе прошедшего времени
 */
export const updateResources = (state: GameState, deltaTime: number): GameState => {
  if (deltaTime <= 0) {
    return state;
  }

  const newState = { ...state };
  const seconds = deltaTime / 1000;
  
  // Обновляем все ресурсы
  for (const resourceId in newState.resources) {
    const resource = newState.resources[resourceId];
    
    if (resource.unlocked && resource.perSecond !== 0) {
      // Рассчитываем новое значение с учетом лимита max
      const newValue = Math.min(
        resource.value + resource.perSecond * seconds,
        resource.max
      );
      
      // Обновляем значение ресурса
      newState.resources[resourceId] = {
        ...resource,
        value: Math.max(0, newValue) // Ресурсы не могут быть отрицательными
      };
    }
  }
  
  return {
    ...newState,
    lastUpdate: Date.now()
  };
};
