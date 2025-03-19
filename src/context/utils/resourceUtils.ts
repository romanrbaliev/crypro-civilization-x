
import { GameState, Resource, Building } from '../types';

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

// Функция для проверки условий разблокировки возможностей
export const checkUnlocks = (state: GameState): GameState => {
  try {
    let newState = { ...state };
    
    // Проверяем условия разблокировки зданий
    Object.entries(state.buildings).forEach(([buildingId, building]) => {
      // Если здание уже разблокировано, пропускаем его
      if (building.unlocked) return;
      
      // Проверяем условия на основе количества ресурсов
      const requirements = building.requirements || {};
      let shouldUnlock = true;
      
      for (const [resourceId, requiredAmount] of Object.entries(requirements)) {
        const resource = state.resources[resourceId];
        if (!resource || resource.value < requiredAmount) {
          shouldUnlock = false;
          break;
        }
      }
      
      // Проверяем дополнительные условия, например наличие исследований
      if (building.unlockedBy && building.unlockedBy.startsWith('upgrade:')) {
        const upgradeId = building.unlockedBy.replace('upgrade:', '');
        if (!state.upgrades[upgradeId]?.purchased) {
          shouldUnlock = false;
        }
      }
      
      if (shouldUnlock) {
        console.log(`Разблокировано здание: ${building.name}`);
        newState = {
          ...newState,
          buildings: {
            ...newState.buildings,
            [buildingId]: {
              ...newState.buildings[buildingId],
              unlocked: true
            }
          }
        };
      }
    });
    
    // Аналогично проверяем условия разблокировки исследований
    Object.entries(state.upgrades).forEach(([upgradeId, upgrade]) => {
      if (upgrade.unlocked) return;
      
      let shouldUnlock = true;
      
      // Проверяем требования по ресурсам
      if (upgrade.unlockCondition?.resources) {
        for (const [resourceId, requiredAmount] of Object.entries(upgrade.unlockCondition.resources)) {
          const resource = state.resources[resourceId];
          if (!resource || resource.value < requiredAmount) {
            shouldUnlock = false;
            break;
          }
        }
      }
      
      // Проверяем требования по зданиям
      if (shouldUnlock && upgrade.unlockCondition?.buildings) {
        for (const [buildingId, requiredCount] of Object.entries(upgrade.unlockCondition.buildings)) {
          const building = state.buildings[buildingId];
          if (!building || building.count < requiredCount) {
            shouldUnlock = false;
            break;
          }
        }
      }
      
      // Проверяем требования по исследованиям
      if (shouldUnlock && upgrade.requiredUpgrades && upgrade.requiredUpgrades.length > 0) {
        for (const requiredUpgradeId of upgrade.requiredUpgrades) {
          if (!state.upgrades[requiredUpgradeId]?.purchased) {
            shouldUnlock = false;
            break;
          }
        }
      }
      
      if (shouldUnlock) {
        console.log(`Разблокировано исследование: ${upgrade.name}`);
        newState = {
          ...newState,
          upgrades: {
            ...newState.upgrades,
            [upgradeId]: {
              ...newState.upgrades[upgradeId],
              unlocked: true
            }
          }
        };
      }
    });
    
    return newState;
  } catch (error) {
    console.error("Ошибка при проверке разблокировок:", error);
    return state;
  }
};

// Функция для расчета изменений в производстве ресурсов
export const calculateResourceProduction = (
  resources: { [key: string]: Resource },
  buildings: { [key: string]: Building },
  referralHelpers: any[],
  referrals: any[],
  referralCode: string | null
): { [key: string]: Resource } => {
  try {
    const newResources = { ...resources };
    
    // Сбрасываем текущее производство для всех ресурсов
    Object.keys(newResources).forEach(resourceId => {
      newResources[resourceId].production = 0;
      newResources[resourceId].perSecond = 0;
    });
    
    // Считаем активных рефералов для бонусов
    const activeReferralsCount = referrals.filter(ref => ref.status === 'active').length;
    const referralBonus = activeReferralsCount * 0.05; // 5% за каждого активного реферала
    
    console.log(`Активных рефералов: ${activeReferralsCount}, бонус: +${referralBonus * 100}%`);
    
    // Расчет базового производства от зданий
    Object.values(buildings).forEach((building: Building) => {
      const { count, production = {}, id: buildingId } = building;
      
      if (count > 0) {
        // Проверяем, есть ли помощники для этого здания
        const helpers = referralHelpers.filter(h => 
          h.buildingId === buildingId && h.status === 'accepted'
        );
        
        // Расчет бонуса от помощников (10% за каждого)
        const helperBonus = helpers.length * 0.1;
        
        // Для каждого ресурса, который производит здание
        Object.entries(production).forEach(([productionType, amount]) => {
          // Пропускаем эффекты влияющие на максимум, они учтены в другой функции
          if (productionType.includes('Max')) return;
          
          const resourceId = productionType;
          if (newResources[resourceId]) {
            // Базовое производство от здания с учетом количества
            const baseProduction = Number(amount) * count;
            
            // Применяем бонус от помощников и рефералов
            const totalBonus = 1 + helperBonus + referralBonus;
            const boostedProduction = baseProduction * totalBonus;
            
            newResources[resourceId].production += boostedProduction;
            newResources[resourceId].perSecond += boostedProduction;
            
            if (helpers.length > 0 || activeReferralsCount > 0) {
              console.log(`${building.name} производит ${resourceId}: ${baseProduction} * ${totalBonus} = ${boostedProduction}/сек`);
            }
          }
        });
      }
    });
    
    return newResources;
  } catch (error) {
    console.error("Ошибка при расчете производства ресурсов:", error);
    return resources;
  }
};

// Функция для применения бонусов к хранилищам ресурсов
export const applyStorageBoosts = (
  resources: { [key: string]: Resource },
  buildings: { [key: string]: Building }
): { [key: string]: Resource } => {
  try {
    const newResources = { ...resources };
    
    // Применяем бонусы к хранилищам от зданий
    Object.values(buildings).forEach((building: Building) => {
      const { count, production = {} } = building;
      
      if (count > 0) {
        Object.entries(production).forEach(([productionType, amount]) => {
          if (productionType.includes('Max')) {
            const resourceId = productionType.replace('Max', '');
            if (newResources[resourceId]) {
              const storageBoost = Number(amount) * count;
              newResources[resourceId].max += storageBoost;
            }
          }
        });
      }
    });
    
    return newResources;
  } catch (error) {
    console.error("Ошибка при применении бонусов к хранилищам:", error);
    return resources;
  }
};

// Функция для обновления значений ресурсов с учетом производства и времени
export const updateResourceValues = (
  resources: { [key: string]: Resource },
  deltaTime: number
): { [key: string]: Resource } => {
  try {
    const newResources = { ...resources };
    const deltaSeconds = deltaTime / 1000; // Переводим миллисекунды в секунды
    
    // Для каждого ресурса обновляем значение в зависимости от производства
    Object.keys(newResources).forEach(resourceId => {
      const resource = newResources[resourceId];
      const production = resource.production || 0;
      
      // Расчет прироста за прошедшее время
      const increment = production * deltaSeconds;
      
      // Обновляем значение, но не выше максимума
      let newValue = resource.value + increment;
      if (resource.max !== Infinity && newValue > resource.max) {
        newValue = resource.max;
      }
      
      resource.value = newValue;
    });
    
    return newResources;
  } catch (error) {
    console.error("Ошибка при обновлении значений ресурсов:", error);
    return resources;
  }
};
