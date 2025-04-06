
import { GameState } from '../types';
import { ResourceSystem } from '@/systems/ResourceSystem';

// Создаем статический экземпляр для использования вне компонентов
const resourceSystem = new ResourceSystem();

// Определяем функцию для обновления ресурсов
export const updateResources = (state: GameState, deltaTime: number): GameState => {
  console.log(`resourceUpdateReducer: Обновление ресурсов, прошло ${deltaTime}ms`);
  
  // Обновляем ресурсы, используя ResourceSystem
  const updatedState = resourceSystem.updateResources(state, deltaTime);
  
  // Возвращаем обновленное состояние
  return updatedState;
};

// Функция для расчета производства ресурсов на основе зданий
export const calculateResourceProduction = (state: GameState): GameState => {
  console.log("resourceUpdateReducer: Пересчет производства ресурсов");
  
  // Полностью пересчитываем производство ресурсов
  return resourceSystem.recalculateAllResourceProduction(state);
};
