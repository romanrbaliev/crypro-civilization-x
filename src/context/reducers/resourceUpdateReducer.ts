
import { GameState, Resource, ResourceType } from '../types';

// Определяем функцию для обновления ресурсов
export const updateResources = (state: GameState, deltaTime: number): GameState => {
  const newState = { ...state };
  const resources = { ...state.resources };
  
  // Создаем computingPower ресурс, если он еще не существует
  if (!resources.computingPower) {
    resources.computingPower = {
      id: 'computingPower',
      name: 'Вычислительная мощность',
      description: 'Вычислительная мощность для майнинга',
      type: 'resource' as ResourceType,
      icon: 'cpu',
      value: 0,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 1000,
      unlocked: true,
      consumption: 0
    };
  }
  
  newState.resources = resources;
  return newState;
};
