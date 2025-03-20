
import { GameState } from '../types';
import { hasEnoughResources, updateResourceMaxValues } from '../utils/resourceUtils';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { checkUpgradeUnlocks } from './upgradeReducer';

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
    const currentCost = Number(baseCost) * Math.pow(Number(building.costMultiplier || 1.1), building.count);
    calculatedCost[resourceId] = currentCost;
  }
  
  if (!hasEnoughResources(state, calculatedCost)) {
    console.warn(`Недостаточно ресурсов для покупки ${building.name}`);
    return state;
  }
  
  // Вычитаем ресурсы
  const newResources = { ...state.resources };
  for (const [resourceId, cost] of Object.entries(calculatedCost)) {
    newResources[resourceId] = {
      ...newResources[resourceId],
      value: newResources[resourceId].value - cost
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
  
  console.log(`Куплено здание ${building.name}`);
  
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
  
  // Создаем новое состояние
  let newState = {
    ...state,
    resources: newResources,
    buildings: newBuildings
  };
  
  // Разблокируем криптобиблиотеку после покупки интернет-канала
  if (buildingId === "internetConnection" && building.count === 0) {
    console.log("Проверяем условия для разблокировки криптобиблиотеки");
    if (state.resources.usdt.value >= 80) {
      newState.buildings.cryptoLibrary = {
        ...newState.buildings.cryptoLibrary,
        unlocked: true
      };
      safeDispatchGameEvent("Разблокирована Криптобиблиотека", "info");
    }
  }

  // Разблокируем систему охлаждения только после покупки 2+ домашних компьютеров
  if (buildingId === "homeComputer" && newState.buildings.homeComputer.count >= 2) {
    console.log(`Проверяем разблокировку системы охлаждения. Количество компьютеров: ${newState.buildings.homeComputer.count}`);
    if (!newState.buildings.coolingSystem.unlocked) {
      newState.buildings.coolingSystem = {
        ...newState.buildings.coolingSystem,
        unlocked: true
      };
      safeDispatchGameEvent("Разблокирована Система охлаждения", "info");
    }
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

// Добавим новую функцию для проверки условий разблокировки зданий
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
    
    // Домашний компьютер появляется при наличии 10+ электричества
    if (building.id === "homeComputer" && !building.unlocked) {
      if (state.resources.electricity && state.resources.electricity.unlocked && 
          state.resources.electricity.value >= 10) {
        shouldUnlock = true;
        safeDispatchGameEvent("Разблокирован Домашний компьютер", "info");
      }
    }

    // Проверяем требования к ресурсам
    if (building.requirements && !shouldUnlock) {
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

    // Специальные условия для зданий Фазы 2
    if (building.id === "autoMiner" && !shouldUnlock) {
      if (state.resources.computingPower && state.resources.computingPower.unlocked) {
        shouldUnlock = true;
      }
    }

    // Система охлаждения разблокируется только при наличии минимум 2-х домашних компьютеров
    if (building.id === "coolingSystem" && !shouldUnlock) {
      if (state.buildings.homeComputer && state.buildings.homeComputer.count >= 2) {
        shouldUnlock = true;
      } else {
        shouldUnlock = false;
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
