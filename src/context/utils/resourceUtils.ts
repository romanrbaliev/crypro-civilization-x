import { Resource, Building, ReferralHelper, GameState } from '../types';
import { calculateBuildingBoostFromHelpers, calculateHelperBoost } from '@/utils/helpers';

/**
 * Рассчитывает общее производство ресурсов с учетом всех зданий, бустов и помощников
 * @param resources Текущие ресурсы
 * @param buildings Имеющиеся здания
 * @param referralHelpers Помощники рефералов
 * @param referrals Количество активных рефералов 
 * @param myReferralCode Реферальный код пользователя
 * @returns Обновленные ресурсы с учетом всех производителей
 */
export const calculateResourceProduction = (
  resources: { [key: string]: Resource },
  buildings: { [key: string]: Building },
  referralHelpers: ReferralHelper[],
  referrals: any[],
  myReferralCode: string
): { [key: string]: Resource } => {
  const updatedResources = { ...resources };
  
  // Сбрасываем производство в секунду для всех ресурсов
  Object.keys(updatedResources).forEach(resourceId => {
    updatedResources[resourceId] = {
      ...updatedResources[resourceId],
      perSecond: 0
    };
  });
  
  // Рассчитываем базовое производство от зданий с учетом помощников
  Object.values(buildings).forEach(building => {
    if (building.count > 0) {
      // Получаем бонус эффективности от помощников (+5% за каждого помощника)
      const helperBoost = calculateBuildingBoostFromHelpers(building.id, referralHelpers);
      
      // Для каждого типа ресурса, производимого зданием
      Object.entries(building.production).forEach(([resourceId, baseProduction]) => {
        // Пропускаем увеличение максимального хранения
        if (resourceId.endsWith('Max') || resourceId.endsWith('Boost')) return;
        
        // Эффективный уровень производства с учетом количества зданий и бонусов
        const effectiveProduction = baseProduction * building.count * (1 + helperBoost);
        
        if (updatedResources[resourceId]) {
          updatedResources[resourceId] = {
            ...updatedResources[resourceId],
            perSecond: updatedResources[resourceId].perSecond + effectiveProduction
          };
        }
      });
    }
  });
  
  // Добавляем бонус производства от активных рефералов (+5% за каждого)
  const activeReferrals = referrals.filter(ref => ref.activated);
  const referralProductionBoost = activeReferrals.length * 0.05;
  
  // Добавляем бонус от наших собственных помощников (+10% за каждую принятую работу)
  const helperProductionBoost = calculateHelperBoost(myReferralCode, referralHelpers);
  
  // Применяем общий бонус производства ко всем ресурсам
  Object.keys(updatedResources).forEach(resourceId => {
    if (updatedResources[resourceId].perSecond > 0) {
      updatedResources[resourceId] = {
        ...updatedResources[resourceId],
        perSecond: updatedResources[resourceId].perSecond * (1 + referralProductionBoost + helperProductionBoost)
      };
    }
  });
  
  return updatedResources;
};

/**
 * Увеличивает максимальный размер хранилища определенных ресурсов на основе зданий
 * @param resources Текущие ресурсы
 * @param buildings Имеющиеся здания 
 * @returns Обновленные ресурсы с измененными максимальными значениями
 */
export const applyStorageBoosts = (
  resources: { [key: string]: Resource },
  buildings: { [key: string]: Building }
): { [key: string]: Resource } => {
  const updatedResources = { ...resources };
  
  // Применяем увеличение максимального хранения от зданий
  Object.values(buildings).forEach(building => {
    if (building.count > 0) {
      Object.entries(building.production).forEach(([boostId, amount]) => {
        // Проверяем, является ли это бустом максимального хранения
        if (boostId.endsWith('Max')) {
          const resourceId = boostId.replace('Max', '');
          if (updatedResources[resourceId]) {
            updatedResources[resourceId] = {
              ...updatedResources[resourceId],
              max: updatedResources[resourceId].max + (amount * building.count)
            };
          }
        }
      });
    }
  });
  
  return updatedResources;
};

/**
 * Обновляет значения ресурсов на основе их производства в секунду и прошедшего времени
 * @param resources Текущие ресурсы 
 * @param deltaTime Прошедшее время в миллисекундах
 * @returns Обновленные значения ресурсов
 */
export const updateResourceValues = (
  resources: { [key: string]: Resource },
  deltaTime: number
): { [key: string]: Resource } => {
  const deltaSeconds = deltaTime / 1000;
  const updatedResources = { ...resources };
  
  Object.keys(updatedResources).forEach(resourceId => {
    const resource = updatedResources[resourceId];
    const perSecondValue = resource.perSecond;
    
    // Если есть производство и ресурс разблокирован
    if (perSecondValue !== 0 && resource.unlocked) {
      // Изменение за прошедшее время
      const change = perSecondValue * deltaSeconds;
      
      // Новое значение с ограничением по максимуму
      let newValue = resource.value + change;
      if (newValue > resource.max && resource.max !== Infinity) {
        newValue = resource.max;
      } else if (newValue < 0) {
        newValue = 0;
      }
      
      updatedResources[resourceId] = {
        ...resource,
        value: newValue
      };
    }
  });
  
  return updatedResources;
};

/**
 * Проверяет наличие достаточного количества ресурсов для приобретения
 * @param resources Текущие ресурсы
 * @param cost Стоимость в виде объекта {ресурс: количество}
 * @returns Булево значение, указывающее на достаточность ресурсов
 */
export const isEnoughResources = (
  resources: { [key: string]: Resource },
  cost: { [resourceId: string]: number }
): boolean => {
  return Object.entries(cost).every(([resourceId, amount]) => {
    return resources[resourceId] && resources[resourceId].value >= amount;
  });
};

/**
 * Проверяет наличие достаточного количества ресурсов для приобретения (alias для isEnoughResources)
 */
export const hasEnoughResources = (
  state: GameState,
  cost: { [resourceId: string]: number }
): boolean => {
  return Object.entries(cost).every(([resourceId, amount]) => {
    return state.resources[resourceId] && state.resources[resourceId].value >= amount;
  });
};

/**
 * Обновляет максимальные значения ресурсов в зависимости от приобретенных улучшений и зданий
 * @param state Текущее состояние игры
 * @returns Обновленное состояние игры с пересчитанными максимальными значениями ресурсов
 */
export const updateResourceMaxValues = (state: GameState): GameState => {
  // Копируем ресурсы для обновления
  const updatedResources = { ...state.resources };
  
  // Сначала устанавливаем базовые значения максимума для всех ресурсов
  Object.keys(updatedResources).forEach(resourceId => {
    const resource = updatedResources[resourceId];
    // Базовые максимальные значения
    let baseMax = 100; // Значение по умолчанию
    
    switch (resourceId) {
      case 'knowledge':
        baseMax = 100;
        break;
      case 'usdt':
        baseMax = 50;
        break;
      case 'electricity':
        baseMax = 1000;
        break;
      case 'computingPower':
        baseMax = 500;
        break;
      case 'btc':
        baseMax = 1;
        break;
      // Добавьте другие ресурсы при необходимости
      default:
        baseMax = 100;
    }
    
    updatedResources[resourceId] = {
      ...resource,
      max: baseMax
    };
  });
  
  // Применяем множители от исследований
  Object.values(state.upgrades).forEach(upgrade => {
    if (upgrade.purchased) {
      Object.entries(upgrade.effect).forEach(([effectId, value]) => {
        if (effectId.endsWith('Max')) {
          const resourceId = effectId.replace('Max', '');
          if (updatedResources[resourceId]) {
            updatedResources[resourceId] = {
              ...updatedResources[resourceId],
              max: updatedResources[resourceId].max * (1 + value)
            };
          }
        }
      });
    }
  });
  
  // Применяем бонусы от зданий
  const boostedResources = applyStorageBoosts(updatedResources, state.buildings);
  
  return {
    ...state,
    resources: boostedResources
  };
};

/**
 * Проверяет условия для разблокировки ресурсов, зданий и улучшений на основе текущего состояния
 * @param state Текущее состояние игры
 * @returns Обновленное состояние с разблокированными элементами, если выполнены условия
 */
export const checkUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  let hasChanges = false;
  
  // Проверяем разблокировку генератора
  if (!state.buildings.generator.unlocked && state.resources.usdt.value >= 11) {
    newState = {
      ...newState,
      buildings: {
        ...newState.buildings,
        generator: {
          ...newState.buildings.generator,
          unlocked: true
        }
      }
    };
    hasChanges = true;
  }
  
  // Проверяем разблокировку домашнего компьютера
  if (!state.buildings.homeComputer.unlocked && state.resources.electricity.unlocked && state.resources.electricity.value >= 10) {
    newState = {
      ...newState,
      buildings: {
        ...newState.buildings,
        homeComputer: {
          ...newState.buildings.homeComputer,
          unlocked: true
        }
      }
    };
    hasChanges = true;
  }
  
  // Возвращаем обновленное состояние только если были изменения
  return hasChanges ? newState : state;
};

/**
 * Рассчитывает стоимость с учетом множителя
 * @param baseCost Базовая стоимость
 * @param count Текущее количество
 * @param multiplier Множитель стоимости
 * @returns Объект с обновленными значениями стоимости
 */
export const calculateCost = (
  baseCost: { [resourceId: string]: number },
  count: number,
  multiplier: number
): { [resourceId: string]: number } => {
  const finalCost: { [resourceId: string]: number } = {};
  
  Object.entries(baseCost).forEach(([resourceId, baseAmount]) => {
    finalCost[resourceId] = Math.floor(baseAmount * Math.pow(multiplier, count));
  });
  
  return finalCost;
};

/**
 * Списывает ресурсы в соответствии с указанной стоимостью
 * @param resources Текущие ресурсы
 * @param cost Стоимость для списания
 * @returns Обновленные ресурсы после списания
 */
export const deductResources = (
  resources: { [key: string]: Resource },
  cost: { [resourceId: string]: number }
): { [key: string]: Resource } => {
  const newResources = { ...resources };
  
  Object.entries(cost).forEach(([resourceId, amount]) => {
    if (newResources[resourceId]) {
      newResources[resourceId] = {
        ...newResources[resourceId],
        value: newResources[resourceId].value - amount
      };
    }
  });
  
  return newResources;
};
