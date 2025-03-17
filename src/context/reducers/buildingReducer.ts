
import { GameState } from '../types';
import { hasEnoughResources, updateResourceMaxValues } from '../utils/resourceUtils';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Обработка покупки здания
export const processPurchaseBuilding = (
  state: GameState,
  payload: { buildingId: string }
): GameState => {
  const { buildingId } = payload;
  const building = state.buildings[buildingId];
  
  // Если здание не существует или не разблокировано
  if (!building || !building.unlocked) {
    return state;
  }
  
  // Проверяем максимальное количество
  if (building.maxCount !== undefined && building.count >= building.maxCount) {
    safeDispatchGameEvent(`Вы достигли максимального количества (${building.maxCount}) для ${building.name}`, "error");
    return state;
  }
  
  // Рассчитываем текущую стоимость с учетом уже построенных зданий
  const currentCost: { [resourceId: string]: number } = {};
  for (const [resourceId, baseCost] of Object.entries(building.cost)) {
    currentCost[resourceId] = Math.floor(baseCost * Math.pow(building.costMultiplier, building.count));
  }
  
  // Проверяем, хватает ли ресурсов
  const canAfford = hasEnoughResources(state, currentCost);
  if (!canAfford) {
    safeDispatchGameEvent("Недостаточно ресурсов для покупки здания", "error");
    return state;
  }
  
  // Вычитаем ресурсы
  const newResources = { ...state.resources };
  for (const [resourceId, cost] of Object.entries(currentCost)) {
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
  
  let newState = {
    ...state,
    resources: newResources,
    buildings: newBuildings
  };
  
  // Специальная обработка для автомайнера - разблокируем ресурс BTC
  if (buildingId === 'autoMiner' && building.count === 0) {
    newState = {
      ...newState,
      resources: {
        ...newState.resources,
        btc: {
          ...newState.resources.btc,
          unlocked: true
        }
      }
    };
    safeDispatchGameEvent("Разблокирован ресурс Bitcoin (BTC)", "success");
  }
  
  // Проверяем условия для разблокировки улучшений
  const newUpgrades = { ...state.upgrades };
  for (const upgradeId in newUpgrades) {
    const upgrade = newUpgrades[upgradeId];
    
    if (!upgrade.unlocked && upgrade.requirements) {
      const metRequirements = Object.entries(upgrade.requirements).every(([reqKey, reqValue]) => {
        // Проверка требований по количеству определенных зданий
        if (reqKey.endsWith('Count')) {
          const buildingKey = reqKey.replace('Count', '');
          return newState.buildings[buildingKey]?.count >= reqValue;
        }
        
        // Прочие требования (по ресурсам или другие)
        return true;
      });
      
      if (metRequirements) {
        newUpgrades[upgradeId] = {
          ...upgrade,
          unlocked: true
        };
        
        // Отправляем уведомление о разблокировке улучшения
        safeDispatchGameEvent(`Разблокировано исследование: ${upgrade.name}`, "info");
      }
    }
  }
  
  // Обновляем улучшения в состоянии
  newState = {
    ...newState,
    upgrades: newUpgrades
  };
  
  // Обновляем максимальные значения ресурсов, если здание влияет на них
  return updateResourceMaxValues(newState);
};

