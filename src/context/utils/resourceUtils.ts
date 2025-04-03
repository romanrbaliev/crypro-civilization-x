
// Утилиты для работы с ресурсами
import { GameState, Resource, Building, Upgrade } from '../types';

/**
 * Проверяет, достаточно ли у игрока ресурсов для покупки
 */
export const hasEnoughResources = (
  state: GameState,
  costs: { [key: string]: number }
): boolean => {
  for (const [resourceId, amount] of Object.entries(costs)) {
    const resource = state.resources[resourceId];
    if (!resource || resource.value < amount) {
      return false;
    }
  }
  return true;
};

/**
 * Проверяет разблокировки ресурсов, зданий и улучшений
 */
export const checkUnlocks = (state: GameState): GameState => {
  // Используем внешнюю функцию проверки разблокировок из utils/unlockManager
  const { checkAllUnlocks } = require('../../utils/unlockManager');
  return checkAllUnlocks(state);
};

/**
 * Расчет стоимости здания с учетом количества уже построенных
 */
export const calculateBuildingCost = (
  building: Building
): { [key: string]: number } => {
  const costs: { [key: string]: number } = {};
  
  // Проверяем наличие cost в здании
  if (!building.cost) {
    console.warn(`Здание ${building.id} не имеет определенной стоимости`);
    return costs;
  }
  
  // Применяем множитель стоимости на основе количества уже построенных зданий
  const multiplier = building.count > 0 
    ? Math.pow(building.costMultiplier || 1.1, building.count) 
    : 1;
  
  // Рассчитываем стоимость каждого ресурса
  for (const [resourceId, baseAmount] of Object.entries(building.cost)) {
    costs[resourceId] = Math.ceil(baseAmount * multiplier);
  }
  
  return costs;
};

/**
 * Форматирование числа для отображения
 */
export const formatNumber = (num: number): string => {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  } else if (Number.isInteger(num)) {
    return num.toString();
  } else {
    return num.toFixed(2);
  }
};

/**
 * Рассчитывает производство ресурсов с учетом бонусов
 */
export const calculateTotalProduction = (
  state: GameState,
  resourceId: string
): number => {
  // Базовое производство ресурса
  let production = state.resources[resourceId]?.baseProduction || 0;
  
  // Добавляем производство от зданий
  for (const building of Object.values(state.buildings)) {
    if (!building.unlocked || building.count === 0) continue;
    
    const buildingProduction = building.production[resourceId] || 0;
    production += buildingProduction * building.count;
  }
  
  // Применяем бонусы от улучшений
  for (const upgrade of Object.values(state.upgrades)) {
    if (!upgrade.purchased) continue;
    
    const productionBonus = upgrade.effects[`${resourceId}ProductionBonus`] || 0;
    const productionMultiplier = upgrade.effects[`${resourceId}ProductionMultiplier`] || 0;
    
    production += productionBonus;
    if (productionMultiplier > 0) {
      production *= (1 + productionMultiplier);
    }
  }
  
  return production;
};

/**
 * Обновляет максимальные значения ресурсов на основе зданий и улучшений
 */
export const updateResourceMaxValues = (state: GameState): GameState => {
  // Создаем копию состояния для изменений
  const newState = { ...state };
  const newResources = { ...newState.resources };
  
  // Проходим по всем ресурсам и обновляем их максимальные значения
  for (const resourceId in newResources) {
    const resource = newResources[resourceId];
    
    // Базовое максимальное значение для разных типов ресурсов
    let baseMax = 100; // По умолчанию для обычных ресурсов
    
    // Определяем базовый максимум для разных ресурсов
    switch (resourceId) {
      case 'knowledge':
        baseMax = 100;
        break;
      case 'usdt':
        baseMax = 50;
        break;
      case 'electricity':
        baseMax = 100;
        break;
      case 'computingPower':
        baseMax = 1000;
        break;
      case 'bitcoin':
        baseMax = 0.01;
        break;
    }
    
    // Начинаем с базового максимального значения
    let maxValue = resource.max || baseMax;
    
    // Учитываем бонусы от зданий для максимальных значений ресурсов
    // Например, кошелек увеличивает максимум USDT
    if (resourceId === 'usdt') {
      // Криптокошелек увеличивает максимум USDT на 50 за каждый
      if (newState.buildings.cryptoWallet) {
        const walletCount = newState.buildings.cryptoWallet.count || 0;
        maxValue += 50 * walletCount;
      }
      
      // Улучшенный кошелек увеличивает максимум USDT на 150 за каждый
      if (newState.buildings.improvedWallet || newState.buildings.enhancedWallet) {
        const improvedWalletCount = (newState.buildings.improvedWallet?.count || 0) + 
                                   (newState.buildings.enhancedWallet?.count || 0);
        maxValue += 150 * improvedWalletCount;
      }
    } 
    else if (resourceId === 'bitcoin') {
      // Улучшенный кошелек увеличивает максимум BTC на 1 за каждый
      if (newState.buildings.improvedWallet || newState.buildings.enhancedWallet) {
        const improvedWalletCount = (newState.buildings.improvedWallet?.count || 0) + 
                                   (newState.buildings.enhancedWallet?.count || 0);
        maxValue += 1 * improvedWalletCount;
      }
    }
    else if (resourceId === 'knowledge') {
      // Криптобиблиотека увеличивает максимум знаний на 100 за каждую
      if (newState.buildings.cryptoLibrary) {
        const libraryCount = newState.buildings.cryptoLibrary.count || 0;
        maxValue += 100 * libraryCount;
      }
      
      // Криптокошелек увеличивает максимум знаний на 25% за каждый
      if (newState.buildings.cryptoWallet) {
        const walletCount = newState.buildings.cryptoWallet.count || 0;
        const knowledgeMaxBoost = 0.25 * walletCount; // +25% за каждый кошелек
        maxValue = maxValue * (1 + knowledgeMaxBoost);
      }
      
      // Проверяем наличие исследования "Основы блокчейна"
      if (newState.upgrades.blockchainBasics?.purchased || 
          newState.upgrades.basicBlockchain?.purchased || 
          newState.upgrades.blockchain_basics?.purchased) {
        // Увеличиваем максимум знаний на 50%
        maxValue = maxValue * 1.5;
      }
    }
    
    // Учитываем бонусы от улучшений для максимальных значений ресурсов
    if (newState.upgrades.cryptoWalletSecurity?.purchased || 
        newState.upgrades.walletSecurity?.purchased) {
      if (resourceId === 'usdt') {
        // Безопасность криптокошельков увеличивает максимум USDT на 25%
        maxValue = maxValue * 1.25;
      }
    }
    
    // Обновляем максимальное значение ресурса
    newResources[resourceId] = {
      ...resource,
      max: maxValue
    };
    
    // Проверяем, чтобы текущее значение не превышало максимальное
    if (resource.value > maxValue) {
      newResources[resourceId].value = maxValue;
    }
  }
  
  return {
    ...newState,
    resources: newResources
  };
};
