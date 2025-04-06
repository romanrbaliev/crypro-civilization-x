
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
  if (!building.maxResourceEffects) {
    return newState;
  }
  
  // Применяем эффекты здания на максимальное количество ресурсов
  for (const [resourceId, amount] of Object.entries(building.maxResourceEffects)) {
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
