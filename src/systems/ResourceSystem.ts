
import { GameState, Resource, Building, Upgrade, ResourceType } from '@/context/types';

/**
 * Система управления ресурсами
 */
export class ResourceSystem {
  // Кэш для хранения расчетов, чтобы избежать повторных вычислений
  private resourceCache: Map<string, any> = new Map();
  private lastUpdateTime: number = 0;
  
  // Сброс кэша при существенных изменениях
  private resetCache() {
    this.resourceCache.clear();
    this.lastUpdateTime = Date.now();
  }
  
  /**
   * Обновляет ресурсы на основе прошедшего времени
   * @param state Игровое состояние
   * @param deltaTime Прошедшее время в миллисекундах
   * @returns Обновленное состояние
   */
  public updateResources(state: GameState, deltaTime: number): GameState {
    // Проверяем, что deltaTime имеет положительное значение
    if (deltaTime <= 0) {
      return state;
    }

    // Проверяем, нужно ли сбросить кэш
    if (Date.now() - this.lastUpdateTime > 5000) {
      this.resetCache();
    }

    // Создаем копию состояния для безопасного обновления, 
    // но избегаем глубокого копирования для повышения производительности
    const newState = {
      ...state,
      resources: { ...state.resources }
    };
    
    // Проверяем все ресурсы и обновляем их значения
    for (const resourceId in newState.resources) {
      if (newState.resources.hasOwnProperty(resourceId)) {
        const resource = newState.resources[resourceId];
        
        // Пропускаем не разблокированные ресурсы
        if (!resource.unlocked) continue;
        
        // Получаем текущие значения или устанавливаем 0, если не определены
        const currentValue = resource.value !== undefined && resource.value !== null 
          ? resource.value 
          : 0;
        
        const perSecond = resource.perSecond !== undefined && resource.perSecond !== null 
          ? resource.perSecond 
          : 0;
        
        // Пропускаем ресурсы без производства/потребления
        if (perSecond === 0) continue;
        
        // Рассчитываем прирост ресурса за прошедшее время (в секундах)
        const increment = (perSecond * deltaTime) / 1000;
        
        // Обновляем значение ресурса, не превышая максимум
        let newValue = currentValue + increment;
        
        // Если есть максимальное значение, ограничиваем им
        if (resource.max !== undefined && resource.max !== null && resource.max !== Infinity) {
          newValue = Math.min(newValue, resource.max);
        }
        
        // Обновляем значение ресурса в состоянии
        newState.resources[resourceId] = {
          ...resource,
          value: newValue
        };
      }
    }
    
    return newState;
  }
  
  /**
   * Обновляет максимальные значения ресурсов на основе построенных зданий
   */
  public updateResourceMaxValues(state: GameState): GameState {
    // Проверяем кэш для избежания лишних пересчетов
    const cacheKey = `maxValues_${JSON.stringify(Object.values(state.buildings).map(b => b.count))}`;
    if (this.resourceCache.has(cacheKey)) {
      return this.resourceCache.get(cacheKey);
    }

    const newState = { ...state, resources: { ...state.resources } };
    
    // Базовые значения максимумов
    const baseMaxValues: Record<string, number> = {
      knowledge: 100,
      usdt: 50,
      bitcoin: 0.01,
      electricity: 100,
      computingPower: 50
    };
    
    // Для каждого ресурса сначала устанавливаем базовые значения
    for (const resourceId in baseMaxValues) {
      if (newState.resources[resourceId] && newState.resources[resourceId].unlocked) {
        // Сохраняем текущие свойства ресурса
        const resource = { ...newState.resources[resourceId] };
        
        // Устанавливаем базовое максимальное значение
        resource.max = baseMaxValues[resourceId];
        
        // Обновляем ресурс в состоянии
        newState.resources[resourceId] = resource;
      }
    }
    
    // Применяем бонусы от зданий к максимальным значениям
    for (const buildingId in newState.buildings) {
      const building = newState.buildings[buildingId];
      
      // Пропускаем не построенные здания
      if (!building.count || building.count <= 0) continue;
      
      // Получаем бонусы max ресурсов для здания, если они существуют в эффектах
      if (building.effects) {
        for (const effectKey in building.effects) {
          // Проверяем, относится ли эффект к максимуму ресурса
          if (effectKey.includes('max') && effectKey.includes('Boost')) {
            const resourcePart = effectKey.replace('max', '').replace('Boost', '').toLowerCase();
            const resourceId = this.normalizeResourceId(resourcePart);
            
            if (newState.resources[resourceId] && newState.resources[resourceId].unlocked) {
              // Текущий максимум ресурса
              const resource = { ...newState.resources[resourceId] };
              
              // Добавляем бонус от здания, умноженный на количество зданий
              const buildingBonus = Number(building.effects[effectKey]) * building.count;
              
              // Обновляем максимальное значение
              resource.max += buildingBonus;
              
              // Обновляем ресурс в состоянии
              newState.resources[resourceId] = resource;
            }
          }
          
          // Проверяем прямые эффекты для knowledge
          if (effectKey === 'knowledgeMaxBoost' && newState.resources.knowledge && newState.resources.knowledge.unlocked) {
            const resource = { ...newState.resources.knowledge };
            const buildingBonus = Number(building.effects[effectKey]) * building.count;
            
            resource.max += buildingBonus;
            newState.resources.knowledge = resource;
          }
        }
      }
    }
    
    // Применяем бонусы от улучшений к максимальным значениям
    for (const upgradeId in newState.upgrades) {
      const upgrade = newState.upgrades[upgradeId];
      
      // Пропускаем не приобретенные улучшения
      if (!upgrade.purchased) continue;
      
      // Применяем эффекты улучшения
      if (upgrade.effects) {
        for (const effectKey in upgrade.effects) {
          // Проверяем, относится ли эффект к максимуму ресурса
          if (effectKey.includes('max') && effectKey.includes('Boost')) {
            const resourcePart = effectKey.replace('max', '').replace('Boost', '').toLowerCase();
            const resourceId = this.normalizeResourceId(resourcePart);
            
            if (newState.resources[resourceId] && newState.resources[resourceId].unlocked) {
              // Текущий максимум ресурса
              const resource = { ...newState.resources[resourceId] };
              const effectValue = Number(upgrade.effects[effectKey]);
              
              // Если эффект процентный (>= 1.0)
              if (effectValue >= 1.0) {
                resource.max = Math.floor(resource.max * effectValue);
              } else {
                // Абсолютное значение
                resource.max += effectValue;
              }
              
              // Обновляем ресурс в состоянии
              newState.resources[resourceId] = resource;
            }
          }
          
          // Явная проверка для максимума знаний
          if (effectKey === 'knowledgeMaxBoost' && newState.resources.knowledge && newState.resources.knowledge.unlocked) {
            const resource = { ...newState.resources.knowledge };
            const effectValue = Number(upgrade.effects[effectKey]);
            
            // Если эффект процентный (>= 1.0)
            if (effectValue >= 1.0) {
              resource.max = Math.floor(resource.max * effectValue);
            } else {
              // Абсолютное значение
              resource.max += effectValue;
            }
            
            newState.resources.knowledge = resource;
          }
        }
      }
    }
    
    // Сохраняем результат в кэш
    this.resourceCache.set(cacheKey, newState);
    
    return newState;
  }
  
  /**
   * Нормализует ID ресурса из названия эффекта
   */
  private normalizeResourceId(resourcePart: string): string {
    // Маппинг для преобразования частей эффектов в корректные ID ресурсов
    const resourceIdMap: Record<string, string> = {
      'knowledge': 'knowledge',
      'usdt': 'usdt',
      'bitcoin': 'bitcoin',
      'electricity': 'electricity',
      'computingpower': 'computingPower',
      'computing': 'computingPower'
    };
    
    return resourceIdMap[resourcePart] || resourcePart;
  }
  
  /**
   * Проверяет достаточно ли ресурсов для покупки
   */
  public checkAffordability(state: GameState, cost: Record<string, number>): boolean {
    // Проверяем каждый ресурс в стоимости
    for (const resourceId in cost) {
      const requiredAmount = cost[resourceId];
      const resource = state.resources[resourceId];
      
      // Если ресурс не существует, не разблокирован или недостаточно его количества
      if (!resource || !resource.unlocked || resource.value < requiredAmount) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Возвращает список недостающих ресурсов
   */
  public getMissingResources(state: GameState, cost: Record<string, number>): Record<string, number> {
    const missingResources: Record<string, number> = {};
    
    // Проверяем каждый ресурс в стоимости
    for (const resourceId in cost) {
      const requiredAmount = cost[resourceId];
      const resource = state.resources[resourceId];
      
      // Если ресурс не существует, не разблокирован или его недостаточно
      if (!resource || !resource.unlocked) {
        missingResources[resourceId] = requiredAmount;
      } else if (resource.value < requiredAmount) {
        missingResources[resourceId] = requiredAmount - resource.value;
      }
    }
    
    return missingResources;
  }

  /**
   * Инкрементирует значение ресурса
   */
  public incrementResource(state: GameState, payload: { resourceId: string; amount?: number }): GameState {
    const { resourceId, amount = 1 } = payload;
    const newState = { ...state, resources: { ...state.resources } };
    
    // Проверяем, существует ли ресурс
    if (!newState.resources[resourceId]) {
      return state;
    }
    
    // Получаем текущий ресурс
    const resource = { ...newState.resources[resourceId] };
    
    // Если ресурс не разблокирован, ничего не делаем
    if (!resource.unlocked) {
      return state;
    }
    
    // Обновляем значение ресурса, не превышая максимум
    let newValue = (resource.value || 0) + amount;
    
    // Если есть максимальное значение, ограничиваем им
    if (resource.max !== undefined && resource.max !== Infinity) {
      newValue = Math.min(newValue, resource.max);
    }
    
    // Обновляем значение ресурса
    newState.resources[resourceId] = {
      ...resource,
      value: newValue
    };
    
    return newState;
  }

  /**
   * Разблокирует ресурс
   */
  public unlockResource(state: GameState, payload: { resourceId: string }): GameState {
    const { resourceId } = payload;
    const newState = { ...state, resources: { ...state.resources } };
    
    // Проверяем, существует ли ресурс
    if (!newState.resources[resourceId]) {
      return state;
    }
    
    // Получаем текущий ресурс
    const resource = { ...newState.resources[resourceId] };
    
    // Если ресурс уже разблокирован, ничего не делаем
    if (resource.unlocked) {
      return state;
    }
    
    // Разблокируем ресурс
    newState.resources[resourceId] = {
      ...resource,
      unlocked: true
    };
    
    return newState;
  }

  /**
   * Обновляет производство и потребление ресурсов на основе зданий
   */
  public updateProductionConsumption(state: GameState): GameState {
    // Проверяем кэш для избежания лишних пересчетов
    const buildingKey = JSON.stringify(Object.entries(state.buildings)
      .filter(([_, b]) => b.count > 0)
      .map(([id, b]) => ({ id, count: b.count })));
    
    const cacheKey = `prodCons_${buildingKey}`;
    if (this.resourceCache.has(cacheKey)) {
      return this.resourceCache.get(cacheKey);
    }
    
    const newState = { ...state, resources: { ...state.resources } };
    
    // Сбрасываем значения производства и потребления
    for (const resourceId in newState.resources) {
      if (newState.resources[resourceId].unlocked) {
        newState.resources[resourceId] = {
          ...newState.resources[resourceId],
          production: 0,
          consumption: 0
        };
      }
    }
    
    // Рассчитываем производство от зданий
    for (const buildingId in newState.buildings) {
      const building = newState.buildings[buildingId];
      
      if (building.count > 0) {
        // Учитываем производство ресурсов
        if (building.production) {
          for (const resourceId in building.production) {
            if (newState.resources[resourceId] && newState.resources[resourceId].unlocked) {
              const production = newState.resources[resourceId].production || 0;
              const buildingProduction = Number(building.production[resourceId]) * building.count;
              
              newState.resources[resourceId] = {
                ...newState.resources[resourceId],
                production: production + buildingProduction
              };
            }
          }
        }
        
        // Учитываем потребление ресурсов
        if (building.consumption) {
          for (const resourceId in building.consumption) {
            if (newState.resources[resourceId] && newState.resources[resourceId].unlocked) {
              const consumption = newState.resources[resourceId].consumption || 0;
              const buildingConsumption = Number(building.consumption[resourceId]) * building.count;
              
              newState.resources[resourceId] = {
                ...newState.resources[resourceId],
                consumption: consumption + buildingConsumption
              };
            }
          }
        }
      }
    }
    
    // Рассчитываем perSecond для всех ресурсов
    for (const resourceId in newState.resources) {
      if (newState.resources[resourceId].unlocked) {
        const resource = newState.resources[resourceId];
        const production = resource.production || 0;
        const consumption = resource.consumption || 0;
        const perSecond = production - consumption;
        
        newState.resources[resourceId] = {
          ...resource,
          perSecond: perSecond
        };
      }
    }
    
    // Сохраняем результат в кэш
    this.resourceCache.set(cacheKey, newState);
    
    return newState;
  }
}
