
import { GameState } from '@/context/types';

// Базовые функции для работы с ресурсами
export const hasResources = (state: GameState, costs: Record<string, number>): boolean => {
  for (const [resourceId, amount] of Object.entries(costs)) {
    const resource = state.resources[resourceId];
    if (!resource || resource.value < amount) {
      return false;
    }
  }
  return true;
};

// Функция для списания ресурсов
export const spendResources = (state: GameState, costs: Record<string, number>): GameState => {
  const newState = { ...state };
  
  for (const [resourceId, amount] of Object.entries(costs)) {
    const resource = newState.resources[resourceId];
    if (resource) {
      newState.resources = {
        ...newState.resources,
        [resourceId]: {
          ...resource,
          value: Math.max(0, resource.value - amount)
        }
      };
    }
  }
  
  return newState;
};

// Функция для обработки эффектов зданий на максимальное количество ресурса
export const processMaxResourceEffects = (state: GameState, building: any): GameState => {
  const newState = { ...state };
  
  // Если у здания нет эффектов, возвращаем исходное состояние
  if (!building.effects || !building.effects.maxResourceEffects) {
    return newState;
  }
  
  // Применяем эффекты здания на максимальное количество ресурсов
  for (const [resourceId, amount] of Object.entries(building.effects.maxResourceEffects)) {
    const resource = newState.resources[resourceId];
    if (resource) {
      newState.resources = {
        ...newState.resources,
        [resourceId]: {
          ...resource,
          max: (resource.max || 0) + Number(amount)
        }
      };
    }
  }
  
  return newState;
};

// Добавляем новую функцию updateResourceMaxValues
export const updateResourceMaxValues = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Сначала устанавливаем базовые максимальные значения
  const baseMaxValues: Record<string, number> = {
    knowledge: 100,
    usdt: 50,
    electricity: 100,
    computingPower: 1000,
    bitcoin: 0.01
  };
  
  // Устанавливаем базовые значения для всех ресурсов
  for (const resourceId in baseMaxValues) {
    if (newState.resources[resourceId]) {
      newState.resources = {
        ...newState.resources,
        [resourceId]: {
          ...newState.resources[resourceId],
          max: baseMaxValues[resourceId as keyof typeof baseMaxValues]
        }
      };
    }
  }
  
  // Применяем эффекты от зданий
  for (const buildingId in newState.buildings) {
    const building = newState.buildings[buildingId];
    if (building.count > 0 && building.effects) {
      // Проверяем эффекты максимальных значений ресурсов
      for (const effectKey in building.effects) {
        if (effectKey.startsWith('max') && effectKey.endsWith('Boost')) {
          const resourceId = effectKey.replace('max', '').replace('Boost', '').toLowerCase();
          if (newState.resources[resourceId]) {
            const boostAmount = building.effects[effectKey] * building.count;
            newState.resources = {
              ...newState.resources,
              [resourceId]: {
                ...newState.resources[resourceId],
                max: newState.resources[resourceId].max + boostAmount
              }
            };
          }
        } else if (effectKey.startsWith('max') && effectKey.endsWith('PercentBoost')) {
          const resourceId = effectKey.replace('max', '').replace('PercentBoost', '').toLowerCase();
          if (newState.resources[resourceId]) {
            const percentBoost = building.effects[effectKey] * building.count;
            newState.resources = {
              ...newState.resources,
              [resourceId]: {
                ...newState.resources[resourceId],
                max: newState.resources[resourceId].max * (1 + percentBoost)
              }
            };
          }
        }
      }
    }
  }
  
  // Применяем эффекты от улучшений
  for (const upgradeId in newState.upgrades) {
    const upgrade = newState.upgrades[upgradeId];
    if (upgrade.purchased && upgrade.effects) {
      // Аналогичная логика для эффектов улучшений
      for (const effectKey in upgrade.effects) {
        if (effectKey.startsWith('max') && effectKey.endsWith('Boost')) {
          const resourceId = effectKey.replace('max', '').replace('Boost', '').toLowerCase();
          if (newState.resources[resourceId]) {
            const boostAmount = upgrade.effects[effectKey];
            newState.resources = {
              ...newState.resources,
              [resourceId]: {
                ...newState.resources[resourceId],
                max: newState.resources[resourceId].max + boostAmount
              }
            };
          }
        } else if (effectKey.startsWith('max') && effectKey.endsWith('PercentBoost')) {
          const resourceId = effectKey.replace('max', '').replace('PercentBoost', '').toLowerCase();
          if (newState.resources[resourceId]) {
            const percentBoost = upgrade.effects[effectKey];
            newState.resources = {
              ...newState.resources,
              [resourceId]: {
                ...newState.resources[resourceId],
                max: newState.resources[resourceId].max * (1 + percentBoost)
              }
            };
          }
        }
      }
    }
  }
  
  return newState;
};
