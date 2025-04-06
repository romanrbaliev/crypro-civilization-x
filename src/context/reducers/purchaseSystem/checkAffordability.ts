
import { GameState } from "@/context/types";
import { ResourceSystem } from "@/systems/ResourceSystem";

// Создаем новый экземпляр системы ресурсов
const resourceSystem = new ResourceSystem();

/**
 * Проверяет, может ли игрок позволить себе покупку
 */
export const checkAffordability = (state: GameState, cost: Record<string, number>): boolean => {
  return resourceSystem.checkAffordability(state, cost);
};

/**
 * Получает информацию о недостающих ресурсах
 */
export const getMissingResources = (state: GameState, cost: Record<string, number>): Record<string, number> => {
  return resourceSystem.getMissingResources(state, cost);
};
