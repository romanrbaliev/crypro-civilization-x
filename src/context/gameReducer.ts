
import { GameState, GameAction } from '../types/game';
import { initialState } from './initialState';

export const gameReducer = (state: GameState = initialState, action: GameAction): GameState => {
  console.log('Получено действие:', action.type);
  
  switch (action.type) {
    case 'INCREMENT_RESOURCE':
      return incrementResource(state, action.payload);
    
    case 'UNLOCK_RESOURCE':
      return unlockResource(state, action.payload);
    
    case 'PURCHASE_BUILDING':
      return purchaseBuilding(state, action.payload);
      
    case 'SELL_BUILDING':
      return sellBuilding(state, action.payload);
      
    case 'PURCHASE_UPGRADE':
      return purchaseUpgrade(state, action.payload);
      
    case 'APPLY_KNOWLEDGE':
      return applyKnowledge(state);
      
    case 'UPDATE_RESOURCES':
      return updateResources(state);
      
    case 'START_GAME':
      return {
        ...initialState,
        gameStarted: true,
        lastUpdate: Date.now()
      };
      
    case 'LOAD_GAME':
      return {
        ...action.payload,
        lastUpdate: Date.now()
      };
      
    case 'RESET_GAME':
      return {
        ...initialState,
        gameStarted: true,
        lastUpdate: Date.now()
      };
      
    default:
      return state;
  }
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

// Функция для применения знаний
function applyKnowledge(state: GameState): GameState {
  // Проверяем наличие знаний
  const knowledge = state.resources.knowledge;
  
  if (!knowledge || knowledge.value < 10) {
    return state;
  }
  
  // Получаем USDT из знаний
  const conversionRate = 10; // 10 знаний = 1 USDT
  const knowledgeToConvert = Math.floor(knowledge.value / conversionRate) * conversionRate;
  const usdtGained = knowledgeToConvert / conversionRate;
  
  // Если USDT не разблокирован, разблокируем его
  let usdtResource = state.resources.usdt;
  let usdtUnlocked = usdtResource.unlocked;
  
  if (!usdtUnlocked) {
    usdtUnlocked = true;
  }
  
  // Обновляем счетчик применений знаний
  const newCounters = {
    ...state.counters,
    applyKnowledge: {
      ...state.counters.applyKnowledge,
      value: state.counters.applyKnowledge.value + 1
    }
  };
  
  // Обновляем ресурсы
  return {
    ...state,
    resources: {
      ...state.resources,
      knowledge: {
        ...knowledge,
        value: knowledge.value - knowledgeToConvert
      },
      usdt: {
        ...usdtResource,
        unlocked: usdtUnlocked,
        value: usdtResource.value + usdtGained
      }
    },
    counters: newCounters,
    unlocks: {
      ...state.unlocks,
      usdt: usdtUnlocked
    }
  };
}

// Функция обновления ресурсов (вызывается каждую секунду)
function updateResources(state: GameState): GameState {
  const now = Date.now();
  const deltaTime = (now - state.lastUpdate) / 1000; // Время в секундах
  
  if (deltaTime <= 0 || !state.gameStarted) {
    return {
      ...state,
      lastUpdate: now
    };
  }
  
  // Копируем ресурсы для обновления
  const newResources = { ...state.resources };
  
  // Сначала рассчитываем производство от зданий
  Object.values(state.buildings).forEach(building => {
    if (building.count > 0 && building.production) {
      Object.entries(building.production).forEach(([resourceId, amount]) => {
        const resource = newResources[resourceId];
        if (resource && resource.unlocked) {
          // Добавляем производство в perSecond
          const productionPerSecond = amount * building.count;
          resource.perSecond = (resource.perSecond || 0) + productionPerSecond;
        }
      });
    }
  });
  
  // Теперь рассчитываем потребление ресурсов
  Object.values(state.buildings).forEach(building => {
    if (building.count > 0 && building.consumption) {
      Object.entries(building.consumption).forEach(([resourceId, amount]) => {
        const resource = newResources[resourceId];
        if (resource && resource.unlocked) {
          // Вычитаем потребление из perSecond
          const consumptionPerSecond = amount * building.count;
          resource.perSecond = (resource.perSecond || 0) - consumptionPerSecond;
        }
      });
    }
  });
  
  // Теперь обновляем значения ресурсов
  Object.keys(newResources).forEach(resourceId => {
    const resource = newResources[resourceId];
    if (resource.unlocked) {
      // Обновляем значение ресурса на основе perSecond
      const newValue = resource.value + (resource.perSecond * deltaTime);
      // Проверяем максимум
      resource.value = Math.max(0, Math.min(newValue, resource.max));
    }
  });
  
  // Проверяем разблокировки
  const newUnlocks = { ...state.unlocks };
  const newBuildings = { ...state.buildings };
  
  // Если у нас есть 2+ применения знаний, разблокируем практику
  if (state.counters.applyKnowledge.value >= 2 && !newBuildings.practice.unlocked) {
    newBuildings.practice.unlocked = true;
    newUnlocks.practice = true;
  }
  
  // Если у нас есть 11+ USDT, разблокируем генератор
  if (newResources.usdt.value >= 11 && !newBuildings.generator.unlocked) {
    newBuildings.generator.unlocked = true;
    newUnlocks.generator = true;
  }
  
  return {
    ...state,
    resources: newResources,
    buildings: newBuildings,
    unlocks: newUnlocks,
    lastUpdate: now,
    gameTime: state.gameTime + deltaTime
  };
}
