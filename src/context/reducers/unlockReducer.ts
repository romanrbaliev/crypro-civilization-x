
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
    return state;
  }
  
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
  payload: { counterId: string; value?: number }
): GameState => {
  const { counterId, value = 1 } = payload;
  
  // Если счетчик не существует, создаем его
  if (!state.counters[counterId]) {
    return {
      ...state,
      counters: {
        ...state.counters,
        [counterId]: {
          id: counterId,
          name: counterId,
          value: value
        }
      }
    };
  }
  
  // Обновляем существующий счетчик
  const counter = state.counters[counterId];
  const currentValue = typeof counter === 'number' ? counter : counter.value;
  
  return {
    ...state,
    counters: {
      ...state.counters,
      [counterId]: {
        ...(typeof counter === 'object' ? counter : { id: counterId, name: counterId }),
        value: currentValue + value
      }
    }
  };
};
