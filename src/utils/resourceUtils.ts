
import { GameState, Resource, ResourceType } from '@/context/types';

// Функция для проверки, достаточно ли ресурсов для совершения действия
export const hasEnoughResources = (
  state: GameState,
  cost: Record<string, number>
): boolean => {
  for (const resourceId in cost) {
    if (state.resources[resourceId] === undefined || state.resources[resourceId].value < cost[resourceId]) {
      return false;
    }
  }
  return true;
};

// Функция для обновления максимальных значений ресурсов на основе зданий и улучшений
export const updateResourceMaxValues = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Обновляем максимум USDT
  let usdtMaxBoost = 50; // Базовый максимум
  
  // Применяем эффекты от зданий
  for (const buildingId in newState.buildings) {
    const building = newState.buildings[buildingId];
    if (building.unlocked && building.count > 0 && building.effects && building.effects.usdtMaxBoost) {
      usdtMaxBoost += Number(building.count) * Number(building.effects.usdtMaxBoost);
    }
  }
  
  // Применяем эффекты от улучшений
  for (const upgradeId in newState.upgrades) {
    const upgrade = newState.upgrades[upgradeId];
    if (upgrade.purchased && upgrade.effects && upgrade.effects.usdtMaxBoost) {
      usdtMaxBoost += Number(upgrade.effects.usdtMaxBoost);
    }
  }
  
  // Обновляем максимум USDT в состоянии
  if (newState.resources.usdt) {
    newState.resources.usdt = {
      ...newState.resources.usdt,
      max: usdtMaxBoost
    };
  }
  
  // Обновляем максимум Bitcoin
  let bitcoinMaxBoost = 0.01; // Базовый максимум
  
  // Применяем эффекты от зданий
  for (const buildingId in newState.buildings) {
    const building = newState.buildings[buildingId];
    if (building.unlocked && building.count > 0 && building.effects && building.effects.bitcoinMaxBoost) {
      bitcoinMaxBoost += Number(building.count) * Number(building.effects.bitcoinMaxBoost);
    }
  }
  
  // Применяем эффекты от улучшений
  for (const upgradeId in newState.upgrades) {
    const upgrade = newState.upgrades[upgradeId];
    if (upgrade.purchased && upgrade.effects && upgrade.effects.bitcoinMaxBoost) {
      bitcoinMaxBoost += Number(upgrade.effects.bitcoinMaxBoost);
    }
  }
  
  // Обновляем максимум Bitcoin в состоянии
  if (newState.resources.bitcoin) {
    newState.resources.bitcoin = {
      ...newState.resources.bitcoin,
      max: bitcoinMaxBoost
    };
  }
  
  // Обновляем максимум knowledge
  let knowledgeMaxBoost = 100; // Базовый максимум
  
  // Применяем эффекты от зданий
  for (const buildingId in newState.buildings) {
    const building = newState.buildings[buildingId];
    if (building.unlocked && building.count > 0 && building.effects && building.effects.knowledgeMaxBoost) {
      knowledgeMaxBoost += Number(building.count) * Number(building.effects.knowledgeMaxBoost);
    }
  }
  
  // Применяем эффекты от улучшений
  for (const upgradeId in newState.upgrades) {
    const upgrade = newState.upgrades[upgradeId];
    if (upgrade.purchased && upgrade.effects && upgrade.effects.knowledgeMaxBoost) {
      knowledgeMaxBoost += Number(upgrade.effects.knowledgeMaxBoost);
    }
  }
  
  // Обновляем максимум knowledge в состоянии
  if (newState.resources.knowledge) {
    newState.resources.knowledge = {
      ...newState.resources.knowledge,
      max: knowledgeMaxBoost
    };
  }
  
  return newState;
};

// Функция для проверки разблокировок на основе ресурсов
export const checkUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Пример: разблокировка USDT при достижении 10 знаний
  if (!newState.unlocks.usdt && newState.resources.knowledge && newState.resources.knowledge.value >= 10) {
    newState = {
      ...newState,
      unlocks: {
        ...newState.unlocks,
        usdt: true
      }
    };
  }
  
  return newState;
};

// Вспомогательные функции для создания и обновления ресурсов
export const createResourceObject = (
  id: string, 
  name: string, 
  description: string, 
  type: ResourceType, 
  icon: string, 
  value: number = 0,
  max: number = 100,
  unlocked: boolean = true,
  baseProduction: number = 0,
  production: number = 0,
  perSecond: number = 0,
  consumption: number = 0
): Resource => {
  return {
    id,
    name,
    description,
    type,
    icon,
    value,
    max,
    unlocked,
    baseProduction,
    production,
    perSecond,
    consumption
  };
};
