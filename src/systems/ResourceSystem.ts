
import { GameState, Resource } from '@/context/types';
import { checkAllUnlocks } from '@/utils/unlockManager';

export class ResourceSystem {
  private cache: Map<string, any> = new Map();
  private lastUpdateTimestamp: number = 0;

  /**
   * Обновляет ресурсы на основе прошедшего времени
   * @param state Текущее состояние игры
   * @param deltaTime Прошедшее время в миллисекундах
   * @returns Обновленное состояние игры
   */
  public updateResources(state: GameState, deltaTime: number): GameState {
    // Валидация кэша
    this.validateCache(state);

    // Создаем копию состояния для обновления
    const newState = { ...state };
    const resources = { ...state.resources };

    // Обновляем значения ресурсов на основе прошедшего времени
    for (const resourceId in resources) {
      const resource = resources[resourceId];
      
      if (resource.unlocked && resource.perSecond !== 0) {
        const increment = resource.perSecond * (deltaTime / 1000);
        const newValue = Math.max(0, resource.value + increment); // Предотвращаем отрицательные значения
        
        resources[resourceId] = {
          ...resource,
          value: resource.max > 0 ? Math.min(newValue, resource.max) : newValue
        };
      }
    }

    newState.resources = resources;

    // Возвращаем обновленное состояние
    return newState;
  }

  /**
   * Инкрементирует значение ресурса
   * @param state Текущее состояние игры
   * @param payload Параметры инкремента (resourceId, amount)
   * @returns Обновленное состояние игры
   */
  public incrementResource(state: GameState, payload: { resourceId: string; amount?: number }): GameState {
    const { resourceId, amount = 1 } = payload;
    const resource = state.resources[resourceId];

    // Проверяем, что ресурс существует и разблокирован
    if (!resource || !resource.unlocked) {
      console.error(`Попытка увеличить неразблокированный ресурс: ${resourceId}`);
      return state;
    }

    // Создаем копию состояния
    const newState = { ...state };
    const resources = { ...state.resources };

    // Рассчитываем новое значение с учетом максимума
    const newValue = resource.value + amount;
    resources[resourceId] = {
      ...resource,
      value: resource.max > 0 ? Math.min(newValue, resource.max) : newValue
    };

    newState.resources = resources;
    
    // Возвращаем обновленное состояние
    return newState;
  }

  /**
   * Разблокирует ресурс
   * @param state Текущее состояние игры
   * @param payload Параметры разблокировки (resourceId)
   * @returns Обновленное состояние игры
   */
  public unlockResource(state: GameState, payload: { resourceId: string }): GameState {
    const { resourceId } = payload;
    const resource = state.resources[resourceId];

    // Проверяем, что ресурс существует
    if (!resource) {
      console.error(`Попытка разблокировать несуществующий ресурс: ${resourceId}`);
      return state;
    }

    // Если ресурс уже разблокирован, ничего не делаем
    if (resource.unlocked) {
      return state;
    }

    // Создаем копию состояния
    const newState = { ...state };
    const resources = { ...state.resources };

    // Разблокируем ресурс
    resources[resourceId] = {
      ...resource,
      unlocked: true
    };

    newState.resources = resources;

    // Возвращаем обновленное состояние с проверкой разблокировок
    return checkAllUnlocks(newState);
  }

  /**
   * Проверяет, достаточно ли ресурсов для покупки
   * @param state Текущее состояние игры
   * @param cost Стоимость покупки
   * @returns true, если ресурсов достаточно
   */
  public checkAffordability(state: GameState, cost: Record<string, number>): boolean {
    // Проверка валидности стоимости
    if (!cost || typeof cost !== 'object' || Object.keys(cost).length === 0) {
      console.error('Некорректная стоимость', cost);
      return false;
    }

    // Проверяем каждый ресурс в стоимости
    for (const [resourceId, amount] of Object.entries(cost)) {
      const resource = state.resources[resourceId];
      
      // Проверяем, что ресурс существует, разблокирован и его достаточно
      if (!resource || !resource.unlocked || resource.value < Number(amount)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Возвращает список недостающих ресурсов
   * @param state Текущее состояние игры
   * @param cost Стоимость покупки
   * @returns Объект с недостающими ресурсами
   */
  public getMissingResources(state: GameState, cost: Record<string, number>): Record<string, number> {
    const missingResources: Record<string, number> = {};

    // Проверка валидности стоимости
    if (!cost || typeof cost !== 'object' || Object.keys(cost).length === 0) {
      console.error('Некорректная стоимость', cost);
      return missingResources;
    }

    // Проверяем каждый ресурс в стоимости
    for (const [resourceId, amount] of Object.entries(cost)) {
      const resource = state.resources[resourceId];
      
      // Если ресурс не существует, не разблокирован или его недостаточно
      if (!resource || !resource.unlocked || resource.value < Number(amount)) {
        // Если ресурс разблокирован, вычисляем недостающее количество
        if (resource && resource.unlocked) {
          missingResources[resourceId] = Number(amount) - resource.value;
        } else {
          // Если ресурс не разблокирован, указываем полную стоимость
          missingResources[resourceId] = Number(amount);
        }
      }
    }

    return missingResources;
  }

  /**
   * Обновляет максимальные значения ресурсов
   * @param state Текущее состояние игры
   * @returns Обновленное состояние игры
   */
  public updateResourceMaxValues(state: GameState): GameState {
    // Создаем копию состояния
    const newState = { ...state };
    const resources = { ...state.resources };

    // Базовые максимальные значения
    const baseMaxValues: Record<string, number> = {
      knowledge: 100,
      usdt: 100,
      electricity: 100,
      computingPower: 50,
      bitcoin: 1
    };

    // Обновляем максимальные значения для каждого ресурса
    for (const resourceId in resources) {
      const resource = resources[resourceId];
      let maxValue = baseMaxValues[resourceId] || 100;

      // Применяем модификаторы от зданий
      for (const buildingId in state.buildings) {
        const building = state.buildings[buildingId];
        
        // Проверяем, что здание построено и влияет на максимум ресурса
        if (building.count > 0 && building.effects && building.effects.maxResources) {
          const maxModifier = building.effects.maxResources[resourceId];
          
          if (maxModifier) {
            // Применяем множитель к максимальному значению для каждого построенного здания
            maxValue += maxModifier * building.count;
          }
        }
      }

      // Применяем модификаторы от исследований
      for (const upgradeId in state.upgrades) {
        const upgrade = state.upgrades[upgradeId];
        
        // Проверяем, что исследование куплено и влияет на максимум ресурса
        if (upgrade.purchased && upgrade.effects && upgrade.effects.maxResources) {
          const maxModifier = upgrade.effects.maxResources[resourceId];
          
          if (maxModifier) {
            // Применяем множитель к максимальному значению
            if (typeof maxModifier === 'number') {
              maxValue += maxModifier;
            } else if (typeof maxModifier === 'string' && maxModifier.endsWith('%')) {
              // Процентное увеличение
              const percent = parseFloat(maxModifier) / 100;
              maxValue *= (1 + percent);
            }
          }
        }
      }

      // Обновляем максимальное значение ресурса
      resources[resourceId] = {
        ...resource,
        max: Math.floor(maxValue)
      };
    }

    newState.resources = resources;
    
    // Возвращаем обновленное состояние
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
   * Проверяет актуальность кэша
   * @param state Текущее состояние игры
   */
  private validateCache(state: GameState): void {
    if (state.lastUpdate > this.lastUpdateTimestamp) {
      this.clearCache();
      this.lastUpdateTimestamp = state.lastUpdate;
    }
  }
}
