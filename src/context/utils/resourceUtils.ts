

import { Resource, ReferralHelper, GameState, PhaseBoosts } from '../types';

// Функция для расчета производства ресурсов
export const calculateResourceProduction = (
  resources: { [key: string]: Resource },
  buildings: any,
  referralHelpers: ReferralHelper[],
  referrals: any[],
  currentUserId?: string | null,
  referralHelperBonus: number = 0,
  phaseBoosts?: PhaseBoosts
): { [key: string]: Resource } => {
  const updatedResources = { ...resources };
  
  // Базовое производство ресурсов
  const baseProduction: {[key: string]: number} = {};
  
  // Итерируем по всем ресурсам
  Object.keys(updatedResources).forEach(resourceId => {
    updatedResources[resourceId] = { ...updatedResources[resourceId] };
    updatedResources[resourceId].production = 0;
    
    // Считаем базовую продукцию ресурса (от зданий)
    baseProduction[resourceId] = 0;
  });
  
  // Собираем базовую продукцию от зданий
  Object.keys(buildings).forEach(buildingId => {
    const building = buildings[buildingId];
    if (building.count > 0) {
      // Если у здания есть продукция ресурсов
      if (building.resourceProduction) {
        Object.keys(building.resourceProduction).forEach(resId => {
          if (updatedResources[resId]) {
            const productionPerBuilding = building.resourceProduction[resId];
            baseProduction[resId] += productionPerBuilding * building.count;
          }
        });
      }
    }
  });
  
  console.log('Базовое производство ресурсов:', baseProduction);
  
  // Подсчитываем количество активных рефералов
  const activeReferrals = referrals?.filter(r => r.activated === true || r.activated === 'true')?.length || 0;
  const referralBonus = activeReferrals * 0.05; // 5% за каждого активного реферала
  
  console.log(`Активных рефералов: ${activeReferrals}, бонус: +${referralBonus * 100}%`);
  
  // Применяем бонусы к ресурсам
  Object.keys(updatedResources).forEach(resourceId => {
    let resourceProduction = baseProduction[resourceId] || 0;
    
    // Бонус от рефералов-помощников (для всех ресурсов)
    if (referralHelperBonus > 0) {
      const helperBoost = resourceProduction * referralHelperBonus;
      console.log(`Бонус для реферала-помощника (${resourceId}): ${resourceProduction} * ${referralHelperBonus * 100}% = +${helperBoost}/сек`);
      resourceProduction += helperBoost;
    }
    
    // Бонус от активных рефералов
    if (referralBonus > 0) {
      const refBoost = resourceProduction * referralBonus;
      resourceProduction += refBoost;
    }
    
    // Применяем бонусы от текущей фазы игры
    if (phaseBoosts) {
      // Бонус к знаниям
      if (resourceId === 'knowledge' && phaseBoosts.knowledgeRate) {
        resourceProduction += resourceProduction * phaseBoosts.knowledgeRate;
      }
      
      // Бонус к вычислительной мощности
      if (resourceId === 'computingPower' && phaseBoosts.computingPower) {
        resourceProduction += resourceProduction * phaseBoosts.computingPower;
      }
    }
    
    // Обновляем окончательную продукцию ресурса
    updatedResources[resourceId].production = resourceProduction;
    updatedResources[resourceId].perSecond = resourceProduction;
  });
  
  return updatedResources;
};

// Функция для применения бонусов к максимуму хранения
export const applyStorageBoosts = (
  resources: { [key: string]: Resource },
  buildings: any,
  upgrades: any,
  phaseBoosts?: PhaseBoosts
): { [key: string]: Resource } => {
  const updatedResources = { ...resources };
  
  // Расчет бонусов хранения от зданий
  const buildingStorageBoosts: {[key: string]: {flat: number, percent: number}} = {};
  
  // Инициализация бонусов хранения
  Object.keys(updatedResources).forEach(resourceId => {
    buildingStorageBoosts[resourceId] = { flat: 0, percent: 0 };
  });
  
  // Бонусы от зданий
  Object.values(buildings).forEach((building: any) => {
    if (building.count > 0 && building.storageBoost) {
      Object.keys(building.storageBoost).forEach(resourceId => {
        if (updatedResources[resourceId]) {
          // Фиксированное увеличение максимума
          if (building.storageBoost[resourceId].flat) {
            buildingStorageBoosts[resourceId].flat += 
              building.storageBoost[resourceId].flat * building.count;
          }
          
          // Процентное увеличение максимума
          if (building.storageBoost[resourceId].percent) {
            buildingStorageBoosts[resourceId].percent += 
              building.storageBoost[resourceId].percent * building.count;
          }
        }
      });
    }
  });
  
  // Бонусы от исследований
  const basicBlockchainUpgrade = upgrades.basicBlockchain || upgrades.blockchain_basics;
  
  // Бонус от исследования "Основы блокчейна"
  if (basicBlockchainUpgrade && basicBlockchainUpgrade.purchased) {
    console.log('Исследование Основы блокчейна увеличивает макс. знаний на 50%');
    buildingStorageBoosts.knowledge.percent += 0.5; // +50% к максимуму знаний
  }
  
  // Бонус криптокошелька
  if (buildings.cryptoWallet && buildings.cryptoWallet.count > 0) {
    // Проверяем, есть ли свойство storageBoost у криптокошелька
    if (!buildingStorageBoosts.usdt) {
      buildingStorageBoosts.usdt = { flat: 0, percent: 0 };
    }
    
    // Увеличиваем максимум USDT на 50 за каждый криптокошелек
    buildingStorageBoosts.usdt.flat += 50 * buildings.cryptoWallet.count;
    
    // Увеличиваем максимум знаний на 25% за каждый криптокошелек
    buildingStorageBoosts.knowledge.percent += 0.25 * buildings.cryptoWallet.count;
  }
  
  // Применяем бонусы хранения
  Object.keys(updatedResources).forEach(resourceId => {
    const resource = updatedResources[resourceId];
    const boost = buildingStorageBoosts[resourceId] || { flat: 0, percent: 0 };
    
    // Базовый максимум из конфигурации ресурса
    const baseMax = resource.max;
    
    // Фиксированный бонус от зданий
    const buildingFlatBonus = boost.flat;
    
    // Процентный бонус от зданий и исследований
    const buildingPercentBonus = boost.percent;
    
    // Бонус к хранению от фазы игры
    const phaseStorageBonus = phaseBoosts?.maxStorage || 0;
    
    // Итоговый максимум
    const finalMax = baseMax + buildingFlatBonus;
    
    // Процентное увеличение (от зданий, исследований и фазы)
    const percentIncrease = buildingPercentBonus + phaseStorageBonus;
    
    // Итоговый максимум с учетом процентного увеличения
    const maxWithPercent = finalMax * (1 + percentIncrease);
    
    // Отладочная информация
    if (resourceId === 'knowledge') {
      console.log(`Итоговый максимум знаний: ${maxWithPercent.toFixed(2)} (база: ${baseMax}, от зданий: ${buildingFlatBonus}, от улучшений: 0, процентный бонус: ${percentIncrease.toFixed(2)})`);
    } else if (resourceId === 'usdt') {
      console.log(`Итоговый максимум USDT: ${maxWithPercent.toFixed(2)} (база: ${baseMax}, от зданий: ${buildingFlatBonus}, от улучшений: 0, процентный бонус: ${percentIncrease.toFixed(2)})`);
    } else if (resourceId === 'electricity') {
      console.log(`Итоговый максимум электричества: ${Math.round(maxWithPercent)}`);
    } else if (resourceId === 'computingPower') {
      console.log(`Итоговый максимум вычислительной мощности: ${Math.round(maxWithPercent)}`);
    }
    
    // Обновляем максимальное значение ресурса
    updatedResources[resourceId].max = maxWithPercent;
  });
  
  return updatedResources;
};

// Функция для обновления значений ресурсов с учетом времени
export const updateResourceValues = (
  resources: { [key: string]: Resource },
  deltaTime: number
): { [key: string]: Resource } => {
  const updatedResources = { ...resources };
  
  // Обновляем значение каждого ресурса
  Object.keys(updatedResources).forEach(resourceId => {
    const resource = updatedResources[resourceId];
    
    // Только для разблокированных ресурсов
    if (resource.unlocked) {
      // Расчет увеличения за время
      const increase = (resource.production * deltaTime) / 1000;
      
      // Обновляем значение с ограничением по максимуму
      updatedResources[resourceId] = {
        ...resource,
        value: Math.min(resource.value + increase, resource.max)
      };
    }
  });
  
  return updatedResources;
};

// Обновляет максимальные значения ресурсов при изменении состояния игры
export const updateResourceMaxValues = (state: GameState): GameState => {
  // Применяем бонусы хранения к ресурсам
  const updatedResources = applyStorageBoosts(
    state.resources, 
    state.buildings, 
    state.upgrades,
    state.phaseBoosts
  );
  
  return {
    ...state,
    resources: updatedResources
  };
};

// Проверяет, достаточно ли ресурсов для покупки
export const hasEnoughResources = (
  state: GameState,
  cost: { [resourceId: string]: number }
): boolean => {
  for (const [resourceId, amount] of Object.entries(cost)) {
    if (!state.resources[resourceId] || state.resources[resourceId].value < amount) {
      return false;
    }
  }
  return true;
};

// Проверяет и обновляет разблокировки в зависимости от ресурсов
export const checkUnlocks = (state: GameState): GameState => {
  let updatedState = { ...state };
  
  // Проверяем разблокировку генератора при достижении 11 USDT
  if (state.resources.usdt.value >= 11 && !state.buildingUnlocked.generator) {
    console.log("Разблокируем генератор при достижении 11 USDT");
    updatedState = {
      ...updatedState,
      buildingUnlocked: {
        ...updatedState.buildingUnlocked,
        generator: true
      }
    };
    
    if (updatedState.buildings.generator) {
      updatedState.buildings = {
        ...updatedState.buildings,
        generator: {
          ...updatedState.buildings.generator,
          unlocked: true
        }
      };
    }
  }
  
  // Проверяем разблокировку домашнего компьютера при достижении 10 электричества
  if (state.resources.electricity && 
      state.resources.electricity.value >= 10 && 
      !state.buildingUnlocked.homeComputer) {
    console.log("Разблокируем домашний компьютер при достижении 10 электричества");
    updatedState = {
      ...updatedState,
      buildingUnlocked: {
        ...updatedState.buildingUnlocked,
        homeComputer: true
      }
    };
    
    if (updatedState.buildings.homeComputer) {
      updatedState.buildings = {
        ...updatedState.buildings,
        homeComputer: {
          ...updatedState.buildings.homeComputer,
          unlocked: true
        }
      };
    }
  }
  
  return updatedState;
};

