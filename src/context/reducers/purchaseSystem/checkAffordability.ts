
import { GameState } from '@/context/types';

/**
 * Проверяет, достаточно ли ресурсов для покупки
 */
export function checkAffordability(
  state: GameState,
  costs: Record<string, number>
): boolean {
  if (!costs || Object.keys(costs).length === 0) {
    return true;
  }

  for (const [resourceId, amount] of Object.entries(costs)) {
    const resource = state.resources[resourceId];
    if (!resource || resource.value < Number(amount)) {
      return false;
    }
  }

  return true;
}

/**
 * Получает список недостающих ресурсов
 */
export function getMissingResources(
  state: GameState,
  costs: Record<string, number>
): Record<string, number> {
  const missing: Record<string, number> = {};

  if (!costs || Object.keys(costs).length === 0) {
    return missing;
  }

  for (const [resourceId, amount] of Object.entries(costs)) {
    const resource = state.resources[resourceId];
    if (!resource || resource.value < Number(amount)) {
      missing[resourceId] = Number(amount) - (resource?.value || 0);
    }
  }

  return missing;
}
