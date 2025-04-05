import { GameState, GameAction } from '../types/game';
import { initialState } from './initialState';
import { processApplyKnowledge, processApplyAllKnowledge } from './reducers/building/applyKnowledge';
import { processUpdateResources } from './reducers/resourceUpdateReducer';
import { convertGameState } from '@/utils/typeConverters';

export const gameReducer = (state: GameState = initialState, action: GameAction): GameState => {
  console.log('Получено действие:', action.type);
  
  // Создаем пустой объект для результата
  let result: GameState;
  
  switch (action.type) {
    case 'INCREMENT_RESOURCE':
      result = incrementResource(state, action.payload);
      break;
    
    case 'UNLOCK_RESOURCE':
      result = unlockResource(state, action.payload);
      break;
    
    case 'PURCHASE_BUILDING':
      result = purchaseBuilding(state, action.payload);
      break;
      
    case 'SELL_BUILDING':
      result = sellBuilding(state, action.payload);
      break;
      
    case 'PURCHASE_UPGRADE':
      result = purchaseUpgrade(state, action.payload);
      break;
      
    case 'APPLY_KNOWLEDGE':
      result = processApplyKnowledge(state);
      break;
      
    case 'APPLY_ALL_KNOWLEDGE':
      result = processApplyAllKnowledge(state);
      break;
      
    case 'UPDATE_RESOURCES':
      result = processUpdateResources(state, action.payload);
      break;
      
    case 'INCREMENT_COUNTER':
      result = incrementCounter(state, action.payload);
      break;
      
    case 'START_GAME':
      result = {
        ...initialState,
        gameStarted: true,
        lastUpdate: Date.now()
      };
      break;
      
    case 'LOAD_GAME':
      result = {
        ...action.payload,
        lastUpdate: Date.now()
      };
      break;
      
    case 'RESET_GAME':
      result = {
        ...initialState,
        gameStarted: true,
        lastUpdate: Date.now()
      };
      break;
      
    default:
      result = state;
      break;
  }
  
  // Преобразуем результат для обеспечения совместимости типов
  return convertGameState<GameState>(result);
};

// Функция для увеличения ресурса
function incrementResource(state: GameState, payload: { resourceId: string; amount: number }): GameState {
  const { resourceId, amount } = payload;
  const resource = state.resources[resourceId];
  
  if (!resource || !resource.unlocked) {
    return state;
  }
  
  // Проверяем, не превышает ли новое значение максимум
  const newValue = Math.min(resource.value + amount, resource.max);
  
  return {
    ...state,
    resources: {
      ...state.resources,
      [resourceId]: {
        ...resource,
        value: newValue
      }
    }
  };
}

// Функция для разблокировки ресурса
function unlockResource(state: GameState, payload: { resourceId: string }): GameState {
  const { resourceId } = payload;
  const resource = state.resources[resourceId];
  
  if (!resource) {
    return state;
  }
  
  return {
    ...state,
    resources: {
      ...state.resources,
      [resourceId]: {
        ...resource,
        unlocked: true
      }
    },
    unlocks: {
      ...state.unlocks,
      [resourceId]: true
    }
  };
}

// Функция для покупки здания
function purchaseBuilding(state: GameState, payload: { buildingId: string }): GameState {
  const { buildingId } = payload;
  const building = state.buildings[buildingId];
  
  if (!building || !building.unlocked) {
    return state;
  }
  
  // Проверяем, достаточно ли ресурсов для покупки
  const canAfford = Object.entries(building.cost).every(([resourceId, cost]) => {
    const resource = state.resources[resourceId];
    // Учитываем множитель стоимости для каждого уровня здания
    const scaledCost = cost * Math.pow(building.costMultiplier, building.count);
    return resource && resource.unlocked && resource.value >= scaledCost;
  });
  
  if (!canAfford) {
    return state;
  }
  
  // Вычитаем ресурсы
  const newResources = { ...state.resources };
  Object.entries(building.cost).forEach(([resourceId, cost]) => {
    const resource = newResources[resourceId];
    const scaledCost = cost * Math.pow(building.costMultiplier, building.count);
    newResources[resourceId] = {
      ...resource,
      value: resource.value - scaledCost
    };
  });
  
  // Увеличиваем количество зданий
  return {
    ...state,
    resources: newResources,
    buildings: {
      ...state.buildings,
      [buildingId]: {
        ...building,
        count: building.count + 1
      }
    }
  };
}

// Функция для продажи здания
function sellBuilding(state: GameState, payload: { buildingId: string }): GameState {
  const { buildingId } = payload;
  const building = state.buildings[buildingId];
  
  if (!building || !building.unlocked || building.count <= 0) {
    return state;
  }
  
  // Возвращаем часть ресурсов (обычно 50%)
  const refundMultiplier = 0.5;
  const newResources = { ...state.resources };
  
  Object.entries(building.cost).forEach(([resourceId, cost]) => {
    const resource = newResources[resourceId];
    if (resource && resource.unlocked) {
      const scaledCost = cost * Math.pow(building.costMultiplier, building.count - 1);
      const refundAmount = scaledCost * refundMultiplier;
      
      newResources[resourceId] = {
        ...resource,
        value: Math.min(resource.value + refundAmount, resource.max)
      };
    }
  });
  
  // Уменьшаем количество зданий
  return {
    ...state,
    resources: newResources,
    buildings: {
      ...state.buildings,
      [buildingId]: {
        ...building,
        count: building.count - 1
      }
    }
  };
}

// Функция для покупки улучшения
function purchaseUpgrade(state: GameState, payload: { upgradeId: string }): GameState {
  const { upgradeId } = payload;
  const upgrade = state.upgrades[upgradeId];
  
  if (!upgrade || !upgrade.unlocked || upgrade.purchased) {
    return state;
  }
  
  // Проверяем, достаточно ли ресурсов для покупки
  const canAfford = Object.entries(upgrade.cost).every(([resourceId, cost]) => {
    const resource = state.resources[resourceId];
    return resource && resource.unlocked && resource.value >= cost;
  });
  
  if (!canAfford) {
    return state;
  }
  
  // Вычитаем ресурсы
  const newResources = { ...state.resources };
  Object.entries(upgrade.cost).forEach(([resourceId, cost]) => {
    const resource = newResources[resourceId];
    if (resource && resource.unlocked) {
      newResources[resourceId] = {
        ...resource,
        value: resource.value - cost
      };
    }
  });
  
  // Отмечаем улучшение как купленное
  return {
    ...state,
    resources: newResources,
    upgrades: {
      ...state.upgrades,
      [upgradeId]: {
        ...upgrade,
        purchased: true
      }
    }
  };
}

// Функция для увеличения счетчика
function incrementCounter(state: GameState, payload: { counterId: string; amount?: number }): GameState {
  const { counterId, amount = 1 } = payload;
  
  // Если счетчик существует, увеличиваем его значение
  if (state.counters[counterId]) {
    return {
      ...state,
      counters: {
        ...state.counters,
        [counterId]: {
          ...state.counters[counterId],
          value: state.counters[counterId].value + amount
        }
      }
    };
  }
  
  // Если счетчик не существует, создаем его
  return {
    ...state,
    counters: {
      ...state.counters,
      [counterId]: {
        id: counterId,
        name: counterId,
        value: amount
      }
    }
  };
}
