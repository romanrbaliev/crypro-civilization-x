
import { GameState } from '../../types';
import { safeDispatchGameEvent } from '../../utils/eventBusUtils';
import { checkAllUnlocks } from '@/utils/unlockManager';
import { processPurchase } from '../purchaseSystem/processPurchase';
import { PurchasableType } from '@/types/purchasable';
import { ResourceSystem } from '@/systems/ResourceSystem';

// Создаем экземпляр ResourceSystem
const resourceSystem = new ResourceSystem();

// Обертка для совместимости с новой системой покупок
export const processPurchaseBuilding = (state: GameState, payload: { buildingId: string }): GameState => {
  // Конвертируем старый формат в новый
  const newPayload = {
    itemId: payload.buildingId,
    itemType: 'building' as PurchasableType
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
  
  // Обновляем производство и потребление ресурсов
  if (building.production) {
    for (const [resourceId, amount] of Object.entries(building.production)) {
      if (resources[resourceId]) {
        resources[resourceId] = {
          ...resources[resourceId],
          production: Math.max(0, (resources[resourceId].production || 0) - Number(amount))
        };
      }
    }
  }
  
  // Обновляем потребление ресурсов
  if (building.consumption) {
    for (const [resourceId, amount] of Object.entries(building.consumption)) {
      if (resources[resourceId]) {
        resources[resourceId] = {
          ...resources[resourceId],
          consumption: Math.max(0, (resources[resourceId].consumption || 0) - Number(amount))
        };
      }
    }
  }
  
  // Пересчитываем perSecond для всех ресурсов
  for (const resourceId in resources) {
    if (resources[resourceId].unlocked) {
      resources[resourceId] = {
        ...resources[resourceId],
        perSecond: (resources[resourceId].production || 0) - (resources[resourceId].consumption || 0)
      };
    }
  }
  
  // Обновляем состояние
  newState.resources = resources;
  newState.buildings = buildings;
  
  // Проверяем разблокировки
  const updatedState = checkAllUnlocks(newState);
  
  // Принудительно обновляем ресурсы
  return resourceSystem.updateResources(updatedState, 0);
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
