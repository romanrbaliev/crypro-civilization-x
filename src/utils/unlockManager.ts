
import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Функция для отладки статуса разблокировок
 */
export const debugUnlockStatus = (state: GameState) => {
  // Добавляем экспорт функции для отладки разблокировок
  const unlocks = state.unlocks || {};
  const buildings = state.buildings || {};
  const resources = state.resources || {};
  
  return {
    unlocks: Object.keys(unlocks).filter(key => unlocks[key]).sort(),
    unlockedBuildings: Object.keys(buildings).filter(key => buildings[key]?.unlocked).sort(),
    unlockedResources: Object.keys(resources).filter(key => resources[key]?.unlocked).sort(),
    applyKnowledgeCount: state.counters.applyKnowledge?.value || 0,
    blockchainBasics: state.upgrades.blockchainBasics?.purchased || false,
    cryptoCurrencyBasics: state.upgrades.cryptoCurrencyBasics?.purchased || false,
    homeComputerCount: buildings.homeComputer?.count || 0,
    cryptoWalletCount: buildings.cryptoWallet?.count || 0
  };
};

/**
 * Проверяет все разблокировки и обновляет состояние
 */
export const checkAllUnlocks = (state: GameState): GameState => {
  console.log("unlockManager: Проверка всех разблокировок");
  
  // Последовательно выполняем все проверки и обновляем состояние
  let newState = { ...state };
  
  // Проверяем специальные разблокировки зависящие от счетчиков
  newState = checkSpecialUnlocks(newState);
  
  // Проверяем ресурсы
  newState = checkResourceUnlocks(newState);
  
  // Проверяем здания
  newState = checkBuildingUnlocks(newState);
  
  // Проверяем улучшения
  newState = checkUpgradeUnlocks(newState);
  
  // Проверяем действия
  newState = checkActionUnlocks(newState);
  
  return newState;
};

/**
 * Полностью перестраивает все разблокировки с нуля
 */
export const rebuildAllUnlocks = (state: GameState): GameState => {
  console.log("unlockManager: Полная перестройка разблокировок");
  return checkAllUnlocks(state);
};

/**
 * Проверяет специальные разблокировки, зависящие от счетчиков и других условий
 */
export const checkSpecialUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  const unlocks = { ...newState.unlocks };
  
  // Проверяем счетчики и условия для специальных разблокировок
  const applyKnowledgeCount = getCounterValue(newState, 'applyKnowledge');
  const knowledgeClicksCount = getCounterValue(newState, 'knowledgeClicks');
  
  // Проверяем разблокировку применения знаний после 3 кликов
  if (knowledgeClicksCount >= 3 && !unlocks.applyKnowledge) {
    unlocks.applyKnowledge = true;
    console.log("✅ Разблокировано: Применение знаний");
    safeDispatchGameEvent("Разблокировано: Применение знаний", "success");
  }
  
  // Проверяем разблокировку фазы 2 - только после 2+ применений знаний
  if (applyKnowledgeCount >= 2 && !unlocks.phase2) {
    unlocks.phase2 = true;
    console.log("✅ Разблокирована фаза 2");
  }
  
  // Проверяем разблокировку исследований - только после покупки генератора
  if (state.buildings.generator?.count > 0 && !unlocks.research) {
    unlocks.research = true;
    console.log("✅ Разблокированы исследования");
    safeDispatchGameEvent("Разблокированы исследования", "success");
  }
  
  // Проверяем разблокировку рефералов - только после покупки исследования cryptoCommunity
  if (state.upgrades.cryptoCommunity?.purchased && !unlocks.referrals) {
    unlocks.referrals = true;
    console.log("✅ Разблокированы рефералы");
  }
  
  // Сохраняем обновленные разблокировки
  newState.unlocks = unlocks;
  return newState;
};

/**
 * Проверяет разблокировки ресурсов на основе требований
 */
export const checkResourceUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  const resources = { ...newState.resources };
  const unlocks = { ...newState.unlocks };
  
  // Проверяем условия для USDT
  const applyKnowledgeCount = getCounterValue(newState, 'applyKnowledge');
  if (applyKnowledgeCount >= 1 && !unlocks.usdt) {
    unlocks.usdt = true;
    
    if (resources.usdt) {
      resources.usdt = {
        ...resources.usdt,
        unlocked: true
      };
    }
    
    console.log("✅ Разблокирован ресурс: USDT");
  }
  
  // Проверяем условия для электричества
  if (newState.buildings.generator?.count > 0 && !unlocks.electricity) {
    unlocks.electricity = true;
    
    if (resources.electricity) {
      resources.electricity = {
        ...resources.electricity,
        unlocked: true
      };
    }
    
    console.log("✅ Разблокирован ресурс: Электричество");
  }
  
  // Проверяем условия для вычислительной мощности
  if (newState.buildings.homeComputer?.count > 0 && !unlocks.computingPower) {
    unlocks.computingPower = true;
    
    if (resources.computingPower) {
      resources.computingPower = {
        ...resources.computingPower,
        unlocked: true
      };
    }
    
    console.log("✅ Разблокирован ресурс: Вычислительная мощность");
  }
  
  // Проверяем условия для Bitcoin - только после покупки майнера
  if ((newState.buildings.miner?.count > 0 || newState.buildings.autoMiner?.count > 0) && !unlocks.bitcoin) {
    unlocks.bitcoin = true;
    
    if (resources.bitcoin) {
      resources.bitcoin = {
        ...resources.bitcoin,
        unlocked: true
      };
    }
    
    console.log("✅ Разблокирован ресурс: Bitcoin");
  }
  
  // Сохраняем обновленные данные
  newState.resources = resources;
  newState.unlocks = unlocks;
  return newState;
};

/**
 * Проверяет разблокировки зданий на основе требований
 */
export const checkBuildingUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  const buildings = { ...newState.buildings };
  const unlocks = { ...newState.unlocks };
  
  // Проверяем условия для Practice
  const applyKnowledgeCount = getCounterValue(newState, 'applyKnowledge');
  if (applyKnowledgeCount >= 2 && buildings.practice && !buildings.practice.unlocked) {
    buildings.practice = {
      ...buildings.practice,
      unlocked: true
    };
    
    unlocks.practice = true;
    console.log("✅ Разблокировано здание: Практика");
    safeDispatchGameEvent("Разблокировано здание: Практика", "success");
  }
  
  // Проверяем условия для Generator
  const usdtAmount = newState.resources.usdt?.value || 0;
  const usdtUnlocked = newState.resources.usdt?.unlocked || false;
  
  if (usdtAmount >= 11 && usdtUnlocked && buildings.generator && !buildings.generator.unlocked) {
    buildings.generator = {
      ...buildings.generator,
      unlocked: true
    };
    
    unlocks.generator = true;
    console.log("✅ Разблокировано здание: Генератор");
    safeDispatchGameEvent("Разблокировано здание: Генератор", "success");
  }
  
  // Проверяем условия для CryptoWallet - только после покупки "Основы блокчейна"
  const hasBlockchainBasics = state.upgrades.blockchainBasics?.purchased || 
                             state.upgrades.basicBlockchain?.purchased ||
                             state.upgrades.blockchain_basics?.purchased;
                             
  if (hasBlockchainBasics && buildings.cryptoWallet && !buildings.cryptoWallet.unlocked) {
    buildings.cryptoWallet = {
      ...buildings.cryptoWallet,
      unlocked: true
    };
    
    unlocks.cryptoWallet = true;
    console.log("✅ Разблокировано здание: Криптокошелек");
    safeDispatchGameEvent("Разблокировано здание: Криптокошелек", "success");
  }
  
  // Проверяем условия для HomeComputer
  const electricityAmount = newState.resources.electricity?.value || 0;
  if (electricityAmount >= 50 && buildings.homeComputer && !buildings.homeComputer.unlocked) {
    buildings.homeComputer = {
      ...buildings.homeComputer,
      unlocked: true
    };
    
    unlocks.homeComputer = true;
    console.log("✅ Разблокировано здание: Домашний компьютер");
    safeDispatchGameEvent("Разблокировано здание: Домашний компьютер", "success");
  }
  
  // Проверяем условия для Майнера - только после исследования "Основы криптовалют"
  const hasCryptoBasics = 
    newState.upgrades.cryptoCurrencyBasics?.purchased || 
    newState.upgrades.cryptoBasics?.purchased;
  
  if (hasCryptoBasics) {
    // Проверяем разблокировку майнера
    if (buildings.miner && !buildings.miner.unlocked) {
      buildings.miner = {
        ...buildings.miner,
        unlocked: true
      };
      
      unlocks.miner = true;
      console.log("✅ Разблокировано здание: Майнер");
      safeDispatchGameEvent("Разблокировано здание: Майнер", "success");
    }
    
    // Проверяем разблокировку автомайнера (если он есть)
    if (buildings.autoMiner && !buildings.autoMiner.unlocked) {
      buildings.autoMiner = {
        ...buildings.autoMiner,
        unlocked: true
      };
      
      unlocks.autoMiner = true;
      console.log("✅ Разблокировано здание: Автомайнер");
      safeDispatchGameEvent("Разблокировано здание: Автомайнер", "success");
    }
    
    // ИСПРАВЛЕНИЕ: Также разблокируем криптобиблиотеку при тех же условиях
    if (buildings.cryptoLibrary && !buildings.cryptoLibrary.unlocked) {
      buildings.cryptoLibrary = {
        ...buildings.cryptoLibrary,
        unlocked: true
      };
      
      unlocks.cryptoLibrary = true;
      console.log("✅ Разблокировано здание: Криптобиблиотека");
      safeDispatchGameEvent("Разблокировано здание: Криптобиблиотека", "success");
    }
  }
  
  // Проверяем условия для InternetChannel
  if (buildings.homeComputer?.count > 0 && buildings.internetChannel && !buildings.internetChannel.unlocked) {
    buildings.internetChannel = {
      ...buildings.internetChannel,
      unlocked: true
    };
    
    unlocks.internetChannel = true;
    console.log("✅ Разблокировано здание: Интернет-канал");
    safeDispatchGameEvent("Разблокировано здание: Интернет-канал", "success");
  }
  
  // ИСПРАВЛЕНИЕ: Проверяем условия для CoolingSystem и принудительно разблокируем при выполнении условий
  if (buildings.homeComputer?.count >= 2) {
    if (buildings.coolingSystem && !buildings.coolingSystem.unlocked) {
      buildings.coolingSystem = {
        ...buildings.coolingSystem,
        unlocked: true
      };
      
      unlocks.coolingSystem = true;
      console.log("✅ Разблокировано здание: Система охлаждения");
      safeDispatchGameEvent("Разблокировано здание: Система охлаждения", "success");
    }
  }
  
  // ИСПРАВЛЕНИЕ: Проверяем условия для EnhancedWallet или ImprovedWallet и принудительно разблокируем
  if (buildings.cryptoWallet?.count >= 5) {
    // Проверяем разные возможные имена для улучшенного кошелька
    if (buildings.enhancedWallet && !buildings.enhancedWallet.unlocked) {
      buildings.enhancedWallet = {
        ...buildings.enhancedWallet,
        unlocked: true
      };
      
      unlocks.enhancedWallet = true;
      console.log("✅ Разблокировано здание: Улучшенный кошелек (enhancedWallet)");
      safeDispatchGameEvent("Разблокировано здание: Улучшенный кошелек", "success");
    }
    
    if (buildings.improvedWallet && !buildings.improvedWallet.unlocked) {
      buildings.improvedWallet = {
        ...buildings.improvedWallet,
        unlocked: true
      };
      
      unlocks.improvedWallet = true;
      console.log("✅ Разблокировано здание: Улучшенный кошелек (improvedWallet)");
      safeDispatchGameEvent("Разблокировано здание: Улучшенный кошелек", "success");
    }
  }
  
  // Сохраняем обновленные данные
  newState.buildings = buildings;
  newState.unlocks = unlocks;
  return newState;
};

/**
 * Проверяет разблокировки улучшений на основе требований
 */
export const checkUpgradeUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  const upgrades = { ...newState.upgrades };
  const unlocks = { ...newState.unlocks };
  
  // Проверяем разблокировку BlockchainBasics - только после покупки генератора
  if (newState.buildings.generator?.count > 0) {
    if (upgrades.blockchainBasics && !upgrades.blockchainBasics.unlocked) {
      upgrades.blockchainBasics = {
        ...upgrades.blockchainBasics,
        unlocked: true
      };
      console.log("✅ Разблокировано улучшение: Основы блокчейна");
      safeDispatchGameEvent("Разблокировано улучшение: Основы блокчейна", "success");
    }
    
    // Альтернативные ID для того же улучшения
    if (upgrades.basicBlockchain && !upgrades.basicBlockchain.unlocked) {
      upgrades.basicBlockchain = {
        ...upgrades.basicBlockchain,
        unlocked: true
      };
      console.log("✅ Разблокировано улучшение: Основы блокчейна (альт.)");
    }
    
    if (upgrades.blockchain_basics && !upgrades.blockchain_basics.unlocked) {
      upgrades.blockchain_basics = {
        ...upgrades.blockchain_basics,
        unlocked: true
      };
      console.log("✅ Разблокировано улучшение: Основы блокчейна (альт.)");
    }
  }
  
  // Проверяем разблокировку WalletSecurity
  if (newState.buildings.cryptoWallet?.count > 0) {
    if (upgrades.walletSecurity && !upgrades.walletSecurity.unlocked) {
      upgrades.walletSecurity = {
        ...upgrades.walletSecurity,
        unlocked: true
      };
      console.log("✅ Разблокировано улучшение: Безопасность криптокошельков");
      safeDispatchGameEvent("Разблокировано улучшение: Безопасность криптокошельков", "success");
    }
    
    // Альтернативный ID
    if (upgrades.cryptoWalletSecurity && !upgrades.cryptoWalletSecurity.unlocked) {
      upgrades.cryptoWalletSecurity = {
        ...upgrades.cryptoWalletSecurity,
        unlocked: true
      };
      console.log("✅ Разблокировано улучшение: Безопасность криптокошельков (альт.)");
    }
  }
  
  // Проверяем разблокировку OptimizationAlgorithms - после покупки майнера
  if (newState.buildings.miner?.count > 0 || newState.buildings.autoMiner?.count > 0) {
    if (upgrades.optimizationAlgorithms && !upgrades.optimizationAlgorithms.unlocked) {
      upgrades.optimizationAlgorithms = {
        ...upgrades.optimizationAlgorithms,
        unlocked: true
      };
      console.log("✅ Разблокировано улучшение: Оптимизация алгоритмов");
      safeDispatchGameEvent("Разблокировано улучшение: Оптимизация алгоритмов", "success");
    }
    
    if (upgrades.algorithmOptimization && !upgrades.algorithmOptimization.unlocked) {
      upgrades.algorithmOptimization = {
        ...upgrades.algorithmOptimization,
        unlocked: true
      };
      console.log("✅ Разблокировано улучшение: Оптимизация алгоритмов (альт.)");
    }
  }
  
  // Проверяем разблокировку ProofOfWork
  if (upgrades.optimizationAlgorithms?.purchased || upgrades.algorithmOptimization?.purchased) {
    if (upgrades.proofOfWork && !upgrades.proofOfWork.unlocked) {
      upgrades.proofOfWork = {
        ...upgrades.proofOfWork,
        unlocked: true
      };
      console.log("✅ Разблокировано улучшение: Proof of Work");
      safeDispatchGameEvent("Разблокировано улучшение: Proof of Work", "success");
    }
  }
  
  // Проверяем разблокировку EnergyEfficientComponents
  if (newState.buildings.coolingSystem?.count > 0) {
    if (upgrades.energyEfficientComponents && !upgrades.energyEfficientComponents.unlocked) {
      upgrades.energyEfficientComponents = {
        ...upgrades.energyEfficientComponents,
        unlocked: true
      };
      console.log("✅ Разблокировано улучшение: Энергоэффективные компоненты");
      safeDispatchGameEvent("Разблокировано улучшение: Энергоэффективные компоненты", "success");
    }
  }
  
  // Проверяем разблокировку CryptoTrading
  const hasEnhancedWallet = 
    newState.buildings.enhancedWallet?.count > 0 || 
    newState.buildings.improvedWallet?.count > 0;
  
  if (hasEnhancedWallet) {
    if (upgrades.cryptoTrading && !upgrades.cryptoTrading.unlocked) {
      upgrades.cryptoTrading = {
        ...upgrades.cryptoTrading,
        unlocked: true
      };
      console.log("✅ Разблокировано улучшение: Криптовалютный трейдинг");
      safeDispatchGameEvent("Разблокировано улучшение: Криптовалютный трейдинг", "success");
    }
  }
  
  // Проверяем разблокировку TradingBot
  if (upgrades.cryptoTrading?.purchased) {
    if (upgrades.tradingBot && !upgrades.tradingBot.unlocked) {
      upgrades.tradingBot = {
        ...upgrades.tradingBot,
        unlocked: true
      };
      console.log("✅ Разблокировано улучшение: Торговый бот");
      safeDispatchGameEvent("Разблокировано улучшение: Торговый бот", "success");
    }
  }
  
  // Проверяем разблокировку CryptoCurrencyBasics - после 2+ уровней криптокошелька
  const hasLevelTwoCryptoWallet = newState.buildings.cryptoWallet?.count >= 2;
  if (hasLevelTwoCryptoWallet) {
    if (upgrades.cryptoCurrencyBasics && !upgrades.cryptoCurrencyBasics.unlocked) {
      upgrades.cryptoCurrencyBasics = {
        ...upgrades.cryptoCurrencyBasics,
        unlocked: true
      };
      console.log("✅ Разблокировано улучшение: Основы криптовалют");
      safeDispatchGameEvent("Разблокировано улучшение: Основы криптовалют", "success");
    }
    
    // Альтернативный ID
    if (upgrades.cryptoBasics && !upgrades.cryptoBasics.unlocked) {
      upgrades.cryptoBasics = {
        ...upgrades.cryptoBasics,
        unlocked: true
      };
      console.log("✅ Разблокировано улучшение: Основы криптовалют (альт.)");
    }
  }
  
  // Сохраняем обновленные данные
  newState.upgrades = upgrades;
  newState.unlocks = unlocks;
  return newState;
};

/**
 * Проверяет разблокировки действий на основе требований
 */
export const checkActionUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  const unlocks = { ...newState.unlocks };
  
  // Разблокируем кнопку обмена Bitcoin только если есть Bitcoin и он разблокирован
  if (state.resources.bitcoin?.unlocked && state.resources.bitcoin?.value > 0 && !unlocks.exchangeBtc) {
    unlocks.exchangeBtc = true;
    console.log("✅ Разблокировано действие: Обмен Bitcoin");
  }
  
  // Сохраняем обновленные данные
  newState.unlocks = unlocks;
  return newState;
};

/**
 * Получить значение счетчика из состояния
 */
const getCounterValue = (state: GameState, counterId: string): number => {
  const counter = state.counters[counterId];
  if (!counter) return 0;
  return typeof counter === 'object' ? counter.value : counter;
};
