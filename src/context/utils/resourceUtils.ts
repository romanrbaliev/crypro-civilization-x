
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
          resource.max = 100; // Базовый максимум для знаний
          break;
        case "usdt":
          resource.max = 50; // Базовый максимум для USDT
          break;
        case "electricty":
        case "electricity":  // Исправление для поддержки обоих вариантов написания
          resource.max = 100; // Базовый максимум для электричества
          break;
        case "computingPower":
          resource.max = 1000; // Базовый максимум для вычислительной мощности
          break;
        case "btc":
          resource.max = Infinity; // Максимум для BTC неограничен
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
              console.log(`Здание ${building.name} (${building.count} шт.) увеличивает макс. ${resourceId} на ${Number(amount) * building.count}`);
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
          if (effectType.includes('Max') && !effectType.includes('Boost')) {
            const resourceId = effectType.replace('Max', '');
            if (newResources[resourceId]) {
              const currentMax = newResources[resourceId].max || 0;
              const addedAmount = Number(amount);
              newResources[resourceId].max = currentMax + addedAmount;
              console.log(`Исследование ${upgrade.name} увеличивает макс. ${resourceId} на ${addedAmount}, новый макс: ${newResources[resourceId].max}`);
            }
          } 
          else if (effectType === 'knowledgeMaxBoost' && newResources.knowledge) {
            const boost = Number(amount);
            const baseMax = 100; // Базовый максимум для знаний
            const addedAmount = baseMax * boost;
            newResources.knowledge.max += addedAmount;
            console.log(`Исследование ${upgrade.name} увеличивает макс. знаний на ${boost * 100}% (${addedAmount}), новый макс: ${newResources.knowledge.max}`);
          } 
          else if (effectType === 'usdtMaxBoost' && newResources.usdt) {
            const boost = Number(amount);
            const baseMax = 50; // Базовый максимум для USDT
            const addedAmount = baseMax * boost;
            newResources.usdt.max += addedAmount;
            console.log(`Исследование ${upgrade.name} увеличивает макс. USDT на ${boost * 100}% (${addedAmount}), новый макс: ${newResources.usdt.max}`);
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
    const newResources = JSON.parse(JSON.stringify(resources));
    
    // Сбрасываем текущее производство для всех ресурсов, но сохраняем базовое производство
    Object.keys(newResources).forEach(resourceId => {
      // Сохраняем базовое производство отдельно
      if (newResources[resourceId].production > 0 && !newResources[resourceId].baseProduction) {
        newResources[resourceId].baseProduction = newResources[resourceId].production;
      }
      
      newResources[resourceId].production = 0;
      newResources[resourceId].perSecond = 0;
    });
    
    // Считаем активных рефералов для бонусов - принимаем разные форматы статуса
    const activeReferrals = referrals.filter(ref => 
      ref.status === 'active' || ref.activated === true || ref.activated === 'true'
    );
    const activeReferralsCount = activeReferrals.length;
    
    const referralBonus = activeReferralsCount * 0.05; // 5% за каждого активного реферала
    
    console.log(`Активных рефералов: ${activeReferralsCount}, бонус: +${referralBonus * 100}%`);
    
    // Базовое производство ресурсов от зданий
    const baseProduction: { [key: string]: number } = {};
    
    // Сначала рассчитаем базовое производство от всех зданий
    Object.values(buildings).forEach((building: Building) => {
      const { count, production = {}, id: buildingId } = building;
      
      if (count > 0) {
        // Для каждого ресурса, который производит здание
        Object.entries(production).forEach(([productionType, amount]) => {
          // Пропускаем эффекты влияющие на максимум
          if (productionType.includes('Max')) return;
          
          const resourceId = productionType;
          if (newResources[resourceId]) {
            // Устанавливаем или увеличиваем базовое производство ресурса
            const productionAmount = Number(amount) * count;
            baseProduction[resourceId] = (baseProduction[resourceId] || 0) + productionAmount;
            
            // Сохраняем базовое производство здания для этого ресурса (для применения бонусов)
            if (!building.resourceProduction) {
              building.resourceProduction = {};
            }
            building.resourceProduction[resourceId] = productionAmount;
            
            // Обновляем базовое производство ресурса
            newResources[resourceId].baseProduction = (newResources[resourceId].baseProduction || 0) + productionAmount;
          }
        });
      }
    });
    
    // Логируем базовое производство
    console.log('Базовое производство ресурсов:', baseProduction);
    
    // Бонусы от помощников для каждого здания
    let helperBonuses: { [key: string]: number } = {};
    
    // Рассчитываем бонусы от помощников для каждого здания
    Object.values(buildings).forEach((building: Building) => {
      const { id: buildingId, resourceProduction = {} } = building;
      
      // Проверяем, есть ли помощники для этого здания
      const buildingHelpers = referralHelpers.filter(h => 
        h.buildingId === buildingId && h.status === 'accepted'
      );
      
      if (buildingHelpers.length > 0) {
        // Расчет бонуса от помощников (10% за каждого)
        const helperBonus = buildingHelpers.length * 0.1;
        
        // Для каждого ресурса, производимого зданием
        Object.entries(resourceProduction).forEach(([resourceId, baseAmount]) => {
          // Добавляем бонус от помощников
          helperBonuses[resourceId] = (helperBonuses[resourceId] || 0) + (Number(baseAmount) * helperBonus);
          
          console.log(`Здание "${building.name}" с ${buildingHelpers.length} помощниками: бонус +${helperBonus * 100}% к производству ${resourceId}`);
        });
      }
    });
    
    // Применяем базовое производство и бонусы
    Object.entries(baseProduction).forEach(([resourceId, baseAmount]) => {
      // Базовое производство
      newResources[resourceId].production += baseAmount;
      newResources[resourceId].perSecond += baseAmount;
      
      // Бонус от рефералов
      const referralEffect = baseAmount * referralBonus;
      if (referralBonus > 0) {
        newResources[resourceId].production += referralEffect;
        newResources[resourceId].perSecond += referralEffect;
        console.log(`Бонус от рефералов для ${resourceId}: ${baseAmount} * ${referralBonus * 100}% = +${referralEffect.toFixed(2)}/сек`);
      }
      
      // Бонус от помощников
      const helperEffect = helperBonuses[resourceId] || 0;
      if (helperEffect > 0) {
        newResources[resourceId].production += helperEffect;
        newResources[resourceId].perSecond += helperEffect;
        console.log(`Бонус от помощников для ${resourceId}: +${helperEffect.toFixed(2)}/сек`);
      }
    });
    
    // Возвращаем обновленные ресурсы для дальнейшей обработки
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
