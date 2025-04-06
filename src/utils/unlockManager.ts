
import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Централизованная система управления разблокировками игровых элементов
 */

// Функция для проверки всех разблокировок
export const checkAllUnlocks = (state: GameState): GameState => {
  // Создаем копию состояния для модификации
  let newState = { ...state };
  
  // Применяем логику "если однажды разблокировано, всегда разблокировано"
  newState = applyPermanentUnlocks(newState);
  
  // Последовательно проверяем все типы разблокировок
  newState = checkResourceUnlocks(newState);
  newState = checkBuildingUnlocks(newState);
  newState = checkUpgradeUnlocks(newState);
  newState = checkActionUnlocks(newState);
  
  return newState;
};

// Применяет логику "однажды разблокировано - всегда разблокировано"
const applyPermanentUnlocks = (state: GameState): GameState => {
  // В случае если что-то уже разблокировано, оставляем статус разблокировки
  return state;
};

// Полная перепроверка всех разблокировок с нуля
export const rebuildAllUnlocks = (state: GameState): GameState => {
  console.log("unlockManager: Выполняем полную перепроверку всех разблокировок");
  return checkAllUnlocks(state);
};

// Проверяет разблокировки ресурсов на основе требований
export const checkResourceUnlocks = (state: GameState): GameState => {
  // Создаем копию состояния для модификации
  const newState = { ...state };
  
  // 1. Разблокировка USDT (после 1+ применения знаний)
  const applyKnowledgeCount = getApplyKnowledgeCount(state);
  if (applyKnowledgeCount >= 1 && !newState.unlocks.usdt && !newState.resources.usdt?.unlocked) {
    newState.unlocks.usdt = true;
    
    // Проверяем, существует ли ресурс USDT
    if (!newState.resources.usdt) {
      newState.resources.usdt = {
        id: 'usdt',
        name: 'USDT',
        description: 'Стабильная криптовалюта, привязанная к доллару',
        type: 'currency',
        icon: 'dollar',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 100,
        unlocked: true,
        consumption: 0
      };
    } else {
      // Если ресурс существует, просто разблокируем его
      newState.resources.usdt.unlocked = true;
    }
    
    safeDispatchGameEvent('Разблокирован ресурс: USDT', 'info');
  }
  
  // 2. Разблокировка электричества (после покупки генератора)
  if (newState.buildings.generator && newState.buildings.generator.count > 0 && 
      !newState.unlocks.electricity && !newState.resources.electricity?.unlocked) {
    newState.unlocks.electricity = true;
    
    // Проверяем, существует ли ресурс электричество
    if (!newState.resources.electricity) {
      newState.resources.electricity = {
        id: 'electricity',
        name: 'Электричество',
        description: 'Энергия для питания компьютеров и майнеров',
        type: 'resource',
        icon: 'zap',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 100,
        unlocked: true,
        consumption: 0
      };
    } else {
      // Если ресурс существует, просто разблокируем его
      newState.resources.electricity.unlocked = true;
    }
    
    safeDispatchGameEvent('Разблокирован ресурс: Электричество', 'info');
  }
  
  // 3. Разблокировка вычислительной мощности (после покупки домашнего компьютера)
  if (newState.buildings.homeComputer && newState.buildings.homeComputer.count > 0 && 
      !newState.unlocks.computingPower && !newState.resources.computingPower?.unlocked) {
    newState.unlocks.computingPower = true;
    
    // Проверяем, существует ли ресурс вычислительная мощность
    if (!newState.resources.computingPower) {
      newState.resources.computingPower = {
        id: 'computingPower',
        name: 'Вычислительная мощность',
        description: 'Вычислительные ресурсы для майнинга и анализа',
        type: 'resource',
        icon: 'cpu',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 100,
        unlocked: true,
        consumption: 0
      };
    } else {
      // Если ресурс существует, просто разблокируем его
      newState.resources.computingPower.unlocked = true;
    }
    
    safeDispatchGameEvent('Разблокирован ресурс: Вычислительная мощность', 'info');
  }
  
  // 4. Разблокировка Bitcoin (только после покупки майнера)
  if (newState.buildings.miner && newState.buildings.miner.count > 0 && 
      !newState.unlocks.bitcoin && !newState.resources.bitcoin?.unlocked) {
    newState.unlocks.bitcoin = true;
    newState.unlocks.mining = true;
    
    // Проверяем, существует ли ресурс Bitcoin
    if (!newState.resources.bitcoin) {
      newState.resources.bitcoin = {
        id: 'bitcoin',
        name: 'Bitcoin',
        description: 'Криптовалюта, добываемая майнингом',
        type: 'crypto',
        icon: 'bitcoin',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 0.01, // Небольшой объем хранения для начала
        unlocked: true,
        consumption: 0
      };
    } else {
      // Если ресурс существует, просто разблокируем его
      newState.resources.bitcoin.unlocked = true;
    }
    
    // Устанавливаем параметры майнинга
    newState.miningParams = {
      ...state.miningParams,
      miningEfficiency: 1,
      energyEfficiency: 1,
      networkDifficulty: 1,
      exchangeRate: 25000,
      exchangeCommission: 0.005,
      volatility: 0.05
    };
    
    safeDispatchGameEvent('Разблокирован ресурс: Bitcoin', 'info');
    safeDispatchGameEvent('Разблокирована возможность: Майнинг', 'info');
  }
  
  return newState;
};

// Проверяет разблокировки зданий на основе требований
export const checkBuildingUnlocks = (state: GameState): GameState => {
  // Создаем копию состояния для модификации
  const newState = { ...state };
  
  // 1. Проверяем условия для разблокировки практики (2+ применения знаний)
  const applyKnowledgeCount = getApplyKnowledgeCount(state);
  if (applyKnowledgeCount >= 2 && newState.buildings.practice && !newState.buildings.practice.unlocked) {
    newState.buildings.practice.unlocked = true;
    newState.unlocks.practice = true;
    safeDispatchGameEvent('Разблокировано здание: Практика', 'info');
  }
  
  // 2. Проверяем условия для разблокировки генератора (11+ USDT)
  if ((newState.resources.usdt?.value || 0) >= 11 && 
      newState.resources.usdt?.unlocked && 
      newState.buildings.generator && 
      !newState.buildings.generator.unlocked) {
    newState.buildings.generator.unlocked = true;
    newState.unlocks.generator = true;
    safeDispatchGameEvent('Разблокировано здание: Генератор', 'info');
  }
  
  // 3. Проверяем условия для разблокировки домашнего компьютера (50+ электричества)
  if ((newState.resources.electricity?.value || 0) >= 50 && 
      newState.resources.electricity?.unlocked && 
      newState.buildings.homeComputer && 
      !newState.buildings.homeComputer.unlocked) {
    newState.buildings.homeComputer.unlocked = true;
    newState.unlocks.homeComputer = true;
    safeDispatchGameEvent('Разблокировано здание: Домашний компьютер', 'info');
  }
  
  // 4. Разблокировка криптокошелька после исследования "Основы блокчейна"
  if (newState.upgrades.blockchainBasics && 
      newState.upgrades.blockchainBasics.purchased && 
      newState.buildings.cryptoWallet && 
      !newState.buildings.cryptoWallet.unlocked) {
    newState.buildings.cryptoWallet.unlocked = true;
    newState.unlocks.cryptoWallet = true;
    safeDispatchGameEvent('Разблокировано здание: Криптокошелек', 'info');
  }
  
  // 5. Разблокировка интернет-канала после покупки домашнего компьютера
  if (newState.buildings.homeComputer && 
      newState.buildings.homeComputer.count > 0 && 
      newState.buildings.internetChannel && 
      !newState.buildings.internetChannel.unlocked) {
    newState.buildings.internetChannel.unlocked = true;
    newState.unlocks.internetChannel = true;
    safeDispatchGameEvent('Разблокировано здание: Интернет-канал', 'info');
  }
  
  // 6. Разблокировка майнера после исследования "Основы криптовалют"
  if (newState.upgrades.cryptoCurrencyBasics && 
      newState.upgrades.cryptoCurrencyBasics.purchased && 
      newState.buildings.miner && 
      !newState.buildings.miner.unlocked) {
    newState.buildings.miner.unlocked = true;
    newState.unlocks.miner = true;
    safeDispatchGameEvent('Разблокировано здание: Майнер', 'info');
  }
  
  // 7. Разблокировка системы охлаждения после 2+ уровня домашнего компьютера
  if (newState.buildings.homeComputer && 
      newState.buildings.homeComputer.count >= 2 && 
      newState.buildings.coolingSystem && 
      !newState.buildings.coolingSystem.unlocked) {
    newState.buildings.coolingSystem.unlocked = true;
    newState.unlocks.coolingSystem = true;
    safeDispatchGameEvent('Разблокировано здание: Система охлаждения', 'info');
  }
  
  // 8. Разблокировка улучшенного кошелька после 5+ уровня криптокошелька
  if (newState.buildings.cryptoWallet && 
      newState.buildings.cryptoWallet.count >= 5 && 
      newState.buildings.enhancedWallet && 
      !newState.buildings.enhancedWallet.unlocked) {
    newState.buildings.enhancedWallet.unlocked = true;
    newState.unlocks.enhancedWallet = true;
    safeDispatchGameEvent('Разблокировано здание: Улучшенный кошелек', 'info');
  }
  
  // 9. Разблокировка криптобиблиотеки после исследования "Основы криптовалют"
  if (newState.upgrades.cryptoCurrencyBasics && 
      newState.upgrades.cryptoCurrencyBasics.purchased && 
      newState.buildings.cryptoLibrary && 
      !newState.buildings.cryptoLibrary.unlocked) {
    newState.buildings.cryptoLibrary.unlocked = true;
    newState.unlocks.cryptoLibrary = true;
    safeDispatchGameEvent('Разблокировано здание: Криптобиблиотека', 'info');
  }
  
  return newState;
};

// Проверяет разблокировки исследований на основе требований
export const checkUpgradeUnlocks = (state: GameState): GameState => {
  // Создаем копию состояния для модификации
  const newState = { ...state };
  
  // 1. Проверяем условия для разблокировки исследования "Основы блокчейна" (куплен генератор)
  if (newState.buildings.generator && 
      newState.buildings.generator.count > 0 && 
      newState.upgrades.blockchainBasics && 
      !newState.upgrades.blockchainBasics.unlocked) {
    newState.upgrades.blockchainBasics.unlocked = true;
    
    // Если исследования еще не разблокированы, разблокируем их
    if (!newState.unlocks.research) {
      newState.unlocks.research = true;
      safeDispatchGameEvent('Разблокирована возможность: Исследования', 'info');
    }
    
    safeDispatchGameEvent('Разблокировано исследование: Основы блокчейна', 'info');
  }
  
  // 2. Разблокировка "Безопасность криптокошельков" после покупки криптокошелька
  if (newState.buildings.cryptoWallet && 
      newState.buildings.cryptoWallet.count > 0 && 
      newState.upgrades.walletSecurity && 
      !newState.upgrades.walletSecurity.unlocked) {
    newState.upgrades.walletSecurity.unlocked = true;
    safeDispatchGameEvent('Разблокировано исследование: Безопасность криптокошельков', 'info');
  }
  
  // 3. Разблокировка "Основы криптовалют" после 2+ уровня криптокошелька
  if (newState.buildings.cryptoWallet && 
      newState.buildings.cryptoWallet.count >= 2 && 
      newState.upgrades.cryptoCurrencyBasics && 
      !newState.upgrades.cryptoCurrencyBasics.unlocked) {
    newState.upgrades.cryptoCurrencyBasics.unlocked = true;
    safeDispatchGameEvent('Разблокировано исследование: Основы криптовалют', 'info');
  }
  
  // 4. Разблокировка "Оптимизация алгоритмов" после покупки майнера
  if (newState.buildings.miner && 
      newState.buildings.miner.count > 0 && 
      newState.upgrades.algorithmOptimization && 
      !newState.upgrades.algorithmOptimization.unlocked) {
    newState.upgrades.algorithmOptimization.unlocked = true;
    safeDispatchGameEvent('Разблокировано исследование: Оптимизация алгоритмов', 'info');
  }
  
  // 5. Разблокировка "Proof of Work" после исследования "Оптимизация алгоритмов"
  if (newState.upgrades.algorithmOptimization && 
      newState.upgrades.algorithmOptimization.purchased && 
      newState.upgrades.proofOfWork && 
      !newState.upgrades.proofOfWork.unlocked) {
    newState.upgrades.proofOfWork.unlocked = true;
    safeDispatchGameEvent('Разблокировано исследование: Proof of Work', 'info');
  }
  
  // 6. Разблокировка "Энергоэффективные компоненты" после покупки системы охлаждения
  if (newState.buildings.coolingSystem && 
      newState.buildings.coolingSystem.count > 0 && 
      newState.upgrades.energyEfficientComponents && 
      !newState.upgrades.energyEfficientComponents.unlocked) {
    newState.upgrades.energyEfficientComponents.unlocked = true;
    safeDispatchGameEvent('Разблокировано исследование: Энергоэффективные компоненты', 'info');
  }
  
  // 7. Разблокировка "Криптовалютный трейдинг" после покупки улучшенного кошелька
  if (newState.buildings.enhancedWallet && 
      newState.buildings.enhancedWallet.count > 0 && 
      newState.upgrades.cryptoTrading && 
      !newState.upgrades.cryptoTrading.unlocked) {
    newState.upgrades.cryptoTrading.unlocked = true;
    safeDispatchGameEvent('Разблокировано исследование: Криптовалютный трейдинг', 'info');
  }
  
  // 8. Разблокировка "Торговый бот" после исследования "Криптовалютный трейдинг"
  if (newState.upgrades.cryptoTrading && 
      newState.upgrades.cryptoTrading.purchased && 
      newState.upgrades.tradingBot && 
      !newState.upgrades.tradingBot.unlocked) {
    newState.upgrades.tradingBot.unlocked = true;
    safeDispatchGameEvent('Разблокировано исследование: Торговый бот', 'info');
  }
  
  return newState;
};

// Проверяет разблокировки действий на основе требований
export const checkActionUnlocks = (state: GameState): GameState => {
  // Создаем копию состояния для модификации
  const newState = { ...state };
  
  // 1. Проверка разблокировки действия "Применить знания" (3+ кликов по "Изучить крипту")
  const knowledgeClicksValue = getKnowledgeClickCount(state);
  if (knowledgeClicksValue >= 3 && !newState.unlocks.applyKnowledge) {
    newState.unlocks.applyKnowledge = true;
    safeDispatchGameEvent('Разблокировано действие: Применить знания', 'info');
  }
  
  // 2. Разблокировка обмена Bitcoin (после получения ресурса Bitcoin)
  if (newState.resources.bitcoin && 
      newState.resources.bitcoin.unlocked && 
      !newState.unlocks.exchangeBitcoin) {
    newState.unlocks.exchangeBitcoin = true;
    safeDispatchGameEvent('Разблокировано действие: Обмен Bitcoin', 'info');
  }
  
  return newState;
};

// Функция для отладки статуса разблокировок
export const debugUnlockStatus = (state: GameState): { unlocked: string[], locked: string[], steps: string[] } => {
  const unlocked: string[] = [];
  const locked: string[] = [];
  const steps: string[] = [];
  
  // Проверяем разблокировки ресурсов
  steps.push("Проверка ресурсов:");
  Object.entries(state.resources).forEach(([key, resource]) => {
    if (resource.unlocked) {
      unlocked.push(`Ресурс: ${resource.name}`);
      steps.push(`✅ Ресурс ${resource.name} разблокирован`);
    } else {
      locked.push(`Ресурс: ${resource.name}`);
      steps.push(`❌ Ресурс ${resource.name} заблокирован`);
    }
  });
  
  // Проверяем разблокировки зданий
  steps.push("Проверка зданий:");
  Object.entries(state.buildings).forEach(([key, building]) => {
    if (building.unlocked) {
      unlocked.push(`Здание: ${building.name}`);
      steps.push(`✅ Здание ${building.name} разблокировано`);
    } else {
      locked.push(`Здание: ${building.name}`);
      steps.push(`❌ Здание ${building.name} заблокировано`);
    }
  });
  
  // Проверяем разблокировки исследований
  steps.push("Проверка исследований:");
  Object.entries(state.upgrades).forEach(([key, upgrade]) => {
    if (upgrade.unlocked) {
      unlocked.push(`Исследование: ${upgrade.name}`);
      steps.push(`✅ Исследование ${upgrade.name} разблокировано`);
      
      if (upgrade.purchased) {
        steps.push(`   • Исследование ${upgrade.name} приобретено`);
      } else {
        steps.push(`   • Исследование ${upgrade.name} доступно для покупки`);
      }
    } else {
      locked.push(`Исследование: ${upgrade.name}`);
      steps.push(`❌ Исследование ${upgrade.name} заблокировано`);
    }
  });
  
  // Проверяем общие разблокировки
  steps.push("Проверка общих разблокировок:");
  Object.entries(state.unlocks).forEach(([key, isUnlocked]) => {
    if (isUnlocked) {
      unlocked.push(`Возможность: ${key}`);
      steps.push(`✅ Возможность ${key} разблокирована`);
    } else {
      locked.push(`Возможность: ${key}`);
      steps.push(`❌ Возможность ${key} заблокирована`);
    }
  });
  
  // Проверяем счетчики
  steps.push("Значения счетчиков:");
  Object.entries(state.counters).forEach(([key, counter]) => {
    const value = typeof counter === 'object' ? counter.value : counter;
    steps.push(`   • Счетчик ${key}: ${value}`);
  });
  
  return { unlocked, locked, steps };
};

// Вспомогательные функции для безопасного получения значений счетчиков
const getApplyKnowledgeCount = (state: GameState): number => {
  const counter = state.counters.applyKnowledge;
  if (!counter) return 0;
  return typeof counter === 'object' ? counter.value : counter;
};

const getKnowledgeClickCount = (state: GameState): number => {
  const counter = state.counters.knowledgeClicks;
  if (!counter) return 0;
  return typeof counter === 'object' ? counter.value : counter;
};
