import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

// Функция для отладки статуса разблокировок
export function debugUnlockStatus(state: GameState) {
  let log: string[] = [];
  let unlocked: string[] = [];
  let locked: string[] = [];
  
  // Общая информация
  log.push(`Текущая фаза: ${state.phase}`);
  log.push(`USDT разблокирован: ${state.resources.usdt?.unlocked ? '✅' : '❌'}`);
  log.push(`Знания: ${state.resources.knowledge?.value.toFixed(2)}/${state.resources.knowledge?.max}`);
  log.push(`Применено знаний: ${state.counters.applyKnowledge?.value || 0} раз`);
  
  // Проверка условий разблокировки USDT
  const usdtUnlocked = state.resources.usdt?.unlocked === true;
  const applyKnowledgeCount = state.counters.applyKnowledge?.value || 0;
  const usdtUnlockConditionMet = applyKnowledgeCount >= 1;
  
  log.push(`Условие разблокировки USDT выполнено: ${usdtUnlockConditionMet ? '✅' : '❌'}`);
  
  // Здания
  log.push(`--- Здания ---`);
  for (const buildingId in state.buildings) {
    const building = state.buildings[buildingId];
    log.push(`${building.name} (${buildingId}): разблокирован=${building.unlocked ? '✅' : '❌'}, количество=${building.count}`);
    
    if (building.unlocked) {
      unlocked.push(`Здание: ${building.name}`);
    } else {
      locked.push(`Здание: ${building.name}`);
    }
  }
  
  // Исследования
  log.push(`--- Исследования ---`);
  for (const upgradeId in state.upgrades) {
    const upgrade = state.upgrades[upgradeId];
    log.push(`${upgrade.name} (${upgradeId}): разблокирован=${upgrade.unlocked ? '✅' : '❌'}, куплен=${upgrade.purchased ? '✅' : '❌'}`);
    
    if (upgrade.unlocked) {
      unlocked.push(`Исследование: ${upgrade.name}`);
    } else {
      locked.push(`Исследование: ${upgrade.name}`);
    }
  }
  
  // Ресурсы
  log.push(`--- Ресурсы ---`);
  for (const resourceId in state.resources) {
    const resource = state.resources[resourceId];
    log.push(`${resource.name} (${resourceId}): разблокирован=${resource.unlocked ? '✅' : '❌'}, значение=${resource.value.toFixed(2)}`);
    
    if (resource.unlocked) {
      unlocked.push(`Ресурс: ${resource.name}`);
    } else {
      locked.push(`Ресурс: ${resource.name}`);
    }
  }
  
  // Вывод в консоль
  console.log('--- Отладка разблокировок ---');
  log.forEach(line => console.log(line));
  
  // Возвращаем структурированные данные
  return {
    unlocked,
    locked,
    steps: log
  };
}

// Проверяет все возможные разблокировки
export const checkAllUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  newState = checkResourceUnlocks(newState);
  newState = checkBuildingUnlocks(newState);
  newState = checkUpgradeUnlocks(newState);
  newState = checkActionUnlocks(newState);
  newState = checkSpecialUnlocks(newState);
  
  return newState;
};

// Добавляем функцию rebuildAllUnlocks
export const rebuildAllUnlocks = (state: GameState): GameState => {
  console.log('Полная перепроверка всех разблокировок');
  // Сброс всех флагов unlocks
  let newState = { ...state };
  
  // Базовая инициализация (знания всегда разблокированы)
  newState.unlocks = {
    knowledge: true
  };
  
  // Проверяем разблокировки шаг за шагом
  newState = checkSpecialUnlocks(newState);
  newState = checkResourceUnlocks(newState);
  newState = checkBuildingUnlocks(newState);
  newState = checkUpgradeUnlocks(newState);
  newState = checkActionUnlocks(newState);
  
  return newState;
};

// Проверяет специальные разблокировки, зависящие от счетчиков и других условий
export const checkSpecialUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Проверяем количество кликов на "Изучить крипту" для разблокировки "Применить знания"
  const knowledgeClicks = newState.counters.knowledgeClicks?.value || 0;
  if (!newState.unlocks.applyKnowledge && knowledgeClicks >= 3) {
    console.log('unlockManager: Разблокирована кнопка "Применить знания" (3+ кликов)');
    newState.unlocks.applyKnowledge = true;
    safeDispatchGameEvent('Разблокировано: Применить знания', 'success');
  }
  
  // Проверяем, разблокирован ли USDT
  const applyKnowledgeCount = newState.counters.applyKnowledge?.value || 0;
  if (!newState.unlocks.usdt && applyKnowledgeCount >= 1) {
    console.log('unlockManager: Разблокирован USDT (1+ применений знаний)');
    
    // Создаем или обновляем ресурс USDT
    if (!newState.resources.usdt) {
      // Если ресурса USDT еще нет, создаем его
      newState.resources.usdt = {
        id: 'usdt',
        name: 'USDT',
        description: 'Стабильная криптовалюта для покупок',
        type: 'currency',
        icon: 'dollar',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 50,
        unlocked: true
      };
    } else {
      // Если ресурс USDT существует, просто разблокируем его
      newState.resources.usdt.unlocked = true;
    }
    
    newState.unlocks.usdt = true;
    safeDispatchGameEvent('Разблокирован ресурс: USDT', 'success');
  }
  
  // Проверяем, разблокирована ли практика
  if (!newState.buildings.practice?.unlocked && applyKnowledgeCount >= 2) {
    console.log('unlockManager: Разблокирована практика (2+ применений знаний)');
    if (newState.buildings.practice) {
      newState.buildings.practice.unlocked = true;
      newState.unlocks.practice = true;
      safeDispatchGameEvent('Разблокировано: Практика', 'success');
    }
  }
  
  // Проверяем, разблокирован ли генератор (11+ USDT)
  if (!newState.buildings.generator?.unlocked && 
      newState.resources.usdt?.unlocked && 
      (newState.resources.usdt?.value || 0) >= 11) {
    console.log('unlockManager: Разблокирован генератор (11+ USDT)');
    if (newState.buildings.generator) {
      newState.buildings.generator.unlocked = true;
      newState.unlocks.generator = true;
      safeDispatchGameEvent('Разблокировано: Генератор', 'success');
      safeDispatchGameEvent('Разблокировано: Исследования', 'success'); // Добавляем уведомление о разблокировке исследований
    }
  }
  
  // Проверяем, разблокированы ли Основы блокчейна и исследования
  if (!newState.upgrades.blockchainBasics?.unlocked && 
      newState.buildings.generator?.count > 0 && 
      newState.buildings.generator?.unlocked) {
    console.log('unlockManager: Разблокированы основы блокчейна (куплен генератор)');
    if (newState.upgrades.blockchainBasics) {
      newState.upgrades.blockchainBasics.unlocked = true;
      newState.unlocks.blockchainBasics = true;
      // Разблокируем исследования вместе с основами блокчейна
      newState.unlocks.research = true;
      safeDispatchGameEvent('Разблокировано: Основы блокчейна', 'success');
      safeDispatchGameEvent('Разблокировано: Исследования', 'success');
    }
  }
  
  // Проверяем, разблокирован ли Домашний компьютер (50+ электричества)
  if (!newState.buildings.homeComputer?.unlocked && 
      newState.resources.electricity?.unlocked && 
      (newState.resources.electricity?.value || 0) >= 50) {
    console.log('unlockManager: Разблокирован домашний компьютер (50+ электричества)');
    if (newState.buildings.homeComputer) {
      newState.buildings.homeComputer.unlocked = true;
      newState.unlocks.homeComputer = true;
      safeDispatchGameEvent('Разблокировано: Домашний компьютер', 'success');
    }
  }
  
  // Проверяем, разблокирован ли Интернет-канал
  if (!newState.buildings.internetChannel?.unlocked && 
      newState.buildings.homeComputer?.count > 0 && 
      newState.buildings.homeComputer?.unlocked) {
    console.log('unlockManager: Разблокирован интернет-канал (куплен домашний компьютер)');
    if (newState.buildings.internetChannel) {
      newState.buildings.internetChannel.unlocked = true;
      newState.unlocks.internetChannel = true;
      safeDispatchGameEvent('Разблокировано: Интернет-канал', 'success');
    }
  }
  
  // Проверяем, нужно ли активировать фазу 2
  if (!newState.unlocks.phase2 && (
      (newState.resources.usdt?.value || 0) >= 25 || 
      newState.resources.electricity?.unlocked)
  ) {
    console.log('unlockManager: Активирована фаза 2 (25+ USDT или разблокировано электричество)');
    newState.unlocks.phase2 = true;
    newState.phase = 2;
    safeDispatchGameEvent('Открыта фаза 2: Основы криптоэкономики', 'success');
  }
  
  return newState;
};

// Проверяет разблокировки ресурсов на основе требований
export const checkResourceUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Разблокировка электричества при наличии генератора
  if (!newState.resources.electricity?.unlocked && 
      newState.buildings.generator?.count > 0 && 
      newState.buildings.generator?.unlocked) {
    console.log('unlockManager: Разблокировано электричество (есть генератор)');
    if (newState.resources.electricity) {
      newState.resources.electricity.unlocked = true;
      newState.unlocks.electricity = true;
      safeDispatchGameEvent('Разблокирован ресурс: Электричество', 'success');
    } else {
      // Создаем ресурс электричество, если его нет
      newState.resources.electricity = {
        id: 'electricity',
        name: 'Электричество',
        description: 'Электроэнергия для питания устройств',
        type: 'resource',
        icon: 'zap',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 100,
        unlocked: true
      };
      newState.unlocks.electricity = true;
      safeDispatchGameEvent('Разблокирован ресурс: Электричество', 'success');
    }
  }
  
  // Разблокировка вычислительной мощности при наличии домашнего компьютера
  if (!newState.resources.computingPower?.unlocked && 
      newState.buildings.homeComputer?.count > 0 && 
      newState.buildings.homeComputer?.unlocked) {
    console.log('unlockManager: Разблокирована вычислительная мощность (есть домашний компьютер)');
    if (newState.resources.computingPower) {
      newState.resources.computingPower.unlocked = true;
      newState.unlocks.computingPower = true;
      safeDispatchGameEvent('Разблокирован ресурс: Вычислительная мощность', 'success');
    } else {
      // Создаем ресурс вычислительная мощность, если его нет
      newState.resources.computingPower = {
        id: 'computingPower',
        name: 'Вычислительная мощность',
        description: 'Вычислительная мощность для майнинга и анализа',
        type: 'resource',
        icon: 'cpu',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 1000,
        unlocked: true
      };
      newState.unlocks.computingPower = true;
      safeDispatchGameEvent('Разблокирован ресурс: Вычислительная мощность', 'success');
    }
  }
  
  return newState;
};

// Проверяет разблокировки зданий на основе требований
export const checkBuildingUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Разблокировка криптокошелька, если изучены основы блокчейна
  if (!newState.buildings.cryptoWallet?.unlocked &&
      (state.upgrades.blockchainBasics?.purchased ||
       state.upgrades.basicBlockchain?.purchased ||
       state.upgrades.blockchain_basics?.purchased)) {
    console.log('unlockManager: Разблокирован криптокошелек (изучены основы блокчейна)');
    if (newState.buildings.cryptoWallet) {
      newState.buildings.cryptoWallet.unlocked = true;
      newState.unlocks.cryptoWallet = true;
      safeDispatchGameEvent('Разблокировано: Криптокошелек', 'success');
    }
  }
  
  // ФАЗА 2 Разблокировки
  
  // Разблокировка майнера после исследования "Основы криптовалют"
  if (!newState.buildings.miner?.unlocked && 
      state.upgrades.cryptoCurrencyBasics?.purchased) {
    console.log('unlockManager: Разблокирован майнер (изучены основы криптовалют)');
    if (newState.buildings.miner) {
      newState.buildings.miner.unlocked = true;
      newState.unlocks.miner = true;
      safeDispatchGameEvent('Разблокировано: Майнер', 'success');
    }
  }
  
  // Разблокировка криптобиблиотеки после исследования "Основы криптовалют"
  if (!newState.buildings.cryptoLibrary?.unlocked && 
      state.upgrades.cryptoCurrencyBasics?.purchased) {
    console.log('unlockManager: Разблокирована криптобиблиотека (изучены основы криптовалют)');
    if (newState.buildings.cryptoLibrary) {
      newState.buildings.cryptoLibrary.unlocked = true;
      newState.unlocks.cryptoLibrary = true;
      safeDispatchGameEvent('Разблокировано: Криптобиблиотека', 'success');
    }
  }
  
  // Разблокировка системы охлаждения после покупки 2+ Домашних компьютеров
  if (!newState.buildings.coolingSystem?.unlocked && 
      state.buildings.homeComputer?.count >= 2) {
    console.log('unlockManager: Разблокирована система охлаждения (2+ домашних компьютера)');
    if (newState.buildings.coolingSystem) {
      newState.buildings.coolingSystem.unlocked = true;
      newState.unlocks.coolingSystem = true;
      safeDispatchGameEvent('Разблокировано: Система охлаждения', 'success');
    }
  }
  
  // Разблокировка улучшенного кошелька после покупки 5+ криптокошельков
  if (!newState.buildings.enhancedWallet?.unlocked && 
      state.buildings.cryptoWallet?.count >= 5) {
    console.log('unlockManager: Разблокирован улучшенный кошелек (5+ криптокошельков)');
    if (newState.buildings.enhancedWallet) {
      newState.buildings.enhancedWallet.unlocked = true;
      newState.unlocks.enhancedWallet = true;
      safeDispatchGameEvent('Разблокировано: Улучшенный кошелек', 'success');
    }
  }
  
  return newState;
};

// Проверяет разблокировки исследований на основе требований
export const checkUpgradeUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Разблокировка "Безопасность криптокошельков" после покупки криптокошелька
  if (!newState.upgrades.walletSecurity?.unlocked && 
      state.buildings.cryptoWallet?.count > 0) {
    console.log('unlockManager: Разблокирован исследование "Безопасность криптокошельков"');
    if (newState.upgrades.walletSecurity) {
      newState.upgrades.walletSecurity.unlocked = true;
      safeDispatchGameEvent('Разблокировано исследование: Безопасность криптокошельков', 'success');
    }
  }
  
  // ФАЗА 2 Разблокировки
  
  // Разблокировка "Основы криптовалют" после покупки 2+ криптокошельков
  if (!newState.upgrades.cryptoCurrencyBasics?.unlocked && 
      state.buildings.cryptoWallet?.count >= 2) {
    console.log('unlockManager: Разблокировано исследование "Основы криптовалют"');
    if (newState.upgrades.cryptoCurrencyBasics) {
      newState.upgrades.cryptoCurrencyBasics.unlocked = true;
      safeDispatchGameEvent('Разблокировано исследование: Основы криптовалют', 'success');
    }
  }
  
  // Разблокировка "Оптимизация алгоритмов" после покупки майнера
  if (!newState.upgrades.algorithmOptimization?.unlocked && 
      state.buildings.miner?.count > 0) {
    console.log('unlockManager: Разблокировано исследование "Оптимизация алгоритмов"');
    if (newState.upgrades.algorithmOptimization) {
      newState.upgrades.algorithmOptimization.unlocked = true;
      safeDispatchGameEvent('Разблокировано исследование: Оптимизация алгоритмов', 'success');
    }
  }
  
  // Разблокировка "Proof of Work" после покупки оптимизации алгоритмов
  if (!newState.upgrades.proofOfWork?.unlocked && 
      state.upgrades.algorithmOptimization?.purchased) {
    console.log('unlockManager: Разблокировано исследование "Proof of Work"');
    if (newState.upgrades.proofOfWork) {
      newState.upgrades.proofOfWork.unlocked = true;
      safeDispatchGameEvent('Разблокировано исследование: Proof of Work', 'success');
    }
  }
  
  // Разблокировка "Энергоэффективные компоненты" после покупки системы охлаждения
  if (!newState.upgrades.energyEfficientComponents?.unlocked && 
      state.buildings.coolingSystem?.count > 0) {
    console.log('unlockManager: Разблокировано исследование "Энергоэффективные компоненты"');
    if (newState.upgrades.energyEfficientComponents) {
      newState.upgrades.energyEfficientComponents.unlocked = true;
      safeDispatchGameEvent('Разблокировано исследование: Энергоэффективные компоненты', 'success');
    }
  }
  
  // Разблокировка "Криптовалютный трейдинг" после покупки улучшенного кошелька
  if (!newState.upgrades.cryptoTrading?.unlocked && 
      state.buildings.enhancedWallet?.count > 0) {
    console.log('unlockManager: Разблокировано исследование "Криптовалютный трейдинг"');
    if (newState.upgrades.cryptoTrading) {
      newState.upgrades.cryptoTrading.unlocked = true;
      safeDispatchGameEvent('Разблокировано исследование: Криптовалютный трейдинг', 'success');
    }
  }
  
  // Разблокировка "Торговый бот" после исследования криптовалютного трейдинга
  if (!newState.upgrades.tradingBot?.unlocked && 
      state.upgrades.cryptoTrading?.purchased) {
    console.log('unlockManager: Разблокировано исследование "Торговый бот"');
    if (newState.upgrades.tradingBot) {
      newState.upgrades.tradingBot.unlocked = true;
      safeDispatchGameEvent('Разблокировано исследование: Торговый бот', 'success');
    }
  }
  
  return newState;
};

// Проверяет разблокировки действий на основе требований
export const checkActionUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Разблокировка исследований (вкладка исследований) после 5 применений знаний ИЛИ при наличии генератора
  if (!newState.unlocks.research && 
      ((newState.counters.applyKnowledge?.value || 0) >= 5 || 
       newState.buildings.generator?.count > 0)) {
    console.log('unlockManager: Разблокирована вкладка исследований');
    newState.unlocks.research = true;
    safeDispatchGameEvent('Разблокировано: Исследования', 'success');
  }
  
  // Проверка других действий могут быть добавлены по мере необходимости
  
  return newState;
};
