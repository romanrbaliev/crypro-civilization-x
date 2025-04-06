
import { GameState } from '@/context/types';

/**
 * Класс для работы с ресурсами
 */
export class ResourceSystem {
  /**
   * Проверяет, достаточно ли ресурсов для покупки
   */
  checkAffordability(state: GameState, cost: Record<string, number>): boolean {
    for (const [resourceId, amount] of Object.entries(cost)) {
      const resource = state.resources[resourceId];
      if (!resource || resource.value < amount) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Возвращает список недостающих ресурсов
   */
  getMissingResources(state: GameState, cost: Record<string, number>): Record<string, number> {
    const missing: Record<string, number> = {};
    
    for (const [resourceId, amount] of Object.entries(cost)) {
      const resource = state.resources[resourceId];
      if (!resource || resource.value < amount) {
        missing[resourceId] = amount - (resource?.value || 0);
      }
    }
    
    return missing;
  }
}

export default ResourceSystem;
