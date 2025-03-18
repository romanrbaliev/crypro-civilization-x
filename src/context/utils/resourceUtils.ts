import { Resource, Building, ReferralHelper, GameState, Upgrade } from '../types';
import { calculateBuildingBoostFromHelpers, calculateHelperBoost, calculateReferralBonus, canAffordCost } from '../../utils/helpers';

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
  
  console.log(`Расчет бонуса от рефералов: ${referrals.filter(r => r.activated).length} активных из ${referrals.length} всего`);
  console.log(`Общий бонус от рефералов: +${(referralBonus * 100).toFixed(0)}%`);
  
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
          // Применяем все бонусы: количество зданий, буст от помощников, буст от рефералов
          const totalProduction = productionValue * building.count * (1 + helperBoost) * (1 + referralBonus);
          
          newResources[resourceId] = {
            ...newResources[resourceId],
            perSecond: (newResources[resourceId].perSecond || 0) + totalProduction
          };
          
          // Добавляем отладочную информацию
          if (helperBoost > 0 || referralBonus > 0) {
            console.log(`Ресурс ${resourceId}: базовое производство ${productionValue * building.count}, с бонусами ${totalProduction}`);
          }
        }
      });
    }
  });
  
  return newResources;
};

// Обновлено: применение всех возможных бустов к хранилищу
export const applyStorageBoosts = (
  resources: { [key: string]: Resource },
  buildings: { [key: string]: Building }
): { [key: string]: Resource } => {
  const newResources = { ...resources };
  
  // Применяем увеличение хранилища от зданий
  Object.values(buildings).forEach(building => {
    if (building.count > 0) {
      Object.entries(building.production).forEach(([resourceId, amount]) => {
        // Проверяем, является ли эффект увеличением максимального значения ресурса
        if (resourceId.includes('Max') && !resourceId.includes('Boost')) {
          const actualResourceId = resourceId.replace('Max', '');
          if (newResources[actualResourceId]) {
            const totalIncrease = Number(amount) * building.count;
            newResources[actualResourceId] = {
              ...newResources[actualResourceId],
              max: newResources[actualResourceId].max + totalIncrease
            };
            
            console.log(`Здание ${building.name} увеличивает максимум ${actualResourceId} на ${totalIncrease}`);
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
          max: newResources.usdt.max + (building.count * 50)
        };
        console.log(`Криптокошелек (${building.count} шт.) увеличивает максимум USDT до ${newResources.usdt.max}`);
      }
      
      // Криптокошелек увеличивает максимальный лимит знаний на 25% за каждый
      if (newResources.knowledge) {
        const boostFactor = 1 + (building.count * 0.25);
        newResources.knowledge = {
          ...newResources.knowledge,
          max: Math.floor(newResources.knowledge.max * boostFactor)
        };
        console.log(`Криптокошелек (${building.count} шт.) увеличивает максимум знаний до ${newResources.knowledge.max}`);
      }
    }
    
    // Применяем общие эффекты зданий на максимальные значения ресурсов
    Object.entries(building.production).forEach(([effectId, amount]) => {
      if (effectId.includes('Max') && !effectId.includes('Boost')) {
        const resourceId = effectId.replace('Max', '');
        if (newResources[resourceId]) {
          const totalIncrease = Number(amount) * building.count;
          newResources[resourceId] = {
            ...newResources[resourceId],
            max: newResources[resourceId].max + totalIncrease
          };
          console.log(`Здание ${building.name} (${building.count} шт.) увеличивает максимум ${resourceId} на ${totalIncrease}`);
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
