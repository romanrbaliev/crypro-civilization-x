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
  // Создаем глубокую копию ресурсов для предотвращения мутаций
  const newResources = JSON.parse(JSON.stringify(state.resources));
  
  try {
    // Устанавливаем базовые значения максимумов для каждого ресурса
    // ВАЖНО: Сначала сбрасываем максимумы к базовым значениям, чтобы избежать накопления
    Object.keys(newResources).forEach(resourceId => {
      const resource = newResources[resourceId];
      
      // Устанавливаем базовые максимальные значения
      switch (resourceId) {
        case "knowledge":
          resource.max = 100; // Базовый максимум для знаний
          break;
        case "usdt":
          resource.max = 50; // Базовый максимум для USDT
          break;
        case "electricity":
        case "electricty":  // Исправление для поддержки обоих вариантов написания
          resource.max = 100; // Базовый максимум для электричества
          break;
        case "computingPower":
          resource.max = 1000; // Базовый максимум для вычислительной мощности
          break;
        case "btc":
          resource.max = Infinity; // Максимум для BTC неограничен
          break;
        default:
          resource.max = 100; // Базовый максимум для других ресурсов
      }
    });
    
    // Вычисляем одноразовые бонусы от зданий
    const buildingBoosts = {
      knowledgeMax: 0,
      usdtMax: 0,
      electricityMax: 0,
      computingPowerMax: 0
    };
    
    // Проходим по всем зданиям только один раз и считаем все бонусы
    Object.entries(state.buildings).forEach(([buildingId, building]) => {
      if (building.count > 0) {
        // Получаем production с проверкой на null/undefined
        const production = building.production || {};
        
        // Для каждого эффекта здания
        Object.entries(production).forEach(([effectType, amount]) => {
          if (effectType.includes('Max')) {
            const resourceId = effectType.replace('Max', '');
            // Важно! Умножаем на количество зданий
            const totalBonus = Number(amount) * building.count;
            
            // Суммируем бонусы по типам ресурсов
            if (resourceId === 'knowledge') {
              buildingBoosts.knowledgeMax += totalBonus;
              console.log(`Здание ${building.name} (${building.count} шт.) увеличивает макс. знаний на ${totalBonus}`);
            } else if (resourceId === 'usdt') {
              buildingBoosts.usdtMax += totalBonus;
              console.log(`Здание ${building.name} (${building.count} шт.) увеличивает макс. USDT на ${totalBonus}`);
            } else if (resourceId === 'electricity' || resourceId === 'electricty') {
              buildingBoosts.electricityMax += totalBonus;
              console.log(`Здание ${building.name} (${building.count} шт.) увеличивает макс. электричества на ${totalBonus}`);
            } else if (resourceId === 'computingPower') {
              buildingBoosts.computingPowerMax += totalBonus;
              console.log(`Здание ${building.name} (${building.count} шт.) увеличивает макс. вычислительной мощности на ${totalBonus}`);
            } else {
              // Для других ресурсов создаем динамические поля
              if (!buildingBoosts[resourceId + 'Max']) {
                buildingBoosts[resourceId + 'Max'] = 0;
              }
              buildingBoosts[resourceId + 'Max'] += totalBonus;
              console.log(`Здание ${building.name} (${building.count} шт.) увеличивает макс. ${resourceId} на ${totalBonus}`);
            }
          }
        });
      }
    });
    
    // Вычисляем одноразовые бонусы от улучшений
    const upgradeBoosts = {
      knowledgeMax: 0,
      knowledgeMaxPercent: 0,
      usdtMax: 0,
      usdtMaxPercent: 0
    };
    
    // Проходим по всем исследованиям только один раз
    Object.values(state.upgrades).forEach(upgrade => {
      if (upgrade.purchased) {
        // Безопасно получаем effects/effect с проверкой на null/undefined
        const effects = upgrade.effects || upgrade.effect || {};
        
        Object.entries(effects).forEach(([effectType, amount]) => {
          if (effectType.includes('Max') && !effectType.includes('Boost')) {
            const resourceId = effectType.replace('Max', '');
            const addedAmount = Number(amount);
            
            // Учитываем абсолютные бонусы
            if (resourceId === 'knowledge') {
              upgradeBoosts.knowledgeMax += addedAmount;
              console.log(`Исследование ${upgrade.name} увеличивает макс. знаний на ${addedAmount}`);
            } else if (resourceId === 'usdt') {
              upgradeBoosts.usdtMax += addedAmount;
              console.log(`Исследование ${upgrade.name} увеличивает макс. USDT на ${addedAmount}`);
            }
          } 
          else if (effectType === 'knowledgeMaxBoost') {
            const boost = Number(amount);
            upgradeBoosts.knowledgeMaxPercent += boost;
            console.log(`Исследование ${upgrade.name} увеличивает макс. знаний на ${boost * 100}%`);
          } 
          else if (effectType === 'usdtMaxBoost') {
            const boost = Number(amount);
            upgradeBoosts.usdtMaxPercent += boost;
            console.log(`Исследование ${upgrade.name} увел��чивает макс. USDT на ${boost * 100}%`);
          }
        });
      }
    });
    
    // Применяем рассчитанные бонусы к ресурсам
    if (newResources.knowledge) {
      const baseKnowledgeMax = 100; // Базовое значение
      const absoluteBonus = buildingBoosts.knowledgeMax + upgradeBoosts.knowledgeMax; // Абсолютный бонус
      const percentBonus = baseKnowledgeMax * upgradeBoosts.knowledgeMaxPercent; // Процентный бонус
      
      // Финальное значение - база + абсолютный бонус + процентный бонус от базы
      newResources.knowledge.max = baseKnowledgeMax + absoluteBonus + percentBonus;
      
      console.log(`Итоговый максимум знаний: ${newResources.knowledge.max.toFixed(2)} (база: 100, от зданий: ${buildingBoosts.knowledgeMax}, от улучшений: ${upgradeBoosts.knowledgeMax}, процентный бонус: ${percentBonus.toFixed(2)})`);
    }
    
    if (newResources.usdt) {
      const baseUsdtMax = 50; // Базовое значение
      const absoluteBonus = buildingBoosts.usdtMax + upgradeBoosts.usdtMax; // Абсолютный бонус
      const percentBonus = baseUsdtMax * upgradeBoosts.usdtMaxPercent; // Процентный бонус
      
      // Финальное значение - база + абсолютный бонус + процентный бонус от базы
      newResources.usdt.max = baseUsdtMax + absoluteBonus + percentBonus;
      
      console.log(`Итоговый максимум USDT: ${newResources.usdt.max.toFixed(2)} (база: 50, от зданий: ${buildingBoosts.usdtMax}, от улучшений: ${upgradeBoosts.usdtMax}, процентный бонус: ${percentBonus.toFixed(2)})`);
    }
    
    if (newResources.electricity) {
      newResources.electricity.max = 100 + buildingBoosts.electricityMax;
      console.log(`Итоговый максимум электричества: ${newResources.electricity.max}`);
    }
    
    if (newResources.computingPower) {
      newResources.computingPower.max = 1000 + buildingBoosts.computingPowerMax;
      console.log(`Итоговый максимум вычислительной мощности: ${newResources.computingPower.max}`);
    }
    
    // Для других ресурсов применяем собранные бонусы
    Object.keys(buildingBoosts).forEach(boostKey => {
      if (boostKey.endsWith('Max')) {
        const resourceId = boostKey.replace('Max', '');
        // Применяем только если это не один из основных ресурсов, которые уже обработаны выше
        if (resourceId !== 'knowledge' && resourceId !== 'usdt' && 
            resourceId !== 'electricity' && resourceId !== 'computingPower') {
          if (newResources[resourceId]) {
            const baseMax = 100; // Предполагаемое базовое значение для других ресурсов
            newResources[resourceId].max = baseMax + buildingBoosts[boostKey];
            console.log(`Итоговый максимум ${resourceId}: ${newResources[resourceId].max}`);
          }
        }
      }
    });
    
    // Проверяем, что значения ресурсов не превышают максимум
    Object.keys(newResources).forEach(resourceId => {
      const resource = newResources[resourceId];
      if (resource.value > resource.max && resource.max !== Infinity) {
        resource.value = resource.max;
        console.log(`Ресурс ${resourceId} превышал максимум, установлено значение: ${resource.max}`);
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
    console.error("Ошибка при проверке разблокирово��:", error);
    return state;
  }
};

// Функция для расчета изменений в производстве ресурсов
export const calculateResourceProduction = (
  resources: { [key: string]: Resource },
  buildings: { [key: string]: Building },
  referralHelpers: any[],
  referrals: any[],
  referralCode: string | null,
  referralHelperBonus: number = 0 
): { [key: string]: Resource } => {
  try {
    const newResources = JSON.parse(JSON.stringify(resources));
    
    // Сбрасываем текущее производство для всех ресурсов
    Object.keys(newResources).forEach(resourceId => {
      // Сохраняем исходное базовое производство, если его еще нет
      if (newResources[resourceId].baseProduction === undefined && newResources[resourceId].perSecond > 0) {
        newResources[resourceId].baseProduction = newResources[resourceId].perSecond;
      }
      
      // Полностью сбрасываем текущее производство и perSecond
      newResources[resourceId].production = 0;
      newResources[resourceId].perSecond = 0;
    });
    
    // Считаем активных рефералов для бонусов
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
            
            // Сохраняем базовое производство здания для этого ресурса
            if (!building.resourceProduction) {
              building.resourceProduction = {};
            }
            building.resourceProduction[resourceId] = productionAmount;
            
            // Обновляем базовое производство ресурса для дальнейших расчетов
            newResources[resourceId].baseProduction = baseProduction[resourceId];
          }
        });
      }
    });
    
    // Логируем базовое производство
    console.log('Базовое производство ресурсов:', baseProduction);
    
    // Бонусы от помощников для каждого здания
    let helperBonuses: { [key: string]: number } = {};
    
    // Рассчитываем бонусы от помощников для реферрера (владельца зданий)
    Object.values(buildings).forEach((building: Building) => {
      const { id: buildingId, resourceProduction = {} } = building;
      
      // Проверяем, есть ли помощники для этого здания
      const buildingHelpers = referralHelpers.filter(h => 
        h.buildingId === buildingId && h.status === 'accepted' && h.employerId === referralCode
      );
      
      if (buildingHelpers.length > 0) {
        // Расчет бонуса от помощников (5% за каждого) для реферрера
        const helperBonus = buildingHelpers.length * 0.05;
        
        // Для каждого ресурса, производимого зданием
        Object.entries(resourceProduction).forEach(([resourceId, baseAmount]) => {
          // Добавляем бонус от помощников
          helperBonuses[resourceId] = (helperBonuses[resourceId] || 0) + (Number(baseAmount) * helperBonus);
          
          console.log(`Здание "${building.name}" с ${buildingHelpers.length} помощниками: бонус для реферрера +${helperBonus * 100}% к производству ${resourceId}`);
        });
      }
    });
    
    // Применяем базовое производство и бонусы
    Object.entries(baseProduction).forEach(([resourceId, baseAmount]) => {
      // Базовое производство
      newResources[resourceId].production = baseAmount;
      newResources[resourceId].perSecond = baseAmount;
      
      // Бонус от активных рефералов (если пользователь является реферрером)
      if (referralBonus > 0) {
        const referralEffect = baseAmount * referralBonus;
        newResources[resourceId].production += referralEffect;
        newResources[resourceId].perSecond += referralEffect;
        console.log(`Бонус от рефералов для ${resourceId}: ${baseAmount} * ${referralBonus * 100}% = +${referralEffect.toFixed(2)}/сек`);
      }
      
      // Бонус от помощников для реферрера (владельца зданий)
      const helperEffect = helperBonuses[resourceId] || 0;
      if (helperEffect > 0) {
        newResources[resourceId].production += helperEffect;
        newResources[resourceId].perSecond += helperEffect;
        console.log(`Бонус от помощников для реферрера (${resourceId}): +${helperEffect.toFixed(2)}/сек`);
      }
      
      // Бонус для реферала-помощника (если текущий пользователь является помощником в других зданиях)
      if (referralHelperBonus > 0) {
        const referralHelperEffect = baseAmount * referralHelperBonus;
        newResources[resourceId].production += referralHelperEffect;
        newResources[resourceId].perSecond += referralHelperEffect;
        console.log(`Бонус для реферала-помощника (${resourceId}): ${baseAmount} * ${referralHelperBonus * 100}% = +${referralHelperEffect.toFixed(2)}/сек`);
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
      const perSecond = resource.perSecond || 0;
      
      // Расчет прироста за прошедшее время на основе perSecond
      const increment = perSecond * deltaSeconds;
      
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

