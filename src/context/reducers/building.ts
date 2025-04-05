
import { GameState, Resource, ResourceType } from '../types';

// Функция для обработки покупки здания
export const processBuildingPurchase = (state: GameState, buildingId: string): GameState => {
  const building = state.buildings[buildingId];
  
  if (!building || !building.unlocked) {
    console.error(`Попытка купить недоступное здание: ${buildingId}`);
    return state;
  }
  
  // Создаем глубокую копию состояния
  const newState = { ...state };
  const resources = { ...state.resources };
  const buildings = { ...state.buildings };
  
  // Проверяем, хватает ли ресурсов для покупки
  for (const [resourceId, cost] of Object.entries(building.cost)) {
    const resource = resources[resourceId];
    
    if (!resource || resource.value < cost) {
      console.error(`Недостаточно ресурсов для покупки ${buildingId}`);
      return state;
    }
  }
  
  // Списываем ресурсы за покупку
  for (const [resourceId, cost] of Object.entries(building.cost)) {
    resources[resourceId] = {
      ...resources[resourceId],
      value: resources[resourceId].value - cost
    };
  }
  
  // Увеличиваем счетчик купленных зданий
  buildings[buildingId] = {
    ...buildings[buildingId],
    count: buildings[buildingId].count + 1,
    // Увеличиваем стоимость для следующей покупки
    cost: calculateNextCost(buildings[buildingId])
  };
  
  // Обновляем состояние
  newState.resources = resources;
  newState.buildings = buildings;
  
  // Увеличиваем счетчики в зависимости от типа здания
  if (buildingId === 'practice') {
    newState.counters.practiceBuilt = incrementCounter(newState.counters.practiceBuilt);
  } else if (buildingId === 'generator') {
    newState.counters.generatorBuilt = incrementCounter(newState.counters.generatorBuilt);
  } else if (buildingId === 'homeComputer') {
    newState.counters.computerBuilt = incrementCounter(newState.counters.computerBuilt);
  } else if (buildingId === 'cryptoWallet') {
    newState.counters.walletBuilt = incrementCounter(newState.counters.walletBuilt);
  }
  
  return newState;
};

// Функция для продажи здания
export const processBuildingSell = (state: GameState, buildingId: string): GameState => {
  const building = state.buildings[buildingId];
  
  if (!building || building.count <= 0) {
    console.error(`Попытка продать отсутствующее здание: ${buildingId}`);
    return state;
  }
  
  // Создаем глубокую копию состояния
  const newState = { ...state };
  const resources = { ...state.resources };
  const buildings = { ...state.buildings };
  
  // Рассчитываем возврат ресурсов (50% от текущей стоимости)
  for (const [resourceId, cost] of Object.entries(building.cost)) {
    if (resources[resourceId]) {
      resources[resourceId] = {
        ...resources[resourceId],
        value: Math.min(
          resources[resourceId].value + Math.floor(cost * 0.5),
          resources[resourceId].max
        )
      };
    }
  }
  
  // Уменьшаем счетчик зданий
  buildings[buildingId] = {
    ...buildings[buildingId],
    count: buildings[buildingId].count - 1,
    // Уменьшаем стоимость для следующей покупки
    cost: calculatePreviousCost(buildings[buildingId])
  };
  
  // Обновляем состояние
  newState.resources = resources;
  newState.buildings = buildings;
  
  return newState;
};

// Вспомогательная функция для расчета следующей стоимости здания
const calculateNextCost = (building: any): Record<string, number> => {
  const nextCost: Record<string, number> = {};
  
  for (const [resourceId, cost] of Object.entries(building.cost)) {
    nextCost[resourceId] = Math.floor(Number(cost) * building.costMultiplier);
  }
  
  return nextCost;
};

// Вспомогательная функция для расчета предыдущей стоимости здания
const calculatePreviousCost = (building: any): Record<string, number> => {
  const prevCost: Record<string, number> = {};
  
  for (const [resourceId, cost] of Object.entries(building.cost)) {
    prevCost[resourceId] = Math.floor(Number(cost) / building.costMultiplier);
  }
  
  return prevCost;
};

// Вспомогательная функция для инкремента счетчика
const incrementCounter = (counter: any): { id: string; value: number } => {
  if (!counter) {
    return { id: 'counter', value: 1 };
  }
  
  return typeof counter === 'object' 
    ? { ...counter, value: counter.value + 1 }
    : { id: 'counter', value: counter + 1 };
};

// Функция для выбора специализации
export const processChooseSpecialization = (
  state: GameState, 
  payload: { specializationType: string }
): GameState => {
  return {
    ...state,
    player: {
      ...state.player,
      specialization: payload.specializationType
    },
    unlocks: {
      ...state.unlocks,
      specialization: true
    }
  };
};

// Экспортируем функции для использования в gameReducer
export const processPurchaseBuilding = (
  state: GameState, 
  payload: { buildingId: string }
): GameState => {
  return processBuildingPurchase(state, payload.buildingId);
};

export const processSellBuilding = (
  state: GameState, 
  payload: { buildingId: string }
): GameState => {
  return processBuildingSell(state, payload.buildingId);
};
