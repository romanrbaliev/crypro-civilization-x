
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
  
  // Обновляем счетчик разблокированных зданий при разблокировке
  let updatedCounters = { ...state.counters };
  
  if (unlocked && !state.buildings[buildingId].unlocked) {
    // Увеличиваем счетчик только если здание действительно было заблокировано ранее
    const buildingsUnlockedCounter = state.counters.buildingsUnlocked || { id: 'buildingsUnlocked', name: 'buildingsUnlocked', value: 0 };
    
    updatedCounters.buildingsUnlocked = {
      ...(typeof buildingsUnlockedCounter === 'object' ? buildingsUnlockedCounter : { id: 'buildingsUnlocked', name: 'buildingsUnlocked' }),
      value: (typeof buildingsUnlockedCounter === 'object' ? buildingsUnlockedCounter.value : buildingsUnlockedCounter) + 1
    };
    
    console.log(`processSetBuildingUnlocked: Увеличиваем счетчик buildingsUnlocked на 1 для здания ${buildingId}`);
  }
  
  return {
    ...state,
    buildings: {
      ...state.buildings,
      [buildingId]: {
        ...state.buildings[buildingId],
        unlocked
      }
    },
    counters: updatedCounters
  };
};

// Обработка разблокировки улучшения
export const processSetUpgradeUnlocked = (
  state: GameState,
  payload: { upgradeId: string; unlocked: boolean }
): GameState => {
  const { upgradeId, unlocked } = payload;
  
  if (!state.upgrades[upgradeId]) {
    return state;
  }
  
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

// Обработка инкремента счетчика
export const processIncrementCounter = (
  state: GameState,
  payload: { counterId: string; value?: number }
): GameState => {
  const { counterId, value = 1 } = payload;
  
  // Если счетчик не существует, создаем его
  if (!state.counters[counterId]) {
    console.log(`processIncrementCounter: Создаем новый счетчик ${counterId} со значением ${value}`);
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
  
  console.log(`processIncrementCounter: Увеличиваем счетчик ${counterId} с ${currentValue} на ${value}`);
  
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
