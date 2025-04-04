
import { GameState } from '../types';

// Обработка разблокировки фичи
export const processUnlockFeature = (
  state: GameState,
  payload: { featureId: string }
): GameState => {
  const { featureId } = payload;
  
  // ВАЖНОЕ ИСПРАВЛЕНИЕ: Проверка перед разблокировкой вкладки Оборудование
  if (featureId === 'equipment') {
    console.log(`processUnlockFeature: Попытка разблокировки вкладки Оборудование`);
    
    // Проверка наличия разблокированных зданий
    const hasUnlockedBuildings = Object.values(state.buildings).some(b => b.unlocked);
    console.log(`processUnlockFeature: Наличие разблокированных зданий = ${hasUnlockedBuildings}`);
    
    if (hasUnlockedBuildings) {
      console.log(`processUnlockFeature: Условие разблокировки вкладки Оборудование выполнено`);
    } else {
      console.log(`processUnlockFeature: Условие разблокировки вкладки Оборудование НЕ выполнено`);
      return state; // Не разблокируем, если нет разблокированных зданий
    }
  }
  
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
  
  // Проверяем, действительно ли изменится статус разблокировки
  const isCurrentlyUnlocked = !!state.buildings[buildingId].unlocked;
  if (isCurrentlyUnlocked === unlocked) {
    // Статус не изменится, просто возвращаем текущее состояние
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
    
    // ВАЖНОЕ ИСПРАВЛЕНИЕ: Если счетчик стал равен 1, автоматически разблокируем вкладку оборудования
    if (updatedCounters.buildingsUnlocked.value === 1) {
      console.log(`processSetBuildingUnlocked: Автоматическая разблокировка вкладки Оборудование`);
      
      // Обновляем разблокировки
      return {
        ...state,
        buildings: {
          ...state.buildings,
          [buildingId]: {
            ...state.buildings[buildingId],
            unlocked
          }
        },
        counters: updatedCounters,
        unlocks: {
          ...state.unlocks,
          equipment: true // Разблокируем вкладку оборудования
        }
      };
    }
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
  
  // ИСПРАВЛЕНИЕ: Улучшаем логгирование для счетчика applyKnowledge
  if (counterId === 'applyKnowledge') {
    console.log(`processIncrementCounter: Увеличение счетчика applyKnowledge на ${value}`);
  }
  
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
