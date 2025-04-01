
import { GameState, Resource } from '../types';

// Функция для обновления ресурсов (например, каждый тик игрового цикла)
export const processResourceUpdate = (state: GameState): GameState => {
  // Клонируем объект ресурсов для безопасного изменения
  const updatedResources = { ...state.resources };
  
  // Обновляем каждый ресурс в соответствии с его производством
  for (const resourceId in updatedResources) {
    const resource = updatedResources[resourceId];
    
    // Вычисляем новое значение с учётом ограничения максимума
    const newValue = Math.min(
      resource.max,
      resource.value + resource.perSecond
    );
    
    // Обновляем значение ресурса
    updatedResources[resourceId] = {
      ...resource,
      value: newValue
    };
  }
  
  // Проверка на критические события (например, нехватка электричества)
  let eventMessages = state.eventMessages || {};
  
  if (updatedResources.electricity && updatedResources.electricity.value < 0) {
    // Если электричества не хватает, отключаем компьютеры
    eventMessages = {
      ...eventMessages,
      electricityShortage: true
    };
    
    // Сбрасываем значение электричества до 0
    updatedResources.electricity.value = 0;
  }
  
  return {
    ...state,
    resources: updatedResources,
    eventMessages
  };
};

// Экспорт для совместимости
export const updateResources = processResourceUpdate;

// Вспомогательная функция для обработки производства ресурсов
export function calculateResourceProduction(state: GameState): { [resourceId: string]: Resource } {
  // Клонируем ресурсы для безопасного изменения
  const updatedResources = { ...state.resources };
  
  // Сбрасываем текущее производство для каждого ресурса
  for (const resourceId in updatedResources) {
    updatedResources[resourceId] = {
      ...updatedResources[resourceId],
      production: updatedResources[resourceId].baseProduction || 0,
      perSecond: 0
    };
  }
  
  // Добавляем производство от зданий
  for (const buildingId in state.buildings) {
    const building = state.buildings[buildingId];
    
    // Пропускаем неразблокированные здания или здания с нулевым количеством
    if (!building.unlocked || building.count <= 0) continue;
    
    // Добавляем производство здания к ресурсам
    for (const resourceId in building.production) {
      // Пропускаем несуществующие ресурсы
      if (!updatedResources[resourceId]) {
        console.warn(`Ресурс ${resourceId} не существует, но здание ${buildingId} его производит`);
        
        // Создаем ресурс с базовыми параметрами
        updatedResources[resourceId] = {
          id: resourceId,
          name: resourceId,
          description: `Ресурс ${resourceId}`,
          type: 'resource',
          value: 0,
          baseProduction: 0,
          production: 0,
          perSecond: 0,
          max: 100,
          unlocked: true
        };
      }
      
      // Вычисляем производство здания с учетом его количества и бустов
      const buildingProduction = 
        building.production[resourceId] * 
        building.count * 
        (1 + (building.productionBoost || 0) / 100);
      
      // Добавляем производство к ресурсу
      updatedResources[resourceId] = {
        ...updatedResources[resourceId],
        production: updatedResources[resourceId].production + buildingProduction,
        perSecond: updatedResources[resourceId].perSecond + buildingProduction
      };
    }
    
    // Учитываем потребление ресурсов зданиями
    if (building.consumption) {
      for (const resourceId in building.consumption) {
        // Пропускаем несуществующие ресурсы
        if (!updatedResources[resourceId]) continue;
        
        // Вычисляем потребление здания с учетом его количества
        const buildingConsumption = building.consumption[resourceId] * building.count;
        
        // Вычитаем потребление из производства ресурса
        updatedResources[resourceId] = {
          ...updatedResources[resourceId],
          perSecond: updatedResources[resourceId].perSecond - buildingConsumption
        };
      }
    }
  }
  
  return updatedResources;
}
