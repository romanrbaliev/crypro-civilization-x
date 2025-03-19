
import { Resource, Building, ReferralHelper, GameState, Upgrade } from '../types';
import { 
  calculateBuildingBoostFromHelpers, 
  calculateHelperBoost, 
  calculateReferralBonus, 
  canAffordCost,
  getActiveHelperBoosts
} from '../../utils/helpers';

export const calculateResourceProduction = (
  resources: { [key: string]: Resource },
  buildings: { [key: string]: Building },
  referralHelpers: ReferralHelper[] = [],
  referrals: any[] = [],
  referralCode: string = ''
): { [key: string]: Resource } => {
  const newResources = { ...resources };
  
  // Сбрасываем производство в секунду для всех ресурсов перед пересчетом
  Object.keys(newResources).forEach(resourceId => {
    newResources[resourceId] = {
      ...newResources[resourceId],
      perSecond: 0
    };
  });
  
  // Получаем бонус от рефералов
  const referralBonus = calculateReferralBonus(referrals);
  
  // Получаем полную информацию о бонусах от помощников для всех зданий
  const helperBoosts = getActiveHelperBoosts(buildings, referralHelpers);
  
  // Более подробное логирование активных рефералов для отладки
  const activatedReferrals = referrals.filter(r => {
    if (typeof r.activated === 'boolean') return r.activated;
    return String(r.activated).toLowerCase() === 'true';
  }).map(r => r.id);
  
  console.log(`Активированные рефералы: ${JSON.stringify(activatedReferrals)}`);
  
  // Подробная информация о каждом активированном реферале
  console.log(`Детали активированных рефералов: ${JSON.stringify(
    referrals.filter(r => {
      if (typeof r.activated === 'boolean') return r.activated;
      return String(r.activated).toLowerCase() === 'true';
    }).map(r => ({
      id: r.id,
      activated: r.activated,
      hired: r.hired ? r.hired : {_type: "undefined", value: "undefined"},
      assignedBuildingId: r.assignedBuildingId ? r.assignedBuildingId : {_type: "undefined", value: "undefined"}
    }))
  )}`);
  
  console.log(`Расчет бонуса от рефералов: ${referrals.filter(r => {
    if (typeof r.activated === 'boolean') return r.activated;
    return String(r.activated).toLowerCase() === 'true';
  }).length} активных из ${referrals.length} всего, бонус = ${referralBonus}`);
  
  console.log(`Расчет бонуса от рефералов: ${referrals.filter(r => {
    if (typeof r.activated === 'boolean') return r.activated;
    return String(r.activated).toLowerCase() === 'true';
  }).length} активных из ${referrals.length} всего`);
  console.log(`Общий бонус от рефералов: +${(referralBonus * 100).toFixed(0)}%`);
  
  // Отправляем событие с данными о текущих бонусах для отображения пользователю
  setTimeout(() => {
    try {
      const boostSummaryEvent = new CustomEvent('debug-boosts-summary', {
        detail: { 
          referralBonus: (referralBonus * 100).toFixed(0),
          helperBoosts,
          message: `Общий бонус от рефералов: +${(referralBonus * 100).toFixed(0)}%, активных помощников: ${Object.keys(helperBoosts).length}`
        }
      });
      window.dispatchEvent(boostSummaryEvent);
    } catch (error) {
      console.error('Ошибка при отправке события сводки бонусов:', error);
    }
  }, 500);
  
  // Для каждого здания рассчитываем производство
  Object.values(buildings).forEach(building => {
    if (building.count > 0) {
      // Получаем бонус от помощников для этого здания
      const helperBoost = calculateBuildingBoostFromHelpers(building.id, referralHelpers);
      
      if (helperBoost > 0) {
        console.log(`Здание ${building.name} имеет бонус от помощников: +${(helperBoost * 100).toFixed(0)}%`);
      }
      
      // Применяем производство от здания с учетом бонусов
      Object.entries(building.production).forEach(([resourceId, productionValue]) => {
        if (newResources[resourceId]) {
          // Полный расчет с учетом количества зданий, бонуса от помощников и бонуса от рефералов
          const totalProduction = productionValue * building.count * (1 + helperBoost) * (1 + referralBonus);
          
          newResources[resourceId] = {
            ...newResources[resourceId],
            perSecond: (newResources[resourceId].perSecond || 0) + totalProduction
          };
          
          // Добавляем детальную отладочную информацию
          console.log(`Ресурс ${resourceId}: базовое производство ${productionValue * building.count}/сек, с бонусами: ${totalProduction}/сек (хелперы: +${(helperBoost * 100).toFixed(0)}%, рефералы: +${(referralBonus * 100).toFixed(0)}%)`);
        }
      });
    }
  });
  
  // ОСОБАЯ логика для базовой скорости накопления знаний через здание "Практика"
  if (newResources.knowledge && buildings.practice && buildings.practice.count > 0) {
    // Базовая скорость накопления знаний
    const baseRate = 0.63;
    
    // Получаем бонус от помощников для здания "Практика"
    const practiceHelperBoost = calculateBuildingBoostFromHelpers('practice', referralHelpers);
    
    // Применяем все бонусы к базовой скорости
    const knowledgeRate = baseRate * (1 + practiceHelperBoost) * (1 + referralBonus);
    
    console.log(`Здание Практика: базовая скорость ${baseRate}/сек, с бонусами: ${knowledgeRate}/сек (хелперы: +${(practiceHelperBoost * 100).toFixed(0)}%, рефералы: +${(referralBonus * 100).toFixed(0)}%)`);
    
    // Оповещаем пользователя о текущей производительности Практики
    setTimeout(() => {
      try {
        const practiceEvent = new CustomEvent('debug-practice-production', {
          detail: { 
            baseRate,
            helperBoost: practiceHelperBoost,
            referralBonus,
            totalRate: knowledgeRate,
            message: `Практика: ${baseRate}/сек × (1 + ${(practiceHelperBoost * 100).toFixed(0)}%) × (1 + ${(referralBonus * 100).toFixed(0)}%) = ${knowledgeRate.toFixed(4)}/сек`
          }
        });
        window.dispatchEvent(practiceEvent);
      } catch (error) {
        console.error('Ошибка при отправке события производительности Практики:', error);
      }
    }, 600);
    
    // Обновляем скорость накопления знаний с учетом всех бонусов
    newResources.knowledge = {
      ...newResources.knowledge,
      perSecond: knowledgeRate
    };
  }
  
  return newResources;
};

// Обновлено: применение всех возможных бустов к хранилищу
export const applyStorageBoosts = (
  resources: { [key: string]: Resource },
  buildings: { [key: string]: Building }
): { [key: string]: Resource } => {
  const newResources = { ...resources };
  
  // Применяем увеличение хранилища от зданий, но только от эффектов Max, не от Boost
  Object.values(buildings).forEach(building => {
    if (building.count > 0) {
      Object.entries(building.production).forEach(([resourceId, amount]) => {
        // Проверяем, является ли эффект увеличением максимального значения ресурса
        if (resourceId.includes('Max') && !resourceId.includes('Boost')) {
          const actualResourceId = resourceId.replace('Max', '');
          if (newResources[actualResourceId]) {
            // Важное изменение: НЕ увеличиваем максимум ресурса каждый ��аз
            // Это уже реализовано в функции updateResourceMaxValues
            // Здесь мы просто логируем возможности зданий
            console.log(`Здание ${building.name} может увеличивать максимум ${actualResourceId}`);
          }
        }
      });
    }
  });
  
  return newResources;
};

export const updateResourceValues = (
  resources: { [key: string]: Resource },
  deltaTimeMs: number
): { [key: string]: Resource } => {
  const deltaTimeSeconds = deltaTimeMs / 1000;
  const newResources = { ...resources };
  
  Object.keys(newResources).forEach(resourceId => {
    const resource = newResources[resourceId];
    
    if (resource.unlocked) {
      // Рассчитываем новое значение ресурса
      const newValue = resource.value + resource.perSecond * deltaTimeSeconds;
      
      // Обновляем значение с учетом ограничения максимума
      newResources[resourceId] = {
        ...resource,
        value: Math.min(newValue, resource.max)
      };
    }
  });
  
  return newResources;
};

// Проверка условий для разблокировки зданий и улучшений
export const checkUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Проверка для разблокировки генератора (при 11+ USDT)
  if (state.resources.usdt.value >= 11 && !state.buildings.generator.unlocked) {
    newState.buildings = {
      ...newState.buildings,
      generator: {
        ...newState.buildings.generator,
        unlocked: true
      }
    };
    
    console.log("Разблокирован генератор!");
  }
  
  // Проверка для разблокировки домашнего компьютера (при 10+ электричества)
  if (state.resources.electricity && state.resources.electricity.value >= 10 && !state.buildings.homeComputer.unlocked) {
    newState.buildings = {
      ...newState.buildings,
      homeComputer: {
        ...newState.buildings.homeComputer,
        unlocked: true
      }
    };
    
    console.log("Разблокирован домашний компьютер!");
  }
  
  return newState;
};

// Проверка наличия достаточного количества ресурсов
export const hasEnoughResources = (
  state: GameState,
  cost: { [resourceId: string]: number }
): boolean => {
  return canAffordCost(cost, state.resources);
};

// Обновление максимальных значений ресурсов на основе зданий и исследований
export const updateResourceMaxValues = (state: GameState): GameState => {
  const newResources = { ...state.resources };
  const baseResourceValues = {
    knowledge: 100,
    usdt: 50,
    electricity: 1000,
    computingPower: 100,
    btc: 10
  };
  
  // Сначала устанавливаем базовые значения максимумов
  Object.entries(baseResourceValues).forEach(([resourceId, baseMax]) => {
    if (newResources[resourceId]) {
      newResources[resourceId] = {
        ...newResources[resourceId],
        max: baseMax
      };
    }
  });
  
  // Обработка эффектов зданий на максимальные значения
  Object.values(state.buildings).forEach(building => {
    if (building.count <= 0) return;
    
    // Применяем специфические эффекты зданий
    if (building.id === 'cryptoWallet') {
      // Криптокошелек увеличивает максимальный лимит USDT на 50 за каждый
      if (newResources.usdt) {
        newResources.usdt = {
          ...newResources.usdt,
          max: baseResourceValues.usdt + (building.count * 50)
        };
        console.log(`Криптокошелек (${building.count} шт.) устанавливает максимум USDT на ${newResources.usdt.max}`);
      }
      
      // Криптокошелек увеличивает максимальный лимит знаний на 25% за каждый
      if (newResources.knowledge) {
        const boostFactor = 1 + (building.count * 0.25);
        newResources.knowledge = {
          ...newResources.knowledge,
          max: Math.floor(baseResourceValues.knowledge * boostFactor)
        };
        console.log(`Криптокошелек (${building.count} шт.) устанавливает максимум знаний на ${newResources.knowledge.max}`);
      }
    }
    
    // Применяем общие эффекты зданий на максимальные значения ресурсов
    // ВАЖНО: Используем отдельные вычисления для каждого типа ресурса,
    // а не накапливаем изменения от каждого здания
    Object.entries(building.production).forEach(([effectId, amount]) => {
      if (effectId.includes('Max') && !effectId.includes('Boost')) {
        const resourceId = effectId.replace('Max', '');
        if (newResources[resourceId]) {
          const baseMax = baseResourceValues[resourceId] || newResources[resourceId].max;
          const totalIncrease = Number(amount) * building.count;
          
          if (resourceId === 'usdt' || resourceId === 'knowledge') {
            // Пропускаем, так как уже обработано выше для криптокошелька
            return;
          }
          
          newResources[resourceId] = {
            ...newResources[resourceId],
            max: baseMax + totalIncrease
          };
          console.log(`Здание ${building.name} (${building.count} шт.) устанавливает максимум ${resourceId} на ${baseMax + totalIncrease}`);
        }
      }
    });
  });
  
  // Инициализация базовой скорости накопления знаний, если ее нет
  if (newResources.knowledge && typeof newResources.knowledge.perSecond === 'undefined') {
    newResources.knowledge = {
      ...newResources.knowledge,
      perSecond: 0.63 // Базовая скорость накопления знаний
    };
    console.log(`Установлена базовая скорость накопления знаний: ${newResources.knowledge.perSecond}`);
  }
  
  // Обработка эффектов исследований на максимальные значения и скорость накопления
  Object.values(state.upgrades).forEach(upgrade => {
    if (!upgrade.purchased) return;
    
    console.log(`Применение эффектов исследования ${upgrade.name}:`, upgrade.effect);
    
    Object.entries(upgrade.effect).forEach(([effectId, amount]) => {
      // Обработка процентных бустов (например, knowledgeMaxBoost)
      if (effectId.endsWith('MaxBoost')) {
        const resourceId = effectId.replace('MaxBoost', '');
        if (newResources[resourceId]) {
          const boostFactor = 1 + Number(amount);
          const oldMax = newResources[resourceId].max;
          newResources[resourceId] = {
            ...newResources[resourceId],
            max: Math.floor(newResources[resourceId].max * boostFactor)
          };
          console.log(`Исследование ${upgrade.name} увеличивает максимум ${resourceId} на ${(Number(amount) * 100).toFixed(0)}% (с ${oldMax} до ${newResources[resourceId].max})`);
        }
      }
      // Обработка абсолютных значений (например, knowledgeMax)
      else if (effectId.endsWith('Max')) {
        const resourceId = effectId.replace('Max', '');
        if (newResources[resourceId]) {
          const oldMax = newResources[resourceId].max;
          newResources[resourceId] = {
            ...newResources[resourceId],
            max: newResources[resourceId].max + Number(amount)
          };
          console.log(`Исследование ${upgrade.name} увеличивает максимум ${resourceId} на ${amount} (с ${oldMax} до ${newResources[resourceId].max})`);
        }
      }
      // Обработка boost для скорости накопления ресурсов
      else if (effectId === 'knowledgeBoost') {
        if (newResources.knowledge) {
          const basePerSecond = newResources.knowledge.perSecond || 0.63; // Используем текущую скорость или базовую
          const boostedPerSecond = basePerSecond * (1 + Number(amount));
          newResources.knowledge = {
            ...newResources.knowledge,
            perSecond: boostedPerSecond
          };
          console.log(`Исследование ${upgrade.name} увеличивает скорость накопления знаний на ${(Number(amount) * 100).toFixed(0)}%, новое значение: ${boostedPerSecond.toFixed(2)}/сек`);
        }
      }
    });
  });
  
  return {
    ...state,
    resources: newResources
  };
};
