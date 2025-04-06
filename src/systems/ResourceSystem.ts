
import { GameState, Resource, Building, Upgrade } from '@/context/types';

/**
 * Система управления ресурсами
 */
export class ResourceSystem {
  /**
   * Обновляет ресурсы на основе прошедшего времени
   * @param state Игровое состояние
   * @param deltaTime Прошедшее время в миллисекундах
   * @returns Обновленное состояние
   */
  public updateResources(state: GameState, deltaTime: number): GameState {
    // Создаем глубокую копию состояния для безопасного обновления
    const newState = {
      ...state,
      resources: { ...state.resources }
    };
    
    // Проверяем все ресурсы и обновляем их значения
    for (const resourceId in newState.resources) {
      if (newState.resources.hasOwnProperty(resourceId)) {
        const resource = { ...newState.resources[resourceId] };
        
        // Пропускаем не разблокированные ресурсы
        if (!resource.unlocked) continue;
        
        // Получаем текущие значения или устанавливаем 0, если не определены
        const currentValue = resource.value ?? 0;
        const perSecond = resource.perSecond ?? 0;
        
        // Пропускаем ресурсы без производства
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
        
        // Отладочная информация
        if (increment > 0) {
          console.log(`Ресурс ${resourceId}: ${currentValue.toFixed(2)} -> ${newValue.toFixed(2)} (+${increment.toFixed(4)})`);
        }
      }
    }
    
    // Обновляем lastUpdate для следующего цикла
    newState.lastUpdate = Date.now();
    
    return newState;
  }
  
  /**
   * Обновляет максимальные значения ресурсов на основе построенных зданий
   */
  public updateResourceMaxValues(state: GameState): GameState {
    const newState = { ...state, resources: { ...state.resources } };
    
    // Базовые значения максимумов
    const baseMaxValues: Record<string, number> = {
      knowledge: 100,
      usdt: 50,
      bitcoin: 1,
      electricity: 100,
      computingPower: 50
    };
    
    // Применяем базовые значения
    for (const resourceId in baseMaxValues) {
      if (newState.resources[resourceId] && newState.resources[resourceId].unlocked) {
        // Сохраняем текущее значение ресурса
        const resource = { ...newState.resources[resourceId] };
        
        // Устанавливаем базовое максимальное значение
        newState.resources[resourceId] = {
          ...resource,
          max: baseMaxValues[resourceId]
        };
      }
    }
    
    // Применяем бонусы от зданий к максимальным значениям
    for (const buildingId in newState.buildings) {
      const building = newState.buildings[buildingId];
      
      // Пропускаем не построенные здания
      if (!building.count || building.count <= 0) continue;
      
      // Получаем бонусы max ресурсов для здания, если они существуют
      const maxResourcesBonus = building.maxResourcesBonus as Record<string, number> | undefined;
      
      if (maxResourcesBonus) {
        for (const resourceId in maxResourcesBonus) {
          if (newState.resources[resourceId] && newState.resources[resourceId].unlocked) {
            // Текущий максимум ресурса
            const resource = { ...newState.resources[resourceId] };
            const currentMax = resource.max || baseMaxValues[resourceId] || 0;
            
            // Добавляем бонус от здания, умноженный на количество зданий
            const buildingBonus = maxResourcesBonus[resourceId] * building.count;
            const newMax = currentMax + buildingBonus;
            
            // Обновляем максимальное значение
            newState.resources[resourceId] = {
              ...resource,
              max: newMax
            };
          }
        }
      }
    }
    
    // Применяем бонусы от улучшений к максимальным значениям
    for (const upgradeId in newState.upgrades) {
      const upgrade = newState.upgrades[upgradeId];
      
      // Пропускаем не приобретенные улучшения
      if (!upgrade.purchased) continue;
      
      // Получаем бонусы max ресурсов для улучшения, если они существуют
      const maxResourcesBonus = upgrade.maxResourcesBonus as Record<string, number> | undefined;
      
      if (maxResourcesBonus) {
        for (const resourceId in maxResourcesBonus) {
          if (newState.resources[resourceId] && newState.resources[resourceId].unlocked) {
            // Текущий максимум ресурса
            const resource = { ...newState.resources[resourceId] };
            const currentMax = resource.max || baseMaxValues[resourceId] || 0;
            
            // Рассчитываем новый максимум
            let newMax: number;
            
            // Если бонус процентный (больше 1)
            if (maxResourcesBonus[resourceId] > 1) {
              newMax = currentMax * maxResourcesBonus[resourceId];
            } else {
              // Иначе считаем как абсолютное значение
              newMax = currentMax + maxResourcesBonus[resourceId];
            }
            
            // Обновляем максимальное значение
            newState.resources[resourceId] = {
              ...resource,
              max: newMax
            };
          }
        }
      }
    }
    
    return newState;
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
    const newState = { ...state };
    
    // Проверяем, существует ли ресурс
    if (!newState.resources[resourceId]) {
      console.warn(`Попытка инкрементировать несуществующий ресурс: ${resourceId}`);
      return state;
    }
    
    // Получаем текущий ресурс
    const resource = newState.resources[resourceId];
    
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
  }

  /**
   * Разблокирует ресурс
   */
  public unlockResource(state: GameState, payload: { resourceId: string }): GameState {
    const { resourceId } = payload;
    const newState = { ...state };
    
    // Проверяем, существует ли ресурс
    if (!newState.resources[resourceId]) {
      console.warn(`Попытка разблокировать несуществующий ресурс: ${resourceId}`);
      return state;
    }
    
    // Получаем текущий ресурс
    const resource = newState.resources[resourceId];
    
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
}
