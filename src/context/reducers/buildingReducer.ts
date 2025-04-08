
import { GameState } from '../types';
import { calculateCost } from '@/utils/helpers';

export const processPurchaseBuilding = (
  state: GameState,
  payload: { buildingId: string }
): GameState => {
  const { buildingId } = payload;
  const building = state.buildings[buildingId];
  
  if (!building || !building.unlocked) {
    return state;
  }
  
  // Проверяем, достаточно ли ресурсов
  for (const resourceId in building.cost) {
    const resource = state.resources[resourceId];
    if (!resource || resource.value < building.cost[resourceId]) {
      return state;
    }
  }
  
  // Копируем состояние
  const newState = { ...state };
  
  // Списываем ресурсы
  for (const resourceId in building.cost) {
    newState.resources[resourceId] = {
      ...newState.resources[resourceId],
      value: newState.resources[resourceId].value - building.cost[resourceId]
    };
  }
  
  // Вычисляем новую стоимость
  const newCost = calculateCost(
    building.baseCost || building.cost,
    building.costMultiplier,
    building.count
  );
  
  // Увеличиваем количество зданий
  newState.buildings[buildingId] = {
    ...building,
    count: building.count + 1,
    cost: newCost
  };
  
  return newState;
};

export const processSellBuilding = (
  state: GameState,
  payload: { buildingId: string }
): GameState => {
  const { buildingId } = payload;
  const building = state.buildings[buildingId];
  
  if (!building || !building.unlocked || building.count <= 0) {
    return state;
  }
  
  // Копируем состояние
  const newState = { ...state };
  
  // Вычисляем возврат ресурсов (50% от стоимости)
  for (const resourceId in building.cost) {
    const resource = newState.resources[resourceId];
    if (resource) {
      const refundAmount = Math.floor(building.cost[resourceId] * 0.5);
      newState.resources[resourceId] = {
        ...resource,
        value: Math.min(resource.value + refundAmount, resource.max)
      };
    }
  }
  
  // Вычисляем новую стоимость (если здание было продано, стоимость становится меньше)
  const newCost = calculateCost(
    building.baseCost || building.cost,
    building.costMultiplier,
    building.count - 2 // -2 потому что count еще не уменьшен, а формула считает стоимость для следующего здания
  );
  
  // Уменьшаем количество зданий
  newState.buildings[buildingId] = {
    ...building,
    count: building.count - 1,
    cost: newCost
  };
  
  return newState;
};
