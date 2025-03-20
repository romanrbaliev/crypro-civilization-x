import { GameState, Building } from "@/context/types";
import { safeDispatchGameEvent } from "./eventBusUtils";

// Функция проверки, достаточно ли ресурсов для совершения действия
export const hasEnoughResources = (state: GameState, cost: { [key: string]: number }): boolean => {
  for (const resourceId in cost) {
    if (state.resources[resourceId] === undefined || state.resources[resourceId].value < cost[resourceId]) {
      return false;
    }
  }
  return true;
};

// Функция обновления максимальных значений ресурсов
export const updateResourceMaxValues = (state: GameState): GameState => {
  const newResources = { ...state.resources };
  
  // Базовые значения максимумов
  const baseKnowledgeMax = 100;
  const baseUsdtMax = 50;
  const baseElectricityMax = 1000;
  
  // Бонусы от улучшений
  let knowledgeMaxBoost = 0;
  let usdtMaxBoost = 0;
  let electricityMaxBoost = 0;
  
  // Бонусы от купленных улучшений
  for (const upgrade of Object.values(state.upgrades)) {
    if (upgrade.purchased && upgrade.effects) {
      if (upgrade.effects.knowledgeMaxBoost) {
        knowledgeMaxBoost += Number(upgrade.effects.knowledgeMaxBoost);
      }
      if (upgrade.effects.usdtMaxBoost) {
        usdtMaxBoost += Number(upgrade.effects.usdtMaxBoost);
      }
      if (upgrade.effects.electricityMaxBoost) {
        electricityMaxBoost += Number(upgrade.effects.electricityMaxBoost);
      }
    }
  }
  
  // Бонусы от зданий
  let additionalKnowledgeMax = 0;
  let additionalUsdtMax = 0;
  let additionalElectricityMax = 0;
  
  // Расчет дополнительного max от зданий
  for (const building of Object.values(state.buildings)) {
    if (building.count > 0 && building.production) {
      // Бонус к максимуму знаний
      if (building.production.knowledgeMax) {
        additionalKnowledgeMax += Number(building.production.knowledgeMax) * building.count;
      }
      
      // Бонус к максимуму USDT
      if (building.production.usdtMax) {
        additionalUsdtMax += Number(building.production.usdtMax) * building.count;
      }
      
      // Бонус к максимуму электричества
      if (building.production.electricityMax) {
        additionalElectricityMax += Number(building.production.electricityMax) * building.count;
      }
    }
  }
  
  // Рассчитываем итоговые максимумы с учетом всех бонусов
  const finalKnowledgeMax = baseKnowledgeMax * (1 + knowledgeMaxBoost) + additionalKnowledgeMax;
  const finalUsdtMax = baseUsdtMax * (1 + usdtMaxBoost) + additionalUsdtMax;
  const finalElectricityMax = baseElectricityMax * (1 + electricityMaxBoost) + additionalElectricityMax;
  
  // Устанавливаем новые значения максимумов
  newResources.knowledge.max = finalKnowledgeMax;
  newResources.usdt.max = finalUsdtMax;
  newResources.electricity.max = finalElectricityMax;
  
  // Обеспечиваем, чтобы текущие значения не превышали максимумы
  if (newResources.knowledge.value > finalKnowledgeMax) {
    newResources.knowledge.value = finalKnowledgeMax;
  }
  
  if (newResources.usdt.value > finalUsdtMax) {
    newResources.usdt.value = finalUsdtMax;
  }
  
  if (newResources.electricity.value > finalElectricityMax) {
    newResources.electricity.value = finalElectricityMax;
  }
  
  return {
    ...state,
    resources: newResources
  };
};

// Функция проверки разблокировки контента
export const checkUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  const newBuildings = { ...state.buildings };
  
  // Проверка условий разблокировки зданий
  for (const [buildingId, building] of Object.entries(newBuildings)) {
    if (building.unlocked) continue; // Пропускаем уже разблокированные здания
    
    // Проверяем требования для разблокировки
    if (building.requirements) {
      let allRequirementsMet = true;
      
      for (const [resourceId, amount] of Object.entries(building.requirements)) {
        // Особая обработка для требований по исследованиям
        if (resourceId in state.upgrades) {
          if (!state.upgrades[resourceId].purchased) {
            allRequirementsMet = false;
            break;
          }
          continue;
        }
        
        // Проверка требований по ресурсам
        if (state.resources[resourceId]) {
          if (state.resources[resourceId].value < amount) {
            allRequirementsMet = false;
            break;
          }
        }
      }
      
      // Если все требования выполнены, разблокируем здание
      if (allRequirementsMet) {
        newBuildings[buildingId] = {
          ...building,
          unlocked: true
        };
        
        // Сообщение о разблокировке
        safeDispatchGameEvent(`Доступно новое здание: ${building.name}`, "info");
      }
    }
  }
  
  // Специальные проверки для фазы 2
  
  // Разблокировка Криптобиблиотеки при выполнении условий
  if (state.upgrades.cryptoCurrencyBasics?.purchased && !newBuildings.cryptoLibrary.unlocked) {
    newBuildings.cryptoLibrary = {
      ...newBuildings.cryptoLibrary,
      unlocked: true
    };
    safeDispatchGameEvent("Доступно новое здание: Криптобиблиотека", "info");
  }
  
  // Возвращаем обновленное состояние с разблокированными зданиями
  newState = {
    ...newState,
    buildings: newBuildings
  };
  
  // Проверяем разблокировку улучшений
  newState = checkUpgradeUnlocks(newState);
  
  return newState;
};
