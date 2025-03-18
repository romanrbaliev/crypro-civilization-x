
import { GameState } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { isEnoughResources, calculateCost, deductResources } from '../utils/resourceUtils';
import { activateReferral } from '@/api/gameDataService';

// Процесс покупки здания
export const processPurchaseBuilding = (state: GameState, payload: { buildingId: string }): GameState => {
  const { buildingId } = payload;
  const building = state.buildings[buildingId];
  
  // Проверка на наличие здания
  if (!building) {
    safeDispatchGameEvent(`Ошибка: Здание ${buildingId} не найдено`, "error");
    return state;
  }
  
  // Проверка на разблокировку
  if (!building.unlocked) {
    safeDispatchGameEvent(`Ошибка: Здание ${building.name} недоступно`, "error");
    return state;
  }
  
  // Проверка на максимальное количество
  if (building.maxCount && building.count >= building.maxCount) {
    safeDispatchGameEvent(`Достигнуто максимальное количество ${building.name}`, "warning");
    return state;
  }
  
  // Расчет стоимости с учетом множителя
  const finalCost = calculateCost(building.cost, building.count, building.costMultiplier);
  
  // Проверка достаточности ресурсов
  if (!isEnoughResources(state.resources, finalCost)) {
    safeDispatchGameEvent(`Недостаточно ресурсов для покупки ${building.name}`, "error");
    return state;
  }
  
  // Списание ресурсов
  const newResources = deductResources(state.resources, finalCost);
  
  // Успешная покупка
  const newState = {
    ...state,
    resources: newResources,
    buildings: {
      ...state.buildings,
      [buildingId]: {
        ...building,
        count: building.count + 1
      }
    }
  };
  
  // Отправка события о покупке
  safeDispatchGameEvent(`Построено: ${building.name}`, "success");
  
  // Проверка на первую покупку генератора - это считается активацией реферала
  if (buildingId === 'generator' && building.count === 0) {
    // Активируем пользователя как реферала, если он пришел по реферальной ссылке
    const { referredBy } = state;
    
    if (referredBy) {
      // Получаем свой ID для активации в системе
      const userId = window.__game_user_id;
      
      if (userId) {
        // Асинхронно активируем реферала (не дожидаемся результата)
        activateReferral(userId).then(success => {
          if (success) {
            safeDispatchGameEvent("Вы активировали реферальный бонус для пригласившего вас игрока", "success");
          }
        }).catch(error => {
          console.error("Ошибка при активации реферала:", error);
        });
      }
    }
  }
  
  // Если есть конечные ресурсы, которые производит это здание, разблокируем их
  for (const resourceId in building.production) {
    if (!newState.resources[resourceId]?.unlocked) {
      newState.resources = {
        ...newState.resources,
        [resourceId]: {
          ...newState.resources[resourceId],
          unlocked: true
        }
      };
      
      safeDispatchGameEvent(`Разблокирован ресурс: ${newState.resources[resourceId].name}`, "info");
    }
  }
  
  // Проверка и разблокировка новых зданий и улучшений, которые стали доступны после покупки
  return checkBuildingUnlocks(newState, buildingId);
};

// Проверка и разблокировка новых зданий и улучшений
const checkBuildingUnlocks = (state: GameState, buildingId: string): GameState => {
  const building = state.buildings[buildingId];
  let updatedState = { ...state };
  
  // Проверка на разблокировку новых зданий
  for (const checkBuildingId in updatedState.buildings) {
    const checkBuilding = updatedState.buildings[checkBuildingId];
    
    // Пропускаем уже разблокированные
    if (checkBuilding.unlocked) continue;
    
    // Проверяем требования к зданиям
    if (checkBuilding.requirements) {
      let canUnlock = true;
      
      for (const reqBuildingId in checkBuilding.requirements) {
        const requiredCount = checkBuilding.requirements[reqBuildingId];
        const currentCount = updatedState.buildings[reqBuildingId]?.count || 0;
        
        if (currentCount < requiredCount) {
          canUnlock = false;
          break;
        }
      }
      
      if (canUnlock) {
        updatedState.buildings = {
          ...updatedState.buildings,
          [checkBuildingId]: {
            ...checkBuilding,
            unlocked: true
          }
        };
        
        safeDispatchGameEvent(`Разблокировано новое здание: ${checkBuilding.name}`, "info", { 
          detail: checkBuilding.description 
        });
      }
    }
  }
  
  // Проверка на разблокировку новых улучшений
  for (const upgradeId in updatedState.upgrades) {
    const upgrade = updatedState.upgrades[upgradeId];
    
    // Пропускаем уже разблокированные или купленные
    if (upgrade.unlocked || upgrade.purchased) continue;
    
    // Проверяем условия разблокировки
    if (upgrade.unlockCondition?.buildings) {
      let canUnlock = true;
      
      for (const reqBuildingId in upgrade.unlockCondition.buildings) {
        const requiredCount = upgrade.unlockCondition.buildings[reqBuildingId];
        const currentCount = updatedState.buildings[reqBuildingId]?.count || 0;
        
        if (currentCount < requiredCount) {
          canUnlock = false;
          break;
        }
      }
      
      if (canUnlock) {
        updatedState.upgrades = {
          ...updatedState.upgrades,
          [upgradeId]: {
            ...upgrade,
            unlocked: true
          }
        };
        
        safeDispatchGameEvent(`Разблокировано новое улучшение: ${upgrade.name}`, "info", { 
          detail: upgrade.description 
        });
      }
    }
  }
  
  return updatedState;
};
