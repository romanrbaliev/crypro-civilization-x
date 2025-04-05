
import { GameState } from '../types';

export const processIncrementResource = (
  state: GameState, 
  payload: { resourceId: string; amount?: number }
): GameState => {
  const { resourceId, amount = 1 } = payload;
  const resource = state.resources[resourceId];
  
  if (!resource) return state;
  
  return {
    ...state,
    resources: {
      ...state.resources,
      [resourceId]: {
        ...resource,
        value: Math.min(resource.value + amount, resource.max)
      }
    }
  };
};

export const processUnlockResource = (
  state: GameState, 
  payload: { resourceId: string }
): GameState => {
  const { resourceId } = payload;
  const resource = state.resources[resourceId];
  
  if (!resource) return state;
  
  return {
    ...state,
    resources: {
      ...state.resources,
      [resourceId]: {
        ...resource,
        unlocked: true
      }
    }
  };
};
