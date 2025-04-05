
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
  
  // Обновляем значения ресурсов на основе прошедшего времени и их производства
  for (const resourceId in resources) {
    const resource = resources[resourceId];
    
    if (resource.unlocked && resource.perSecond !== 0) {
      // Рассчитываем новое значение с учетом производства в секунду и прошедшего времени
      const increment = resource.perSecond * (deltaTime / 1000);
      const newValue = resource.value + increment;
      
      // Обновляем значение ресурса, не превышая максимум
      resources[resourceId] = {
        ...resource,
        value: resource.max > 0 ? Math.min(newValue, resource.max) : newValue
      };
    }
  }
  
  newState.resources = resources;
  return newState;
};

// Функция для расчета производства ресурсов на основе зданий
export const calculateResourceProduction = (state: GameState): GameState => {
  const newState = { ...state };
  const resources = { ...state.resources };
  const buildings = state.buildings;
  
  // Сбрасываем производство в секунду для всех ресурсов
  for (const resourceId in resources) {
    resources[resourceId] = {
      ...resources[resourceId],
      production: 0,
      perSecond: 0
    };
  }
  
  // Рассчитываем производство ресурсов от каждого здания
  for (const buildingId in buildings) {
    const building = buildings[buildingId];
    if (building.count > 0 && building.production) {
      for (const resourceId in building.production) {
        if (resources[resourceId]) {
          const productionPerBuilding = building.production[resourceId];
          const totalProduction = productionPerBuilding * building.count;
          
          resources[resourceId] = {
            ...resources[resourceId],
            production: (resources[resourceId].production || 0) + totalProduction,
            perSecond: (resources[resourceId].perSecond || 0) + totalProduction
          };
        }
      }
    }
  }
  
  newState.resources = resources;
  return newState;
};
