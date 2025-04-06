import { GameState, Resource, Building, Upgrade } from '../types';

// Проверяет, достаточно ли ресурсов для покупки
export const hasEnoughResources = (
  state: GameState,
  cost: Record<string, number>
): boolean => {
  if (!cost) return true;
  
  for (const resourceId in cost) {
    const requiredAmount = cost[resourceId];
    if (!state.resources[resourceId] || state.resources[resourceId].value < requiredAmount) {
      return false;
    }
  }
  return true;
};

// Обновляет максимальные значения ресурсов в зависимости от зданий и улучшений
export const updateResourceMaxValues = (state: GameState): GameState => {
  // Копируем ресурсы для модификации
  const updatedResources = { ...state.resources };
  
  // Базовые максимальные значения
  const baseMaxValues = {
    knowledge: 100,
    usdt: 50,
    electricity: 100,
    computingPower: 1000,
    bitcoin: 0.01
  };
  
  // Рассчитываем бонусы от зданий
  let knowledgeMaxBonus = 0;
  let usdtMaxBonus = 0;
  let bitcoinMaxBonus = 0;
  
  // Проверяем здания с эффектами
  for (const buildingId in state.buildings) {
    const building = state.buildings[buildingId];
    if (building.count > 0 && building.effects) {
      // Умножаем эффекты на количество зданий
      if (building.effects.knowledgeMaxBoost) {
        if (typeof building.effects.knowledgeMaxBoost === 'number') {
          // Процентный бонус
          knowledgeMaxBonus += building.effects.knowledgeMaxBoost * building.count;
        } else {
          // Фиксированный бонус
          knowledgeMaxBonus += Number(building.effects.knowledgeMaxBoost) * building.count;
        }
      }
      
      if (building.effects.usdtMaxBoost) {
        usdtMaxBonus += Number(building.effects.usdtMaxBoost) * building.count;
      }
      
      if (building.effects.bitcoinMaxBoost) {
        bitcoinMaxBonus += Number(building.effects.bitcoinMaxBoost) * building.count;
      }
    }
  }
  
  // Проверяем бонусы от улучшений
  for (const upgradeId in state.upgrades) {
    const upgrade = state.upgrades[upgradeId];
    if (upgrade.purchased && upgrade.effects) {
      if (upgrade.effects.knowledgeMaxBoost) {
        knowledgeMaxBonus += Number(upgrade.effects.knowledgeMaxBoost);
      }
      
      if (upgrade.effects.usdtMaxBoost) {
        usdtMaxBonus += Number(upgrade.effects.usdtMaxBoost);
      }
      
      if (upgrade.effects.bitcoinMaxBoost) {
        bitcoinMaxBonus += Number(upgrade.effects.bitcoinMaxBoost);
      }
    }
  }
  
  // Применяем бонусы к базовым значениям
  if (updatedResources.knowledge) {
    updatedResources.knowledge = {
      ...updatedResources.knowledge,
      max: baseMaxValues.knowledge * (1 + knowledgeMaxBonus)
    };
  }
  
  if (updatedResources.usdt) {
    updatedResources.usdt = {
      ...updatedResources.usdt,
      max: baseMaxValues.usdt + usdtMaxBonus
    };
  }
  
  if (updatedResources.bitcoin) {
    updatedResources.bitcoin = {
      ...updatedResources.bitcoin,
      max: baseMaxValues.bitcoin + bitcoinMaxBonus
    };
  }
  
  return {
    ...state,
    resources: updatedResources
  };
};

// Проверяет необходимые условия для разблокировки здания
export const canUnlockBuilding = (
  state: GameState,
  buildingId: string
): boolean => {
  const building = state.buildings[buildingId];
  if (!building) return false;
  
  // Проверка специальных условий для каждого здания
  switch (buildingId) {
    case 'practice':
      // Разблокируется после 3 кликов на "Изучить крипту"
      return state.counters.knowledgeClicks && 
             state.counters.knowledgeClicks.value >= 3;
      
    case 'generator':
      // Разблокируется после накопления 11 USDT
      return state.resources.usdt && 
             state.resources.usdt.value >= 11;
      
    case 'homeComputer':
      // Разблокируется после покупки генератора
      return state.buildings.generator && 
             state.buildings.generator.count > 0;
      
    case 'cryptoWallet':
      // Разблокируется после исследования основ блокчейна
      return state.upgrades.blockchainBasics && 
             state.upgrades.blockchainBasics.purchased;
      
    case 'internetChannel':
      // Разблокируется после покупки домашнего компьютера
      return state.buildings.homeComputer && 
             state.buildings.homeComputer.count > 0;
      
    case 'miner':
      // Разблокируется после исследования основ криптовалют
      return state.upgrades.cryptoCurrencyBasics && 
             state.upgrades.cryptoCurrencyBasics.purchased;
      
    case 'coolingSystem':
      // Разблокируется после 2-го уровня домашнего компьютера
      return state.buildings.homeComputer && 
             state.buildings.homeComputer.count >= 2;
      
    case 'autoMiner':
      // Разблокируется после покупки майнера и запаса электричества
      return state.buildings.miner && 
             state.buildings.miner.count > 0 &&
             state.resources.electricity &&
             state.resources.electricity.value >= 10;
      
    case 'improvedWallet':
      // Разблокируется после достижения 5 уровня криптокошелька
      return state.buildings.cryptoWallet && 
             state.buildings.cryptoWallet.count >= 5;
      
    case 'cryptoLibrary':
      // Разблокируется после "Основы криптовалют"
      return state.upgrades.cryptoCurrencyBasics && 
             state.upgrades.cryptoCurrencyBasics.purchased;
      
    default:
      if (building.requirements) {
        for (const reqResourceId in building.requirements) {
          const requiredAmount = building.requirements[reqResourceId]; 
          const currentAmount = state.resources[reqResourceId]?.value || 0;
          if (currentAmount < Number(requiredAmount)) {
            return false;
          }
        }
        return true;
      }
      return false;
  }
};

// Проверяет необходимые условия для разблокировки улучшения
export const canUnlockUpgrade = (
  state: GameState,
  upgradeId: string
): boolean => {
  const upgrade = state.upgrades[upgradeId];
  if (!upgrade) return false;
  
  // Проверка специальных условий для каждого улучшения
  switch (upgradeId) {
    case 'blockchainBasics':
      // Разблокируется после покупки здания "Практика"
      return state.buildings.practice && 
             state.buildings.practice.count > 0;
      
    case 'walletSecurity':
      // Разблокируется после покупки Криптокошелька
      return state.buildings.cryptoWallet && 
             state.buildings.cryptoWallet.count > 0;
      
    case 'cryptoCurrencyBasics':
      // Разблокируется после исследования "Основы блокчейна"
      return state.upgrades.blockchainBasics && 
             state.upgrades.blockchainBasics.purchased;
      
    case 'algorithmOptimization':
      // Разблокируется после покупки Майнера
      return state.buildings.miner && 
             state.buildings.miner.count > 0;
      
    case 'proofOfWork':
      // Разблокируется после исследования "Оптимизация алгоритмов"
      return state.upgrades.algorithmOptimization && 
             state.upgrades.algorithmOptimization.purchased;
      
    case 'energyEfficientComponents':
      // Разблокируется после покупки Системы охлаждения
      return state.buildings.coolingSystem && 
             state.buildings.coolingSystem.count > 0;
      
    case 'cryptoTrading':
      // Разблокируется после покупки Улучшенного кошелька
      return state.buildings.improvedWallet && 
             state.buildings.improvedWallet.count > 0;
      
    case 'tradingBot':
      // Разблокируется после "Криптовалютный трейдинг"
      return state.upgrades.cryptoTrading && 
             state.upgrades.cryptoTrading.purchased;
      
    case 'cryptoCommunity':
      // Разблокируется после накопления определенного количества знаний
      return state.resources.knowledge && 
             state.resources.knowledge.value >= 200;
      
    default:
      // Проверка наличия условий разблокировки
      if (upgrade.unlockCondition) {
        for (const reqResourceId in upgrade.unlockCondition) {
          const requiredAmount = upgrade.unlockCondition[reqResourceId]; 
          const currentAmount = state.resources[reqResourceId]?.value || 0;
          if (currentAmount < Number(requiredAmount)) {
            return false;
          }
        }
        return true;
      }
      
      // Проверка требуемых улучшений
      if (upgrade.requiredUpgrades && upgrade.requiredUpgrades.length > 0) {
        return upgrade.requiredUpgrades.every(reqUpgradeId => 
          state.upgrades[reqUpgradeId] && state.upgrades[reqUpgradeId].purchased
        );
      }
      
      return true;
  }
};

// Обновляет ресурсы на основе производства от зданий
export const updateResourceProduction = (state: GameState): GameState => {
  const updatedResources = { ...state.resources };
  
  // Сброс всех значений производства и потребления
  for (const resourceId in updatedResources) {
    updatedResources[resourceId] = {
      ...updatedResources[resourceId],
      production: 0,
      consumption: 0,
      perSecond: 0
    };
  }
  
  // Расчет производства от зданий
  for (const buildingId in state.buildings) {
    const building = state.buildings[buildingId];
    if (building.count > 0) {
      // Расчет производства
      if (building.production) {
        for (const resourceId in building.production) {
          if (updatedResources[resourceId]) {
            const productionRate = Number(building.production[resourceId]) * building.count;
            updatedResources[resourceId].production += productionRate;
          }
        }
      }
      
      // Расчет потребления
      if (building.consumption) {
        for (const resourceId in building.consumption) {
          if (updatedResources[resourceId]) {
            const consumptionRate = Number(building.consumption[resourceId]) * building.count;
            updatedResources[resourceId].consumption += consumptionRate;
          }
        }
      }
    }
  }
  
  // Вычисление конечных значений perSecond
  for (const resourceId in updatedResources) {
    const resource = updatedResources[resourceId];
    resource.perSecond = resource.production - resource.consumption;
  }
  
  return {
    ...state,
    resources: updatedResources
  };
};

// Применяет эффекты улучшений (функция-заглушка, можно расширить)
export const applyUpgradeEffects = (state: GameState): GameState => {
  // Простая заглушка
  return state;
};

export function checkUnlocks(state: GameState): GameState {
  return state;
}
