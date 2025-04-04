import { GameState } from '../types';
import { getCost, getRefundAmount } from '@/utils/buildingCosts';
import { formatNumberWithAbbreviation } from '@/utils/formatters';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Обработка покупки здания
export const processPurchaseBuilding = (
  state: GameState,
  payload: { buildingId: string }
): GameState => {
  const { buildingId } = payload;
  const building = state.buildings[buildingId];
  
  if (!building) {
    console.error(`Building ${buildingId} not found`);
    return state;
  }
  
  // Проверяем, разблокировано ли здание
  if (!building.unlocked) {
    console.error(`Building ${buildingId} is not unlocked`);
    return state;
  }
  
  // Рассчитываем стоимость покупки
  const cost = getCost(building);
  
  // Проверяем наличие достаточного количества ресурсов
  for (const [resourceId, amount] of Object.entries(cost)) {
    if (!state.resources[resourceId] || state.resources[resourceId].value < Number(amount)) {
      console.error(`Not enough ${resourceId} to purchase ${buildingId}`);
      return state;
    }
  }
  
  // Обработка специального случая: покупка генератора должна разблокировать электричество
  let newUnlocks = { ...state.unlocks };
  let newResources = { ...state.resources };
  
  if (buildingId === 'generator') {
    console.log("Покупка генератора: разблокируем электричество");
    newUnlocks = {
      ...newUnlocks,
      electricity: true
    };
    
    if (newResources.electricity) {
      newResources = {
        ...newResources,
        electricity: {
          ...newResources.electricity,
          unlocked: true
        }
      };
    }
    
    // Отправляем сообщение о разблокировке
    safeDispatchGameEvent("Разблокирован новый ресурс: Электричество", "success");
  }
  
  // Обновляем состояние ресурсов
  for (const [resourceId, amount] of Object.entries(cost)) {
    newResources = {
      ...newResources,
      [resourceId]: {
        ...newResources[resourceId],
        value: newResources[resourceId].value - Number(amount)
      }
    };
  }
  
  // Обновляем состояние здания
  const newBuildings = {
    ...state.buildings,
    [buildingId]: {
      ...building,
      count: building.count + 1
    }
  };
  
  // Уведомляем пользователя о покупке
  const buildingName = building.name || buildingId;
  const costString = Object.entries(cost)
    .map(([resourceId, amount]) => `${formatNumberWithAbbreviation(Number(amount))} ${state.resources[resourceId]?.name || resourceId}`)
    .join(', ');
  
  safeDispatchGameEvent(`Приобретено: ${buildingName} (${costString})`, "success");
  
  return {
    ...state,
    resources: newResources,
    buildings: newBuildings,
    unlocks: newUnlocks
  };
};

// Обработка продажи здания
export const processSellBuilding = (
  state: GameState,
  payload: { buildingId: string }
): GameState => {
  const { buildingId } = payload;
  const building = state.buildings[buildingId];
  
  if (!building) {
    console.error(`Building ${buildingId} not found`);
    return state;
  }
  
  if (building.count <= 0) {
    console.error(`Cannot sell ${buildingId}, count is already 0`);
    return state;
  }
  
  // Рассчитываем сумму возврата
  const refund = getRefundAmount(building);
  
  // Обновляем состояние ресурсов
  let newResources = { ...state.resources };
  for (const [resourceId, amount] of Object.entries(refund)) {
    newResources = {
      ...newResources,
      [resourceId]: {
        ...newResources[resourceId],
        value: newResources[resourceId].value + Number(amount)
      }
    };
  }
  
  // Обновляем состояние здания
  const newBuildings = {
    ...state.buildings,
    [buildingId]: {
      ...building,
      count: building.count - 1
    }
  };
  
  // Уведомляем пользователя о продаже
  const buildingName = building.name || buildingId;
  const refundString = Object.entries(refund)
    .map(([resourceId, amount]) => `${formatNumberWithAbbreviation(Number(amount))} ${state.resources[resourceId]?.name || resourceId}`)
    .join(', ');
  
  safeDispatchGameEvent(`Продано: ${buildingName} (+${refundString})`, "success");
  
  return {
    ...state,
    resources: newResources,
    buildings: newBuildings
  };
};

// Обработка выбора специализации
export const processChooseSpecialization = (
  state: GameState,
  payload: { specializationType: string }
): GameState => {
  const { specializationType } = payload;
  
  return {
    ...state,
    player: {
      ...state.player,
      roleId: specializationType
    }
  };
};
