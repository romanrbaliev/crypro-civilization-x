
import { GameState } from '../../types';
import { safeDispatchGameEvent } from '../../utils/eventBusUtils';
import { checkAllUnlocks } from '@/utils/unlockManager';
import { processPurchase } from '../purchaseSystem';

// Обертка для совместимости с новой системой покупок
export const processPurchaseBuilding = (state: GameState, payload: { buildingId: string }): GameState => {
  // Конвертируем старый формат в новый
  const newPayload = {
    itemId: payload.buildingId,
    itemType: 'building'
  };
  
  // Используем новую унифицированную функцию
  return processPurchase(state, newPayload);
};

export const processSellBuilding = (state: GameState, payload: { buildingId: string }): GameState => {
  const { buildingId } = payload;
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
          resources[resourceId].value + Math.floor(Number(cost) * 0.5),
          resources[resourceId].max || Number.MAX_SAFE_INTEGER
        )
      };
    }
  }
  
  // Уменьшаем счетчик зданий и высчитываем предыдущую стоимость
  const prevCost: Record<string, number> = {};
  for (const [resourceId, cost] of Object.entries(building.cost)) {
    prevCost[resourceId] = Math.floor(Number(cost) / building.costMultiplier);
  }
  
  buildings[buildingId] = {
    ...buildings[buildingId],
    count: buildings[buildingId].count - 1,
    cost: prevCost
  };
  
  // Обновляем состояние
  newState.resources = resources;
  newState.buildings = buildings;
  
  return checkAllUnlocks(newState);
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
