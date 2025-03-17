
import { GameState } from '../types';

// Обработка разблокировки фичи
export const processUnlockFeature = (
  state: GameState,
  payload: { featureId: string }
): GameState => {
  const { featureId } = payload;
  
  return {
    ...state,
    unlocks: {
      ...state.unlocks,
      [featureId]: true
    }
  };
};

// Обработка разблокировки здания
export const processSetBuildingUnlocked = (
  state: GameState,
  payload: { buildingId: string; unlocked: boolean }
): GameState => {
  const { buildingId, unlocked } = payload;
  
  if (!state.buildings[buildingId]) {
    console.warn(`Попытка установить разблокировку для несуществующего здания: ${buildingId}`);
    return state;
  }
  
  console.log(`Устанавливаем разблокировку для здания ${buildingId}: ${unlocked}`);
  
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

// Обработка инкремента счетчика
export const processIncrementCounter = (
  state: GameState,
  payload: { counterId: string }
): GameState => {
  const { counterId } = payload;
  
  return {
    ...state,
    counters: {
      ...state.counters,
      [counterId]: (state.counters[counterId] || 0) + 1
    }
  };
};
