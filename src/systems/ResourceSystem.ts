
import { GameState, Resource, Building, Upgrade, ResourceType } from '@/context/types';

/**
 * Система управления ресурсами
 */
export class ResourceSystem {
  // Кэш для расчетов, чтобы избежать повторных вычислений
  private cache = {
    maxValues: new Map<string, number>(),
    productionRates: new Map<string, number>(),
    consumptionRates: new Map<string, number>(),
    lastState: null as GameState | null,
    cacheExpiry: 0
  };
  
  /**
   * Обновляет ресурсы на основе прошедшего времени
   * @param state Игровое состояние
   * @param deltaTime Прошедшее время в миллисекундах
   * @returns Обновленное состояние
   */
  public updateResources(state: GameState, deltaTime: number): GameState {
    try {
      // Создаем глубокую копию состояния для безопасного обновления
      const newState = {
        ...state,
        resources: { ...state.resources }
      };
      
      // Очень маленькие deltaTime могут привести к ошибкам округления, пропускаем
      if (deltaTime < 1) return newState;
      
      // Пакетная обработка ресурсов для повышения производительности
      const resourcesNeedingUpdate: string[] = [];
      
      // Сначала определяем ресурсы, которые нужно обновить
      for (const resourceId in newState.resources) {
        if (newState.resources.hasOwnProperty(resourceId)) {
          const resource = newState.resources[resourceId];
          
          // Пропускаем не разблокированные ресурсы
          if (!resource.unlocked) continue;
          
          // Получаем текущие значения или устанавливаем 0, если не определены
          const perSecond = resource.perSecond ?? 0;
          
          // Пропускаем ресурсы без производства/потребления
          if (perSecond === 0) continue;
          
          resourcesNeedingUpdate.push(resourceId);
        }
      }
      
      // Затем обновляем только необходимые ресурсы
      for (const resourceId of resourcesNeedingUpdate) {
        const resource = { ...newState.resources[resourceId] };
        const currentValue = resource.value ?? 0;
        const perSecond = resource.perSecond ?? 0;
        
        // Рассчитываем прирост ресурса за прошедшее время (в секундах)
        const increment = (perSecond * deltaTime) / 1000;
        
        // Обновляем значение ресурса, не превышая максимум
        let newValue = currentValue + increment;
        
        // Если есть максимальное значение, ограничиваем им
        if (resource.max !== undefined && resource.max !== null && resource.max !== Infinity) {
          newValue = Math.min(newValue, resource.max);
        }
        
        // Отладочная информация для значительных изменений
        if (Math.abs(increment) > 0.1 && Math.random() < 0.01) {
          console.log(`[ResourceDebug] Обновление ${resourceId}: ${currentValue.toFixed(2)} -> ${newValue.toFixed(2)}, прирост: ${increment.toFixed(2)}, perSecond: ${perSecond.toFixed(2)}`);
        }
        
        // Обновляем значение ресурса в состоянии
        newState.resources[resourceId] = {
          ...resource,
          value: newValue
        };
      }
      
      return newState;
    } catch (error) {
      console.error('[ResourceSystem] Ошибка при обновлении ресурсов:', error);
      // Возвращаем исходное состояние в случае ошибки
      return state;
    }
  }
  
  /**
   * Обновляет максимальные значения ресурсов на основе построенных зданий
   */
  public updateResourceMaxValues(state: GameState): GameState {
    try {
      // Используем кэш, если состояние не изменилось существенно
      if (this.cache.lastState === state && Date.now() < this.cache.cacheExpiry) {
        // Применяем кэшированные значения
        const newState = { ...state, resources: { ...state.resources } };
        
        for (const [resourceId, maxValue] of this.cache.maxValues.entries()) {
          if (newState.resources[resourceId] && newState.resources[resourceId].unlocked) {
            newState.resources[resourceId] = {
              ...newState.resources[resourceId],
              max: maxValue
            };
          }
        }
        
        return newState;
      }
      
      // Создаем новое состояние
      const newState = { ...state, resources: { ...state.resources } };
      
      // Очищаем кэш максимальных значений
      this.cache.maxValues.clear();
      
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
          
          // Кэшируем базовое значение
          this.cache.maxValues.set(resourceId, baseMaxValues[resourceId]);
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
                
                // Обновляем кэш
                this.cache.maxValues.set(resourceId, resource.max);
              }
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
                
                // Обновляем кэш
                this.cache.maxValues.set(resourceId, resource.max);
              }
            }
          }
        }
      }
      
      // Обновляем кэш
      this.cache.lastState = newState;
      this.cache.cacheExpiry = Date.now() + 5000; // Кэш действителен 5 секунд
      
      return newState;
    } catch (error) {
      console.error('[ResourceSystem] Ошибка при обновлении максимальных значений ресурсов:', error);
      return state;
    }
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
    try {
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
    } catch (error) {
      console.error('[ResourceSystem] Ошибка при проверке доступности ресурсов:', error);
      return false;
    }
  }
  
  /**
   * Возвращает список недостающих ресурсов
   */
  public getMissingResources(state: GameState, cost: Record<string, number>): Record<string, number> {
    try {
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
    } catch (error) {
      console.error('[ResourceSystem] Ошибка при получении недостающих ресурсов:', error);
      return {};
    }
  }

  /**
   * Инкрементирует значение ресурса
   */
  public incrementResource(state: GameState, payload: { resourceId: string; amount?: number }): GameState {
    try {
      const { resourceId, amount = 1 } = payload;
      const newState = { ...state, resources: { ...state.resources } };
      
      // Проверяем, существует ли ресурс
      if (!newState.resources[resourceId]) {
        console.warn(`Попытка инкрементировать несуществующий ресурс: ${resourceId}`);
        return state;
      }
      
      // Получаем текущий ресурс
      const resource = { ...newState.resources[resourceId] };
      
      // Если ресурс не разблокирован, ничего не делаем
      if (!resource.unlocked) {
        console.warn(`Попытка инкрементировать заблокированный ресурс: ${resourceId}`);
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
    } catch (error) {
      console.error('[ResourceSystem] Ошибка при инкременте ресурса:', error);
      return state;
    }
  }

  /**
   * Разблокирует ресурс
   */
  public unlockResource(state: GameState, payload: { resourceId: string }): GameState {
    try {
      const { resourceId } = payload;
      const newState = { ...state, resources: { ...state.resources } };
      
      // Проверяем, существует ли ресурс
      if (!newState.resources[resourceId]) {
        console.warn(`Попытка разблокировать несуществующий ресурс: ${resourceId}`);
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
    } catch (error) {
      console.error('[ResourceSystem] Ошибка при разблокировке ресурса:', error);
      return state;
    }
  }

  /**
   * Обновляет производство и потребление ресурсов на основе зданий
   * Оптимизированная версия с кэшированием
   */
  public updateProductionConsumption(state: GameState): GameState {
    try {
      // Используем кэш, если состояние не изменилось существенно
      if (this.cache.lastState === state && Date.now() < this.cache.cacheExpiry) {
        // Применяем кэшированные значения
        const newState = { ...state, resources: { ...state.resources } };
        
        for (const resourceId in newState.resources) {
          if (newState.resources[resourceId].unlocked) {
            const production = this.cache.productionRates.get(resourceId) || 0;
            const consumption = this.cache.consumptionRates.get(resourceId) || 0;
            
            newState.resources[resourceId] = {
              ...newState.resources[resourceId],
              production,
              consumption,
              perSecond: production - consumption
            };
          }
        }
        
        return newState;
      }
      
      const newState = { ...state, resources: { ...state.resources } };
      
      // Очищаем кэш производства и потребления
      this.cache.productionRates.clear();
      this.cache.consumptionRates.clear();
      
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
      
      // Создаем временные хранилища для суммирования
      const totalProduction: Record<string, number> = {};
      const totalConsumption: Record<string, number> = {};
      
      // Рассчитываем производство от зданий
      for (const buildingId in newState.buildings) {
        const building = newState.buildings[buildingId];
        
        if (building.count > 0) {
          // Учитываем производство ресурсов
          if (building.production) {
            for (const resourceId in building.production) {
              if (newState.resources[resourceId] && newState.resources[resourceId].unlocked) {
                // Инициализируем, если необходимо
                if (!totalProduction[resourceId]) totalProduction[resourceId] = 0;
                
                const buildingProduction = Number(building.production[resourceId]) * building.count;
                totalProduction[resourceId] += buildingProduction;
                
                // Добавляем отладочную информацию редко
                if (Math.random() < 0.005) {
                  console.log(`[Production] Здание ${buildingId} (${building.count}x) производит ${buildingProduction.toFixed(2)} ${resourceId}`);
                }
              }
            }
          }
          
          // Учитываем потребление ресурсов
          if (building.consumption) {
            for (const resourceId in building.consumption) {
              if (newState.resources[resourceId] && newState.resources[resourceId].unlocked) {
                // Инициализируем, если необходимо
                if (!totalConsumption[resourceId]) totalConsumption[resourceId] = 0;
                
                const buildingConsumption = Number(building.consumption[resourceId]) * building.count;
                totalConsumption[resourceId] += buildingConsumption;
                
                // Добавляем отладочную информацию редко
                if (Math.random() < 0.005) {
                  console.log(`[Consumption] Здание ${buildingId} (${building.count}x) потребляет ${buildingConsumption.toFixed(2)} ${resourceId}`);
                }
              }
            }
          }
        }
      }
      
      // Обновляем ресурсы на основе рассчитанных значений
      for (const resourceId in newState.resources) {
        if (newState.resources[resourceId].unlocked) {
          const production = totalProduction[resourceId] || 0;
          const consumption = totalConsumption[resourceId] || 0;
          const perSecond = production - consumption;
          
          // Кэшируем значения
          this.cache.productionRates.set(resourceId, production);
          this.cache.consumptionRates.set(resourceId, consumption);
          
          newState.resources[resourceId] = {
            ...newState.resources[resourceId],
            production,
            consumption,
            perSecond
          };
          
          // Добавляем отладочную информацию редко
          if (Math.abs(perSecond) > 0.01 && Math.random() < 0.01) {
            console.log(`[perSecond] Ресурс ${resourceId}: +${production.toFixed(2)}/сек, -${consumption.toFixed(2)}/сек = ${perSecond.toFixed(2)}/сек`);
          }
        }
      }
      
      // Обновляем кэш
      this.cache.lastState = newState;
      this.cache.cacheExpiry = Date.now() + 2000; // Кэш действителен 2 секунды
      
      return newState;
    } catch (error) {
      console.error('[ResourceSystem] Ошибка при обновлении производства и потребления:', error);
      return state;
    }
  }
}
