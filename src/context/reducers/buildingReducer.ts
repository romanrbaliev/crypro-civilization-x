
import { GameState } from '../types';
import { hasEnoughResources, updateResourceMaxValues } from '../utils/resourceUtils';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

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
  
  return newState;
};
