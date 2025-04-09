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

/**
 * Анализирует текущий статус разблокировок контента в игре.
 * Возвращает списки разблокированных и заблокированных элементов, а также подробные шаги анализа.
 */
export const debugUnlockStatus = (state: GameState): { 
  unlocked: string[], 
  locked: string[], 
  steps: string[] 
} => {
  const unlocked: string[] = [];
  const locked: string[] = [];
  const steps: string[] = [];
  
  // Заголовок отчета
  steps.push("📊 Анализ статуса разблокировок:");
  
  // Анализ разблокировок ресурсов
  steps.push("🔓 Статус разблокировки ресурсов:");
  
  // Ресурс: Knowledge
  if (state.resources.knowledge?.unlocked) {
    unlocked.push("Ресурс: Знания");
    steps.push("• ✅ Знания разблокированы");
  } else {
    locked.push("Ресурс: Знания");
    steps.push("• ❌ Знания заблокированы");
  }
  
  // Ресурс: USDT
  if (state.resources.usdt?.unlocked) {
    unlocked.push("Ресурс: USDT");
    steps.push("• ✅ USDT разблокирован");
  } else {
    locked.push("Ресурс: USDT");
    steps.push("• ❌ USDT заблокирован");
    steps.push(`  Требуется: 1+ применений знаний (текущее: ${state.counters.applyKnowledge?.value || 0})`);
  }
  
  // Ресурс: Electricity
  if (state.resources.electricity?.unlocked) {
    unlocked.push("Ресурс: Электричество");
    steps.push("• ✅ Электричество разблокировано");
  } else {
    locked.push("Ресурс: Электричество");
    steps.push("• ❌ Электричество заблокировано");
    steps.push(`  Требуется: Покупка генератора (текущее: ${state.buildings.generator?.count || 0})`);
  }
  
  // Ресурс: Computing Power
  if (state.resources.computingPower?.unlocked) {
    unlocked.push("Ресурс: Вычислительная мощность");
    steps.push("• ✅ Вычислительная мощность разблокирована");
  } else {
    locked.push("Ресурс: Вычислительная мощность");
    steps.push("• ❌ Вычислительная мощность заблокирована");
    steps.push(`  Требуется: Покупка домашнего компьютера (текущее: ${state.buildings.homeComputer?.count || 0})`);
  }
  
  // Ресурс: Bitcoin
  if (state.resources.bitcoin?.unlocked) {
    unlocked.push("Ресурс: Bitcoin");
    steps.push("• ✅ Bitcoin разблокирован");
  } else {
    locked.push("Ресурс: Bitcoin");
    steps.push("• ❌ Bitcoin заблокирован");
    const hasBasics = state.upgrades.cryptoCurrencyBasics?.purchased || state.upgrades.cryptoBasics?.purchased;
    steps.push(`  Требуется: Исследование основ криптовалют (${hasBasics ? '✅' : '❌'}) и покупка майнера (${state.buildings.miner?.count || 0})`);
  }
  
  // Анализ разблокировок действий
  steps.push("\n🔓 Статус разблокировки действий:");
  
  // Действие: Learn
  if (state.unlocks.learn) {
    unlocked.push("Действие: Изучить крипту");
    steps.push("• ✅ Изучить крипту разблокировано");
  } else {
    locked.push("Действие: Изучить крипту");
    steps.push("• ❌ Изучить крипту заблокировано");
  }
  
  // Действие: Apply Knowledge
  if (state.unlocks.applyKnowledge) {
    unlocked.push("Действие: Применить знания");
    steps.push("• ✅ Применить знания разблокировано");
  } else {
    locked.push("Действие: Применить знания");
    steps.push("• ❌ Применить знания заблокировано");
    const knowledgeClicks = typeof state.counters.knowledgeClicks === 'object' 
      ? state.counters.knowledgeClicks.value 
      : (state.counters.knowledgeClicks || 0);
    steps.push(`  Требуется: 3+ нажатий на "Изучить" (текущее: ${knowledgeClicks})`);
  }
  
  // Анализ разблокировок зданий
  steps.push("\n🏗️ Статус разблокировки зданий:");
  
  // Здание: Practice
  if (state.buildings.practice?.unlocked) {
    unlocked.push("Здание: Практика");
    steps.push("• ✅ Практика разблокирована");
  } else {
    locked.push("Здание: Практика");
    steps.push("• ❌ Практика заблокирована");
    steps.push(`  Требуется: 2+ применений знаний (текущее: ${state.counters.applyKnowledge?.value || 0})`);
  }
  
  // Здание: Generator
  if (state.buildings.generator?.unlocked) {
    unlocked.push("Здание: Генератор");
    steps.push("• ✅ Генератор разблокирован");
  } else {
    locked.push("Здание: Генератор");
    steps.push("• ❌ Генератор заблокирован");
    steps.push(`  Требуется: 11+ USDT (текущее: ${state.resources.usdt?.value || 0})`);
  }
  
  // Здание: Crypto Wallet
  if (state.buildings.cryptoWallet?.unlocked) {
    unlocked.push("Здание: Криптокошелек");
    steps.push("• ✅ Криптокошелек разблокирован");
  } else {
    locked.push("Здание: Криптокошелек");
    steps.push("• ❌ Криптокошелек заблокирован");
    const hasBlockchainBasics = 
      state.upgrades.blockchainBasics?.purchased || 
      state.upgrades.basicBlockchain?.purchased;
    steps.push(`  Требуется: Изучение "Основы блокчейна" (${hasBlockchainBasics ? '✅' : '❌'})`);
  }
  
  // Здание: Home Computer
  if (state.buildings.homeComputer?.unlocked) {
    unlocked.push("Здание: Домашний компьютер");
    steps.push("• ✅ Домашний компьютер разблокирован");
  } else {
    locked.push("Здание: Домашний компьютер");
    steps.push("• ❌ Домашний компьютер заблокирован");
    steps.push(`  Требуется: 50+ электричества (текущее: ${state.resources.electricity?.value || 0})`);
  }
  
  // Здание: Internet Channel
  if (state.buildings.internetChannel?.unlocked) {
    unlocked.push("Здание: Интернет-канал");
    steps.push("• ✅ Интернет-канал разблокирован");
  } else {
    locked.push("Здание: Интернет-канал");
    steps.push("• ❌ Интернет-канал заблокирован");
    steps.push(`  Требуется: Покупка домашнего компьютера (${state.buildings.homeComputer?.count || 0})`);
  }
  
  // Здание: Miner
  if (state.buildings.miner?.unlocked) {
    unlocked.push("Здание: Майнер");
    steps.push("• ✅ Майнер разблокирован");
  } else {
    locked.push("Здание: Майнер");
    steps.push("• ❌ Майнер заблокирован");
    const hasCryptoBasics = 
      state.upgrades.cryptoCurrencyBasics?.purchased || 
      state.upgrades.cryptoBasics?.purchased;
    steps.push(`  Требуется: Изучение "Основы криптовалют" (${hasCryptoBasics ? '✅' : '❌'})`);
  }
  
  // Здание: Crypto Library
  if (state.buildings.cryptoLibrary?.unlocked) {
    unlocked.push("Здание: Криптобиблиотека");
    steps.push("• ✅ Криптобиблиотека разблокирована");
  } else {
    locked.push("Здание: Криптобиблиотека");
    steps.push("• ❌ Криптобиблиотека заблокирована");
    const hasCryptoBasics = 
      state.upgrades.cryptoCurrencyBasics?.purchased || 
      state.upgrades.cryptoBasics?.purchased;
    steps.push(`  Требуется: Изучение "Основы криптовалют" (${hasCryptoBasics ? '✅' : '❌'})`);
  }
  
  // Здание: Cooling System
  if (state.buildings.coolingSystem?.unlocked) {
    unlocked.push("Здание: Система охлаждения");
    steps.push("• ✅ Система охлаждения разблокирована");
  } else {
    locked.push("Здание: Система охлаждения");
    steps.push("• ❌ Система охлаждения заблокирована");
    steps.push(`  Требуется: 2+ уровень домашнего компьютера (текущее: ${state.buildings.homeComputer?.count || 0})`);
  }
  
  // Здание: Enhanced Wallet
  if (state.buildings.enhancedWallet?.unlocked) {
    unlocked.push("Здание: Улучшенный кошелек");
    steps.push("• ✅ Улучшенный кошелек разблокирован");
  } else {
    locked.push("Здание: Улучшенный кошелек");
    steps.push("• ❌ Улучшенный кошелек заблокирован");
    steps.push(`  Требуется: 5+ уровень криптокошелька (текущее: ${state.buildings.cryptoWallet?.count || 0})`);
  }
  
  // Анализ разблокировок исследований
  steps.push("\n📚 Статус разблокировки исследований:");
  
  // Функция для удобного добавления информации о исследованиях
  const analyzeUpgrade = (
    id: string, 
    name: string, 
    condition: string, 
    conditionMet: boolean
  ) => {
    if (state.upgrades[id]?.unlocked) {
      unlocked.push(`Исследование: ${name}`);
      steps.push(`• ✅ ${name} разблокировано`);
    } else {
      locked.push(`Исследование: ${name}`);
      steps.push(`• ❌ ${name} заблокировано`);
      steps.push(`  Требуется: ${condition} (${conditionMet ? '✅' : '❌'})`);
    }
  };
  
  // Исследование: Blockchain Basics
  analyzeUpgrade(
    'blockchainBasics', 
    'Основы блокчейна', 
    'Покупка генератора', 
    (state.buildings.generator?.count || 0) > 0
  );
  
  // Исследование: Crypto Wallet Security
  analyzeUpgrade(
    'cryptoWalletSecurity', 
    'Безопасность криптокошельков', 
    'Покупка криптокошелька', 
    (state.buildings.cryptoWallet?.count || 0) > 0
  );
  
  // Исследование: Cryptocurrency Basics
  analyzeUpgrade(
    'cryptoCurrencyBasics', 
    'Основы криптовалют', 
    '2+ уровень криптокошелька', 
    (state.buildings.cryptoWallet?.count || 0) >= 2
  );
  
  // Исследование: Algorithm Optimization
  analyzeUpgrade(
    'algorithmOptimization', 
    'Оптимизация алгоритмов', 
    'Покупка майнера', 
    (state.buildings.miner?.count || 0) > 0
  );
  
  // Исследование: Proof of Work
  analyzeUpgrade(
    'proofOfWork', 
    'Proof of Work', 
    'Изучение "Оптимизация алгоритмов"', 
    !!state.upgrades.algorithmOptimization?.purchased
  );
  
  // Исследование: Energy Efficient Components
  analyzeUpgrade(
    'energyEfficientComponents', 
    'Энергоэффективные компоненты', 
    'Покупка системы охлаждения', 
    (state.buildings.coolingSystem?.count || 0) > 0
  );
  
  // Исследование: Crypto Trading
  analyzeUpgrade(
    'cryptoTrading', 
    'Криптовалютный трейдинг', 
    'Покупка улучшенного кошелька', 
    (state.buildings.enhancedWallet?.count || 0) > 0
  );
  
  // Исследование: Trading Bot
  analyzeUpgrade(
    'tradingBot', 
    'Торговый бот', 
    'Изучение "Криптовалютный трейдинг"', 
    !!state.upgrades.cryptoTrading?.purchased
  );
  
  // Общая информация
  steps.push("\n🔍 Итоговая статистика:");
  steps.push(`• Разблокировано: ${unlocked.length} элементов`);
  steps.push(`• Заблокировано: ${locked.length} элементов`);
  
  return { unlocked, locked, steps };
};
