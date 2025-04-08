
import { GameState } from '@/context/types';

/**
 * Проверяет все возможные разблокировки и обновляет состояние
 */
export const checkAllUnlocks = (state: GameState): GameState => {
  let newState = {...state};
  
  // Проверяем разблокировки ресурсов
  newState = checkResourceUnlocks(newState);
  
  // Проверяем разблокировки зданий
  newState = checkBuildingUnlocks(newState);
  
  // Проверяем разблокировки улучшений
  newState = checkUpgradeUnlocks(newState);
  
  // Проверяем разблокировки действий
  newState = checkActionUnlocks(newState);
  
  // Проверяем специальные разблокировки
  newState = checkSpecialUnlocks(newState);
  
  return newState;
};

/**
 * Полная перестройка всех разблокировок с нуля
 */
export const rebuildAllUnlocks = (state: GameState): GameState => {
  console.log("unlockManager: Полная перепроверка всех разблокировок запущена");
  
  let newState = {...state};
  
  // Устанавливаем начальные разблокировки ресурсов
  newState = initializeResourceUnlocks(newState);
  
  // Устанавливаем начальные разблокировки зданий
  newState = initializeBuildingUnlocks(newState);
  
  // Устанавливаем начальные разблокировки улучшений
  newState = initializeUpgradeUnlocks(newState);
  
  // Устанавливаем начальные разблокировки действий
  newState = initializeActionUnlocks(newState);
  
  // Проверяем все разблокировки
  newState = checkAllUnlocks(newState);
  
  console.log("unlockManager: Полная перепроверка всех разблокировок завершена");
  
  return newState;
};

// Проверка разблокировок ресурсов
export const checkResourceUnlocks = (state: GameState): GameState => {
  let newState = {...state};
  
  // Разблокировка USDT (1+ применений знаний)
  if ((state.counters.applyKnowledge?.value || 0) >= 1) {
    if (newState.resources.usdt) {
      newState.resources.usdt.unlocked = true;
    }
    
    newState.unlocks.usdt = true;
  }
  
  // Разблокировка электричества
  if (state.buildings.generator && state.buildings.generator.count > 0) {
    if (!newState.resources.electricity) {
      newState.resources.electricity = {
        id: 'electricity',
        name: 'Электричество',
        description: 'Энергия для работы устройств',
        value: 0,
        baseProduction: 0,
        production: state.buildings.generator.count * 0.5,
        perSecond: state.buildings.generator.count * 0.5,
        max: 100,
        unlocked: true,
        type: 'resource',
        icon: 'zap'
      };
    } else {
      newState.resources.electricity.unlocked = true;
    }
    
    newState.unlocks.electricity = true;
  }
  
  // Разблокировка вычислительной мощности
  if (state.buildings.homeComputer && state.buildings.homeComputer.count > 0) {
    if (!newState.resources.computingPower) {
      newState.resources.computingPower = {
        id: 'computingPower',
        name: 'Вычислительная мощность',
        description: 'Используется для майнинга криптовалют',
        value: 0,
        baseProduction: state.buildings.homeComputer.count * 2,
        production: state.buildings.homeComputer.count * 2,
        perSecond: state.buildings.homeComputer.count * 2,
        consumption: state.buildings.homeComputer.count * 1,
        max: 100,
        unlocked: true,
        type: 'resource',
        icon: 'cpu'
      };
    } else {
      newState.resources.computingPower.unlocked = true;
    }
    
    newState.unlocks.computingPower = true;
  }
  
  // Разблокировка Bitcoin
  const hasCryptoBasics = 
    state.upgrades.cryptoCurrencyBasics?.purchased || 
    state.upgrades.cryptoBasics?.purchased;
  
  if (hasCryptoBasics && state.buildings.miner && state.buildings.miner.count > 0) {
    if (!newState.resources.bitcoin) {
      newState.resources.bitcoin = {
        id: 'bitcoin',
        name: 'Bitcoin',
        description: 'Криптовалюта №1 в мире',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 0.01,
        unlocked: true,
        type: 'currency',
        icon: 'bitcoin'
      };
    } else {
      newState.resources.bitcoin.unlocked = true;
    }
    
    newState.unlocks.bitcoin = true;
  }
  
  return newState;
};

// Проверка разблокировок зданий
export const checkBuildingUnlocks = (state: GameState): GameState => {
  let newState = {...state};
  
  // Разблокировка здания "Практика" (2+ применений знаний)
  if ((state.counters.applyKnowledge?.value || 0) >= 2) {
    if (newState.buildings.practice) {
      newState.buildings.practice.unlocked = true;
    }
  }
  
  // Разблокировка здания "Генератор" (11+ USDT)
  if ((state.resources.usdt?.value || 0) >= 11 && state.resources.usdt?.unlocked) {
    if (newState.buildings.generator) {
      newState.buildings.generator.unlocked = true;
    }
  }
  
  // Разблокировка здания "Криптокошелек" (после "Основы блокчейна")
  const hasBlockchainBasics = 
    state.upgrades.blockchainBasics?.purchased || 
    state.upgrades.basicBlockchain?.purchased || 
    state.upgrades.blockchain_basics?.purchased;
  
  if (hasBlockchainBasics) {
    if (newState.buildings.cryptoWallet) {
      newState.buildings.cryptoWallet.unlocked = true;
    }
  }
  
  // Разблокировка здания "Домашний компьютер" (50+ электричества)
  if ((state.resources.electricity?.value || 0) >= 50 && state.resources.electricity?.unlocked) {
    if (newState.buildings.homeComputer) {
      newState.buildings.homeComputer.unlocked = true;
    }
  }
  
  // Разблокировка здания "Интернет-канал" (после покупки домашнего компьютера)
  if (state.buildings.homeComputer && state.buildings.homeComputer.count > 0) {
    if (newState.buildings.internetChannel) {
      newState.buildings.internetChannel.unlocked = true;
    }
  }
  
  // Разблокировка здания "Майнер" (после "Основы криптовалют")
  const hasCryptoBasics = 
    state.upgrades.cryptoCurrencyBasics?.purchased || 
    state.upgrades.cryptoBasics?.purchased;
  
  if (hasCryptoBasics) {
    if (newState.buildings.miner) {
      newState.buildings.miner.unlocked = true;
    }
  }
  
  // Разблокировка "Криптобиблиотеки" (после "Основы криптовалют")
  if (hasCryptoBasics) {
    if (newState.buildings.cryptoLibrary) {
      newState.buildings.cryptoLibrary.unlocked = true;
    }
  }
  
  // Разблокировка "Системы охлаждения" (после 2-го уровня Домашнего компьютера)
  if (state.buildings.homeComputer && state.buildings.homeComputer.count >= 2) {
    if (newState.buildings.coolingSystem) {
      newState.buildings.coolingSystem.unlocked = true;
    }
  }
  
  // Разблокировка "Улучшенного кошелька" (после 5-го уровня Криптокошелька)
  if (state.buildings.cryptoWallet && state.buildings.cryptoWallet.count >= 5) {
    if (newState.buildings.enhancedWallet) {
      newState.buildings.enhancedWallet.unlocked = true;
    }
  }
  
  return newState;
};

// Проверка разблокировок улучшений
export const checkUpgradeUnlocks = (state: GameState): GameState => {
  let newState = {...state};
  
  // Разблокировка "Основы блокчейна" (после покупки Генератора)
  if (state.buildings.generator && state.buildings.generator.count > 0) {
    const blockchainBasicsId = 
      newState.upgrades.blockchainBasics ? 'blockchainBasics' : 
      newState.upgrades.basicBlockchain ? 'basicBlockchain' : 
      'blockchain_basics';
    
    if (newState.upgrades[blockchainBasicsId]) {
      newState.upgrades[blockchainBasicsId].unlocked = true;
    }
  }
  
  // Разблокировка "Безопасность криптокошельков" (после покупки Криптокошелька)
  if (state.buildings.cryptoWallet && state.buildings.cryptoWallet.count > 0) {
    const walletSecurityId = 
      newState.upgrades.cryptoWalletSecurity ? 'cryptoWalletSecurity' : 
      'walletSecurity';
    
    if (newState.upgrades[walletSecurityId]) {
      newState.upgrades[walletSecurityId].unlocked = true;
    }
  }
  
  // Разблокировка "Основы криптовалют" (после 2-го уровня Криптокошелька)
  if (state.buildings.cryptoWallet && state.buildings.cryptoWallet.count >= 2) {
    const cryptoBasicsId = 
      newState.upgrades.cryptoCurrencyBasics ? 'cryptoCurrencyBasics' : 
      'cryptoBasics';
    
    if (newState.upgrades[cryptoBasicsId]) {
      newState.upgrades[cryptoBasicsId].unlocked = true;
    }
  }
  
  // Разблокировка "Оптимизация алгоритмов" (после покупки Майнера)
  if (state.buildings.miner && state.buildings.miner.count > 0) {
    if (newState.upgrades.algorithmOptimization) {
      newState.upgrades.algorithmOptimization.unlocked = true;
    }
  }
  
  // Разблокировка "Proof of Work" (после покупки "Оптимизация алгоритмов")
  if (state.upgrades.algorithmOptimization?.purchased) {
    if (newState.upgrades.proofOfWork) {
      newState.upgrades.proofOfWork.unlocked = true;
    }
  }
  
  // Разблокировка "Энергоэффективные компоненты" (после "Системы охлаждения")
  if (state.buildings.coolingSystem && state.buildings.coolingSystem.count > 0) {
    if (newState.upgrades.energyEfficientComponents) {
      newState.upgrades.energyEfficientComponents.unlocked = true;
    }
  }
  
  // Разблокировка "Криптовалютный трейдинг" (после покупки "Улучшенного кошелька")
  if (state.buildings.enhancedWallet && state.buildings.enhancedWallet.count > 0) {
    if (newState.upgrades.cryptoTrading) {
      newState.upgrades.cryptoTrading.unlocked = true;
    }
  }
  
  // Разблокировка "Торговый бот" (после "Криптовалютный трейдинг")
  if (state.upgrades.cryptoTrading?.purchased) {
    if (newState.upgrades.tradingBot) {
      newState.upgrades.tradingBot.unlocked = true;
    }
  }
  
  return newState;
};

// Проверка разблокировок действий
export const checkActionUnlocks = (state: GameState): GameState => {
  let newState = {...state};
  
  // Разблокировка действия "Применить знания" (3+ знания)
  const knowledgeClicks = 
    typeof state.counters.knowledgeClicks === 'object' 
      ? state.counters.knowledgeClicks.value 
      : (state.counters.knowledgeClicks || 0);
  
  if (knowledgeClicks >= 3) {
    newState.unlocks.applyKnowledge = true;
  }
  
  // Разблокировка исследований
  if (state.buildings.practice && state.buildings.practice.count > 0) {
    newState.unlocks.research = true;
  }
  
  return newState;
};

// Проверка специальных разблокировок
export const checkSpecialUnlocks = (state: GameState): GameState => {
  let newState = {...state};
  
  // Пока нет специальных разблокировок
  
  return newState;
};

// Инициализация начальных разблокировок ресурсов
export const initializeResourceUnlocks = (state: GameState): GameState => {
  let newState = {...state};
  
  // Базовая разблокировка знаний
  newState.unlocks.knowledge = true;
  
  if (newState.resources.knowledge) {
    newState.resources.knowledge.unlocked = true;
  }
  
  return newState;
};

// Инициализация начальных разблокировок зданий
export const initializeBuildingUnlocks = (state: GameState): GameState => {
  // Начальные здания не разблокированы
  return state;
};

// Инициализация начальных разблокировок улучшений
export const initializeUpgradeUnlocks = (state: GameState): GameState => {
  // Начальные улучшения не разблокированы
  return state;
};

// Инициализация начальных разблокировок действий
export const initializeActionUnlocks = (state: GameState): GameState => {
  let newState = {...state};
  
  // Базовое действие - изучение крипты
  newState.unlocks.learn = true;
  
  return newState;
};
