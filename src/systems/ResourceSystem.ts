
import { GameState, Resource } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Унифицированная система управления ресурсами
 */
export class ResourceSystem {
  private cache: Map<string, any> = new Map();
  private lastUpdateTimestamp: number = 0;

  /**
   * Обновляет ресурсы на основе прошедшего времени
   * @param state Текущее состояние игры
   * @param deltaTime Прошедшее время в миллисекундах
   * @returns Обновленное состояние
   */
  public updateResources(state: GameState, deltaTime: number): GameState {
    // Валидация и обновление кэша
    this.validateCache(state);
    
    // Копируем состояние для безопасного обновления
    let newState = { ...state };
    const resources = { ...state.resources };
    
    // Рассчитываем производство и потребление для каждого ресурса
    const resourceRates = this.calculateResourceRates(state);
    
    // Обновляем значения ресурсов на основе прошедшего времени и их производства
    for (const resourceId in resources) {
      const resource = resources[resourceId];
      
      if (resource.unlocked && resourceRates[resourceId]) {
        const perSecond = resourceRates[resourceId].production - resourceRates[resourceId].consumption;
        
        // Обновляем perSecond в ресурсе
        resources[resourceId] = {
          ...resource,
          production: resourceRates[resourceId].production,
          consumption: resourceRates[resourceId].consumption,
          perSecond: perSecond
        };
        
        if (perSecond !== 0) {
          // Рассчитываем новое значение с учетом производства в секунду и прошедшего времени
          const increment = perSecond * (deltaTime / 1000);
          const newValue = resource.value + increment;
          
          // Проверяем, не было ли ресурса раньше и не заполнился ли он сейчас
          const wasFull = resource.value >= resource.max && resource.max > 0;
          const willBeFull = newValue >= resource.max && resource.max > 0;
          
          // Обновляем значение ресурса, не превышая максимум
          resources[resourceId] = {
            ...resources[resourceId],
            value: resource.max > 0 ? Math.min(newValue, resource.max) : newValue
          };
          
          // Генерируем события при необходимости
          if (!wasFull && willBeFull) {
            this.emitResourceFull(resourceId, resource.name);
          }
        }
      }
    }
    
    newState.resources = resources;
    return newState;
  }

  /**
   * Рассчитывает производство и потребление для всех ресурсов
   * @param state Текущее состояние игры
   * @returns Объект с производством и потреблением для каждого ресурса
   */
  private calculateResourceRates(state: GameState): Record<string, { production: number, consumption: number }> {
    const cacheKey = `resource_rates_${state.lastUpdate}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const resourceRates: Record<string, { production: number, consumption: number }> = {};
    
    // Инициализируем ставки для всех ресурсов
    for (const resourceId in state.resources) {
      resourceRates[resourceId] = { 
        production: state.resources[resourceId].baseProduction || 0, 
        consumption: 0 
      };
    }
    
    // Рассчитываем производство и потребление от зданий
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      if (building.count > 0) {
        // Учитываем производство
        if (building.production) {
          for (const resourceId in building.production) {
            if (!resourceRates[resourceId]) {
              resourceRates[resourceId] = { production: 0, consumption: 0 };
            }
            resourceRates[resourceId].production += building.production[resourceId] * building.count;
          }
        }
        
        // Учитываем потребление
        if (building.consumption) {
          for (const resourceId in building.consumption) {
            if (!resourceRates[resourceId]) {
              resourceRates[resourceId] = { production: 0, consumption: 0 };
            }
            resourceRates[resourceId].consumption += building.consumption[resourceId] * building.count;
          }
        }
      }
    }
    
    // Применяем модификаторы от улучшений
    for (const upgradeId in state.upgrades) {
      const upgrade = state.upgrades[upgradeId];
      if (upgrade.purchased && upgrade.effects) {
        // Бонусы к производству
        if (upgrade.effects.productionBoost) {
          for (const resourceId in upgrade.effects.productionBoost) {
            if (resourceRates[resourceId]) {
              const boost = upgrade.effects.productionBoost[resourceId];
              resourceRates[resourceId].production *= (1 + boost);
            }
          }
        }
        
        // Уменьшение потребления
        if (upgrade.effects.consumptionReduction) {
          for (const resourceId in upgrade.effects.consumptionReduction) {
            if (resourceRates[resourceId]) {
              const reduction = upgrade.effects.consumptionReduction[resourceId];
              resourceRates[resourceId].consumption *= (1 - reduction);
            }
          }
        }
      }
    }
    
    this.cache.set(cacheKey, resourceRates);
    return resourceRates;
  }

  /**
   * Обновляет максимальные значения ресурсов на основе зданий и улучшений
   * @param state Текущее состояние игры
   * @returns Обновленное состояние
   */
  public updateResourceMaxValues(state: GameState): GameState {
    const cacheKey = `resource_max_values_${state.lastUpdate}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Копируем состояние для безопасного обновления
    let newState = { ...state };
    const resources = { ...state.resources };
    
    // Базовые максимальные значения
    const baseMaxValues = {
      knowledge: 100,
      usdt: 50,
      electricity: 100,
      computingPower: 1000,
      bitcoin: 0.01
    };
    
    // Расчет бонусов к максимальным значениям
    const maxBoosts: Record<string, number> = {};
    for (const resourceId in baseMaxValues) {
      maxBoosts[resourceId] = 0;
    }
    
    // Бонусы от зданий
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      if (building.count > 0 && building.effects) {
        for (const resourceId in baseMaxValues) {
          const boostKey = `${resourceId}MaxBoost`;
          if (building.effects[boostKey]) {
            maxBoosts[resourceId] += Number(building.effects[boostKey]) * building.count;
          }
        }
      }
    }
    
    // Бонусы от улучшений
    for (const upgradeId in state.upgrades) {
      const upgrade = state.upgrades[upgradeId];
      if (upgrade.purchased && upgrade.effects) {
        for (const resourceId in baseMaxValues) {
          const boostKey = `${resourceId}MaxBoost`;
          if (upgrade.effects[boostKey]) {
            maxBoosts[resourceId] += Number(upgrade.effects[boostKey]);
          }
        }
      }
    }
    
    // Применяем бонусы к базовым значениям
    for (const resourceId in baseMaxValues) {
      if (resources[resourceId]) {
        // Для процентных бонусов (например, к knowledge)
        if (resourceId === 'knowledge') {
          resources[resourceId] = {
            ...resources[resourceId],
            max: baseMaxValues[resourceId] * (1 + maxBoosts[resourceId])
          };
        } 
        // Для фиксированных бонусов (например, к usdt)
        else {
          resources[resourceId] = {
            ...resources[resourceId],
            max: baseMaxValues[resourceId] + maxBoosts[resourceId]
          };
        }
      }
    }
    
    newState.resources = resources;
    this.cache.set(cacheKey, newState);
    return newState;
  }

  /**
   * Проверяет, достаточно ли ресурсов для покупки
   * @param state Текущее состояние игры
   * @param cost Стоимость покупки
   * @returns true, если ресурсов достаточно
   */
  public checkAffordability(state: GameState, cost: Record<string, number>): boolean {
    // Проверка на пустой или некорректный объект стоимости
    if (!cost || typeof cost !== 'object' || Object.keys(cost).length === 0) {
      return false;
    }
    
    // Проверяем каждый ресурс
    for (const [resourceId, amount] of Object.entries(cost)) {
      // Дополнительная проверка на валидность значения
      if (amount === undefined || amount === null || isNaN(Number(amount))) {
        continue; // Пропускаем невалидные значения
      }
      
      const resource = state.resources[resourceId];
      if (!resource || resource.value < Number(amount)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Возвращает список недостающих ресурсов
   * @param state Текущее состояние игры
   * @param cost Стоимость покупки
   * @returns Объект с недостающими ресурсами и их количеством
   */
  public getMissingResources(state: GameState, cost: Record<string, number>): Record<string, number> {
    const missingResources: Record<string, number> = {};
    
    // Проверка на пустой или некорректный объект стоимости
    if (!cost || typeof cost !== 'object' || Object.keys(cost).length === 0) {
      return missingResources;
    }
    
    // Проверяем каждый ресурс
    for (const [resourceId, amount] of Object.entries(cost)) {
      // Дополнительная проверка на валидность значения
      if (amount === undefined || amount === null || isNaN(Number(amount))) {
        continue; // Пропускаем невалидные значения
      }
      
      const resource = state.resources[resourceId];
      if (!resource) {
        missingResources[resourceId] = Number(amount);
      } else if (resource.value < Number(amount)) {
        missingResources[resourceId] = Number(amount) - resource.value;
      }
    }
    
    return missingResources;
  }

  /**
   * Сброс кэша
   */
  public clearCache(): void {
    this.cache.clear();
    this.lastUpdateTimestamp = Date.now();
  }

  /**
   * Валидация кэша
   * @param state Текущее состояние игры
   */
  private validateCache(state: GameState): void {
    if (state.lastUpdate > this.lastUpdateTimestamp) {
      this.clearCache();
      this.lastUpdateTimestamp = state.lastUpdate;
    }
  }

  /**
   * Генерирует событие о заполнении ресурса
   * @param resourceId ID ресурса
   * @param resourceName Название ресурса
   */
  private emitResourceFull(resourceId: string, resourceName: string): void {
    safeDispatchGameEvent({
      messageKey: 'event.resourceFull',
      type: 'info',
      params: { name: resourceName }
    });
  }

  /**
   * Обработка инкремента ресурса
   * @param state Текущее состояние игры
   * @param payload Объект с ID ресурса и количеством
   * @returns Обновленное состояние
   */
  public incrementResource(
    state: GameState, 
    payload: { resourceId: string; amount?: number }
  ): GameState {
    const { resourceId, amount = 1 } = payload;
    const resource = state.resources[resourceId];
    
    if (!resource) return state;
    
    return {
      ...state,
      resources: {
        ...state.resources,
        [resourceId]: {
          ...resource,
          value: Math.min(resource.value + amount, resource.max)
        }
      }
    };
  }

  /**
   * Разблокировка ресурса
   * @param state Текущее состояние игры
   * @param payload Объект с ID ресурса
   * @returns Обновленное состояние
   */
  public unlockResource(
    state: GameState, 
    payload: { resourceId: string }
  ): GameState {
    const { resourceId } = payload;
    const resource = state.resources[resourceId];
    
    if (!resource) return state;
    
    // Генерируем событие о разблокировке ресурса
    safeDispatchGameEvent({
      messageKey: 'event.resourceUnlocked',
      type: 'success',
      params: { name: resource.name }
    });
    
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
