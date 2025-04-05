
import { GameState } from '../types';

export const processUnlockFeature = (
  state: GameState, 
  payload: { featureId: string }
): GameState => {
  return {
    ...state,
    unlocks: {
      ...state.unlocks,
      [payload.featureId]: true
    }
  };
};

export const processSetBuildingUnlocked = (
  state: GameState, 
  payload: { buildingId: string; unlocked: boolean }
): GameState => {
  return {
    ...state,
    buildings: {
      ...state.buildings,
      [payload.buildingId]: {
        ...state.buildings[payload.buildingId],
        unlocked: payload.unlocked
      }
    }
  };
};

export const processSetUpgradeUnlocked = (
  state: GameState, 
  payload: { upgradeId: string; unlocked: boolean }
): GameState => {
  return {
    ...state,
    upgrades: {
      ...state.upgrades,
      [payload.upgradeId]: {
        ...state.upgrades[payload.upgradeId],
        unlocked: payload.unlocked
      }
    }
  };
};

export const processIncrementCounter = (
  state: GameState, 
  payload: { counterId: string; value?: number }
): GameState => {
  const { counterId, value = 1 } = payload;
  const counter = state.counters[counterId];
  
  if (!counter) {
    return {
      ...state,
      counters: {
        ...state.counters,
        [counterId]: { id: counterId, value }
      }
    };
  }
  
  return {
    ...state,
    counters: {
      ...state.counters,
      [counterId]: {
        ...counter,
        value: counter.value + value
      }
    }
  };
};
