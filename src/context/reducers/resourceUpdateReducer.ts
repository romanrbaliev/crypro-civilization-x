
import { GameState } from '../types';
import { ResourceSystem } from '@/systems/ResourceSystem';

// Создаем статический экземпляр для использования вне компонентов
const resourceSystem = new ResourceSystem();

// Определяем функцию для обновления ресурсов
export const updateResources = (state: GameState, deltaTime: number): GameState => {
  return resourceSystem.updateResources(state, deltaTime);
};

// Функция для расчета производства ресурсов на основе зданий
export const calculateResourceProduction = (state: GameState): GameState => {
  // Сначала обновляем максимальные значения ресурсов
  state = resourceSystem.updateResourceMaxValues(state);
  
  // Затем обновляем ресурсы с нулевой дельтой времени
  // Это обновит только производство и потребление, но не значения
  return resourceSystem.updateResources(state, 0);
};
