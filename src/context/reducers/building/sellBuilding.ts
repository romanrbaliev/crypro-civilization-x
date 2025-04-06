
import { GameState } from '@/context/types';
import { hasResources, spendResources, processMaxResourceEffects } from '@/utils/resourceUtils';

// Функция для продажи здания
export const processSellBuilding = (
  state: GameState, 
  payload: { buildingId: string, quantity?: number }
): GameState => {
  const { buildingId, quantity = 1 } = payload;
  const building = state.buildings[buildingId];
  
  // Проверяем, существует ли здание
  if (!building) {
    console.error(`Здание с ID ${buildingId} не найдено`);
    return state;
  }
  
  // Проверяем, что у игрока есть это здание
  if (building.count < quantity) {
    console.log(`У вас недостаточно зданий типа ${building.name} для продажи`);
    return state;
  }
  
  // Расчет суммы возврата (обычно процент от стоимости)
  const refundPercent = 0.5; // получаем обратно половину стоимости
  const refund = Object.entries(building.cost).reduce((acc, [resourceId, amount]) => {
    acc[resourceId] = Math.floor(Number(amount) * refundPercent * quantity);
    return acc;
  }, {} as Record<string, number>);
  
  // Обновляем состояние
  let newState = { ...state };
  
  // Возвращаем часть ресурсов
  for (const [resourceId, amount] of Object.entries(refund)) {
    const resource = newState.resources[resourceId];
    if (resource) {
      newState.resources = {
        ...newState.resources,
        [resourceId]: {
          ...resource,
          value: Math.min((resource.value || 0) + amount, resource.max || Infinity)
        }
      };
    }
  }
  
  // Уменьшаем количество зданий
  newState = {
    ...newState,
    buildings: {
      ...newState.buildings,
      [buildingId]: {
        ...building,
        count: building.count - quantity
      }
    }
  };
  
  return newState;
};
