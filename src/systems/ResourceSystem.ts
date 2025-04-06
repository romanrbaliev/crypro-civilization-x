
import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { ResourceFormatter } from '@/formatters/ResourceFormatter';

export class ResourceSystem {
  private formatter: ResourceFormatter;
  
  constructor() {
    this.formatter = new ResourceFormatter();
  }
  
  /**
   * Инкрементирует значение ресурса
   */
  incrementResource(
    state: GameState, 
    payload: { resourceId: string; amount?: number }
  ): GameState {
    const { resourceId, amount = 1 } = payload;
    const resource = state.resources[resourceId];
    
    if (!resource || !resource.unlocked) {
      console.warn(`Попытка инкрементировать неразблокированный ресурс: ${resourceId}`);
      return state;
    }
    
    const incrementAmount = Math.max(0, amount);
    const newValue = Math.min(
      resource.value + incrementAmount,
      resource.max || Number.MAX_SAFE_INTEGER
    );
    
    return {
      ...state,
      resources: {
        ...state.resources,
        [resourceId]: {
          ...resource,
          value: newValue
        }
      }
    };
  }
  
  /**
   * Разблокирует ресурс
   */
  unlockResource(
    state: GameState, 
    payload: { resourceId: string }
  ): GameState {
    const { resourceId } = payload;
    const resource = state.resources[resourceId];
    
    if (!resource) {
      console.warn(`Попытка разблокировать несуществующий ресурс: ${resourceId}`);
      return state;
    }
    
    if (resource.unlocked) {
      // Ресурс уже разблокирован
      return state;
    }
    
    // Разблокируем ресурс
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
  
  /**
   * Проверяет, достаточно ли ресурсов для покупки
   */
  checkAffordability(state: GameState, cost: Record<string, number>): boolean {
    for (const [resourceId, amount] of Object.entries(cost)) {
      const resource = state.resources[resourceId];
      if (!resource || resource.value < Number(amount)) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Возвращает список недостающих ресурсов
   */
  getMissingResources(state: GameState, cost: Record<string, number>): Record<string, number> {
    const missingResources: Record<string, number> = {};
    
    for (const [resourceId, amount] of Object.entries(cost)) {
      const resource = state.resources[resourceId];
      const amountNeeded = Number(amount);
      
      if (!resource || resource.value < amountNeeded) {
        const missing = resource ? Math.max(0, amountNeeded - resource.value) : amountNeeded;
        missingResources[resourceId] = missing;
      }
    }
    
    return missingResources;
  }
  
  /**
   * Обновляет ресурсы на основе производства и прошедшего времени
   */
  updateResources(state: GameState, deltaTime: number): GameState {
    if (deltaTime <= 0) {
      return this.updateResourceProduction(state);
    }
    
    // Преобразуем миллисекунды в секунды
    const deltaSeconds = deltaTime / 1000;
    const resources = { ...state.resources };
    
    // Обрабатываем каждый ресурс
    for (const resourceId in resources) {
      const resource = resources[resourceId];
      
      if (!resource.unlocked) continue;
      
      // Получаем значения производства и потребления
      const production = resource.production || 0;
      const consumption = resource.consumption || 0;
      
      // Рассчитываем чистое изменение ресурса
      const netChange = (production - consumption) * deltaSeconds;
      
      if (netChange !== 0) {
        // Обновляем значение ресурса
        let newValue = resource.value + netChange;
        
        // Ограничиваем значение максимумом, если он установлен
        if (resource.max !== undefined && resource.max !== null) {
          newValue = Math.min(newValue, resource.max);
        }
        
        // Не допускаем отрицательных значений
        newValue = Math.max(0, newValue);
        
        // Обновляем ресурс
        resources[resourceId] = {
          ...resource,
          value: newValue
        };
      }
    }
    
    return {
      ...state,
      resources
    };
  }
  
  /**
   * Обновляет производство ресурсов на основе зданий
   */
  updateResourceProduction(state: GameState): GameState {
    const resources = { ...state.resources };
    
    // Сначала обнуляем всё производство для каждого ресурса
    for (const resourceId in resources) {
      resources[resourceId] = {
        ...resources[resourceId],
        production: 0,
        consumption: 0
      };
    }
    
    // Обрабатываем производство от зданий
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      
      if (building.count <= 0) continue;
      
      // Обрабатываем производство
      if (building.production) {
        for (const resourceId in building.production) {
          if (resources[resourceId] && resources[resourceId].unlocked) {
            const currentProduction = resources[resourceId].production || 0;
            const buildingProduction = building.production[resourceId] * building.count;
            
            resources[resourceId] = {
              ...resources[resourceId],
              production: currentProduction + buildingProduction
            };
          }
        }
      }
      
      // Обрабатываем потребление
      if (building.consumption) {
        for (const resourceId in building.consumption) {
          if (resources[resourceId] && resources[resourceId].unlocked) {
            const currentConsumption = resources[resourceId].consumption || 0;
            const buildingConsumption = building.consumption[resourceId] * building.count;
            
            resources[resourceId] = {
              ...resources[resourceId],
              consumption: currentConsumption + buildingConsumption
            };
          }
        }
      }
    }
    
    return {
      ...state,
      resources
    };
  }
  
  /**
   * Обновляет максимальные значения ресурсов
   */
  updateResourceMaxValues(state: GameState): GameState {
    const resources = { ...state.resources };
    
    // Устанавливаем базовые максимальные значения
    if (resources.knowledge) {
      resources.knowledge = {
        ...resources.knowledge,
        max: resources.knowledge.baseMax || 100
      };
    }
    
    if (resources.usdt) {
      resources.usdt = {
        ...resources.usdt,
        max: resources.usdt.baseMax || 100
      };
    }
    
    // Учитываем бонусы от зданий
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      
      if (building.count <= 0) continue;
      
      // Учитываем бонусы к максимуму
      if (building.maxBonus) {
        for (const resourceId in building.maxBonus) {
          if (resources[resourceId]) {
            const currentMax = resources[resourceId].max || 0;
            const buildingBonus = building.maxBonus[resourceId] * building.count;
            
            resources[resourceId] = {
              ...resources[resourceId],
              max: currentMax + buildingBonus
            };
          }
        }
      }
    }
    
    // Учитываем бонусы от улучшений
    for (const upgradeId in state.upgrades) {
      const upgrade = state.upgrades[upgradeId];
      
      if (!upgrade.purchased) continue;
      
      // Учитываем эффекты улучшений
      if (upgrade.effects) {
        // Бонусы к максимуму
        if (upgrade.effects.knowledgeMaxBoost) {
          const knowledgeMax = resources.knowledge.max || 100;
          resources.knowledge = {
            ...resources.knowledge,
            max: knowledgeMax * (1 + upgrade.effects.knowledgeMaxBoost)
          };
        }
        
        if (upgrade.effects.usdtMaxBoost) {
          const usdtMax = resources.usdt.max || 100;
          resources.usdt = {
            ...resources.usdt,
            max: usdtMax * (1 + upgrade.effects.usdtMaxBoost)
          };
        }
      }
    }
    
    return {
      ...state,
      resources
    };
  }
  
  /**
   * Полностью пересчитывает всё производство для всех ресурсов
   */
  recalculateAllResourceProduction(state: GameState): GameState {
    console.log("Пересчет производства всех ресурсов");
    return this.updateResourceProduction(state);
  }
}
