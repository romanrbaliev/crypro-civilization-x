import { GameState } from '../types';
import { hasEnoughResources, updateResourceMaxValues } from '../utils/resourceUtils';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { checkUpgradeUnlocks } from '@/utils/unlockSystem';

// Обработка покупки зданий
export const processPurchaseBuilding = (
  state: GameState,
  payload: { buildingId: string }
): GameState => {
  const { buildingId } = payload;
  const building = state.buildings[buildingId];
  
  // Если здание не существует или не разблокировано, возвращаем текущее состояние
  if (!building || !building.unlocked) {
    console.warn(`Попытка купить недоступное здание: ${buildingId}`);
    return state;
  }
  
  // Проверяем, достаточно ли ресурсов для покупки
  const calculatedCost: { [key: string]: number } = {};
  for (const [resourceId, baseCost] of Object.entries(building.cost)) {
    // Рассчитываем текущую стоимость с учетом множителя и текущего количества
    const currentCost = Math.floor(Number(baseCost) * Math.pow(Number(building.costMultiplier || 1.15), building.count));
    calculatedCost[resourceId] = currentCost;
  }
  
  // Проверка достаточности ресурсов
  if (!hasEnoughResources(state, calculatedCost)) {
    console.warn(`Недостаточно ресурсов для покупки ${building.name}`);
    return state;
  }
  
  // Вычитаем ресурсы
  const newResources = { ...state.resources };
  for (const [resourceId, cost] of Object.entries(calculatedCost)) {
    newResources[resourceId] = {
      ...newResources[resourceId],
      value: Math.max(0, newResources[resourceId].value - cost) // Предотвращаем отрицательные значения
    };
  }
  
  // Увеличиваем количество зданий
  const newBuildings = {
    ...state.buildings,
    [buildingId]: {
      ...building,
      count: building.count + 1
    }
  };
  
  console.log(`Куплено здание ${building.name} за:`, calculatedCost);
  
  // Создаем новое состояние с обновленными ресурсами и зданиями
  let newState = {
    ...state,
    resources: newResources,
    buildings: newBuildings
  };
  
  // Разблокируем ресурсы, производимые этим зданием
  if (buildingId === "generator" && !newResources.electricity.unlocked) {
    console.log("Разблокируем ресурс электричества после покупки генератора");
    newResources.electricity = {
      ...newResources.electricity,
      unlocked: true
    };
    safeDispatchGameEvent("Разблокирован ресурс: Электричество", "info");
  }
  
  // Если это первый дом.компьютер, разблокируем вычислительную мощность
  if (buildingId === "homeComputer" && building.count === 0 && !newResources.computingPower.unlocked) {
    console.log("Разблокируем ресурс вычислительной мощности после покупки первого компьютера");
    newResources.computingPower = {
      ...newResources.computingPower,
      unlocked: true
    };
    safeDispatchGameEvent("Разблокирован ресурс: Вычислительная мощность", "info");
  }
  
  // Разблокируем BTC после покупки автомайнера
  if (buildingId === "autoMiner" && building.count === 0 && !newResources.btc.unlocked) {
    console.log("Разблокируем ресурс BTC после покупки автомайнера");
    newResources.btc = {
      ...newResources.btc,
      unlocked: true
    };
    safeDispatchGameEvent("Разблокирован ресурс: Bitcoin (BTC)", "info");
  }

  // После покупки практики разблокируем автоматическое получение знаний
  if (buildingId === "practice" && building.count === 0) {
    safeDispatchGameEvent("Теперь знания о крипте накапливаются автоматически", "success");
  }
  
  // Разблокировка вкладки исследований при покупке первого генератора
  if (buildingId === "generator" && building.count === 0) {
    console.log("Разблокируем вкладку исследований после покупки первого генератора");
    
    // Разблокируем саму вкладку исследований
    newState = {
      ...newState,
      unlocks: {
        ...newState.unlocks,
        research: true
      }
    };
    
    // Разблокируем "Основы блокчейна" в обоих возможных ID
    const upgrades = { ...newState.upgrades };
    
    if (upgrades.basicBlockchain) {
      upgrades.basicBlockchain = {
        ...upgrades.basicBlockchain,
        unlocked: true
      };
      console.log("Разблокировано исследование 'Основы блокчейна' (basicBlockchain)");
    }
    
    if (upgrades.blockchain_basics) {
      upgrades.blockchain_basics = {
        ...upgrades.blockchain_basics,
        unlocked: true
      };
      console.log("Разблокировано исследование 'Основы блокчейна' (blockchain_basics)");
    }
    
    if (upgrades.blockchainBasics) {
      upgrades.blockchainBasics = {
        ...upgrades.blockchainBasics,
        unlocked: true
      };
      console.log("Разблокировано исследование 'Основы блокчейна' (blockchainBasics)");
    }
    
    newState = {
      ...newState,
      upgrades: upgrades
    };
    
    safeDispatchGameEvent("Разблокирована вкладка исследований", "success");
    safeDispatchGameEvent("Доступно новое исследование: Основы блокчейна", "info");
  }
  
  // Обновляем максимальные значения ресурсов
  newState = updateResourceMaxValues(newState);
  
  // Проверяем разблокировку улучшений
  newState = checkUpgradeUnlocks(newState);
  
  return newState;
};

// Обработка продажи здания
export const processSellBuilding = (
  state: GameState,
  payload: { buildingId: string }
): GameState => {
  const { buildingId } = payload;
  const building = state.buildings[buildingId];
  
  // Если здание не существует или количество = 0, возвращаем текущее состояние
  if (!building || building.count === 0) {
    console.warn(`Попытка продать несуществующее здание: ${buildingId}`);
    return state;
  }
  
  // Создаем новое состояние с обновленным количеством здания
  const newBuildings = {
    ...state.buildings,
    [buildingId]: {
      ...building,
      count: building.count - 1
    }
  };
  
  console.log(`Продано здание ${building.name}`);
  safeDispatchGameEvent(`Здание ${building.name} продано`, "info");
  
  // Создаем новое состояние (не возвращаем ресурсы при продаже)
  let newState = {
    ...state,
    buildings: newBuildings
  };
  
  // Обновляем максимальные значения ресурсов
  newState = updateResourceMaxValues(newState);
  
  return newState;
};

// Проверка условий разблокировки зданий
export const checkBuildingUnlocks = (state: GameState): GameState => {
  const newBuildings = { ...state.buildings };
  let hasChanges = false;

  // Проверяем условия разблокировки для каждого здания
  Object.values(newBuildings).forEach(building => {
    // Пропускаем уже разблокированные здания
    if (building.unlocked) return;

    let shouldUnlock = false;

    // Генератор появляется только после накопления 11 USDT
    if (building.id === "generator" && !building.unlocked) {
      if (state.resources.usdt.value >= 11) {
        shouldUnlock = true;
        safeDispatchGameEvent("Разблокирован Генератор", "info");
      }
    }
    
    // Домашний компьютер появляется при наличии 50+ электричества
    else if (building.id === "homeComputer" && !building.unlocked) {
      if (state.resources.electricity && state.resources.electricity.unlocked && 
          state.resources.electricity.value >= 50) {
        shouldUnlock = true;
        safeDispatchGameEvent("Разблокирован Домашний компьютер", "info");
      }
    }
    
    // Интернет-канал разблокируется только при наличии хотя бы 1 домашнего компьютера
    else if (building.id === "internetConnection" && !building.unlocked) {
      if (state.buildings.homeComputer && state.buildings.homeComputer.count >= 1) {
        shouldUnlock = true;
        safeDispatchGameEvent("Разблокирован Интернет-канал", "info");
      }
    }
    
    // Улучшенный кошелек разблокируется только при наличии минимум 10 криптокошельков
    else if (building.id === "improvedWallet" && !building.unlocked) {
      if (state.buildings.cryptoWallet && state.buildings.cryptoWallet.count >= 10) {
        shouldUnlock = true;
        safeDispatchGameEvent("Разблокирован Улучшенный кошелек", "info");
      }
    }

    // Система охлаждения разблокируется только при наличии минимум 2-х домашних компьютеров
    else if (building.id === "coolingSystem" && !building.unlocked) {
      if (state.buildings.homeComputer && state.buildings.homeComputer.count >= 2) {
        shouldUnlock = true;
        safeDispatchGameEvent("Разблокирована Система охлаждения", "info");
      }
    }

    // Проверяем требования к ресурсам
    else if (building.requirements && !shouldUnlock) {
      shouldUnlock = true;
      
      for (const [reqId, reqValue] of Object.entries(building.requirements)) {
        // Для требований типа "имеется исследование"
        if (state.upgrades[reqId] && (!state.upgrades[reqId].purchased || state.upgrades[reqId].purchased !== true)) {
          shouldUnlock = false;
          break;
        }
        
        // Для требований типа "N штук здания"
        else if (reqId.endsWith('Count')) {
          const buildingId = reqId.replace('Count', '');
          if (!state.buildings[buildingId] || state.buildings[buildingId].count < reqValue) {
            shouldUnlock = false;
            break;
          }
        }
        
        // Для обычных требований к ресурсам
        else if (state.resources[reqId] && state.resources[reqId].value < reqValue) {
          shouldUnlock = false;
          break;
        }
      }
    }

    if (shouldUnlock) {
      newBuildings[building.id] = {
        ...building,
        unlocked: true
      };
      hasChanges = true;
      safeDispatchGameEvent(`Разблокировано новое здание: ${building.name}`, "info");
    }
  });

  if (hasChanges) {
    return {
      ...state,
      buildings: newBuildings
    };
  }

  return state;
};
