
import { GameState } from '../types';

// Обработка разблокировки ресурса
export const processUnlockResource = (state: GameState, resourceId: string): GameState => {
  // Проверяем, существует ли ресурс
  if (!state.resources[resourceId]) {
    console.log(`Ресурс ${resourceId} не найден`);
    return state;
  }
  
  // Если ресурс уже разблокирован, ничего не делаем
  if (state.resources[resourceId].unlocked) {
    return state;
  }
  
  // Разблокируем ресурс
  const updatedState = {
    ...state,
    resources: {
      ...state.resources,
      [resourceId]: {
        ...state.resources[resourceId],
        unlocked: true
      }
    },
    unlocks: {
      ...state.unlocks,
      [resourceId]: true
    }
  };
  
  return updatedState;
};

// Обработка разблокировки здания
export const processUnlockBuilding = (state: GameState, buildingId: string): GameState => {
  // Проверяем, существует ли здание
  if (!state.buildings[buildingId]) {
    console.log(`Здание ${buildingId} не найдено`);
    return state;
  }
  
  // Если здание уже разблокировано, ничего не делаем
  if (state.buildings[buildingId].unlocked) {
    return state;
  }
  
  // Разблокируем здание
  const updatedState = {
    ...state,
    buildings: {
      ...state.buildings,
      [buildingId]: {
        ...state.buildings[buildingId],
        unlocked: true
      }
    },
    unlocks: {
      ...state.unlocks,
      [buildingId]: true
    }
  };
  
  return updatedState;
};

// Обработка разблокировки улучшения
export const processUnlockUpgrade = (state: GameState, upgradeId: string): GameState => {
  // Проверяем, существует ли улучшение
  if (!state.upgrades[upgradeId]) {
    console.log(`Улучшение ${upgradeId} не найдено`);
    return state;
  }
  
  // Если улучшение уже разблокировано, ничего не делаем
  if (state.upgrades[upgradeId].unlocked) {
    return state;
  }
  
  // Разблокируем улучшение
  const updatedState = {
    ...state,
    upgrades: {
      ...state.upgrades,
      [upgradeId]: {
        ...state.upgrades[upgradeId],
        unlocked: true
      }
    },
    counters: {
      ...state.counters,
      unlocks: {
        value: (typeof state.counters.unlocks === 'object' 
          ? state.counters.unlocks.value + 1 
          : (state.counters.unlocks || 0) + 1),
        updatedAt: Date.now()
      }
    }
  };
  
  return updatedState;
};

// Обработка разблокировки специальных возможностей
export const processUnlockSpecial = (state: GameState, specialId: string): GameState => {
  // Если такой разблокировки не существует, создаем её
  const updatedState = {
    ...state,
    unlocks: {
      ...state.unlocks,
      [specialId]: true
    },
    counters: {
      ...state.counters,
      specialUnlocks: {
        value: (typeof state.counters.specialUnlocks === 'object'
          ? state.counters.specialUnlocks.value + 1
          : (state.counters.specialUnlocks || 0) + 1),
        updatedAt: Date.now()
      }
    }
  };
  
  return updatedState;
};

// Функция для обработки разблокировки любого типа
export const processUnlock = (state: GameState, id: string, type: 'resource' | 'building' | 'upgrade' | 'special'): GameState => {
  switch (type) {
    case 'resource':
      return processUnlockResource(state, id);
    case 'building':
      return processUnlockBuilding(state, id);
    case 'upgrade':
      return processUnlockUpgrade(state, id);
    case 'special':
      return processUnlockSpecial(state, id);
    default:
      return state;
  }
};

// Функция для проверки условий разблокировки ресурсов
export const checkResourceUnlocks = (state: GameState): GameState => {
  return state;
};
