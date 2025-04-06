
import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Утилиты для отладки состояния разблокировок элементов
 */
export const debugUnlockStatus = (state: GameState): { 
  unlocked: string[],
  locked: string[],
  steps: string[]
} => {
  const unlocked: string[] = [];
  const locked: string[] = [];
  const steps: string[] = [];
  
  // Проверяем разблокировки ресурсов
  steps.push('Проверка разблокировок ресурсов:');
  if (state.resources.usdt?.unlocked) {
    unlocked.push('Ресурс: USDT');
    steps.push('✅ USDT разблокирован');
  } else {
    locked.push('Ресурс: USDT');
    steps.push('❌ USDT заблокирован');
    steps.push('• Требуется использовать "Применить знания" хотя бы 1 раз');
  }
  
  if (state.resources.electricity?.unlocked) {
    unlocked.push('Ресурс: Электричество');
    steps.push('✅ Электричество разблокировано');
  } else {
    locked.push('Ресурс: Электричество');
    steps.push('❌ Электричество заблокировано');
    steps.push('• Требуется купить хотя бы 1 Генератор');
  }
  
  if (state.resources.computingPower?.unlocked) {
    unlocked.push('Ресурс: Вычислительная мощность');
    steps.push('✅ Вычислительная мощность разблокирована');
  } else {
    locked.push('Ресурс: Вычислительная мощность');
    steps.push('❌ Вычислительная мощность заблокирована');
    steps.push('• Требуется купить хотя бы 1 Домашний компьютер');
  }
  
  if (state.resources.bitcoin?.unlocked) {
    unlocked.push('Ресурс: Bitcoin');
    steps.push('✅ Bitcoin разблокирован');
  } else {
    locked.push('Ресурс: Bitcoin');
    steps.push('❌ Bitcoin заблокирован');
    steps.push('• Требуется купить хотя бы 1 Майнер');
  }
  
  // Проверяем разблокировки зданий
  steps.push('Проверка разблокировок зданий:');
  if (state.buildings.practice?.unlocked) {
    unlocked.push('Здание: Практика');
    steps.push('✅ Практика разблокирована');
  } else {
    locked.push('Здание: Практика');
    steps.push('❌ Практика заблокирована');
    steps.push('• Требуется использовать "Применить знания" хотя бы 2 раза');
  }
  
  if (state.buildings.generator?.unlocked) {
    unlocked.push('Здание: Генератор');
    steps.push('✅ Генератор разблокирован');
  } else {
    locked.push('Здание: Генератор');
    steps.push('❌ Генератор заблокирован');
    steps.push('• Требуется накопить хотя бы 11 USDT');
  }
  
  if (state.buildings.homeComputer?.unlocked) {
    unlocked.push('Здание: Домашний компьютер');
    steps.push('✅ Домашний компьютер разблокирован');
  } else {
    locked.push('Здание: Домашний компьютер');
    steps.push('❌ Домашний компьютер заблокирован');
    steps.push('• Требуется накопить хотя бы 50 Электричества');
  }
  
  if (state.buildings.cryptoWallet?.unlocked) {
    unlocked.push('Здание: Криптокошелек');
    steps.push('✅ Криптокошелек разблокирован');
  } else {
    locked.push('Здание: Криптокошелек');
    steps.push('❌ Криптокошелек заблокирован');
    steps.push('• Требуется исследовать "Основы блокчейна"');
  }
  
  if (state.buildings.internetChannel?.unlocked) {
    unlocked.push('Здание: Интернет-канал');
    steps.push('✅ Интернет-канал разблокирован');
  } else {
    locked.push('Здание: Интернет-канал');
    steps.push('❌ Интернет-канал заблокирован');
    steps.push('• Требуется купить домашний компьютер');
  }
  
  if (state.buildings.miner?.unlocked) {
    unlocked.push('Здание: Майнер');
    steps.push('✅ Майнер разблокирован');
  } else {
    locked.push('Здание: Майнер');
    steps.push('❌ Майнер заблокирован');
    steps.push('• Требуется исследовать "Основы криптовалют"');
  }
  
  if (state.buildings.coolingSystem?.unlocked) {
    unlocked.push('Здание: Система охлаждения');
    steps.push('✅ Система охлаждения разблокирована');
  } else {
    locked.push('Здание: Система охлаждения');
    steps.push('❌ Система охлаждения заблокирована');
    steps.push('• Требуется 2+ Домашних компьютера');
  }
  
  if (state.buildings.cryptoLibrary?.unlocked) {
    unlocked.push('Здание: Криптобиблиотека');
    steps.push('✅ Криптобиблиотека разблокирована');
  } else {
    locked.push('Здание: Криптобиблиотека');
    steps.push('❌ Криптобиблиотека заблокирована');
    steps.push('• Требуется исследовать "Основы криптовалют"');
  }
  
  if (state.buildings.enhancedWallet?.unlocked) {
    unlocked.push('Здание: Улучшенный кошелек');
    steps.push('✅ Улучшенный кошелек разблокирован');
  } else {
    locked.push('Здание: Улучшенный кошелек');
    steps.push('❌ Улучшенный кошелек заблокирован');
    steps.push('• Требуется 5+ уровней Криптокошелька');
  }
  
  // Проверяем разблокировки исследований
  steps.push('Проверка разблокировок исследований:');
  if (state.upgrades.blockchainBasics?.unlocked) {
    unlocked.push('Исследование: Основы блокчейна');
    steps.push('✅ Исследование "Основы блокчейна" разблокировано');
  } else {
    locked.push('Исследование: Основы блокчейна');
    steps.push('❌ Исследование "Основы блокчейна" заблокировано');
    steps.push('• Требуется купить хотя бы 1 Генератор');
  }
  
  if (state.upgrades.walletSecurity?.unlocked) {
    unlocked.push('Исследование: Безопасность криптокошельков');
    steps.push('✅ Исследование "Безопасность криптокошельков" разблокировано');
  } else {
    locked.push('Исследование: Безопасность криптокошельков');
    steps.push('❌ Исследование "Безопасность криптокошельков" заблокировано');
    steps.push('• Требуется купить хотя бы 1 Криптокошелек');
  }
  
  if (state.upgrades.cryptoBasics?.unlocked || state.upgrades.cryptoCurrencyBasics?.unlocked) {
    unlocked.push('Исследование: Основы криптовалют');
    steps.push('✅ Исследование "Основы криптовалют" разблокировано');
  } else {
    locked.push('Исследование: Основы криптовалют');
    steps.push('❌ Исследование "Основы криптовалют" заблокировано');
    steps.push('• Требуется купить хотя бы 2 Криптокошелька');
  }
  
  if (state.upgrades.algorithmOptimization?.unlocked) {
    unlocked.push('Исследование: Оптимизация алгоритмов');
    steps.push('✅ Исследование "Оптимизация алгоритмов" разблокировано');
  } else {
    locked.push('Исследование: Оптимизация алгоритмов');
    steps.push('❌ Исследование "Оптимизация алгоритмов" заблокировано');
    steps.push('• Требуется купить хотя бы 1 Майнер');
  }
  
  if (state.upgrades.proofOfWork?.unlocked) {
    unlocked.push('Исследование: Proof of Work');
    steps.push('✅ Исследование "Proof of Work" разблокировано');
  } else {
    locked.push('Исследование: Proof of Work');
    steps.push('❌ Исследование "Proof of Work" заблокировано');
    steps.push('• Требуется исследовать "Оптимизация алгоритмов"');
  }
  
  if (state.upgrades.energyEfficientComponents?.unlocked) {
    unlocked.push('Исследование: Энергоэффективные компоненты');
    steps.push('✅ Исследование "Энергоэффективные компоненты" разблокировано');
  } else {
    locked.push('Исследование: Энергоэффективные компоненты');
    steps.push('❌ Исследование "Энергоэффективные компоненты" заблокировано');
    steps.push('• Требуется построить систему охлаждения');
  }
  
  // Проверяем разблокировки действий
  steps.push('Проверка разблокировок действий:');
  if (state.unlocks.applyKnowledge) {
    unlocked.push('Действие: Применить знания');
    steps.push('✅ Действие "Применить знания" разблокировано');
  } else {
    locked.push('Действие: Применить знания');
    steps.push('❌ Действие "Применить знания" заблокировано');
    steps.push('• Требуется нажать на кнопку "Изучить" хотя бы 3 раза');
  }
  
  if (state.unlocks.bitcoinExchange) {
    unlocked.push('Действие: Обмен Bitcoin');
    steps.push('✅ Действие "Обмен Bitcoin" разблокировано');
  } else {
    locked.push('Действие: Обмен Bitcoin');
    steps.push('❌ Действие "Обмен Bitcoin" заблокировано');
    steps.push('• Требуется разблокировать ресурс Bitcoin');
  }
  
  return { unlocked, locked, steps };
};

/**
 * Проверяет и обновляет состояние всех разблокировок
 */
export const checkAllUnlocks = (state: GameState): GameState => {
  console.log("📊 UnlockManager: Проверка всех разблокировок");
  
  let newState = JSON.parse(JSON.stringify(state));
  
  // Последовательно проверяем все типы разблокировок
  newState = checkResourceUnlocks(newState);
  newState = checkBuildingUnlocks(newState);
  newState = checkUpgradeUnlocks(newState);
  newState = checkActionUnlocks(newState);
  newState = checkSpecialUnlocks(newState);
  
  return newState;
};

/**
 * Проверяет и обновляет разблокировки ресурсов
 */
export const checkResourceUnlocks = (state: GameState): GameState => {
  console.log("📊 UnlockManager: Проверка разблокировок ресурсов");
  
  const newState = { ...state };
  
  // Проверяем разблокировку USDT (после 1+ применений знаний)
  const applyKnowledgeCount = getCounterValue(state, 'applyKnowledge');
  if (applyKnowledgeCount >= 1 && newState.resources.usdt && !newState.resources.usdt.unlocked) {
    console.log(`📊 UnlockManager: Разблокировка USDT (применений знаний: ${applyKnowledgeCount})`);
    newState.resources.usdt.unlocked = true;
    newState.unlocks.usdt = true;
    safeDispatchGameEvent(
      newState.language === 'ru' ? 'Разблокирован ресурс: USDT' : 'Resource unlocked: USDT', 
      'info'
    );
  }
  
  // Проверяем разблокировку Электричества (после покупки генератора)
  if (state.buildings.generator && state.buildings.generator.count > 0 && 
      newState.resources.electricity && !newState.resources.electricity.unlocked) {
    console.log(`📊 UnlockManager: Разблокировка Электричества (генераторов: ${state.buildings.generator.count})`);
    newState.resources.electricity.unlocked = true;
    newState.unlocks.electricity = true;
    safeDispatchGameEvent(
      newState.language === 'ru' ? 'Разблокирован ресурс: Электричество' : 'Resource unlocked: Electricity', 
      'info'
    );
  }
  
  // Проверяем разблокировку Вычислительной мощности (после покупки компьютера)
  if (state.buildings.homeComputer && state.buildings.homeComputer.count > 0 && 
      newState.resources.computingPower && !newState.resources.computingPower.unlocked) {
    console.log(`📊 UnlockManager: Разблокировка Выч. Мощности (компьютеров: ${state.buildings.homeComputer.count})`);
    newState.resources.computingPower.unlocked = true;
    newState.unlocks.computingPower = true;
    safeDispatchGameEvent(
      newState.language === 'ru' ? 'Разблокирован ресурс: Вычислительная мощность' : 'Resource unlocked: Computing Power', 
      'info'
    );
  }
  
  // Проверяем разблокировку Bitcoin (после покупки майнера)
  if (state.buildings.miner && state.buildings.miner.count > 0 && 
      newState.resources.bitcoin && !newState.resources.bitcoin.unlocked) {
    console.log(`📊 UnlockManager: Разблокировка Bitcoin (майнеров: ${state.buildings.miner.count})`);
    newState.resources.bitcoin.unlocked = true;
    newState.unlocks.bitcoin = true;
    safeDispatchGameEvent(
      newState.language === 'ru' ? 'Разблокирован ресурс: Bitcoin' : 'Resource unlocked: Bitcoin', 
      'info'
    );
  }
  
  return newState;
};

/**
 * Проверяет и обновляет разблокировки зданий
 */
export const checkBuildingUnlocks = (state: GameState): GameState => {
  console.log("📊 UnlockManager: Проверка разблокировок зданий");
  
  const newState = { ...state };
  
  // Проверяем разблокировку Практики (после 2+ применений знаний)
  const applyKnowledgeCount = getCounterValue(state, 'applyKnowledge');
  if (applyKnowledgeCount >= 2 && newState.buildings.practice && !newState.buildings.practice.unlocked) {
    console.log(`📊 UnlockManager: Разблокировка Практики (применений знаний: ${applyKnowledgeCount})`);
    newState.buildings.practice.unlocked = true;
    newState.unlocks.practice = true;
    safeDispatchGameEvent(
      newState.language === 'ru' ? 'Разблокировано здание: Практика' : 'Building unlocked: Practice', 
      'info'
    );
  }
  
  // Проверяем разблокировку Генератора (11+ USDT)
  if (state.resources.usdt && state.resources.usdt.value >= 11 && state.resources.usdt.unlocked && 
      newState.buildings.generator && !newState.buildings.generator.unlocked) {
    console.log(`📊 UnlockManager: Разблокировка Генератора (USDT: ${state.resources.usdt.value})`);
    newState.buildings.generator.unlocked = true;
    newState.unlocks.generator = true;
    safeDispatchGameEvent(
      newState.language === 'ru' ? 'Разблокировано здание: Генератор' : 'Building unlocked: Generator', 
      'info'
    );
  }
  
  // Проверяем разблокировку Домашнего компьютера (50+ электричества)
  if (state.resources.electricity && state.resources.electricity.value >= 50 && state.resources.electricity.unlocked && 
      newState.buildings.homeComputer && !newState.buildings.homeComputer.unlocked) {
    console.log(`📊 UnlockManager: Разблокировка Домашнего компьютера (электричества: ${state.resources.electricity.value})`);
    newState.buildings.homeComputer.unlocked = true;
    newState.unlocks.homeComputer = true;
    safeDispatchGameEvent(
      newState.language === 'ru' ? 'Разблокировано здание: Домашний компьютер' : 'Building unlocked: Home Computer', 
      'info'
    );
  }
  
  // Проверяем разблокировку Криптокошелька (после исследования основ блокчейна)
  if (state.upgrades.blockchainBasics && state.upgrades.blockchainBasics.purchased && 
      newState.buildings.cryptoWallet && !newState.buildings.cryptoWallet.unlocked) {
    console.log(`📊 UnlockManager: Разблокировка Криптокошелька (исследование: ${state.upgrades.blockchainBasics.id})`);
    newState.buildings.cryptoWallet.unlocked = true;
    newState.unlocks.cryptoWallet = true;
    safeDispatchGameEvent(
      newState.language === 'ru' ? 'Разблокировано здание: Криптокошелек' : 'Building unlocked: Crypto Wallet', 
      'info'
    );
  }
  
  // Проверяем разблокировку Интернет-канала (после покупки домашнего компьютера)
  if (state.buildings.homeComputer && state.buildings.homeComputer.count > 0 && 
      newState.buildings.internetChannel && !newState.buildings.internetChannel.unlocked) {
    console.log(`📊 UnlockManager: Разблокировка Интернет-канала (компьютеров: ${state.buildings.homeComputer.count})`);
    newState.buildings.internetChannel.unlocked = true;
    newState.unlocks.internetChannel = true;
    safeDispatchGameEvent(
      newState.language === 'ru' ? 'Разблокировано здание: Интернет-канал' : 'Building unlocked: Internet Channel', 
      'info'
    );
  }
  
  // Проверяем разблокировку Майнера (после исследования основ криптовалют)
  if ((state.upgrades.cryptoCurrencyBasics && state.upgrades.cryptoCurrencyBasics.purchased) || 
      (state.upgrades.cryptoBasics && state.upgrades.cryptoBasics.purchased) && 
      newState.buildings.miner && !newState.buildings.miner.unlocked) {
    console.log(`📊 UnlockManager: Разблокировка Майнера (исследование криптовалют выполнено)`);
    newState.buildings.miner.unlocked = true;
    newState.unlocks.miner = true;
    safeDispatchGameEvent(
      newState.language === 'ru' ? 'Разблокировано здание: Майнер' : 'Building unlocked: Miner', 
      'info'
    );
  }
  
  // Проверяем разблокировку Системы охлаждения (после 2+ домашних компьютеров)
  if (state.buildings.homeComputer && state.buildings.homeComputer.count >= 2 && 
      newState.buildings.coolingSystem && !newState.buildings.coolingSystem.unlocked) {
    console.log(`📊 UnlockManager: Разблокировка Системы охлаждения (компьютеров: ${state.buildings.homeComputer.count})`);
    newState.buildings.coolingSystem.unlocked = true;
    newState.unlocks.coolingSystem = true;
    safeDispatchGameEvent(
      newState.language === 'ru' ? 'Разблокировано здание: Система охлаждения' : 'Building unlocked: Cooling System', 
      'info'
    );
  }
  
  // Проверяем разблокировку Криптобиблиотеки (после исследования основ криптовалют)
  if ((state.upgrades.cryptoCurrencyBasics && state.upgrades.cryptoCurrencyBasics.purchased) || 
      (state.upgrades.cryptoBasics && state.upgrades.cryptoBasics.purchased) && 
      newState.buildings.cryptoLibrary && !newState.buildings.cryptoLibrary.unlocked) {
    console.log(`📊 UnlockManager: Разблокировка Криптобиблиотеки (исследование криптовалют выполнено)`);
    newState.buildings.cryptoLibrary.unlocked = true;
    newState.unlocks.cryptoLibrary = true;
    safeDispatchGameEvent(
      newState.language === 'ru' ? 'Разблокировано здание: Криптобиблиотека' : 'Building unlocked: Crypto Library', 
      'info'
    );
  }
  
  // Проверяем разблокировку Улучшенного кошелька (после 5+ уровней криптокошелька)
  if (state.buildings.cryptoWallet && state.buildings.cryptoWallet.count >= 5 && 
      newState.buildings.enhancedWallet && !newState.buildings.enhancedWallet.unlocked) {
    console.log(`📊 UnlockManager: Разблокировка Улучшенного кошелька (криптокошельков: ${state.buildings.cryptoWallet.count})`);
    newState.buildings.enhancedWallet.unlocked = true;
    newState.unlocks.enhancedWallet = true;
    safeDispatchGameEvent(
      newState.language === 'ru' ? 'Разблокировано здание: Улучшенный кошелек' : 'Building unlocked: Enhanced Wallet', 
      'info'
    );
  }
  
  return newState;
};

/**
 * Проверяет и обновляет разблокировки улучшений/исследований
 */
export const checkUpgradeUnlocks = (state: GameState): GameState => {
  console.log("📊 UnlockManager: Проверка разблокировок исследований");
  
  const newState = { ...state };
  
  // Проверяем разблокировку вкладки исследований (после покупки генератора)
  if (state.buildings.generator && state.buildings.generator.count > 0 && !state.unlocks.research) {
    console.log(`📊 UnlockManager: Разблокировка вкладки Исследований (генератор: ${state.buildings.generator.count})`);
    newState.unlocks.research = true;
    newState.unlocks.researchTab = true; // Для совместимости
    safeDispatchGameEvent(
      newState.language === 'ru' ? 'Разблокирована вкладка: Исследования' : 'Tab unlocked: Research', 
      'info'
    );
  }
  
  // Проверяем разблокировку "Основы блокчейна" (после покупки генератора)
  if (state.buildings.generator && state.buildings.generator.count > 0 && 
      newState.upgrades.blockchainBasics && !newState.upgrades.blockchainBasics.unlocked) {
    console.log(`📊 UnlockManager: Разблокировка исследования Основы блокчейна (генератор: ${state.buildings.generator.count})`);
    newState.upgrades.blockchainBasics.unlocked = true;
    safeDispatchGameEvent(
      newState.language === 'ru' ? 'Разблокировано исследование: Основы блокчейна' : 'Research unlocked: Blockchain Basics', 
      'info'
    );
  }
  
  // Проверяем разблокировку "Безопасность криптокошельков" (после покупки криптокошелька)
  if (state.buildings.cryptoWallet && state.buildings.cryptoWallet.count > 0 && 
      newState.upgrades.walletSecurity && !newState.upgrades.walletSecurity.unlocked) {
    console.log(`📊 UnlockManager: Разблокировка исследования Безопасность криптокошельков (кошельков: ${state.buildings.cryptoWallet.count})`);
    newState.upgrades.walletSecurity.unlocked = true;
    safeDispatchGameEvent(
      newState.language === 'ru' ? 'Разблокировано исследование: Безопасность криптокошельков' : 'Research unlocked: Wallet Security', 
      'info'
    );
  }
  
  // Проверяем разблокировку "Основы криптовалют" (после покупки 2+ криптокошельков)
  // Обработка обоих возможных идентификаторов для совместимости
  if (state.buildings.cryptoWallet && state.buildings.cryptoWallet.count >= 2) {
    // Проверяем cryptoCurrencyBasics
    if (newState.upgrades.cryptoCurrencyBasics && !newState.upgrades.cryptoCurrencyBasics.unlocked) {
      console.log(`📊 UnlockManager: Разблокировка исследования Основы криптовалют (кошельков: ${state.buildings.cryptoWallet.count})`);
      newState.upgrades.cryptoCurrencyBasics.unlocked = true;
      safeDispatchGameEvent(
        newState.language === 'ru' ? 'Разблокировано исследование: Основы криптовалют' : 'Research unlocked: Crypto Currency Basics', 
        'info'
      );
    }
    
    // Проверяем cryptoBasics (альтернативное имя)
    if (newState.upgrades.cryptoBasics && !newState.upgrades.cryptoBasics.unlocked) {
      console.log(`📊 UnlockManager: Разблокировка исследования Основы криптовалют (альт.) (кошельков: ${state.buildings.cryptoWallet.count})`);
      newState.upgrades.cryptoBasics.unlocked = true;
      // Не отправляем второе уведомление, если уже отправили для cryptoCurrencyBasics
    }
  }
  
  // Проверяем разблокировку "Оптимизация алгоритмов" (после покупки майнера)
  if (state.buildings.miner && state.buildings.miner.count > 0 && 
      newState.upgrades.algorithmOptimization && !newState.upgrades.algorithmOptimization.unlocked) {
    console.log(`📊 UnlockManager: Разблокировка исследования Оптимизация алгоритмов (майнеров: ${state.buildings.miner.count})`);
    newState.upgrades.algorithmOptimization.unlocked = true;
    safeDispatchGameEvent(
      newState.language === 'ru' ? 'Разблокировано исследование: Оптимизация алгоритмов' : 'Research unlocked: Algorithm Optimization', 
      'info'
    );
  }
  
  // Проверяем разблокировку "Proof of Work" (после исследования Оптимизации алгоритмов)
  if (state.upgrades.algorithmOptimization && state.upgrades.algorithmOptimization.purchased && 
      newState.upgrades.proofOfWork && !newState.upgrades.proofOfWork.unlocked) {
    console.log(`📊 UnlockManager: Разблокировка исследования Proof of Work (после Оптимизации)`);
    newState.upgrades.proofOfWork.unlocked = true;
    safeDispatchGameEvent(
      newState.language === 'ru' ? 'Разблокировано исследование: Proof of Work' : 'Research unlocked: Proof of Work', 
      'info'
    );
  }
  
  // Проверяем разблокировку "Энергоэффективные компоненты" (после покупки системы охлаждения)
  if (state.buildings.coolingSystem && state.buildings.coolingSystem.count > 0 && 
      newState.upgrades.energyEfficientComponents && !newState.upgrades.energyEfficientComponents.unlocked) {
    console.log(`📊 UnlockManager: Разблокировка исследования Энергоэффективные компоненты (после системы охлаждения)`);
    newState.upgrades.energyEfficientComponents.unlocked = true;
    safeDispatchGameEvent(
      newState.language === 'ru' ? 'Разблокировано исследование: Энергоэффективные компоненты' : 'Research unlocked: Energy Efficient Components', 
      'info'
    );
  }
  
  // Проверяем разблокировку "Криптовалютный трейдинг" (после покупки улучшенного кошелька)
  if (state.buildings.enhancedWallet && state.buildings.enhancedWallet.count > 0 && 
      newState.upgrades.cryptoTrading && !newState.upgrades.cryptoTrading.unlocked) {
    console.log(`📊 UnlockManager: Разблокировка исследования Криптовалютный трейдинг (после улучшенного кошелька)`);
    newState.upgrades.cryptoTrading.unlocked = true;
    safeDispatchGameEvent(
      newState.language === 'ru' ? 'Разблокировано исследование: Криптовалютный трейдинг' : 'Research unlocked: Crypto Trading', 
      'info'
    );
  }
  
  // Проверяем разблокировку "Торговый бот" (после исследования Криптовалютного трейдинга)
  if (state.upgrades.cryptoTrading && state.upgrades.cryptoTrading.purchased && 
      newState.upgrades.tradingBot && !newState.upgrades.tradingBot.unlocked) {
    console.log(`📊 UnlockManager: Разблокировка исследования Торговый бот (после Крипто-трейдинга)`);
    newState.upgrades.tradingBot.unlocked = true;
    safeDispatchGameEvent(
      newState.language === 'ru' ? 'Разблокировано исследование: Торговый бот' : 'Research unlocked: Trading Bot', 
      'info'
    );
  }
  
  return newState;
};

/**
 * Проверяет и обновляет разблокировки действий
 */
export const checkActionUnlocks = (state: GameState): GameState => {
  console.log("📊 UnlockManager: Проверка разблокировок действий");
  
  const newState = { ...state };
  
  // Проверяем разблокировку кнопки "Применить знания" (после 3+ кликов на "Изучить")
  const knowledgeClicksCount = getCounterValue(state, 'knowledgeClicks');
  if (knowledgeClicksCount >= 3 && !state.unlocks.applyKnowledge) {
    console.log(`📊 UnlockManager: Разблокировка действия Применить знания (кликов: ${knowledgeClicksCount})`);
    newState.unlocks.applyKnowledge = true;
    safeDispatchGameEvent(
      newState.language === 'ru' ? 'Разблокировано действие: Применить знания' : 'Action unlocked: Apply Knowledge', 
      'info'
    );
  }
  
  // Проверяем разблокировку обмена Bitcoin (после разблокировки ресурса)
  if (state.resources.bitcoin && state.resources.bitcoin.unlocked && !state.unlocks.bitcoinExchange) {
    console.log(`📊 UnlockManager: Разблокировка действия Обмен Bitcoin (ресурс разблокирован)`);
    newState.unlocks.bitcoinExchange = true;
    safeDispatchGameEvent(
      newState.language === 'ru' ? 'Разблокировано действие: Обмен Bitcoin' : 'Action unlocked: Exchange Bitcoin', 
      'info'
    );
  }
  
  return newState;
};

/**
 * Проверяет и обновляет специальные разблокировки
 */
export const checkSpecialUnlocks = (state: GameState): GameState => {
  const newState = { ...state };
  
  // Проверяем разблокировку вкладки Equipment для обратной совместимости
  const hasUnlockedBuildings = Object.values(state.buildings).some(building => 
    building && typeof building === 'object' && 'unlocked' in building && building.unlocked === true
  );
  
  if (hasUnlockedBuildings && !state.unlocks.equipmentTab) {
    console.log(`📊 UnlockManager: Разблокировка вкладки Equipment (для совместимости)`);
    newState.unlocks.equipmentTab = true;
  }
  
  // Проверяем разблокировку вкладки Research (дублирование для совместимости)
  if (state.unlocks.research && !state.unlocks.researchTab) {
    console.log(`📊 UnlockManager: Разблокировка вкладки Research (для совместимости)`);
    newState.unlocks.researchTab = true;
  }
  
  return newState;
};

/**
 * Выполняет полную перепроверку всех разблокировок с нуля
 */
export const rebuildAllUnlocks = (state: GameState): GameState => {
  console.log("📊 UnlockManager: Полная перепроверка всех разблокировок");
  
  // Создаем копию состояния
  let newState = JSON.parse(JSON.stringify(state));
  
  // Сбрасываем флаги разблокировок для ресурсов, зданий и исследований
  // Используем правильное приведение типов для каждого элемента
  Object.values(newState.resources).forEach(resource => {
    if (resource && typeof resource === 'object' && 'unlocked' in resource) {
      resource.unlocked = false;
    }
  });
  
  Object.values(newState.buildings).forEach(building => {
    if (building && typeof building === 'object' && 'unlocked' in building) {
      building.unlocked = false;
    }
  });
  
  Object.values(newState.upgrades).forEach(upgrade => {
    if (upgrade && typeof upgrade === 'object' && 'unlocked' in upgrade) {
      upgrade.unlocked = false;
    }
  });
  
  // Сбрасываем общие флаги разблокировок
  newState.unlocks = {
    // Сохраняем только базовые значения
    ...newState.unlocks,
    applyKnowledge: false,
    bitcoinExchange: false,
    research: false,
    researchTab: false,
    equipmentTab: false,
    usdt: false,
    electricity: false,
    computingPower: false,
    bitcoin: false,
  };
  
  // Принудительно разблокируем начальный ресурс - знания
  if (newState.resources.knowledge) {
    newState.resources.knowledge.unlocked = true;
  }
  
  // Выполняем все проверки разблокировок
  newState = checkAllUnlocks(newState);
  
  console.log("📊 UnlockManager: Перепроверка разблокировок завершена");
  return newState;
};

/**
 * Принудительно проверяет все разблокировки
 */
export const forceCheckAllUnlocks = (state: GameState): GameState => {
  console.log("📊 UnlockManager: Принудительная проверка всех разблокировок");
  
  // Принудительно разблокируем начальный ресурс - знания
  let newState = { ...state };
  if (newState.resources.knowledge) {
    newState.resources.knowledge.unlocked = true;
  }
  
  return checkAllUnlocks(newState);
};

/**
 * Безопасно получает значение счетчика
 */
const getCounterValue = (state: GameState, counterId: string): number => {
  const counter = state.counters[counterId];
  if (!counter) return 0;
  
  return typeof counter === 'object' ? counter.value : counter;
};
