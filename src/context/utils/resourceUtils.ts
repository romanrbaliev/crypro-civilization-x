import { GameState } from '../types';

// Функция для проверки, достаточно ли ресурсов для совершения действия
export const hasEnoughResources = (state: GameState, cost: { [key: string]: number }): boolean => {
  for (const [resourceId, amount] of Object.entries(cost)) {
    if (!state.resources[resourceId] || state.resources[resourceId].value < amount) {
      return false;
    }
  }
  return true;
};

// Функция для обновления максимальных значений ресурсов на основе эффектов зданий и улучшений
export const updateResourceMaxValues = (state: GameState): GameState => {
  const newResources = { ...state.resources };
  
  try {
    // Для каждого ресурса устанавливаем базовое максимальное значение
    Object.keys(newResources).forEach(resourceId => {
      const resource = newResources[resourceId];
      switch (resourceId) {
        case "knowledge":
          resource.max = 100;
          break;
        case "usdt":
          resource.max = 50;
          break;
        case "electricty":
        case "electricity":  // Исправление для поддержки обоих вариантов написания
          resource.max = 100;
          break;
        case "computingPower":
          resource.max = 1000;
          break;
        case "btc":
          resource.max = Infinity;
          break;
        default:
          if (!resource.max) resource.max = 100;
      }
    });
    
    // Применяем эффекты от зданий
    Object.values(state.buildings).forEach(building => {
      if (building.count > 0) {
        // Безопасно получаем production с проверкой на null/undefined
        const production = building.production || {};
        
        Object.entries(production).forEach(([productionType, amount]) => {
          if (productionType.includes('Max')) {
            const resourceId = productionType.replace('Max', '');
            if (newResources[resourceId]) {
              const currentMax = newResources[resourceId].max || 0;
              newResources[resourceId].max = currentMax + (Number(amount) * building.count);
            }
          }
        });
      }
    });
    
    // Применяем эффекты от улучшений
    Object.values(state.upgrades).forEach(upgrade => {
      if (upgrade.purchased) {
        // Безопасно получаем effects/effect с проверкой на null/undefined
        const effects = upgrade.effects || upgrade.effect || {};
        
        Object.entries(effects).forEach(([effectType, amount]) => {
          if (effectType.includes('Max')) {
            const resourceId = effectType.replace('Max', '');
            if (newResources[resourceId]) {
              const currentMax = newResources[resourceId].max || 0;
              newResources[resourceId].max = currentMax + Number(amount);
            }
          } else if (effectType === 'knowledgeMaxBoost' && newResources.knowledge) {
            const boost = Number(amount);
            const baseMax = newResources.knowledge.max || 100;
            newResources.knowledge.max = baseMax * (1 + boost);
          } else if (effectType === 'usdtMaxBoost' && newResources.usdt) {
            const boost = Number(amount);
            const baseMax = newResources.usdt.max || 50;
            newResources.usdt.max = baseMax * (1 + boost);
          }
        });
      }
    });
    
    // Проверяем, что значения ресурсов не превышают максимум
    Object.keys(newResources).forEach(resourceId => {
      const resource = newResources[resourceId];
      if (resource.value > resource.max && resource.max !== Infinity) {
        resource.value = resource.max;
      }
    });
  } catch (error) {
    console.error("Ошибка при обновлении максимальных значений ресурсов:", error);
  }
  
  return {
    ...state,
    resources: newResources
  };
};
