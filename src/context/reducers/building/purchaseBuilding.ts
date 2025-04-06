
import { GameState } from '../../types';
import { safeDispatchGameEvent } from '../../utils/eventBusUtils';
import { checkAllUnlocks } from '@/utils/unlockManager';

export const processPurchaseBuilding = (state: GameState, payload: { buildingId: string }): GameState => {
  const { buildingId } = payload;
  const building = state.buildings[buildingId];
  
  if (!building) {
    console.error(`Building with id ${buildingId} not found`);
    return state;
  }
  
  // Проверяем, что у здания есть стоимость
  if (!building.cost || Object.keys(building.cost).length === 0) {
    console.error(`Building ${buildingId} does not have a cost defined`);
    return state;
  }
  
  // Проверяем, достаточно ли ресурсов для покупки
  for (const [resourceId, amount] of Object.entries(building.cost)) {
    const resource = state.resources[resourceId];
    if (!resource || resource.value < Number(amount)) {
      console.log(`Not enough ${resourceId} to purchase ${building.name}`);
      return state;
    }
  }
  
  // Создаем копию состояния для модификации
  const newState = { ...state };
  
  // Списываем ресурсы
  for (const [resourceId, amount] of Object.entries(building.cost)) {
    newState.resources[resourceId] = {
      ...newState.resources[resourceId],
      value: newState.resources[resourceId].value - Number(amount)
    };
  }
  
  // Рассчитываем новую стоимость здания
  const newCost = {...building.cost};
  for (const [resourceId, amount] of Object.entries(building.cost)) {
    newCost[resourceId] = Math.floor(Number(amount) * building.costMultiplier);
  }
  
  // Обновляем здание
  newState.buildings[buildingId] = {
    ...building,
    count: building.count + 1,
    cost: newCost
  };
  
  // Обновляем производство ресурсов
  if (building.production) {
    const productionMultiplier = 1; // Базовый множитель, в будущем можно добавить бонусы
    
    for (const [resourceId, amount] of Object.entries(building.production)) {
      if (newState.resources[resourceId]) {
        newState.resources[resourceId] = {
          ...newState.resources[resourceId],
          productionRate: (newState.resources[resourceId].productionRate || 0) + 
                          Number(amount) * productionMultiplier
        };
      }
    }
  }
  
  // Обновляем счетчики и инкрементируем их
  if (buildingId === 'practice') {
    newState.counters.practiceBuilt = {
      id: 'practiceBuilt',
      value: (newState.counters.practiceBuilt?.value || 0) + 1
    };
  } else if (buildingId === 'generator') {
    newState.counters.generatorBuilt = {
      id: 'generatorBuilt',
      value: (newState.counters.generatorBuilt?.value || 0) + 1
    };
  } else if (buildingId === 'homeComputer') {
    newState.counters.computerBuilt = {
      id: 'computerBuilt',
      value: (newState.counters.computerBuilt?.value || 0) + 1
    };
  } else if (buildingId === 'cryptoWallet') {
    newState.counters.walletBuilt = {
      id: 'walletBuilt',
      value: (newState.counters.walletBuilt?.value || 0) + 1
    };
  }
  
  // Отправляем событие о покупке здания
  const eventMessage = newState.language === 'ru' 
    ? `Приобретено здание: ${building.name}` 
    : `Building purchased: ${building.name}`;
  
  safeDispatchGameEvent(eventMessage, 'success');
  
  // Проверяем и обновляем все разблокировки после покупки
  const stateWithUnlocks = checkAllUnlocks(newState);
  
  return stateWithUnlocks;
};
