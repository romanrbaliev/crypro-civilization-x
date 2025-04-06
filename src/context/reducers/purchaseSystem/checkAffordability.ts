
import { GameState } from '@/context/types';

/**
 * Проверяет, достаточно ли ресурсов для покупки
 */
export function checkAffordability(state: GameState, cost: Record<string, number>): boolean {
  // Проверка на пустой или некорректный объект стоимости
  if (!cost || typeof cost !== 'object' || Object.keys(cost).length === 0) {
    return false;
  }
  
  // Проверяем каждый ресурс
  for (const [resourceId, amount] of Object.entries(cost)) {
    // Дополнительная проверка на валидность значения
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      continue; // Пропускаем невалидные значения
    }
    
    const resource = state.resources[resourceId];
    if (!resource || resource.value < Number(amount)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Возвращает список недостающих ресурсов
 */
export function getMissingResources(state: GameState, cost: Record<string, number>): Record<string, number> {
  const missingResources: Record<string, number> = {};
  
  // Проверка на пустой или некорректный объект стоимости
  if (!cost || typeof cost !== 'object' || Object.keys(cost).length === 0) {
    return missingResources;
  }
  
  // Проверяем каждый ресурс
  for (const [resourceId, amount] of Object.entries(cost)) {
    // Дополнительная проверка на валидность значения
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      continue; // Пропускаем невалидные значения
    }
    
    const resource = state.resources[resourceId];
    if (!resource) {
      missingResources[resourceId] = Number(amount);
    } else if (resource.value < Number(amount)) {
      missingResources[resourceId] = Number(amount) - resource.value;
    }
  }
  
  return missingResources;
}
