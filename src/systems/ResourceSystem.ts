
import { GameState, Resource } from '@/context/types';

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
    // Создаем копию состояния для безопасного обновления
    const newState = { ...state };
    
    // Проверяем все ресурсы и обновляем их значения
    for (const resourceId in newState.resources) {
      if (newState.resources.hasOwnProperty(resourceId)) {
        const resource = newState.resources[resourceId];
        
        // Пропускаем не разблокированные ресурсы или ресурсы без производства
        if (!resource.unlocked || resource.perSecond === 0) continue;
        
        // Рассчитываем прирост ресурса за прошедшее время
        const increment = (resource.perSecond * deltaTime) / 1000;
        
        // Обновляем значение ресурса, не превышая максимум
        let newValue = (resource.value || 0) + increment;
        
        // Если есть максимальное значение, ограничиваем им
        if (resource.max !== undefined && resource.max !== Infinity) {
          newValue = Math.min(newValue, resource.max);
        }
        
        // Обновляем значение ресурса
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
    const newState = { ...state };
    
    // Базовые значения максимумов
    const baseMaxValues: Record<string, number> = {
      knowledge: 100,
      usdt: 50,
    };
    
    // Применяем базовые значения
    for (const resourceId in baseMaxValues) {
      if (newState.resources[resourceId] && newState.resources[resourceId].unlocked) {
        // Сохраняем текущее значение ресурса
        const currentValue = newState.resources[resourceId].value || 0;
        
        // Устанавливаем базовое максимальное значение
        newState.resources[resourceId] = {
          ...newState.resources[resourceId],
          max: baseMaxValues[resourceId]
        };
      }
    }
    
    // Применяем бонусы от зданий к максимальным значениям
    for (const buildingId in newState.buildings) {
      const building = newState.buildings[buildingId];
      
      // Пропускаем здания без эффектов максимальных значений или не построенные здания
      if (!building.purchased || building.count <= 0) continue;
      
      // Получаем бонусы max ресурсов для здания, если они существуют
      const maxResourcesBonus = building.maxResourcesBonus as Record<string, number> | undefined;
      
      if (maxResourcesBonus) {
        for (const resourceId in maxResourcesBonus) {
          if (newState.resources[resourceId] && newState.resources[resourceId].unlocked) {
            // Текущий максимум ресурса
            const currentMax = newState.resources[resourceId].max || 0;
            
            // Добавляем бонус от здания, умноженный на количество зданий
            const newMax = currentMax + (maxResourcesBonus[resourceId] * building.count);
            
            // Обновляем максимальное значение
            newState.resources[resourceId] = {
              ...newState.resources[resourceId],
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
            const currentMax = newState.resources[resourceId].max || 0;
            
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
              ...newState.resources[resourceId],
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
