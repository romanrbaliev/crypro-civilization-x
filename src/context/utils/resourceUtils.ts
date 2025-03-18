
import { Resource, Building, ReferralHelper, GameState } from '../types';
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
  
  // Получаем бонус от рефералов (ИСПРАВЛЕНО: функция calculateReferralBonus теперь учитывает только активных рефералов)
  const referralBonus = calculateReferralBonus(referrals);
  
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

export const applyStorageBoosts = (
  resources: { [key: string]: Resource },
  buildings: { [key: string]: Building }
): { [key: string]: Resource } => {
  const newResources = { ...resources };
  
  // Логика увеличения хранилища от зданий здесь...
  // (оставляем существующую логику)
  
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

// Обновление максимальных значений ресурсов
export const updateResourceMaxValues = (state: GameState): GameState => {
  const newResources = { ...state.resources };
  
  // Обновление максимальных значений ресурсов в зависимости от зданий и улучшений
  // Пример: Криптокошелёк увеличивает максимальное хранение USDT и знаний
  const cryptoWalletCount = state.buildings.cryptoWallet?.count || 0;
  
  if (cryptoWalletCount > 0) {
    // Увеличиваем максимальный лимит USDT на 50 за каждый криптокошелек
    if (newResources.usdt) {
      newResources.usdt = {
        ...newResources.usdt,
        max: 50 + (cryptoWalletCount * 50)  // Базовый лимит 50 + 50 за каждый кошелек
      };
    }
    
    // Увеличиваем максимальный лимит знаний на 25% за каждый криптокошелек
    if (newResources.knowledge) {
      newResources.knowledge = {
        ...newResources.knowledge,
        max: 100 * (1 + (cryptoWalletCount * 0.25))  // Базовый лимит 100 + 25% за каждый кошелек
      };
    }
  }
  
  // Проверка улучшений для увеличения максимальных значений
  Object.values(state.upgrades).forEach(upgrade => {
    if (upgrade.purchased) {
      Object.entries(upgrade.effect).forEach(([effectId, amount]) => {
        if (effectId.includes('MaxStorage')) {
          const resourceId = effectId.replace('MaxStorage', '');
          if (newResources[resourceId]) {
            newResources[resourceId] = {
              ...newResources[resourceId],
              max: newResources[resourceId].max * (1 + amount)
            };
          }
        }
      });
    }
  });
  
  return {
    ...state,
    resources: newResources
  };
};
