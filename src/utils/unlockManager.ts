
import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Проверяет все возможные разблокировки в игре
 */
export function checkAllUnlocks(state: GameState): GameState {
  console.log('unlockManager: Запуск проверки всех разблокировок');
  
  let updatedState = { ...state };
  
  // Проверяем разблокировки ресурсов
  updatedState = checkResourceUnlocks(updatedState);
  
  // Проверяем разблокировки зданий
  updatedState = checkBuildingUnlocks(updatedState);
  
  // Проверяем разблокировки исследований
  updatedState = checkUpgradeUnlocks(updatedState);
  
  // Проверяем разблокировки действий
  updatedState = checkActionUnlocks(updatedState);
  
  // Проверяем разблокировки функций
  updatedState = checkFeatureUnlocks(updatedState);
  
  return updatedState;
}

/**
 * Проверяет специальные разблокировки, такие как разблокировка вкладок интерфейса, пороговые значения и т.д.
 */
export function checkSpecialUnlocks(state: GameState): GameState {
  console.log('unlockManager: Проверка специальных разблокировок');
  
  let updatedState = { ...state };
  
  // Проверка исследований (покупка генератора разблокирует вкладку исследований)
  if (state.buildings.generator && state.buildings.generator.count > 0 && !state.unlocks.research) {
    console.log('unlockManager: Разблокировка исследований через генератор');
    updatedState = {
      ...updatedState,
      unlocks: {
        ...updatedState.unlocks,
        research: true
      }
    };
    
    // Разблокируем основное исследование "Основы блокчейна"
    const researchIds = ['blockchainBasics', 'blockchain_basics', 'basicBlockchain'];
    
    for (const id of researchIds) {
      if (updatedState.upgrades[id]) {
        updatedState.upgrades[id] = {
          ...updatedState.upgrades[id],
          unlocked: true
        };
        console.log(`unlockManager: Разблокировка исследования ${id}`);
      }
    }
    
    safeDispatchGameEvent('Разблокирована вкладка исследований!', 'success');
  }
  
  // Проверка USDT (если счетчик applyKnowledge >= 1, разблокируем USDT)
  const applyKnowledgeCount = getCounterValue(state, 'applyKnowledge');
  if (applyKnowledgeCount >= 1 && !state.unlocks.usdt) {
    console.log('unlockManager: Разблокировка USDT через счетчик applyKnowledge');
    
    updatedState = {
      ...updatedState,
      unlocks: {
        ...updatedState.unlocks,
        usdt: true
      }
    };
    
    if (updatedState.resources.usdt) {
      updatedState.resources.usdt.unlocked = true;
    }
  }
  
  return updatedState;
}

/**
 * Полная перестройка всех разблокировок с нуля на основе состояния
 */
export function rebuildAllUnlocks(state: GameState): GameState {
  console.log('unlockManager: Полная перестройка всех разблокировок');
  
  let updatedState = { ...state };
  
  // Базовые разблокировки ресурсов
  // Knowledge всегда разблокирован
  if (updatedState.resources.knowledge) {
    updatedState.resources.knowledge.unlocked = true;
    updatedState.unlocks.knowledge = true;
  }
  
  // USDT разблокируется после 1+ применения знаний
  if (updatedState.counters.applyKnowledge && updatedState.counters.applyKnowledge.value >= 1) {
    if (updatedState.resources.usdt) {
      updatedState.resources.usdt.unlocked = true;
      updatedState.unlocks.usdt = true;
    }
  }
  
  // Электричество разблокируется после покупки генератора
  if (updatedState.buildings.generator && updatedState.buildings.generator.count > 0) {
    if (updatedState.resources.electricity) {
      updatedState.resources.electricity.unlocked = true;
      updatedState.unlocks.electricity = true;
    }
    
    // Также разблокируем вкладку исследований
    updatedState.unlocks.research = true;
  }
  
  // Вычислительная мощность разблокируется после покупки домашнего компьютера
  if (updatedState.buildings.homeComputer && updatedState.buildings.homeComputer.count > 0) {
    if (updatedState.resources.computingPower) {
      updatedState.resources.computingPower.unlocked = true;
      updatedState.unlocks.computingPower = true;
    }
  }
  
  // Bitcoin разблокируется после покупки майнера
  if ((updatedState.buildings.miner && updatedState.buildings.miner.count > 0) || 
      (updatedState.buildings.autoMiner && updatedState.buildings.autoMiner.count > 0)) {
    if (updatedState.resources.bitcoin) {
      updatedState.resources.bitcoin.unlocked = true;
      updatedState.unlocks.bitcoin = true;
    }
  }
  
  // Здания
  updatedState = rebuildBuildingUnlocks(updatedState);
  
  // Исследования
  updatedState = rebuildUpgradeUnlocks(updatedState);
  
  return updatedState;
}

// Проверка разблокировок ресурсов
export function checkResourceUnlocks(state: GameState): GameState {
  console.log('unlockManager: Проверка разблокировок ресурсов');
  
  let unlockUpdates = {};
  let resourcesUpdated = false;
  
  // Проверяем USDT (после применения знаний)
  const applyKnowledgeCount = getCounterValue(state, 'applyKnowledge');
  if (applyKnowledgeCount >= 1 && !state.unlocks.usdt) {
    console.log('unlockManager: Разблокировка USDT (применений знаний:', applyKnowledgeCount, ')');
    unlockUpdates['usdt'] = true;
    resourcesUpdated = true;
  }
  
  // Проверяем электричество (после покупки генератора)
  if (state.buildings.generator?.count > 0 && !state.unlocks.electricity) {
    console.log('unlockManager: Разблокировка электричества');
    unlockUpdates['electricity'] = true;
    resourcesUpdated = true;
  }
  
  // Проверяем вычислительную мощность (после покупки компьютера)
  if (state.buildings.homeComputer?.count > 0 && !state.unlocks.computingPower) {
    console.log('unlockManager: Разблокировка вычислительной мощности');
    unlockUpdates['computingPower'] = true;
    resourcesUpdated = true;
  }
  
  // Проверяем Bitcoin (после покупки майнера)
  if ((state.buildings.miner?.count > 0 || state.buildings.autoMiner?.count > 0) && !state.unlocks.bitcoin) {
    console.log('unlockManager: Разблокировка bitcoin');
    unlockUpdates['bitcoin'] = true;
    resourcesUpdated = true;
  }
  
  if (!resourcesUpdated) {
    return state;
  }
  
  const newState = {
    ...state,
    unlocks: {
      ...state.unlocks,
      ...unlockUpdates
    }
  };
  
  // Также обновляем состояние в самих ресурсах
  for (const resourceId of Object.keys(unlockUpdates)) {
    if (newState.resources[resourceId]) {
      newState.resources[resourceId] = {
        ...newState.resources[resourceId],
        unlocked: true
      };
    }
  }
  
  return newState;
}

// Проверка разблокировок зданий
export function checkBuildingUnlocks(state: GameState): GameState {
  console.log('unlockManager: Проверка разблокировок зданий');
  
  let buildingsToUnlock = {};
  let buildingUpdates = {};
  let buildingsUpdated = false;
  
  // Проверяем "Практика" (разблокируется после 2+ применений знаний)
  const applyKnowledgeCount = getCounterValue(state, 'applyKnowledge');
  if (applyKnowledgeCount >= 2 && state.buildings.practice && !state.buildings.practice.unlocked) {
    console.log('unlockManager: Разблокировка здания Практика');
    buildingsToUnlock['practice'] = true;
    buildingUpdates['practice'] = true;
    buildingsUpdated = true;
  }
  
  // Проверяем "Генератор" (разблокируется после накопления 11+ USDT)
  if (state.resources.usdt?.unlocked && 
      state.resources.usdt?.value >= 11 && 
      state.buildings.generator && 
      !state.buildings.generator.unlocked) {
    console.log('unlockManager: Разблокировка здания Генератор');
    buildingsToUnlock['generator'] = true;
    buildingUpdates['generator'] = true;
    buildingsUpdated = true;
  }
  
  // Проверяем "Домашний компьютер" (разблокируется после 50+ электричества)
  if (state.resources.electricity?.unlocked && 
      state.resources.electricity?.value >= 50 && 
      state.buildings.homeComputer && 
      !state.buildings.homeComputer.unlocked) {
    console.log('unlockManager: Разблокировка здания Домашний компьютер');
    buildingsToUnlock['homeComputer'] = true;
    buildingUpdates['homeComputer'] = true;
    buildingsUpdated = true;
  }
  
  // Проверяем "Интернет-канал" (разблокируется после покупки компьютера)
  if (state.buildings.homeComputer?.count > 0 && 
      state.buildings.internetConnection && 
      !state.buildings.internetConnection.unlocked) {
    console.log('unlockManager: Разблокировка здания Интернет-канал');
    buildingsToUnlock['internetConnection'] = true;
    buildingUpdates['internetConnection'] = true;
    buildingsUpdated = true;
  }
  
  // Проверяем "Криптокошелек" (разблокируется после исследования "Основы блокчейна")
  const hasBlockchainBasics = state.upgrades.blockchainBasics?.purchased || 
                             state.upgrades.blockchain_basics?.purchased ||
                             state.upgrades.basicBlockchain?.purchased;
  if (hasBlockchainBasics && 
      state.buildings.cryptoWallet && 
      !state.buildings.cryptoWallet.unlocked) {
    console.log('unlockManager: Разблокировка здания Криптокошелек');
    buildingsToUnlock['cryptoWallet'] = true;
    buildingUpdates['cryptoWallet'] = true;
    buildingsUpdated = true;
  }
  
  // Проверяем "Майнер" (разблокируется после исследования "Основы криптовалют")
  const hasCryptoBasics = state.upgrades.cryptoCurrencyBasics?.purchased || 
                          state.upgrades.cryptoBasics?.purchased;
  if (hasCryptoBasics && 
      state.buildings.miner && 
      !state.buildings.miner.unlocked) {
    console.log('unlockManager: Разблокировка здания Майнер');
    buildingsToUnlock['miner'] = true;
    buildingUpdates['miner'] = true;
    buildingsUpdated = true;
  }
  
  // Проверяем "Криптобиблиотеку" (после исследования "Основы криптовалют")
  if (hasCryptoBasics && 
      state.buildings.cryptoLibrary && 
      !state.buildings.cryptoLibrary.unlocked) {
    console.log('unlockManager: Разблокировка здания Криптобиблиотека');
    buildingsToUnlock['cryptoLibrary'] = true;
    buildingUpdates['cryptoLibrary'] = true;
    buildingsUpdated = true;
  }
  
  // Проверяем "Система охлаждения" (после 2+ уровней домашнего компьютера)
  if (state.buildings.homeComputer?.count >= 2 && 
      state.buildings.coolingSystem && 
      !state.buildings.coolingSystem.unlocked) {
    console.log('unlockManager: Разблокировка здания Система охлаждения');
    buildingsToUnlock['coolingSystem'] = true;
    buildingUpdates['coolingSystem'] = true;
    buildingsUpdated = true;
  }
  
  // Проверяем "Улучшенный кошелек" (после 5+ уровней криптокошелька)
  if (state.buildings.cryptoWallet?.count >= 5) {
    if (state.buildings.enhancedWallet && !state.buildings.enhancedWallet.unlocked) {
      console.log('unlockManager: Разблокировка здания Улучшенный кошелек');
      buildingsToUnlock['enhancedWallet'] = true;
      buildingUpdates['enhancedWallet'] = true;
      buildingsUpdated = true;
    }
    
    if (state.buildings.improvedWallet && !state.buildings.improvedWallet.unlocked) {
      console.log('unlockManager: Разблокировка здания Улучшенный кошелек (alt)');
      buildingsToUnlock['improvedWallet'] = true;
      buildingUpdates['improvedWallet'] = true;
      buildingsUpdated = true;
    }
  }
  
  if (!buildingsUpdated) {
    return state;
  }
  
  // Обновляем статус разблокировки в зданиях
  const updatedBuildings = {};
  for (const buildingId in state.buildings) {
    if (buildingUpdates[buildingId]) {
      updatedBuildings[buildingId] = {
        ...state.buildings[buildingId],
        unlocked: true
      };
    } else {
      updatedBuildings[buildingId] = state.buildings[buildingId];
    }
  }
  
  return {
    ...state,
    buildings: updatedBuildings,
    unlocks: {
      ...state.unlocks,
      ...buildingsToUnlock
    }
  };
}

// Проверка разблокировок исследований
export function checkUpgradeUnlocks(state: GameState): GameState {
  console.log('unlockManager: Проверка разблокировок исследований');
  
  let upgradesToUnlock = {};
  let upgradesUpdated = false;
  
  // Проверяем "Основы блокчейна" (разблокируется после покупки генератора)
  if (state.buildings.generator?.count > 0) {
    const blockchainBasicsIds = ['blockchainBasics', 'blockchain_basics', 'basicBlockchain'];
    
    for (const id of blockchainBasicsIds) {
      if (state.upgrades[id] && !state.upgrades[id].unlocked) {
        console.log(`unlockManager: Разблокировка исследования ${id}`);
        upgradesToUnlock[id] = true;
        upgradesUpdated = true;
      }
    }
  }
  
  // Проверяем "Безопасность криптокошельков" (разблокируется после покупки криптокошелька)
  if (state.buildings.cryptoWallet?.count > 0) {
    const walletSecurityIds = ['walletSecurity', 'cryptoWalletSecurity'];
    
    for (const id of walletSecurityIds) {
      if (state.upgrades[id] && !state.upgrades[id].unlocked) {
        console.log(`unlockManager: Разблокировка исследования ${id}`);
        upgradesToUnlock[id] = true;
        upgradesUpdated = true;
      }
    }
  }
  
  // Проверяем "Основы криптовалют" (разблокируется после 2+ уровней криптокошелька)
  if (state.buildings.cryptoWallet?.count >= 2) {
    const cryptoBasicsIds = ['cryptoCurrencyBasics', 'cryptoBasics'];
    
    for (const id of cryptoBasicsIds) {
      if (state.upgrades[id] && !state.upgrades[id].unlocked) {
        console.log(`unlockManager: Разблокировка исследования ${id}`);
        upgradesToUnlock[id] = true;
        upgradesUpdated = true;
      }
    }
  }
  
  // Проверяем "Оптимизация алгоритмов" (разблокируется после покупки майнера)
  if (state.buildings.miner?.count > 0) {
    const optimizationIds = ['algorithmOptimization', 'optimizationAlgorithms'];
    
    for (const id of optimizationIds) {
      if (state.upgrades[id] && !state.upgrades[id].unlocked) {
        console.log(`unlockManager: Разблокировка исследования ${id}`);
        upgradesToUnlock[id] = true;
        upgradesUpdated = true;
      }
    }
  }
  
  if (!upgradesUpdated) {
    return state;
  }
  
  // Обновляем состояние разблокировки исследований
  const updatedUpgrades = {};
  for (const upgradeId in state.upgrades) {
    if (upgradesToUnlock[upgradeId]) {
      updatedUpgrades[upgradeId] = {
        ...state.upgrades[upgradeId],
        unlocked: true
      };
    } else {
      updatedUpgrades[upgradeId] = state.upgrades[upgradeId];
    }
  }
  
  return {
    ...state,
    upgrades: updatedUpgrades
  };
}

// Проверка разблокировок действий
export function checkActionUnlocks(state: GameState): GameState {
  console.log('unlockManager: Проверка разблокировок действий');
  
  let unlockUpdates = {};
  let actionsUpdated = false;
  
  // Проверяем "Применить знания" (разблокируется после 3+ нажатий на "Изучить крипту")
  const knowledgeClicksCount = getCounterValue(state, 'knowledgeClicks');
  if (knowledgeClicksCount >= 3 && !state.unlocks.applyKnowledge) {
    console.log('unlockManager: Разблокировка действия "Применить знания"');
    unlockUpdates['applyKnowledge'] = true;
    actionsUpdated = true;
  }
  
  // Другие проверки разблокировки действий...
  
  if (!actionsUpdated) {
    return state;
  }
  
  return {
    ...state,
    unlocks: {
      ...state.unlocks,
      ...unlockUpdates
    }
  };
}

// Проверка разблокировок функций (вкладок, возможностей)
export function checkFeatureUnlocks(state: GameState): GameState {
  console.log('unlockManager: Проверка разблокировок функций и вкладок');
  
  let unlockUpdates = {};
  let featuresUpdated = false;
  
  // Проверяем вкладку исследований (разблокируется после покупки генератора)
  if (state.buildings.generator?.count > 0 && !state.unlocks.research) {
    console.log('unlockManager: Разблокировка вкладки исследований');
    unlockUpdates['research'] = true;
    featuresUpdated = true;
  }
  
  // Проверяем биткоин-обмен (разблокируется когда есть биткоины)
  if (state.resources.bitcoin?.value > 0 && !state.unlocks.exchangeBtc) {
    console.log('unlockManager: Разблокировка обмена биткоинов');
    unlockUpdates['exchangeBtc'] = true;
    featuresUpdated = true;
  }
  
  // Проверяем рефералы (разблокируется после покупки исследования cryptoCommunity)
  if (state.upgrades.cryptoCommunity?.purchased && !state.unlocks.referrals) {
    console.log('unlockManager: Разблокировка рефералов');
    unlockUpdates['referrals'] = true;
    featuresUpdated = true;
  }
  
  // Другие проверки разблокировок функций...
  
  if (!featuresUpdated) {
    return state;
  }
  
  return {
    ...state,
    unlocks: {
      ...state.unlocks,
      ...unlockUpdates
    }
  };
}

// Вспомогательные функции

function rebuildBuildingUnlocks(state: GameState): GameState {
  console.log('unlockManager: Перестройка разблокировок зданий');
  
  const buildings = { ...state.buildings };
  const unlocks = { ...state.unlocks };
  
  // Practice разблокируется после 2+ применений знаний
  const applyKnowledgeCount = getCounterValue(state, 'applyKnowledge');
  if (applyKnowledgeCount >= 2) {
    if (buildings.practice) {
      buildings.practice.unlocked = true;
      unlocks.practice = true;
    }
  }
  
  // Generator разблокируется после накопления 11+ USDT
  if (state.resources.usdt?.unlocked && state.resources.usdt?.value >= 11) {
    if (buildings.generator) {
      buildings.generator.unlocked = true;
      unlocks.generator = true;
    }
  }
  
  // Home Computer разблокируется после 50+ электричества
  if (state.resources.electricity?.unlocked && state.resources.electricity?.value >= 50) {
    if (buildings.homeComputer) {
      buildings.homeComputer.unlocked = true;
      unlocks.homeComputer = true;
    }
  }
  
  // Crypto Wallet разблокируется после покупки исследования "Основы блокчейна"
  const hasBlockchainBasics = state.upgrades.blockchainBasics?.purchased || 
                             state.upgrades.blockchain_basics?.purchased || 
                             state.upgrades.basicBlockchain?.purchased;
  if (hasBlockchainBasics) {
    if (buildings.cryptoWallet) {
      buildings.cryptoWallet.unlocked = true;
      unlocks.cryptoWallet = true;
    }
  }
  
  // Crypto Library разблокируется после покупки исследования "Основы криптовалют"
  const hasCryptoBasics = state.upgrades.cryptoCurrencyBasics?.purchased || 
                         state.upgrades.cryptoBasics?.purchased;
  if (hasCryptoBasics) {
    if (buildings.cryptoLibrary) {
      buildings.cryptoLibrary.unlocked = true;
      unlocks.cryptoLibrary = true;
    }
  }
  
  // Cooling System разблокируется после 2+ уровней домашнего компьютера
  if (state.buildings.homeComputer?.count >= 2) {
    if (buildings.coolingSystem) {
      buildings.coolingSystem.unlocked = true;
      unlocks.coolingSystem = true;
    }
  }
  
  // Enhanced Wallet разблокируется после 5+ уровней крипто кошелька
  if (state.buildings.cryptoWallet?.count >= 5) {
    if (buildings.enhancedWallet) {
      buildings.enhancedWallet.unlocked = true;
      unlocks.enhancedWallet = true;
    }
    
    if (buildings.improvedWallet) {
      buildings.improvedWallet.unlocked = true;
      unlocks.improvedWallet = true;
    }
  }
  
  return {
    ...state,
    buildings,
    unlocks
  };
}

function rebuildUpgradeUnlocks(state: GameState): GameState {
  console.log('unlockManager: Перестройка разблокировок исследований');
  
  const upgrades = { ...state.upgrades };
  
  // "Основы блокчейна" разблокируется после покупки генератора
  if (state.buildings.generator?.count > 0) {
    const blockchainBasicsIds = ['blockchainBasics', 'blockchain_basics', 'basicBlockchain'];
    
    for (const id of blockchainBasicsIds) {
      if (upgrades[id]) {
        upgrades[id].unlocked = true;
      }
    }
  }
  
  // "Безопасность криптокошельков" разблокируется после покупки криптокошелька
  if (state.buildings.cryptoWallet?.count > 0) {
    const walletSecurityIds = ['walletSecurity', 'cryptoWalletSecurity'];
    
    for (const id of walletSecurityIds) {
      if (upgrades[id]) {
        upgrades[id].unlocked = true;
      }
    }
  }
  
  // "Основы криптовалют" разблокируется после 2+ уровней криптокошелька
  if (state.buildings.cryptoWallet?.count >= 2) {
    const cryptoBasicsIds = ['cryptoCurrencyBasics', 'cryptoBasics'];
    
    for (const id of cryptoBasicsIds) {
      if (upgrades[id]) {
        upgrades[id].unlocked = true;
      }
    }
  }
  
  return {
    ...state,
    upgrades
  };
}

function getCounterValue(state: GameState, counterId: string): number {
  const counter = state.counters[counterId];
  if (!counter) return 0;
  return typeof counter === 'object' ? counter.value : counter;
}
