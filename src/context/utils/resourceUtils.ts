
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
