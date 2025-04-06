
import { GameState, Resource, ResourceType } from '@/context/types';
import { ResourceSystem } from '@/systems/ResourceSystem';

// Создаем экземпляр системы ресурсов
const resourceSystem = new ResourceSystem();

// Функция для проверки, достаточно ли ресурсов для совершения действия
export const hasEnoughResources = (
  state: GameState,
  cost: Record<string, number>
): boolean => {
  return resourceSystem.checkAffordability(state, cost);
};

// Функция для обновления максимальных значений ресурсов на основе зданий и улучшений
export const updateResourceMaxValues = (state: GameState): GameState => {
  return resourceSystem.updateResourceMaxValues(state);
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
