
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
  const { buildingId, unlocked } = payload;
  
  return {
    ...state,
    buildings: {
      ...state.buildings,
      [buildingId]: {
        ...state.buildings[buildingId],
        unlocked
      }
    }
  };
};

export const processSetUpgradeUnlocked = (
  state: GameState,
  payload: { upgradeId: string; unlocked: boolean }
): GameState => {
  const { upgradeId, unlocked } = payload;
  
  return {
    ...state,
    upgrades: {
      ...state.upgrades,
      [upgradeId]: {
        ...state.upgrades[upgradeId],
        unlocked
      }
    }
  };
};

export const processIncrementCounter = (
  state: GameState,
  payload: { counterId: string; value?: number }
): GameState => {
  const { counterId, value = 1 } = payload;
  
  // Проверяем существование счетчика
  if (!state.counters[counterId]) {
    // Создаем новый счетчик, если его не существует
    return {
      ...state,
      counters: {
        ...state.counters,
        [counterId]: { id: counterId, value }
      }
    };
  }
  
  // Инкрементируем существующий счетчик
  return {
    ...state,
    counters: {
      ...state.counters,
      [counterId]: {
        ...state.counters[counterId],
        value: state.counters[counterId].value + value
      }
    }
  };
};
