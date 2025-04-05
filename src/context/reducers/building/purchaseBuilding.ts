
import { GameState } from '../../types';
import { safeDispatchGameEvent } from '../../utils/eventBusUtils';

// Интерфейс для параметров майнинга
interface MiningParams {
  difficulty: number;
  hashrate: number;
  blockReward: number;
  lastBlockTime: number;
  exchangeRate: number;
  exchangeCommission: number;
  miningEfficiency: number;
  energyEfficiency: number;
  networkDifficulty: number;
  volatility: number;
}

// Интерфейс для параметров покупки здания
interface PurchaseBuildingPayload {
  buildingId: string;
}

export const processPurchaseBuilding = (state: GameState, payload: PurchaseBuildingPayload): GameState => {
  const { buildingId } = payload;
  const building = state.buildings[buildingId];
  
  if (!building) {
    console.error(`Building with id ${buildingId} not found`);
    return state;
  }
  
  // Проверяем, достаточно ли ресурсов для покупки
  for (const [resourceId, amount] of Object.entries(building.cost)) {
    const resource = state.resources[resourceId];
    if (!resource || resource.value < Number(amount)) {
      console.log(`Not enough ${resourceId} to purchase ${building.name}`);
      return state;
    }
  }
  
  // Создаем копию состояния для модификации
  const newState = { ...state };
  
  // Списываем ресурсы
  for (const [resourceId, amount] of Object.entries(building.cost)) {
    newState.resources[resourceId] = {
      ...newState.resources[resourceId],
      value: newState.resources[resourceId].value - Number(amount)
    };
  }
  
  // Рассчитываем новую стоимость здания
  const newCost = {};
  for (const [resourceId, amount] of Object.entries(building.cost)) {
    newCost[resourceId] = Math.floor(Number(amount) * building.costMultiplier);
  }
  
  // Обновляем здание
  newState.buildings[buildingId] = {
    ...building,
    count: building.count + 1,
    cost: newCost
  };
  
  // Обновляем счетчики
  if (buildingId === 'practice' && building.count === 0) {
    newState.counters = {
      ...newState.counters,
      practiceBuilt: (newState.counters.practiceBuilt || 0) + 1
    };
  } else if (buildingId === 'generator' && building.count === 0) {
    newState.counters = {
      ...newState.counters,
      generatorBuilt: (newState.counters.generatorBuilt || 0) + 1
    };
    
    // Разблокировка электричества
    if (!newState.unlocks.electricity) {
      newState.unlocks = {
        ...newState.unlocks,
        electricity: true
      };
      
      newState.resources.electricity = {
        ...newState.resources.electricity,
        unlocked: true,
        consumption: 0
      };
      
      safeDispatchGameEvent('Разблокирован ресурс: Электричество', 'unlock');
    }
  } else if (buildingId === 'homeComputer' && building.count === 0) {
    newState.counters = {
      ...newState.counters,
      computerBuilt: (newState.counters.computerBuilt || 0) + 1
    };
    
    // Разблокировка вычислительной мощности
    if (!newState.unlocks.computingPower) {
      newState.unlocks = {
        ...newState.unlocks,
        computingPower: true
      };
      
      newState.resources.computingPower = {
        ...newState.resources.computingPower,
        unlocked: true,
        consumption: 0
      };
      
      safeDispatchGameEvent('Разблокирован ресурс: Вычислительная мощность', 'unlock');
    }
  } else if (buildingId === 'cryptoWallet' && building.count === 0) {
    newState.counters = {
      ...newState.counters,
      walletBuilt: (newState.counters.walletBuilt || 0) + 1
    };
  } else if (buildingId === 'miner' && building.count === 0) {
    // Разблокировка биткоина
    if (!newState.unlocks.bitcoin) {
      newState.unlocks = {
        ...newState.unlocks,
        bitcoin: true,
        mining: true
      };
      
      newState.resources.bitcoin = {
        ...newState.resources.bitcoin,
        unlocked: true,
        consumption: 0
      };
      
      // Устанавливаем параметры майнинга
      newState.miningParams = {
        ...state.miningParams,
        miningEfficiency: 1,
        energyEfficiency: 1,
        networkDifficulty: 1,
        exchangeRate: 25000,
        exchangeCommission: 0.005,
        volatility: 0.05
      };
      
      safeDispatchGameEvent('Разблокирован ресурс: Bitcoin', 'unlock');
      safeDispatchGameEvent('Разблокирована возможность: Майнинг', 'unlock');
    }
  }
  
  return newState;
};
