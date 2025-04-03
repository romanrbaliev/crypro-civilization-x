/**
 * Вычисляет прирост ресурса за указанный временной интервал
 */
export const calculateResourceIncrement = (perSecond: number, deltaTime: number): number => {
  return (perSecond * deltaTime) / 1000;
};

/**
 * Обновляет максимальные значения ресурсов на основе зданий и улучшений
 */
export const updateResourceMaxValues = (state: any): any => {
  // Создаем копию состояния
  const newState = { ...state };
  const updatedResources = { ...state.resources };
  
  // Обновляем максимальные значения для каждого ресурса
  for (const resourceId in updatedResources) {
    const resource = updatedResources[resourceId];
    
    // Начинаем с базового максимума из ресурса
    let maxValue = resource.max || Infinity;
    
    // Если ресурс не имеет базового максимума, пропускаем
    if (maxValue === Infinity) continue;
    
    // Проходим по всем зданиям и учитываем их эффекты на максимум ресурса
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      
      if (building.unlocked && building.count > 0 && building.effects) {
        const effects = building.effects;
        
        // Проверяем эффекты здания для текущего ресурса
        if (effects[`${resourceId}Max`]) {
          maxValue += effects[`${resourceId}Max`] * building.count;
        }
        
        // Проверяем процентные бусты для максимума ресурса
        if (effects[`${resourceId}MaxBoost`]) {
          maxValue *= (1 + effects[`${resourceId}MaxBoost`] * building.count);
        }
      }
    }
    
    // Учитываем эффекты улучшений
    for (const upgradeId in state.upgrades) {
      const upgrade = state.upgrades[upgradeId];
      
      if (upgrade.purchased && upgrade.effects) {
        const effects = upgrade.effects;
        
        // Проверяем эффекты улучшения для текущего ресурса
        if (effects[`${resourceId}Max`]) {
          maxValue += effects[`${resourceId}Max`];
        }
        
        // Проверяем процентные бусты для максимума ресурса
        if (effects[`${resourceId}MaxBoost`]) {
          maxValue *= (1 + effects[`${resourceId}MaxBoost`]);
        }
      }
    }
    
    // Обновляем максимальное значение ресурса
    updatedResources[resourceId] = {
      ...resource,
      max: Math.round(maxValue)
    };
  }
  
  newState.resources = updatedResources;
  return newState;
};

/**
 * Проверяет, достаточно ли ресурсов для покупки
 */
export const hasEnoughResources = (state: any, cost: Record<string, number>): boolean => {
  if (!cost) return true;
  
  for (const [resourceId, amount] of Object.entries(cost)) {
    if (!state.resources[resourceId] || state.resources[resourceId].value < amount) {
      return false;
    }
  }
  
  return true;
};

/**
 * Проверяет разблокировки на основе текущего состояния
 * Функция-заглушка, так как основная логика перенесена в unlockManager
 */
export const checkUnlocks = (state: any): any => {
  // В текущей архитектуре эта функция должна перенаправлять к новой системе разблокировок
  // Импортируем из utils/unlockManager
  console.log('resourceUtils: checkUnlocks вызван (устаревшая функция)');
  
  // Просто возвращаем исходное состояние - логика обработана в unlockManager
  return state;
};

/**
 * Проверяет определенное условие для разблокировки
 */
export const checkCondition = (state: any, condition: any): boolean => {
  // Простая проверка для базовых условий
  if (!condition) return true;
  
  // Проверка ресурсов
  if (condition.resources) {
    for (const [resourceId, amount] of Object.entries(condition.resources)) {
      if (!state.resources[resourceId] || state.resources[resourceId].value < amount) {
        return false;
      }
    }
  }
  
  // Проверка зданий
  if (condition.buildings) {
    for (const [buildingId, count] of Object.entries(condition.buildings)) {
      if (!state.buildings[buildingId] || state.buildings[buildingId].count < count) {
        return false;
      }
    }
  }
  
  // Проверка улучшений
  if (condition.upgrades) {
    for (const upgradeId of condition.upgrades) {
      if (!state.upgrades[upgradeId] || !state.upgrades[upgradeId].purchased) {
        return false;
      }
    }
  }
  
  // Проверка действий
  if (condition.actions) {
    for (const [actionId, count] of Object.entries(condition.actions)) {
      if (!state.counters[actionId] || state.counters[actionId].value < count) {
        return false;
      }
    }
  }
  
  // Если все условия прошли проверку, возвращаем true
  return true;
};
