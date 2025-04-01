
import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Проверяет все разблокировки игровых элементов
 */
export const checkAllUnlocks = (state: GameState): GameState => {
  // Последовательно проверяем все типы разблокировок
  let newState = checkResourceUnlocks(state);
  newState = checkBuildingUnlocks(newState);
  newState = checkUpgradeUnlocks(newState);
  newState = checkActionUnlocks(newState);
  newState = checkSpecialUnlocks(newState);
  
  return newState;
};

/**
 * Проверяет разблокировки ресурсов
 */
export const checkResourceUnlocks = (state: GameState): GameState => {
  const newState = { ...state };
  
  // Проверка разблокировки электричества
  if (newState.buildings.generator?.count > 0 && !newState.resources.electricity?.unlocked) {
    console.log("unlockManager: Разблокировка ресурса электричество (куплен генератор)");
    
    if (newState.resources.electricity) {
      newState.resources.electricity.unlocked = true;
    } else {
      newState.resources = {
        ...newState.resources,
        electricity: {
          id: 'electricity',
          name: 'Электричество',
          description: 'Энергия для питания устройств',
          type: 'resource',
          icon: 'zap',
          value: 0,
          baseProduction: 0,
          production: 0,
          perSecond: 0,
          max: 100,
          unlocked: true
        }
      };
    }
    
    newState.unlocks.electricity = true;
    safeDispatchGameEvent('Разблокирован ресурс: Электричество', 'success');
  }
  
  // Проверка разблокировки вычислительной мощности
  if (newState.buildings.homeComputer?.count > 0 && !newState.resources.computingPower?.unlocked) {
    console.log("unlockManager: Разблокировка ресурса вычислительная мощность (куплен домашний компьютер)");
    
    if (newState.resources.computingPower) {
      newState.resources.computingPower.unlocked = true;
    } else {
      newState.resources = {
        ...newState.resources,
        computingPower: {
          id: 'computingPower',
          name: 'Вычислительная мощность',
          description: 'Используется для майнинга криптовалют',
          type: 'resource',
          icon: 'cpu',
          value: 0,
          baseProduction: 0,
          production: 0,
          perSecond: 0,
          max: 100,
          unlocked: true
        }
      };
    }
    
    newState.unlocks.computingPower = true;
    safeDispatchGameEvent('Разблокирован ресурс: Вычислительная мощность', 'success');
  }
  
  // Проверка разблокировки Bitcoin
  if (newState.buildings.miner?.count > 0 && !newState.resources.bitcoin?.unlocked) {
    console.log("unlockManager: Разблокировка ресурса Bitcoin (куплен майнер)");
    
    if (newState.resources.bitcoin) {
      newState.resources.bitcoin.unlocked = true;
    } else {
      newState.resources = {
        ...newState.resources,
        bitcoin: {
          id: 'bitcoin',
          name: 'Bitcoin',
          description: 'Криптовалюта, полученная в результате майнинга',
          type: 'currency',
          icon: 'bitcoin',
          value: 0,
          baseProduction: 0,
          production: 0,
          perSecond: 0,
          max: 1,
          unlocked: true
        }
      };
    }
    
    newState.unlocks.bitcoin = true;
    safeDispatchGameEvent('Разблокирован ресурс: Bitcoin', 'success');
  }
  
  return newState;
};

/**
 * Проверяет разблокировки зданий
 */
export const checkBuildingUnlocks = (state: GameState): GameState => {
  const newState = { ...state };
  
  // Проверка разблокировки генератора (нужно 11+ USDT)
  if (newState.resources.usdt?.value >= 11 && 
      newState.resources.usdt?.unlocked && 
      !newState.buildings.generator?.unlocked) {
    console.log("unlockManager: Разблокировка генератора (11+ USDT)");
    
    if (newState.buildings.generator) {
      newState.buildings.generator.unlocked = true;
    }
    
    newState.unlocks.generator = true;
    safeDispatchGameEvent('Разблокировано: Генератор', 'success');
  }
  
  // Проверка разблокировки криптокошелька (после исследования "Основы блокчейна")
  if (newState.upgrades.blockchainBasics?.purchased && 
      !newState.buildings.cryptoWallet?.unlocked) {
    console.log("unlockManager: Разблокировка криптокошелька (куплено улучшение Основы блокчейна)");
    
    if (newState.buildings.cryptoWallet) {
      newState.buildings.cryptoWallet.unlocked = true;
    }
    
    newState.unlocks.cryptoWallet = true;
    safeDispatchGameEvent('Разблокировано: Криптокошелек', 'success');
  }
  
  // Проверка разблокировки домашнего компьютера (50+ электричества)
  if (newState.resources.electricity?.value >= 50 && 
      newState.resources.electricity?.unlocked && 
      !newState.buildings.homeComputer?.unlocked) {
    console.log("unlockManager: Разблокировка домашнего компьютера (50+ электричества)");
    
    if (newState.buildings.homeComputer) {
      newState.buildings.homeComputer.unlocked = true;
    }
    
    newState.unlocks.homeComputer = true;
    safeDispatchGameEvent('Разблокировано: Домашний компьютер', 'success');
  }
  
  // Проверка разблокировки интернет-канала (после покупки домашнего компьютера)
  if (newState.buildings.homeComputer?.count > 0 && 
      !newState.buildings.internetChannel?.unlocked) {
    console.log("unlockManager: Разблокировка интернет-канала (куплен домашний компьютер)");
    
    if (newState.buildings.internetChannel) {
      newState.buildings.internetChannel.unlocked = true;
    }
    
    newState.unlocks.internetChannel = true;
    safeDispatchGameEvent('Разблокировано: Интернет-канал', 'success');
  }
  
  // Проверка разблокировки майнера (после исследования "Основы криптовалют")
  if (newState.upgrades.cryptoCurrencyBasics?.purchased && 
      !newState.buildings.miner?.unlocked) {
    console.log("unlockManager: Разблокировка майнера (куплено улучшение Основы криптовалют)");
    
    if (newState.buildings.miner) {
      newState.buildings.miner.unlocked = true;
    }
    
    newState.unlocks.miner = true;
    safeDispatchGameEvent('Разблокировано: Майнер', 'success');
  }
  
  // Проверка разблокировки криптобиблиотеки (после "Основы криптовалют")
  if (newState.upgrades.cryptoCurrencyBasics?.purchased && 
      !newState.buildings.cryptoLibrary?.unlocked) {
    console.log("unlockManager: Разблокировка криптобиблиотеки (куплено улучшение Основы криптовалют)");
    
    if (newState.buildings.cryptoLibrary) {
      newState.buildings.cryptoLibrary.unlocked = true;
    }
    
    newState.unlocks.cryptoLibrary = true;
    safeDispatchGameEvent('Разблокировано: Криптобиблиотека', 'success');
  }
  
  // Проверка разблокировки системы охлаждения (после 2-го уровня домашнего компьютера)
  if (newState.buildings.homeComputer?.count >= 2 && 
      !newState.buildings.coolingSystem?.unlocked) {
    console.log("unlockManager: Разблокировка системы охлаждения (2+ домашних компьютера)");
    
    if (newState.buildings.coolingSystem) {
      newState.buildings.coolingSystem.unlocked = true;
    }
    
    newState.unlocks.coolingSystem = true;
    safeDispatchGameEvent('Разблокировано: Система охлаждения', 'success');
  }
  
  // Проверка разблокировки улучшенного кошелька (после 5-го уровня криптокошелька)
  if (newState.buildings.cryptoWallet?.count >= 5 && 
      !newState.buildings.enhancedWallet?.unlocked) {
    console.log("unlockManager: Разблокировка улучшенного кошелька (5+ уровень криптокошелька)");
    
    if (newState.buildings.enhancedWallet) {
      newState.buildings.enhancedWallet.unlocked = true;
    }
    
    newState.unlocks.enhancedWallet = true;
    safeDispatchGameEvent('Разблокировано: Улучшенный кошелек', 'success');
  }
  
  return newState;
};

/**
 * Проверяет разблокировки исследований
 */
export const checkUpgradeUnlocks = (state: GameState): GameState => {
  const newState = { ...state };
  
  // Разблокировка "Основы блокчейна" (куплен генератор)
  if (newState.buildings.generator?.count > 0 && 
      !newState.upgrades.blockchainBasics?.unlocked) {
    console.log("unlockManager: Разблокировка исследования Основы блокчейна (куплен генератор)");
    
    if (newState.upgrades.blockchainBasics) {
      newState.upgrades.blockchainBasics.unlocked = true;
    }
    
    newState.unlocks.blockchainBasics = true;
    safeDispatchGameEvent('Разблокировано исследование: Основы блокчейна', 'info');
  }
  
  // Разблокировка "Безопасность криптокошельков" (куплен криптокошелек)
  if (newState.buildings.cryptoWallet?.count > 0 && 
      !newState.upgrades.walletSecurity?.unlocked) {
    console.log("unlockManager: Разблокировка исследования Безопасность криптокошельков (куплен криптокошелек)");
    
    if (newState.upgrades.walletSecurity) {
      newState.upgrades.walletSecurity.unlocked = true;
    }
    
    newState.unlocks.walletSecurity = true;
    safeDispatchGameEvent('Разблокировано исследование: Безопасность криптокошельков', 'info');
  }
  
  // Разблокировка "Основы криптовалют" (2+ уровень криптокошелька)
  if (newState.buildings.cryptoWallet?.count >= 2 && 
      !newState.upgrades.cryptoCurrencyBasics?.unlocked) {
    console.log("unlockManager: Разблокировка исследования Основы криптовалют (2+ уровень криптокошелька)");
    
    if (newState.upgrades.cryptoCurrencyBasics) {
      newState.upgrades.cryptoCurrencyBasics.unlocked = true;
    }
    
    newState.unlocks.cryptoCurrencyBasics = true;
    safeDispatchGameEvent('Разблокировано исследование: Основы криптовалют', 'info');
  }
  
  // Разблокировка "Оптимизация алгоритмов" (куплен майнер)
  if (newState.buildings.miner?.count > 0 && 
      !newState.upgrades.algorithmOptimization?.unlocked) {
    console.log("unlockManager: Разблокировка исследования Оптимизация алгоритмов (куплен майнер)");
    
    if (newState.upgrades.algorithmOptimization) {
      newState.upgrades.algorithmOptimization.unlocked = true;
    }
    
    newState.unlocks.algorithmOptimization = true;
    safeDispatchGameEvent('Разблокировано исследование: Оптимизация алгоритмов', 'info');
  }
  
  // Разблокировка "Proof of Work" (куплена оптимизация алгоритмов)
  if (newState.upgrades.algorithmOptimization?.purchased && 
      !newState.upgrades.proofOfWork?.unlocked) {
    console.log("unlockManager: Разблокировка исследования Proof of Work (куплена оптимизация алгоритмов)");
    
    if (newState.upgrades.proofOfWork) {
      newState.upgrades.proofOfWork.unlocked = true;
    }
    
    newState.unlocks.proofOfWork = true;
    safeDispatchGameEvent('Разблокировано исследование: Proof of Work', 'info');
  }
  
  // Разблокировка "Энергоэффективные компоненты" (куплена система охлаждения)
  if (newState.buildings.coolingSystem?.count > 0 && 
      !newState.upgrades.energyEfficientComponents?.unlocked) {
    console.log("unlockManager: Разблокировка исследования Энергоэффективные компоненты (куплена система охлаждения)");
    
    if (newState.upgrades.energyEfficientComponents) {
      newState.upgrades.energyEfficientComponents.unlocked = true;
    }
    
    newState.unlocks.energyEfficientComponents = true;
    safeDispatchGameEvent('Разблокировано исследование: Энергоэффективные компоненты', 'info');
  }
  
  // Разблокировка "Криптовалютный трейдинг" (куплен улучшенный кошелек)
  if (newState.buildings.enhancedWallet?.count > 0 && 
      !newState.upgrades.cryptoTrading?.unlocked) {
    console.log("unlockManager: Разблокировка исследования Криптовалютный трейдинг (куплен улучшенный кошелек)");
    
    if (newState.upgrades.cryptoTrading) {
      newState.upgrades.cryptoTrading.unlocked = true;
    }
    
    newState.unlocks.cryptoTrading = true;
    safeDispatchGameEvent('Разблокировано исследование: Криптовалютный трейдинг', 'info');
  }
  
  // Разблокировка "Торговый бот" (куплен криптовалютный трейдинг)
  if (newState.upgrades.cryptoTrading?.purchased && 
      !newState.upgrades.tradingBot?.unlocked) {
    console.log("unlockManager: Разблокировка исследования Торговый бот (куплен криптовалютный трейдинг)");
    
    if (newState.upgrades.tradingBot) {
      newState.upgrades.tradingBot.unlocked = true;
    }
    
    newState.unlocks.tradingBot = true;
    safeDispatchGameEvent('Разблокировано исследование: Торговый бот', 'info');
  }
  
  return newState;
};

/**
 * Проверяет разблокировки действий
 */
export const checkActionUnlocks = (state: GameState): GameState => {
  const newState = { ...state };
  
  // Проверка разблокировки "Применить знания" (3+ кликов на "Изучить крипту")
  if (newState.counters.knowledgeClicks?.value >= 3 && !newState.unlocks.applyKnowledge) {
    console.log("unlockManager: Разблокировка действия Применить знания (3+ кликов на Изучить крипту)");
    
    newState.unlocks.applyKnowledge = true;
    safeDispatchGameEvent('Разблокировано действие: Применить знания', 'success');
  }
  
  return newState;
};

/**
 * Проверяет специальные разблокировки
 */
export const checkSpecialUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Проверка активации второй фазы игры
  // Условие: 25+ USDT или электричество разблокировано
  if ((newState.resources.usdt?.value >= 25 || newState.resources.electricity?.unlocked) && 
      newState.phase < 2) {
    console.log("unlockManager: Активация фазы 2 (25+ USDT или электричество разблокировано)");
    
    newState.phase = 2;
    safeDispatchGameEvent('Открыта фаза 2: Основы криптоэкономики', 'milestone');
    
    // Импортируем здания для фазы 2
    // Здания второй фазы должны быть добавлены из initialPhase2Buildings
    // Но в этой функции мы не можем импортировать, поэтому обновляем только флаг фазы
  }
  
  return newState;
};

/**
 * Полное восстановление разблокировок
 */
export const rebuildAllUnlocks = (state: GameState): GameState => {
  console.log("unlockManager: Полное восстановление всех разблокировок");
  return checkAllUnlocks(state);
};

/**
 * Утилита для отладки состояния разблокировок
 */
export const debugUnlockStatus = (state: GameState): { unlocked: string[], locked: string[], steps: string[] } => {
  const unlocked: string[] = [];
  const locked: string[] = [];
  const steps: string[] = [];
  
  steps.push('📊 Базовые счетчики:');
  steps.push(`• Клики знаний: ${state.counters.knowledgeClicks?.value || 0}`);
  steps.push(`• Применения знаний: ${state.counters.applyKnowledge?.value || 0}`);
  
  // Проверка разблокировки "Применить знания"
  const applyKnowledgeUnlocked = !!state.unlocks.applyKnowledge;
  const shouldUnlockApplyKnowledge = (state.counters.knowledgeClicks?.value || 0) >= 3;
  steps.push(`• Действие "Применить знания" разблокировано: ${applyKnowledgeUnlocked ? '✅' : '❌'} (должно быть: ${shouldUnlockApplyKnowledge ? '✅' : '❌'})`);
  
  steps.push('');
  steps.push('🔓 Разблокировки ресурсов:');
  
  // Проверка разблокировки USDT
  const usdtUnlocked = state.resources.usdt?.unlocked || false;
  const shouldUnlockUsdt = (state.counters.applyKnowledge?.value || 0) >= 1;
  steps.push(`• USDT разблокирован: ${usdtUnlocked ? '✅' : '❌'} (должно быть: ${shouldUnlockUsdt ? '✅' : '❌'})`);
  
  // Проверка разблокировки Электричества
  const electricityUnlocked = state.resources.electricity?.unlocked || false;
  const shouldUnlockElectricity = (state.buildings.generator?.count || 0) > 0;
  steps.push(`• Электричество разблокировано: ${electricityUnlocked ? '✅' : '❌'} (должно быть: ${shouldUnlockElectricity ? '✅' : '❌'})`);
  
  // Проверка разблокировки Вычислительной мощности
  const computingPowerUnlocked = state.resources.computingPower?.unlocked || false;
  const shouldUnlockComputingPower = (state.buildings.homeComputer?.count || 0) > 0;
  steps.push(`• Вычислительная мощность разблокирована: ${computingPowerUnlocked ? '✅' : '❌'} (должно быть: ${shouldUnlockComputingPower ? '✅' : '❌'})`);
  
  // Проверка разблокировки Bitcoin
  const bitcoinUnlocked = state.resources.bitcoin?.unlocked || false;
  const shouldUnlockBitcoin = (state.buildings.miner?.count || 0) > 0;
  steps.push(`• Bitcoin разблокирован: ${bitcoinUnlocked ? '✅' : '❌'} (должно быть: ${shouldUnlockBitcoin ? '✅' : '❌'})`);
  
  steps.push('');
  steps.push('🏗️ Разблокировки зданий:');
  
  // Проверка разблокировки Практики
  const practiceUnlocked = state.buildings.practice?.unlocked || false;
  const shouldUnlockPractice = (state.counters.applyKnowledge?.value || 0) >= 2;
  steps.push(`• Практика разблокирована: ${practiceUnlocked ? '✅' : '❌'} (должно быть: ${shouldUnlockPractice ? '✅' : '❌'})`);
  
  // Проверка разблокировки Генератора
  const generatorUnlocked = state.buildings.generator?.unlocked || false;
  const shouldUnlockGenerator = (state.resources.usdt?.value || 0) >= 11 && (state.resources.usdt?.unlocked || false);
  steps.push(`• Генератор разблокирован: ${generatorUnlocked ? '✅' : '❌'} (должно быть: ${shouldUnlockGenerator ? '✅' : '❌'})`);
  
  // Проверка разблокировки Криптокошелька
  const cryptoWalletUnlocked = state.buildings.cryptoWallet?.unlocked || false;
  const shouldUnlockCryptoWallet = !!(state.upgrades.blockchainBasics?.purchased);
  steps.push(`• Криптокошелек разблокирован: ${cryptoWalletUnlocked ? '✅' : '❌'} (должно быть: ${shouldUnlockCryptoWallet ? '✅' : '❌'})`);
  
  // Проверка разблокировки Домашнего компьютера
  const homeComputerUnlocked = state.buildings.homeComputer?.unlocked || false;
  const shouldUnlockHomeComputer = (state.resources.electricity?.value || 0) >= 50 && (state.resources.electricity?.unlocked || false);
  steps.push(`• Домашний компьютер разблокирован: ${homeComputerUnlocked ? '✅' : '❌'} (должно быть: ${shouldUnlockHomeComputer ? '✅' : '❌'})`);
  
  // Проверка разблокировки Интернет-канала
  const internetChannelUnlocked = state.buildings.internetChannel?.unlocked || false;
  const shouldUnlockInternetChannel = (state.buildings.homeComputer?.count || 0) > 0;
  steps.push(`• Интернет-канал разблокирован: ${internetChannelUnlocked ? '✅' : '❌'} (должно быть: ${shouldUnlockInternetChannel ? '✅' : '❌'})`);
  
  // Проверка разблокировки Майнера
  const minerUnlocked = state.buildings.miner?.unlocked || false;
  const shouldUnlockMiner = !!(state.upgrades.cryptoCurrencyBasics?.purchased);
  steps.push(`• Майнер разблокирован: ${minerUnlocked ? '✅' : '❌'} (должно быть: ${shouldUnlockMiner ? '✅' : '❌'})`);
  
  // Проверка разблокировки Криптобиблиотеки
  const cryptoLibraryUnlocked = state.buildings.cryptoLibrary?.unlocked || false;
  const shouldUnlockCryptoLibrary = !!(state.upgrades.cryptoCurrencyBasics?.purchased);
  steps.push(`• Криптобиблиотека разблокирована: ${cryptoLibraryUnlocked ? '✅' : '❌'} (должно быть: ${shouldUnlockCryptoLibrary ? '✅' : '❌'})`);
  
  // Проверка разблокировки Системы охлаждения
  const coolingSystemUnlocked = state.buildings.coolingSystem?.unlocked || false;
  const shouldUnlockCoolingSystem = (state.buildings.homeComputer?.count || 0) >= 2;
  steps.push(`• Система охлаждения разблокирована: ${coolingSystemUnlocked ? '✅' : '❌'} (должно быть: ${shouldUnlockCoolingSystem ? '✅' : '❌'})`);
  
  // Проверка разблокировки Улучшенного кошелька
  const enhancedWalletUnlocked = state.buildings.enhancedWallet?.unlocked || false;
  const shouldUnlockEnhancedWallet = (state.buildings.cryptoWallet?.count || 0) >= 5;
  steps.push(`• Улучшенный кошелек разблокирован: ${enhancedWalletUnlocked ? '✅' : '❌'} (должно быть: ${shouldUnlockEnhancedWallet ? '✅' : '❌'})`);
  
  steps.push('');
  steps.push('📚 Разблокировки исследований:');
  
  // Проверка разблокировки Основ блокчейна
  const blockchainBasicsUnlocked = state.upgrades.blockchainBasics?.unlocked || false;
  const shouldUnlockBlockchainBasics = (state.buildings.generator?.count || 0) > 0;
  steps.push(`• Основы блокчейна разблокированы: ${blockchainBasicsUnlocked ? '✅' : '❌'} (должно быть: ${shouldUnlockBlockchainBasics ? '✅' : '❌'})`);
  
  // Проверка разблокировки Безопасности криптокошельков
  const walletSecurityUnlocked = state.upgrades.walletSecurity?.unlocked || false;
  const shouldUnlockWalletSecurity = (state.buildings.cryptoWallet?.count || 0) > 0;
  steps.push(`• Безопасность криптокошельков разблокирована: ${walletSecurityUnlocked ? '✅' : '❌'} (должно быть: ${shouldUnlockWalletSecurity ? '✅' : '❌'})`);
  
  // Проверка разблокировки Основ криптовалют
  const cryptoCurrencyBasicsUnlocked = state.upgrades.cryptoCurrencyBasics?.unlocked || false;
  const shouldUnlockCryptoCurrencyBasics = (state.buildings.cryptoWallet?.count || 0) >= 2;
  steps.push(`• Основы криптовалют разблокированы: ${cryptoCurrencyBasicsUnlocked ? '✅' : '❌'} (должно быть: ${shouldUnlockCryptoCurrencyBasics ? '✅' : '❌'})`);
  
  // Прочее
  steps.push('');
  steps.push(`Текущая фаза: ${state.phase}`);
  const shouldBePhase2 = (state.resources.usdt?.value || 0) >= 25 || (state.resources.electricity?.unlocked || false);
  steps.push(`• Условия для фазы 2 выполнены: ${shouldBePhase2 ? '✅' : '❌'}`);
  
  // Составляем список разблокированных и заблокированных элементов
  if (applyKnowledgeUnlocked) unlocked.push('Применить знания'); else locked.push('Применить знания');
  if (usdtUnlocked) unlocked.push('USDT'); else locked.push('USDT');
  if (electricityUnlocked) unlocked.push('Электричество'); else locked.push('Электричество');
  if (computingPowerUnlocked) unlocked.push('Вычислительная мощность'); else locked.push('Вычислительная мощность');
  if (bitcoinUnlocked) unlocked.push('Bitcoin'); else locked.push('Bitcoin');
  
  if (practiceUnlocked) unlocked.push('Практика'); else locked.push('Практика');
  if (generatorUnlocked) unlocked.push('Генератор'); else locked.push('Генератор');
  if (cryptoWalletUnlocked) unlocked.push('Криптокошелек'); else locked.push('Криптокошелек');
  if (homeComputerUnlocked) unlocked.push('Домашний компьютер'); else locked.push('Домашний компьютер');
  if (internetChannelUnlocked) unlocked.push('Интернет-канал'); else locked.push('Интернет-канал');
  if (minerUnlocked) unlocked.push('Майнер'); else locked.push('Майнер');
  if (cryptoLibraryUnlocked) unlocked.push('Криптобиблиотека'); else locked.push('Криптобиблиотека');
  if (coolingSystemUnlocked) unlocked.push('Система охлаждения'); else locked.push('Система охлаждения');
  if (enhancedWalletUnlocked) unlocked.push('Улучшенный кошелек'); else locked.push('Улучшенный кошелек');
  
  if (blockchainBasicsUnlocked) unlocked.push('Основы блокчейна'); else locked.push('Основы блокчейна');
  if (walletSecurityUnlocked) unlocked.push('Безопасность криптокошельков'); else locked.push('Безопасность криптокошельков');
  if (cryptoCurrencyBasicsUnlocked) unlocked.push('Основы криптовалют'); else locked.push('Основы криптовалют');
  
  return {
    unlocked,
    locked,
    steps
  };
};
