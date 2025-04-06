
import { GameState, Resource, Building } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { checkAllUnlocks } from '@/utils/unlockManager';

/**
 * Унифицированная система управления ресурсами
 */
export class ResourceSystem {
  private cache: Map<string, any> = new Map();
  private lastUpdateTimestamp: number = 0;

  /**
   * Обновляет ресурсы на основе прошедшего времени
   */
  public updateResources(state: GameState, deltaTime: number): GameState {
    // Проверяем валидность кэша
    this.validateCache(state);

    // Создаем копии состояния и ресурсов
    const newState = { ...state };
    const resources = { ...newState.resources };

    // Для каждого ресурса применяем изменения
    for (const resourceId in resources) {
      const resource = resources[resourceId];
      
      if (resource.unlocked && resource.perSecond !== 0) {
        // Рассчитываем прирост на основе deltaTime (в миллисекундах)
        const increment = resource.perSecond * (deltaTime / 1000);
        let newValue = resource.value + increment;
        
        // Применяем максимальное значение, если оно есть
        if (resource.max > 0) {
          newValue = Math.min(newValue, resource.max);
        }
        
        // Обновляем значение ресурса
        resources[resourceId] = {
          ...resource,
          value: newValue
        };
      }
    }
    
    // Устанавливаем обновленные ресурсы
    newState.resources = resources;
    
    return newState;
  }

  /**
   * Обновляет максимальные значения ресурсов
   */
  public updateResourceMaxValues(state: GameState): GameState {
    const newState = { ...state };
    const resources = { ...newState.resources };
    
    // Базовые максимальные значения
    const baseMaxValues: Record<string, number> = {
      knowledge: 100,
      usdt: 100,
      electricity: 50,
      computingPower: 50,
      bitcoin: 1
    };
    
    // Модификаторы от зданий
    for (const buildingId in newState.buildings) {
      const building = newState.buildings[buildingId];
      
      if (building.count > 0 && building.effects && building.effects.maxResources) {
        // Используем приведение типов для безопасного доступа к maxResources
        const maxResourcesEffect = building.effects.maxResources as Record<string, number>;
        
        for (const [resourceId, bonus] of Object.entries(maxResourcesEffect)) {
          if (resources[resourceId]) {
            const currentMax = baseMaxValues[resourceId] || 0;
            baseMaxValues[resourceId] = currentMax + (bonus as number) * building.count;
          }
        }
      }
    }
    
    // Модификаторы от исследований
    for (const upgradeId in newState.upgrades) {
      const upgrade = newState.upgrades[upgradeId];
      
      if (upgrade.purchased && upgrade.effects && upgrade.effects.maxResources) {
        const maxResourcesEffect = upgrade.effects.maxResources as Record<string, number>;
        
        for (const [resourceId, bonus] of Object.entries(maxResourcesEffect)) {
          if (resources[resourceId]) {
            // Применяем процентный бонус
            const baseMax = baseMaxValues[resourceId] || 0;
            const bonusAmount = baseMax * (Number(bonus) / 100);
            baseMaxValues[resourceId] = baseMax + bonusAmount;
          }
        }
      }
    }
    
    // Устанавливаем обновленные максимальные значения
    for (const resourceId in resources) {
      if (baseMaxValues[resourceId] !== undefined) {
        resources[resourceId] = {
          ...resources[resourceId],
          max: Math.max(1, Math.floor(baseMaxValues[resourceId]))
        };
      }
    }
    
    // Обновляем состояние
    newState.resources = resources;
    return newState;
  }

  /**
   * Проверяет доступность ресурсов для покупки
   */
  public checkAffordability(state: GameState, cost: Record<string, number>): boolean {
    if (!cost) return true;
    
    for (const [resourceId, amount] of Object.entries(cost)) {
      const resource = state.resources[resourceId];
      
      // Проверяем наличие ресурса и достаточное количество
      if (!resource || resource.value < Number(amount)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Получает список недостающих ресурсов
   */
  public getMissingResources(state: GameState, cost: Record<string, number>): Record<string, number> {
    const missing: Record<string, number> = {};
    
    if (!cost) return missing;
    
    for (const [resourceId, amount] of Object.entries(cost)) {
      const resource = state.resources[resourceId];
      
      // Если ресурса нет или его недостаточно
      if (!resource || resource.value < Number(amount)) {
        missing[resourceId] = Number(amount) - (resource?.value || 0);
      }
    }
    
    return missing;
  }

  /**
   * Увеличивает значение ресурса
   */
  public incrementResource(state: GameState, payload: { resourceId: string; amount?: number }): GameState {
    const { resourceId, amount = 1 } = payload;
    const resource = state.resources[resourceId];
    
    if (!resource) {
      console.error(`Ресурс с ID ${resourceId} не найден`);
      return state;
    }
    
    // Создаем копию состояния
    const newState = { ...state };
    const resources = { ...newState.resources };
    
    // Увеличиваем значение ресурса
    const newValue = resource.value + amount;
    
    // Применяем ограничение максимального значения
    resources[resourceId] = {
      ...resource,
      value: resource.max > 0 ? Math.min(newValue, resource.max) : newValue
    };
    
    // Обновляем состояние
    newState.resources = resources;
    
    return newState;
  }

  /**
   * Разблокирует ресурс
   */
  public unlockResource(state: GameState, payload: { resourceId: string }): GameState {
    const { resourceId } = payload;
    const resource = state.resources[resourceId];
    
    if (!resource) {
      console.error(`Ресурс с ID ${resourceId} не найден`);
      return state;
    }
    
    // Проверяем, что ресурс еще не разблокирован
    if (resource.unlocked) {
      console.log(`Ресурс ${resource.name} уже разблокирован`);
      return state;
    }
    
    // Создаем копию состояния
    const newState = { ...state };
    const resources = { ...newState.resources };
    
    // Разблокируем ресурс
    resources[resourceId] = {
      ...resource,
      unlocked: true
    };
    
    // Обновляем состояние
    newState.resources = resources;

    // Отправляем событие
    safeDispatchGameEvent({
      messageKey: 'event.resourceUnlocked',
      type: 'success',
      params: { name: resource.name }
    });
    
    return newState;
  }

  /**
   * Сбрасывает кэш
   */
  public clearCache(): void {
    this.cache.clear();
    this.lastUpdateTimestamp = Date.now();
  }

  /**
   * Проверяет валидность кэша
   */
  private validateCache(state: GameState): void {
    if (state.lastUpdate > this.lastUpdateTimestamp) {
      this.clearCache();
      this.lastUpdateTimestamp = state.lastUpdate;
    }
  }
}
