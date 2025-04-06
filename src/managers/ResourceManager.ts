
import { GameState, Resource, Building, Upgrade } from '@/context/types';
import { ResourceCore } from '@/core/ResourceCore';

/**
 * Менеджер ресурсов - центральная точка управления всеми ресурсами
 */
export class ResourceManager {
  /**
   * Обновляет все ресурсы за указанное время
   */
  static updateResources(
    state: GameState,
    deltaTime: number
  ): GameState {
    if (deltaTime <= 0) {
      return state;
    }

    // Конвертируем миллисекунды в секунды
    const deltaSeconds = deltaTime / 1000;
    
    // Создаем копию состояния и ресурсов
    const updatedState = { ...state };
    const updatedResources = { ...state.resources };
    
    // Обновляем каждый ресурс
    for (const resourceId in updatedResources) {
      const resource = updatedResources[resourceId];
      
      // Пропускаем неразблокированные ресурсы
      if (!resource.unlocked) continue;
      
      // Обновляем значение ресурса
      updatedResources[resourceId] = ResourceCore.updateResourceValue(resource, deltaSeconds);
    }
    
    updatedState.resources = updatedResources;
    return updatedState;
  }

  /**
   * Выполняет полный пересчет производства и потребления для всех ресурсов
   */
  static recalculateAllProduction(state: GameState): GameState {
    // Создаем копию состояния и ресурсов
    const updatedState = { ...state };
    const updatedResources = { ...state.resources };
    
    // Сбрасываем все значения производства и потребления
    for (const resourceId in updatedResources) {
      updatedResources[resourceId] = {
        ...updatedResources[resourceId],
        production: 0,
        consumption: 0,
        perSecond: 0
      };
    }
    
    // Обрабатываем базовое производство ресурсов
    this.applyBaseProduction(updatedResources);
    
    // Обрабатываем производство от зданий
    this.applyBuildingProduction(updatedResources, updatedState.buildings);
    
    // Обрабатываем эффекты улучшений
    this.applyUpgradeEffects(updatedResources, updatedState.upgrades);
    
    // Вычисляем итоговые значения
    for (const resourceId in updatedResources) {
      const resource = updatedResources[resourceId];
      if (!resource.unlocked) continue;
      
      updatedResources[resourceId] = {
        ...resource,
        perSecond: (resource.production || 0) - (resource.consumption || 0)
      };
    }
    
    updatedState.resources = updatedResources;
    
    // Обновляем максимальные значения ресурсов
    return this.updateResourceMaxValues(updatedState);
  }

  /**
   * Применяет базовое производство для каждого ресурса
   */
  private static applyBaseProduction(resources: Record<string, Resource>): void {
    for (const resourceId in resources) {
      const resource = resources[resourceId];
      if (!resource.unlocked) continue;
      
      resources[resourceId] = {
        ...resource,
        production: resource.baseProduction || 0
      };
    }
  }

  /**
   * Применяет производство от всех зданий
   */
  private static applyBuildingProduction(
    resources: Record<string, Resource>,
    buildings: Record<string, Building>
  ): void {
    for (const buildingId in buildings) {
      const building = buildings[buildingId];
      
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
  }

  /**
   * Применяет эффекты улучшений
   */
  private static applyUpgradeEffects(
    resources: Record<string, Resource>,
    upgrades: Record<string, Upgrade>
  ): void {
    for (const upgradeId in upgrades) {
      const upgrade = upgrades[upgradeId];
      
      if (!upgrade.purchased) continue;
      
      // Применяем эффекты
      if (upgrade.effects) {
        // Эффекты производства
        if (upgrade.effects.productionBoost) {
          for (const resourceId in upgrade.effects.productionBoost) {
            if (resources[resourceId] && resources[resourceId].unlocked) {
              const currentProduction = resources[resourceId].production || 0;
              const boost = Number(upgrade.effects.productionBoost[resourceId]);
              
              resources[resourceId] = {
                ...resources[resourceId],
                production: currentProduction * (1 + boost)
              };
            }
          }
        }
        
        // Эффекты потребления
        if (upgrade.effects.consumptionReduction) {
          for (const resourceId in upgrade.effects.consumptionReduction) {
            if (resources[resourceId] && resources[resourceId].unlocked) {
              const currentConsumption = resources[resourceId].consumption || 0;
              const reduction = Number(upgrade.effects.consumptionReduction[resourceId]);
              
              resources[resourceId] = {
                ...resources[resourceId],
                consumption: currentConsumption * (1 - reduction)
              };
            }
          }
        }
      }
    }
  }

  /**
   * Обновляет максимальные значения для ресурсов
   */
  static updateResourceMaxValues(state: GameState): GameState {
    const updatedState = { ...state };
    const updatedResources = { ...state.resources };
    
    // Базовые максимальные значения
    const baseMaxValues = {
      knowledge: 100,
      usdt: 50, 
      electricity: 100,
      computingPower: 1000,
      bitcoin: 0.01
    };
    
    // Устанавливаем базовые значения
    for (const resourceId in baseMaxValues) {
      if (updatedResources[resourceId]) {
        updatedResources[resourceId] = {
          ...updatedResources[resourceId],
          max: baseMaxValues[resourceId as keyof typeof baseMaxValues]
        };
      }
    }
    
    // Применяем бонусы от зданий
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      
      if (building.count <= 0) continue;
      
      if (building.effects) {
        // Обрабатываем эффекты максимальных значений
        for (const resourceId in updatedResources) {
          const resource = updatedResources[resourceId];
          
          // Применяем бонусы
          if (building.effects[`max${resourceId.charAt(0).toUpperCase() + resourceId.slice(1)}Boost`]) {
            const boost = Number(building.effects[`max${resourceId.charAt(0).toUpperCase() + resourceId.slice(1)}Boost`]);
            
            updatedResources[resourceId] = {
              ...resource,
              max: (resource.max || 0) + boost * building.count
            };
          }
          
          // Применяем процентные бонусы
          if (building.effects[`max${resourceId.charAt(0).toUpperCase() + resourceId.slice(1)}PercentBoost`]) {
            const percentBoost = Number(building.effects[`max${resourceId.charAt(0).toUpperCase() + resourceId.slice(1)}PercentBoost`]);
            
            updatedResources[resourceId] = {
              ...resource,
              max: (resource.max || 0) * (1 + percentBoost * building.count)
            };
          }
        }
      }
    }
    
    // Применяем бонусы от улучшений
    for (const upgradeId in state.upgrades) {
      const upgrade = state.upgrades[upgradeId];
      
      if (!upgrade.purchased) continue;
      
      if (upgrade.effects) {
        // Обрабатываем эффекты максимальных значений
        for (const resourceId in updatedResources) {
          const resource = updatedResources[resourceId];
          
          // Применяем бонусы
          if (upgrade.effects[`max${resourceId.charAt(0).toUpperCase() + resourceId.slice(1)}Boost`]) {
            const boost = Number(upgrade.effects[`max${resourceId.charAt(0).toUpperCase() + resourceId.slice(1)}Boost`]);
            
            updatedResources[resourceId] = {
              ...resource,
              max: (resource.max || 0) + boost
            };
          }
          
          // Применяем процентные бонусы
          if (upgrade.effects[`max${resourceId.charAt(0).toUpperCase() + resourceId.slice(1)}PercentBoost`]) {
            const percentBoost = Number(upgrade.effects[`max${resourceId.charAt(0).toUpperCase() + resourceId.slice(1)}PercentBoost`]);
            
            updatedResources[resourceId] = {
              ...resource,
              max: (resource.max || 0) * (1 + percentBoost)
            };
          }
        }
      }
    }
    
    updatedState.resources = updatedResources;
    return updatedState;
  }

  /**
   * Проверяет, достаточно ли ресурсов для покупки
   */
  static canAfford(state: GameState, cost: Record<string, number>): boolean {
    for (const [resourceId, amount] of Object.entries(cost)) {
      const resource = state.resources[resourceId];
      if (!resource || resource.value < Number(amount)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Списывает ресурсы при покупке
   */
  static spendResources(
    state: GameState,
    cost: Record<string, number>
  ): GameState {
    const updatedState = { ...state };
    const updatedResources = { ...state.resources };
    
    for (const [resourceId, amount] of Object.entries(cost)) {
      if (updatedResources[resourceId]) {
        updatedResources[resourceId] = ResourceCore.decrementResource(
          updatedResources[resourceId],
          Number(amount)
        );
      }
    }
    
    updatedState.resources = updatedResources;
    return updatedState;
  }

  /**
   * Возвращает список недостающих ресурсов
   */
  static getMissingResources(
    state: GameState,
    cost: Record<string, number>
  ): Record<string, number> {
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
   * Обрабатывает применение знаний
   */
  static applyKnowledge(state: GameState, efficiency: number = 0): GameState {
    const updatedState = { ...state };
    const knowledge = updatedState.resources.knowledge;
    const usdt = updatedState.resources.usdt;
    
    if (!knowledge || !usdt || knowledge.value < 10) {
      return state;
    }
    
    // Рассчитываем, сколько знаний можно применить (кратно 10)
    const knowledgeToApply = Math.floor(knowledge.value / 10) * 10;
    
    // Рассчитываем, сколько USDT получится (с учетом эффективности)
    const usdtToAdd = (knowledgeToApply / 10) * (1 + efficiency);
    
    // Обновляем ресурсы
    updatedState.resources = {
      ...updatedState.resources,
      knowledge: ResourceCore.decrementResource(knowledge, knowledgeToApply),
      usdt: ResourceCore.incrementResource(usdt, usdtToAdd)
    };
    
    return updatedState;
  }

  /**
   * Разблокирует ресурс
   */
  static unlockResource(
    state: GameState,
    resourceId: string
  ): GameState {
    const resource = state.resources[resourceId];
    
    if (!resource || resource.unlocked) {
      return state;
    }
    
    return {
      ...state,
      resources: {
        ...state.resources,
        [resourceId]: ResourceCore.unlockResource(resource)
      }
    };
  }

  /**
   * Инкрементирует значение ресурса
   */
  static incrementResource(
    state: GameState,
    resourceId: string,
    amount: number = 1
  ): GameState {
    const resource = state.resources[resourceId];
    
    if (!resource || !resource.unlocked) {
      return state;
    }
    
    return {
      ...state,
      resources: {
        ...state.resources,
        [resourceId]: ResourceCore.incrementResource(resource, amount)
      }
    };
  }
}
