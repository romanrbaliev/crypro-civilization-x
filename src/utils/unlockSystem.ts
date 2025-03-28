import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

// Типы условий разблокировки
export type UnlockCondition = {
  resources?: { [resourceId: string]: number }; // Требования к ресурсам
  buildings?: { [buildingId: string]: number }; // Требования к зданиям
  buildingCount?: { [buildingId: string]: number }; // Альтернативный формат требований к зданиям
  upgrades?: string[]; // Требуемые исследования
  counters?: { [counterId: string]: number }; // Требования к счетчикам
  custom?: (state: GameState) => boolean; // Пользовательская функция проверки
};

// Центральная функция проверки условий разблокировки
export function checkUnlockCondition(
  state: GameState,
  condition: UnlockCondition
): boolean {
  // Проверка требований к ресурсам
  if (condition.resources) {
    for (const [resourceId, amount] of Object.entries(condition.resources)) {
      if (!state.resources[resourceId] || state.resources[resourceId].value < amount) {
        return false;
      }
    }
  }

  // Проверка требований к зданиям
  if (condition.buildings) {
    for (const [buildingId, count] of Object.entries(condition.buildings)) {
      if (!state.buildings[buildingId] || state.buildings[buildingId].count < count) {
        return false;
      }
    }
  }
  
  // Проверка альтернативного формата требований к зданиям
  if (condition.buildingCount) {
    for (const [buildingId, count] of Object.entries(condition.buildingCount)) {
      if (!state.buildings[buildingId] || state.buildings[buildingId].count < count) {
        return false;
      }
    }
  }

  // Проверка требований к исследованиям
  if (condition.upgrades) {
    for (const upgradeId of condition.upgrades) {
      if (!state.upgrades[upgradeId] || !state.upgrades[upgradeId].purchased) {
        return false;
      }
    }
  }

  // Проверка требований к счетчикам
  if (condition.counters) {
    for (const [counterId, value] of Object.entries(condition.counters)) {
      const counter = state.counters[counterId];
      if (!counter || (typeof counter === 'object' && counter.value < value) || 
          (typeof counter === 'number' && counter < value)) {
        return false;
      }
    }
  }

  // Выполнение пользовательской функции проверки, если она есть
  if (condition.custom && !condition.custom(state)) {
    return false;
  }

  // Если все проверки пройдены, условие выполнено
  return true;
}

// Ключевые последовательности разблокировки
export const UNLOCK_SEQUENCES = {
  // Последовательность практики
  PRACTICE: (state: GameState) => {
    // Практика разблокируется после 2-х использований "Применить знания"
    const applyKnowledgeCount = state.counters.applyKnowledge 
      ? (typeof state.counters.applyKnowledge === 'object' 
          ? state.counters.applyKnowledge.value 
          : state.counters.applyKnowledge)
      : 0;
    
    return applyKnowledgeCount >= 2;
  },
  
  // Проверка разблокировки основных исследований
  BASIC_BLOCKCHAIN: (state: GameState) => {
    // "Основы блокчейна" разблокируются после покупки генератора
    return state.buildings.generator && state.buildings.generator.count > 0;
  },
  
  // Проверка разблокировки основ криптовалют
  CRYPTO_CURRENCY_BASICS: (state: GameState) => {
    // "Основы криптовалют" разблокируются после покупки "Основы блокчейна"
    const basicBlockchainPurchased = state.upgrades.basicBlockchain?.purchased ||
                                    state.upgrades.blockchain_basics?.purchased ||
                                    state.upgrades.blockchainBasics?.purchased;
    return !!basicBlockchainPurchased;
  },
  
  // Проверка условий для разблокировки кошелька
  CRYPTO_WALLET: (state: GameState) => {
    // Кошелек разблокируется после покупки "Основы блокчейна"
    const basicBlockchainPurchased = state.upgrades.basicBlockchain?.purchased ||
                                     state.upgrades.blockchain_basics?.purchased ||
                                     state.upgrades.blockchainBasics?.purchased;
    return !!basicBlockchainPurchased;
  },
  
  // Проверка условий для разблокировки интернет-канала
  INTERNET_CONNECTION: (state: GameState) => {
    // Интернет-канал разблокируется после покупки домашнего компьютера
    return state.buildings.homeComputer && state.buildings.homeComputer.count > 0;
  },
  
  // Проверка условий для разблокировки автомайнера
  AUTO_MINER: (state: GameState) => {
    // Автомайнер разблокируется после покупки "Основы криптовалют"
    return (state.upgrades.cryptoCurrencyBasics?.purchased === true) || 
           (state.upgrades.cryptocurrency_basics?.purchased === true);
  },
  
  // Проверка условий для разблокировки улучшенного кошелька
  IMPROVED_WALLET: (state: GameState) => {
    // Улучшенный кошелек разблокируется после приобретения 10 криптокошельков
    return state.buildings.cryptoWallet && state.buildings.cryptoWallet.count >= 10;
  },
  
  // Безопасность кошелька разблокируется после покупки криптокошелька
  WALLET_SECURITY: (state: GameState) => {
    return state.buildings.cryptoWallet && state.buildings.cryptoWallet.count > 0;
  },
  
  // Оптимизация алгоритмов разблокируется после покупки автомайнера
  ALGORITHM_OPTIMIZATION: (state: GameState) => {
    return state.buildings.autoMiner && state.buildings.autoMiner.count > 0;
  },
  
  // Proof of Work разблокируется после покупки автомайнера
  PROOF_OF_WORK: (state: GameState) => {
    return state.buildings.autoMiner && state.buildings.autoMiner.count > 0;
  },
  
  // Криптовалютный трейдинг разблокируется после покупки Улучшенного кошелька
  CRYPTO_TRADING: (state: GameState) => {
    return state.buildings.improvedWallet && state.buildings.improvedWallet.count > 0;
  }
};

// Обновленная универсальная функция проверки разблокировок зданий
export function checkBuildingUnlocks(state: GameState): GameState {
  const newBuildings = { ...state.buildings };
  let hasChanges = false;

  // Проверяем каждое здание
  Object.entries(newBuildings).forEach(([buildingId, building]) => {
    // Пропускаем уже разблокированные здания
    if (building.unlocked) return;

    let shouldUnlock = false;

    // Особые правила разблокировки для определенных зданий
    switch (buildingId) {
      case "generator":
        // Генератор появляется только после накопления 11 USDT
        shouldUnlock = state.resources.usdt && state.resources.usdt.value >= 11;
        break;
        
      case "homeComputer":
        // Домашний компьютер появляется при наличии 50+ электричества
        shouldUnlock = state.resources.electricity && 
                      state.resources.electricity.unlocked && 
                      state.resources.electricity.value >= 50;
        break;
        
      case "coolingSystem":
        // Система охлаждения разблокируется при наличии 2+ компьютеров
        shouldUnlock = state.buildings.homeComputer && 
                      state.buildings.homeComputer.count >= 2;
        break;
        
      case "practice":
        // Практика разблокируется после 2+ использований "Применить знания"
        shouldUnlock = UNLOCK_SEQUENCES.PRACTICE(state);
        break;
        
      case "cryptoWallet":
        // Кошелек разблокируется после покупки "Основы блокчейна"
        shouldUnlock = UNLOCK_SEQUENCES.CRYPTO_WALLET(state);
        break;
        
      case "internetConnection":
        // Интернет-канал разблокируется после покупки домашнего компьютера
        shouldUnlock = UNLOCK_SEQUENCES.INTERNET_CONNECTION(state);
        break;
        
      case "improvedWallet":
        // Улучшенный кошелек разблокируется после приобретения 10 криптокошельков
        shouldUnlock = UNLOCK_SEQUENCES.IMPROVED_WALLET(state);
        break;
        
      case "autoMiner":
        // Автомайнер разблокируется после покупки "Основы криптовалют"
        shouldUnlock = UNLOCK_SEQUENCES.AUTO_MINER(state);
        break;
        
      default:
        // Стандартная проверка требований для других зданий
        if (building.requirements) {
          shouldUnlock = checkUnlockCondition(state, {
            resources: Object.entries(building.requirements)
              .filter(([key]) => state.resources[key])
              .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
              
            buildingCount: Object.entries(building.requirements)
              .filter(([key]) => key.endsWith('Count') && state.buildings[key.replace('Count', '')])
              .reduce((acc, [key, value]) => ({ ...acc, [key.replace('Count', '')]: value }), {}),
              
            upgrades: Object.keys(building.requirements)
              .filter(key => state.upgrades[key])
          });
        }
    }

    if (shouldUnlock) {
      newBuildings[buildingId] = {
        ...building,
        unlocked: true
      };
      hasChanges = true;
      console.log(`🔓 Разблокировано здание: ${building.name}`);
      safeDispatchGameEvent(`Разблокировано новое здание: ${building.name}`, "info");
    }
  });

  if (hasChanges) {
    return {
      ...state,
      buildings: newBuildings
    };
  }

  return state;
}

// Обновленная универсальная функция проверки разблокировок исследований
export function checkUpgradeUnlocks(state: GameState): GameState {
  const newUpgrades = { ...state.upgrades };
  let hasChanges = false;

  // Проверяем каждое исследование
  Object.entries(newUpgrades).forEach(([upgradeId, upgrade]) => {
    // Пропускаем уже разблокированные или купленные исследования
    if (upgrade.unlocked || upgrade.purchased) return;

    let shouldUnlock = false;

    // Особые правила разблокировки для определенных исследований
    switch (upgradeId) {
      case "basicBlockchain":
      case "blockchain_basics":
      case "blockchainBasics":
        // "Основы блокчейна" разблокируются после покупки генератора
        shouldUnlock = UNLOCK_SEQUENCES.BASIC_BLOCKCHAIN(state);
        break;
        
      case "cryptoCurrencyBasics":
      case "cryptocurrency_basics":
        // "Основы криптовалют" разблокируются после покупки "Основы блокчейна"
        shouldUnlock = UNLOCK_SEQUENCES.CRYPTO_CURRENCY_BASICS(state);
        break;
        
      case "walletSecurity":
      case "cryptoWalletSecurity":
        // "Безопасность криптокошельков" разблокируется после покупки криптокошелька
        shouldUnlock = UNLOCK_SEQUENCES.WALLET_SECURITY(state);
        break;
        
      case "algorithmOptimization":
        // "Оптимизация алгоритмов" разблокируется после покупки автомайнера
        shouldUnlock = UNLOCK_SEQUENCES.ALGORITHM_OPTIMIZATION(state);
        break;
        
      case "proofOfWork":
        // "Proof of Work" разблокируется после покупки автомайнера
        shouldUnlock = UNLOCK_SEQUENCES.PROOF_OF_WORK(state);
        break;
      
      case "cryptoTrading":
        // "Криптовалютный трейдинг" разблокируется после покупки Улучшенного кошелька
        shouldUnlock = UNLOCK_SEQUENCES.CRYPTO_TRADING(state);
        break;
        
      default:
        // Стандартная проверка требований и предшествующих исследований
        if (upgrade.requiredUpgrades && upgrade.requiredUpgrades.length > 0) {
          shouldUnlock = upgrade.requiredUpgrades.every(
            reqId => state.upgrades[reqId] && state.upgrades[reqId].purchased
          );
        } else if (upgrade.requirements) {
          shouldUnlock = checkUnlockCondition(state, {
            buildingCount: Object.entries(upgrade.requirements)
              .filter(([key]) => key.endsWith('Count') && state.buildings[key.replace('Count', '')])
              .reduce((acc, [key, value]) => ({ ...acc, [key.replace('Count', '')]: value }), {}),
              
            upgrades: Object.keys(upgrade.requirements)
              .filter(key => state.upgrades[key] && !key.endsWith('Count'))
          });
        } else if (upgrade.unlockCondition) {
          shouldUnlock = checkUnlockCondition(state, upgrade.unlockCondition);
        }
    }

    if (shouldUnlock) {
      newUpgrades[upgradeId] = {
        ...upgrade,
        unlocked: true
      };
      hasChanges = true;
      console.log(`🔓 Разблокировано исследование: ${upgrade.name}`);
      safeDispatchGameEvent(`Доступно новое исследование: ${upgrade.name}`, "info");
    }
  });

  if (hasChanges) {
    return {
      ...state,
      upgrades: newUpgrades
    };
  }

  return state;
}

// Функция для проверки всех разблокировок
export function checkAllUnlocks(state: GameState): GameState {
  // Проверяем сначала исследования, так как они могут влиять на здания
  let newState = checkUpgradeUnlocks(state);
  // Затем проверяем здания
  newState = checkBuildingUnlocks(newState);
  return newState;
}

// Проверка ресурсов и особых разблокировок
export function checkSpecialUnlocks(state: GameState): GameState {
  let newState = { ...state };
  
  // Разблокировка "Применить знания" после 3-х кликов на "Изучить крипту"
  if (!newState.unlocks.applyKnowledge && 
      newState.resources.knowledge && 
      newState.resources.knowledge.value >= 3) {
    console.log("🔓 Разблокирована функция 'Применить знания'");
    newState = {
      ...newState,
      unlocks: {
        ...newState.unlocks,
        applyKnowledge: true
      }
    };
    safeDispatchGameEvent("Открыта новая функция: Применить знания", "info");
  }
  
  // Разблокировка "Практика" после 2-х использований "Применить знания"
  if (!newState.unlocks.practice && UNLOCK_SEQUENCES.PRACTICE(newState)) {
    console.log("🔓 Разблокирована функция 'Практика'");
    newState = {
      ...newState,
      unlocks: {
        ...newState.unlocks,
        practice: true
      }
    };
    
    // Также разблокируем здание практики
    if (newState.buildings.practice) {
      newState.buildings.practice = {
        ...newState.buildings.practice,
        unlocked: true
      };
    }
    
    safeDispatchGameEvent("Открыта новая функция: Практика", "info");
  }
  
  // Проверяем особые разблокировки ресурсов
  // Например, электричество разблокируется после покупки генератора
  if (newState.buildings.generator && 
      newState.buildings.generator.count > 0 && 
      !newState.resources.electricity.unlocked) {
    newState.resources.electricity = {
      ...newState.resources.electricity,
      unlocked: true
    };
    safeDispatchGameEvent("Разблокирован ресурс: Электричество", "info");
  }
  
  // Вычислительная мощность разблокируется после покупки компьютера
  if (newState.buildings.homeComputer && 
      newState.buildings.homeComputer.count > 0 && 
      !newState.resources.computingPower.unlocked) {
    newState.resources.computingPower = {
      ...newState.resources.computingPower,
      unlocked: true
    };
    safeDispatchGameEvent("Разблокирован ресурс: Вычислительная мощность", "info");
  }
  
  // BTC разблокируется после покупки автомайнера
  if (newState.buildings.autoMiner && 
      newState.buildings.autoMiner.count > 0 && 
      !newState.resources.btc.unlocked) {
    newState.resources.btc = {
      ...newState.resources.btc,
      unlocked: true
    };
    safeDispatchGameEvent("Разблокирован ресурс: Bitcoin (BTC)", "info");
  }
  
  return newState;
}
