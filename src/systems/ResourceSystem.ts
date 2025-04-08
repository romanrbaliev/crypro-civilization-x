
import { GameState } from '@/context/types';

/**
 * Система управления ресурсами игры
 */
export class ResourceSystem {
  /**
   * Обновляет значения ресурсов на основе прошедшего времени
   */
  updateResources(state: GameState, deltaTime: number): GameState {
    if (deltaTime <= 0) {
      return state;
    }

    const newState = { ...state };
    const seconds = deltaTime / 1000;
    
    // Обновляем все ресурсы
    for (const resourceId in newState.resources) {
      const resource = newState.resources[resourceId];
      
      if (resource.unlocked && resource.perSecond !== 0) {
        // Рассчитываем новое значение с учетом лимита max
        const newValue = Math.min(
          resource.value + resource.perSecond * seconds,
          resource.max
        );
        
        // Обновляем значение ресурса
        newState.resources[resourceId] = {
          ...resource,
          value: Math.max(0, newValue) // Ресурсы не могут быть отрицательными
        };
      }
    }
    
    return newState;
  }

  /**
   * Обновляет максимальные значения ресурсов
   */
  updateResourceMaxValues(state: GameState): GameState {
    const newState = { ...state };
    
    // Обновляем максимальные значения ресурсов на основе эффектов
    // (В данной реализации это заглушка)
    
    return newState;
  }

  /**
   * Пересчитывает все производство ресурсов
   */
  recalculateAllResourceProduction(state: GameState): GameState {
    const newState = { ...state };
    
    for (const resourceId in newState.resources) {
      const resource = newState.resources[resourceId];
      
      // Сбрасываем значения перед пересчетом
      newState.resources[resourceId] = {
        ...resource,
        production: 0,
        consumption: 0
      };
    }
    
    // Рассчитываем производство от зданий
    for (const buildingId in newState.buildings) {
      const building = newState.buildings[buildingId];
      
      if (!building.unlocked || building.count === 0) {
        continue;
      }
      
      // Добавляем производство
      if (building.production) {
        for (const resourceId in building.production) {
          if (newState.resources[resourceId] && newState.resources[resourceId].unlocked) {
            const productionPerBuilding = building.production[resourceId];
            const totalProduction = productionPerBuilding * building.count;
            
            newState.resources[resourceId].production += totalProduction;
          }
        }
      }
      
      // Учитываем потребление
      if (building.consumption) {
        for (const resourceId in building.consumption) {
          if (newState.resources[resourceId] && newState.resources[resourceId].unlocked) {
            const consumptionPerBuilding = building.consumption[resourceId];
            const totalConsumption = consumptionPerBuilding * building.count;
            
            newState.resources[resourceId].consumption += totalConsumption;
          }
        }
      }
    }
    
    // Рассчитываем итоговую производительность как разницу
    for (const resourceId in newState.resources) {
      const resource = newState.resources[resourceId];
      if (resource.unlocked) {
        const netProduction = resource.production - resource.consumption;
        newState.resources[resourceId].perSecond = netProduction;
      }
    }
    
    return newState;
  }

  /**
   * Проверяет, достаточно ли ресурсов для покупки
   */
  checkAffordability(state: GameState, cost: Record<string, number>): boolean {
    for (const resourceId in cost) {
      const resource = state.resources[resourceId];
      if (!resource || !resource.unlocked || resource.value < cost[resourceId]) {
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
    
    for (const resourceId in cost) {
      const resource = state.resources[resourceId];
      if (!resource || !resource.unlocked) {
        missing[resourceId] = cost[resourceId];
      } else if (resource.value < cost[resourceId]) {
        missing[resourceId] = cost[resourceId] - resource.value;
      }
    }
    
    return missing;
  }

  /**
   * Разблокирует ресурс
   */
  unlockResource(state: GameState, payload: { resourceId: string }): GameState {
    const { resourceId } = payload;
    const resource = state.resources[resourceId];
    
    if (!resource) {
      return state;
    }
    
    return {
      ...state,
      resources: {
        ...state.resources,
        [resourceId]: {
          ...resource,
          unlocked: true
        }
      }
    };
  }
}
