
import { GameState } from '@/context/types';
import { ResourceSystem } from '@/systems/ResourceSystem';

// Создаем статический экземпляр для использования вне компонентов
const resourceSystem = new ResourceSystem();

/**
 * Проверяет, достаточно ли ресурсов для покупки
 */
export function checkAffordability(state: GameState, cost: Record<string, number>): boolean {
  return resourceSystem.checkAffordability(state, cost);
}

/**
 * Возвращает список недостающих ресурсов
 */
export function getMissingResources(state: GameState, cost: Record<string, number>): Record<string, number> {
  return resourceSystem.getMissingResources(state, cost);
}
