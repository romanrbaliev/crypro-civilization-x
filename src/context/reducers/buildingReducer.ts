
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
    const currentCost = Number(baseCost) * Math.pow(Number(building.costMultiplier), building.count);
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
  // ИСПРАВЛЕНО: Проверяем именно по ID здания, а не по наличию полей
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
  
  // Обновляем максимальные значения ресурсов
  newState = updateResourceMaxValues(newState);
  
  // НОВЫЙ КОД: Разблокировка вкладки исследований при покупке первого генератора
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
  
  // Проверяем разблокировку улучшений
  newState = checkUpgradeUnlocks(newState);
  
  return newState;
};
