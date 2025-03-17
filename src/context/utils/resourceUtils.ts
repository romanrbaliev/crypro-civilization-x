import { GameState } from '../types';
import { initialState } from '../initialState';
import { safeDispatchGameEvent } from './eventBusUtils';

// Функция для проверки, достаточно ли ресурсов для покупки
export const hasEnoughResources = (
  state: GameState,
  costs: { [key: string]: number }
): boolean => {
  for (const [resourceId, amount] of Object.entries(costs)) {
    if (!state.resources[resourceId] || state.resources[resourceId].value < amount) {
      return false;
    }
  }
  return true;
};

// Функция для вычисления максимальных значений ресурсов с учётом бонусов
export const calculateResourceMax = (
  state: GameState,
  resourceId: string,
  baseMax: number
): number => {
  let maxBoost = 1;
  
  // Проверяем бонусы от улучшений
  for (const upgradeId in state.upgrades) {
    const upgrade = state.upgrades[upgradeId];
    if (upgrade.purchased) {
      const boostKey = `${resourceId}MaxBoost`;
      if (upgrade.effect[boostKey]) {
        maxBoost += upgrade.effect[boostKey];
      }
    }
  }
  
  // Проверяем бонусы от зданий
  for (const buildingId in state.buildings) {
    const building = state.buildings[buildingId];
    const maxKey = `${resourceId}Max`;
    if (building.count > 0 && building.production[maxKey]) {
      baseMax += building.production[maxKey] * building.count;
    }
  }
  
  return baseMax * maxBoost;
};

// Функция для вычисления бонусов к производству ресурсов
export const calculateProductionBoost = (
  state: GameState,
  resourceId: string
): number => {
  let boost = 1;
  
  // Проверяем бонусы от улучшений
  for (const upgradeId in state.upgrades) {
    const upgrade = state.upgrades[upgradeId];
    if (upgrade.purchased) {
      const boostKey = `${resourceId}Boost`;
      if (upgrade.effect[boostKey]) {
        boost += upgrade.effect[boostKey];
        console.log(`Применен бонус ${boostKey} от улучшения ${upgradeId}: +${upgrade.effect[boostKey] * 100}%, итоговый множитель: ${boost}`);
      }
    }
  }
  
  return boost;
};

// Проверка выполнения требований для разблокировки
export const meetsRequirements = (
  state: GameState,
  requirements: { [key: string]: number }
): boolean => {
  for (const [key, amount] of Object.entries(requirements)) {
    // Проверка требований для количества зданий
    if (key.includes('Count')) {
      const buildingId = key.replace('Count', '');
      if (!state.buildings[buildingId] || state.buildings[buildingId].count < amount) {
        return false;
      }
    }
    // Проверка требований для улучшений
    else if (state.upgrades[key]) {
      const upgrade = state.upgrades[key];
      if (!upgrade.purchased) {
        return false;
      }
    }
    // Проверка требований для ресурсов
    else if (!state.resources[key] || state.resources[key].value < amount) {
      return false;
    }
  }
  return true;
};

// Функция проверки требований для зданий и улучшений
export const checkUnlocks = (state: GameState): GameState => {
  const newState = { ...state };
  
  // Проверка зданий
  for (const buildingId in newState.buildings) {
    const building = newState.buildings[buildingId];
    
    // Пропускаем здания, которые требуют особой логики разблокировки
    if (buildingId === 'cryptoWallet') {
      // Криптокошелек разблокируется только через улучшение Основы блокчейна
      continue;
    }
    
    if (!building.unlocked && building.requirements) {
      const requirementsMet = meetsRequirements(newState, building.requirements);
      if (requirementsMet) {
        // Разблокируем здание
        newState.buildings[buildingId] = {
          ...building,
          unlocked: true
        };
        console.log(`Здание ${buildingId} разблокировано из-за выполнения требований`);
        
        // Отправляем сообщение о разблокировке через шину событий
        let message = "";
        switch (buildingId) {
          case "homeComputer":
            message = "Открыто новое оборудование: Домашний компьютер";
            break;
          case "generator":
            message = "Открыто новое оборудование: Генератор";
            break;
          case "autoMiner":
            message = "Открыто новое оборудование: Автомайнер";
            break;
          default:
            message = `Открыто новое оборудование: ${building.name}`;
        }
        
        safeDispatchGameEvent(message, "info");
      }
    }
  }
  
  // Проверка улучшений
  for (const upgradeId in newState.upgrades) {
    const upgrade = newState.upgrades[upgradeId];
    if (!upgrade.unlocked && upgrade.requirements) {
      const requirementsMet = meetsRequirements(newState, upgrade.requirements);
      if (requirementsMet) {
        // Разблокируем улучшение
        newState.upgrades[upgradeId] = {
          ...upgrade,
          unlocked: true
        };
        console.log(`Улучшение ${upgradeId} разблокировано из-за выполнения требований`);
        
        // Отправляем сообщение о разблокировке через шину событий
        const message = `Открыто новое исследование: ${upgrade.name}`;
        safeDispatchGameEvent(message, "info");
      }
    }
  }
  
  return newState;
};

// Функция для обновления максимальных значений ресурсов
export const updateResourceMaxValues = (state: GameState): GameState => {
  const newResources = { ...state.resources };
  
  for (const resourceId in newResources) {
    const resource = newResources[resourceId];
    const baseMax = initialState.resources[resourceId].max;
    newResources[resourceId] = {
      ...resource,
      max: calculateResourceMax(state, resourceId, baseMax)
    };
  }
  
  return {
    ...state,
    resources: newResources
  };
};
