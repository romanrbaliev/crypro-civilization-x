
// Единая централизованная система управления разблокировками игровых элементов

import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

interface UnlockCondition {
  check: (state: GameState) => boolean;
  apply: (state: GameState) => GameState;
  message?: string;
  type?: "success" | "info";
}

// Объект, хранящий все условия разблокировки
const unlockConditions: Record<string, UnlockCondition> = {
  // === РЕСУРСЫ ===
  'usdt': {
    check: (state) => state.counters.applyKnowledge?.value >= 2,
    apply: (state) => ({
      ...state,
      resources: {
        ...state.resources,
        usdt: {
          ...state.resources.usdt,
          unlocked: true
        }
      },
      unlocks: {
        ...state.unlocks,
        usdt: true
      }
    }),
    message: "Открыт ресурс «USDT»",
    type: "success"
  },
  
  'electricity': {
    check: (state) => state.buildings.generator?.count > 0,
    apply: (state) => ({
      ...state,
      resources: {
        ...state.resources,
        electricity: {
          ...state.resources.electricity,
          unlocked: true,
          name: "Электричество"
        }
      },
      unlocks: {
        ...state.unlocks,
        electricity: true
      }
    }),
    message: "Открыт ресурс «Электричество»",
    type: "success"
  },
  
  'computingPower': {
    check: (state) => state.buildings.homeComputer?.count > 0,
    apply: (state) => ({
      ...state,
      resources: {
        ...state.resources,
        computingPower: {
          ...state.resources.computingPower,
          unlocked: true,
          name: "Вычислительная мощность"
        }
      },
      unlocks: {
        ...state.unlocks,
        computingPower: true
      }
    }),
    message: "Открыт ресурс «Вычислительная мощность»",
    type: "success"
  },
  
  'bitcoin': {
    check: (state) => state.buildings.autoMiner?.count > 0,
    apply: (state) => {
      // Делаем базовую настройку Bitcoin
      const newState = {
        ...state,
        resources: {
          ...state.resources,
          bitcoin: {
            ...state.resources.bitcoin,
            id: 'bitcoin',
            name: "Bitcoin",
            description: "Bitcoin - первая и основная криптовалюта",
            type: "currency",
            icon: "bitcoin",
            value: state.resources.bitcoin?.value || 0,
            baseProduction: 0,
            production: 0,
            perSecond: 0.00005 * state.buildings.autoMiner.count, // Устанавливаем сразу начальную скорость производства
            max: 0.01,
            unlocked: true
          }
        },
        unlocks: {
          ...state.unlocks,
          bitcoin: true
        }
      };
      
      // Установка дополнительных параметров для майнинга
      if (!newState.miningParams) {
        newState.miningParams = {
          miningEfficiency: 1,
          networkDifficulty: 1.0,
          energyEfficiency: 0,
          exchangeRate: 20000,
          exchangeCommission: 0.05,
          volatility: 0.2,
          exchangePeriod: 3600,
          baseConsumption: 1
        };
      }
      
      return newState;
    },
    message: "Открыт ресурс «Bitcoin»",
    type: "success"
  },
  
  // === ЗДАНИЯ ===
  'practice': {
    check: (state) => state.counters.applyKnowledge?.value >= 2,
    apply: (state) => ({
      ...state,
      unlocks: {
        ...state.unlocks,
        practice: true
      },
      buildings: {
        ...state.buildings,
        practice: {
          ...state.buildings.practice,
          unlocked: true
        }
      }
    }),
    message: "Открыта возможность приобрести «Практика»",
    type: "success"
  },
  
  'generator': {
    check: (state) => state.resources.usdt?.value >= 11 && state.resources.usdt?.unlocked,
    apply: (state) => ({
      ...state,
      buildings: {
        ...state.buildings,
        generator: {
          ...state.buildings.generator,
          unlocked: true
        }
      }
    }),
    message: "Открыта возможность приобрести «Генератор»",
    type: "success"
  },
  
  'homeComputer': {
    check: (state) => state.resources.electricity?.value >= 10 && state.resources.electricity?.unlocked,
    apply: (state) => ({
      ...state,
      buildings: {
        ...state.buildings,
        homeComputer: {
          ...state.buildings.homeComputer,
          unlocked: true
        }
      }
    }),
    message: "Открыта возможность приобрести «Домашний компьютер»",
    type: "success"
  },
  
  // Добавляем разблокировку Интернет-канала
  'internetConnection': {
    check: (state) => state.buildings.homeComputer?.count > 0,
    apply: (state) => ({
      ...state,
      buildings: {
        ...state.buildings,
        internetConnection: {
          ...state.buildings.internetConnection,
          unlocked: true
        }
      }
    }),
    message: "Открыта возможность приобрести «Интернет-канал»",
    type: "success"
  },
  
  'cryptoWallet': {
    check: (state) => isBlockchainBasicsUnlocked(state),
    apply: (state) => ({
      ...state,
      buildings: {
        ...state.buildings,
        cryptoWallet: {
          ...state.buildings.cryptoWallet,
          unlocked: true
        }
      }
    }),
    message: "Открыта возможность приобрести «Криптокошелек»",
    type: "success"
  },
  
  'autoMiner': {
    check: (state) => state.upgrades.cryptoCurrencyBasics?.purchased === true,
    apply: (state) => ({
      ...state,
      buildings: {
        ...state.buildings,
        autoMiner: {
          ...state.buildings.autoMiner,
          unlocked: true
        }
      }
    }),
    message: "Открыта возможность приобрести «Автомайнер»",
    type: "success"
  },
  
  // Изменено условие для улучшенного кошелька - теперь требуется безопасность кошельков
  'improvedWallet': {
    check: (state) => state.buildings.cryptoWallet?.count >= 1 && state.upgrades.walletSecurity?.purchased === true,
    apply: (state) => ({
      ...state,
      buildings: {
        ...state.buildings,
        improvedWallet: {
          ...state.buildings.improvedWallet,
          unlocked: true
        }
      }
    }),
    message: "Открыта возможность приобрести «Улучшенный кошелек»",
    type: "success"
  },
  
  // Добавляем разблокировку криптобиблиотеки
  'cryptoLibrary': {
    check: (state) => state.upgrades.cryptoCurrencyBasics?.purchased === true,
    apply: (state) => ({
      ...state,
      buildings: {
        ...state.buildings,
        cryptoLibrary: {
          ...state.buildings.cryptoLibrary,
          unlocked: true
        }
      }
    }),
    message: "Открыта возможность приобрести «Криптобиблиотека»",
    type: "success"
  },
  
  // === ИССЛЕДОВАНИЯ ===
  'researchTab': {
    check: (state) => state.buildings.generator?.count > 0,
    apply: (state) => ({
      ...state,
      unlocks: {
        ...state.unlocks,
        research: true
      }
    }),
    message: "Разблокирована вкладка исследований",
    type: "success"
  },
  
  'blockchainBasics': {
    check: (state) => state.buildings.generator?.count > 0,
    apply: (state) => {
      const upgrades = { ...state.upgrades };
      let updated = false;
      
      if (upgrades.blockchainBasics) {
        upgrades.blockchainBasics = {
          ...upgrades.blockchainBasics,
          unlocked: true
        };
        updated = true;
      }
      
      if (upgrades.blockchain_basics) {
        upgrades.blockchain_basics = {
          ...upgrades.blockchain_basics,
          unlocked: true
        };
        updated = true;
      }
      
      if (upgrades.basicBlockchain) {
        upgrades.basicBlockchain = {
          ...upgrades.basicBlockchain,
          unlocked: true
        };
        updated = true;
      }
      
      return {
        ...state,
        upgrades
      };
    },
    message: "Открыто исследование «Основы блокчейна»",
    type: "success"
  },
  
  'cryptoCurrencyBasics': {
    check: (state) => isBlockchainBasicsUnlocked(state),
    apply: (state) => ({
      ...state,
      upgrades: {
        ...state.upgrades,
        cryptoCurrencyBasics: {
          ...state.upgrades.cryptoCurrencyBasics,
          unlocked: true
        }
      }
    }),
    message: "Открыто исследование «Основы криптовалют»",
    type: "success"
  },
  
  'walletSecurity': {
    check: (state) => state.buildings.cryptoWallet?.count > 0,
    apply: (state) => ({
      ...state,
      upgrades: {
        ...state.upgrades,
        walletSecurity: {
          ...state.upgrades.walletSecurity,
          unlocked: true
        }
      }
    }),
    message: "Открыто исследование «Безопасность криптокошельков»",
    type: "success"
  },
  
  'cryptoTrading': {
    check: (state) => state.buildings.improvedWallet?.count > 0,
    apply: (state) => ({
      ...state,
      upgrades: {
        ...state.upgrades,
        cryptoTrading: {
          ...state.upgrades.cryptoTrading,
          unlocked: true
        }
      }
    }),
    message: "Открыто исследование «Криптовалютный трейдинг»",
    type: "success"
  },
  
  // Новая разблокировка для Оптимизации алгоритмов после покупки автомайнера
  'algorithmOptimization': {
    check: (state) => state.buildings.autoMiner?.count > 0,
    apply: (state) => ({
      ...state,
      upgrades: {
        ...state.upgrades,
        algorithmOptimization: {
          ...state.upgrades.algorithmOptimization,
          unlocked: true
        }
      }
    }),
    message: "Открыто исследование «Оптимизация алгоритмов»",
    type: "success"
  },
  
  // Разблокировка Proof of Work после покупки автомайнера
  'proofOfWork': {
    check: (state) => state.buildings.autoMiner?.count > 0,
    apply: (state) => ({
      ...state,
      upgrades: {
        ...state.upgrades,
        proofOfWork: {
          ...state.upgrades.proofOfWork,
          unlocked: true
        }
      }
    }),
    message: "Открыто исследование «Proof of Work»",
    type: "success"
  },
  
  // === ДЕЙСТВИЯ ===
  'applyKnowledge': {
    check: (state) => state.counters.knowledgeClicks?.value >= 3,
    apply: (state) => ({
      ...state,
      unlocks: {
        ...state.unlocks,
        applyKnowledge: true
      }
    }),
    message: "Открыто действие «Применить знания»",
    type: "success"
  },
  
  'miningPower': {
    check: (state) => state.resources.computingPower?.unlocked,
    apply: (state) => ({
      ...state,
      unlocks: {
        ...state.unlocks,
        miningPower: true
      }
    }),
    message: "Открыто действие «Майнинг»",
    type: "success"
  },
  
  'exchangeBitcoin': {
    check: (state) => state.resources.bitcoin?.unlocked,
    apply: (state) => ({
      ...state,
      unlocks: {
        ...state.unlocks,
        exchangeBitcoin: true
      }
    }),
    message: "Открыто действие «Обмен Bitcoin»",
    type: "success"
  }
};

// Вспомогательная функция для проверки разблокировки "Основы блокчейна"
function isBlockchainBasicsUnlocked(state: GameState) {
  return (
    (state.upgrades.blockchainBasics && state.upgrades.blockchainBasics.purchased) ||
    (state.upgrades.blockchain_basics && state.upgrades.blockchain_basics.purchased) ||
    (state.upgrades.basicBlockchain && state.upgrades.basicBlockchain.purchased)
  );
}

/**
 * Основная функция проверки и применения всех возможных разблокировок
 */
export function checkAllUnlocks(state: GameState): GameState {
  let newState = { ...state };
  let anyUnlockApplied = false;
  
  // Проходим по всем условиям разблокировок
  Object.entries(unlockConditions).forEach(([id, condition]) => {
    // Проверяем, что элемент существует в состоянии и не разблокирован
    const shouldCheck = checkShouldApplyUnlock(newState, id);
    
    if (shouldCheck && condition.check(newState)) {
      console.log(`🔓 Применяем разблокировку для ${id}`);
      newState = condition.apply(newState);
      
      // Отправляем сообщение о разблокировке
      if (condition.message) {
        safeDispatchGameEvent(condition.message, condition.type || "info");
      }
      
      anyUnlockApplied = true;
    }
  });
  
  // Если были разблокировки, выполняем рекурсивную проверку для обработки каскадных разблокировок
  if (anyUnlockApplied) {
    newState = checkAllUnlocks(newState);
  }
  
  // Принудительная проверка USDT (особый случай)
  if (newState.resources.usdt) {
    if (!newState.counters.applyKnowledge || newState.counters.applyKnowledge.value < 2) {
      // Если условие не выполнено - блокируем
      newState = {
        ...newState,
        resources: {
          ...newState.resources,
          usdt: {
            ...newState.resources.usdt,
            unlocked: false
          }
        },
        unlocks: {
          ...newState.unlocks,
          usdt: false
        }
      };
    }
  }
  
  return newState;
}

/**
 * Проверяет, нужно ли применять разблокировку для конкретного элемента
 */
function checkShouldApplyUnlock(state: GameState, id: string): boolean {
  // Проверка для ресурсов
  if (id === 'usdt') {
    return state.resources.usdt && !state.resources.usdt.unlocked;
  }
  if (id === 'electricity') {
    return state.resources.electricity && !state.resources.electricity.unlocked;
  }
  if (id === 'computingPower') {
    return state.resources.computingPower && !state.resources.computingPower.unlocked;
  }
  if (id === 'bitcoin') {
    return state.resources.bitcoin && !state.resources.bitcoin.unlocked;
  }
  
  // Проверка для зданий
  if (id === 'practice') {
    return state.buildings.practice && !state.buildings.practice.unlocked && !state.unlocks.practice;
  }
  if (id === 'generator') {
    return state.buildings.generator && !state.buildings.generator.unlocked;
  }
  if (id === 'homeComputer') {
    return state.buildings.homeComputer && !state.buildings.homeComputer.unlocked;
  }
  if (id === 'internetConnection') {
    return state.buildings.internetConnection && !state.buildings.internetConnection.unlocked;
  }
  if (id === 'cryptoWallet') {
    return state.buildings.cryptoWallet && !state.buildings.cryptoWallet.unlocked;
  }
  if (id === 'autoMiner') {
    return state.buildings.autoMiner && !state.buildings.autoMiner.unlocked;
  }
  if (id === 'improvedWallet') {
    return state.buildings.improvedWallet && !state.buildings.improvedWallet.unlocked;
  }
  if (id === 'cryptoLibrary') {
    return state.buildings.cryptoLibrary && !state.buildings.cryptoLibrary.unlocked;
  }
  
  // Проверка для исследований и вкладки исследований
  if (id === 'researchTab') {
    return !state.unlocks.research;
  }
  if (id === 'blockchainBasics') {
    return (
      (state.upgrades.blockchainBasics && !state.upgrades.blockchainBasics.unlocked) ||
      (state.upgrades.blockchain_basics && !state.upgrades.blockchain_basics.unlocked) ||
      (state.upgrades.basicBlockchain && !state.upgrades.basicBlockchain.unlocked)
    );
  }
  if (id === 'cryptoCurrencyBasics') {
    return state.upgrades.cryptoCurrencyBasics && !state.upgrades.cryptoCurrencyBasics.unlocked;
  }
  if (id === 'walletSecurity') {
    return state.upgrades.walletSecurity && !state.upgrades.walletSecurity.unlocked;
  }
  if (id === 'cryptoTrading') {
    return state.upgrades.cryptoTrading && !state.upgrades.cryptoTrading.unlocked;
  }
  if (id === 'algorithmOptimization') {
    return state.upgrades.algorithmOptimization && !state.upgrades.algorithmOptimization.unlocked;
  }
  if (id === 'proofOfWork') {
    return state.upgrades.proofOfWork && !state.upgrades.proofOfWork.unlocked;
  }
  
  // Проверка для действий
  if (id === 'applyKnowledge') {
    return !state.unlocks.applyKnowledge;
  }
  if (id === 'miningPower') {
    return !state.unlocks.miningPower;
  }
  if (id === 'exchangeBitcoin') {
    return !state.unlocks.exchangeBitcoin;
  }
  
  return false;
}

/**
 * Проверяет разблокировки для определенной категории элементов
 */
export function checkCategoryUnlocks(state: GameState, category: 'buildings' | 'resources' | 'upgrades' | 'actions'): GameState {
  let newState = { ...state };
  
  // Фильтруем только те условия, которые относятся к указанной категории
  const categoryConditions: [string, UnlockCondition][] = Object.entries(unlockConditions).filter(([id]) => {
    switch (category) {
      case 'buildings':
        return ['practice', 'generator', 'homeComputer', 'cryptoWallet', 'autoMiner', 'improvedWallet', 'internetConnection', 'cryptoLibrary'].includes(id);
      case 'resources':
        return ['usdt', 'electricity', 'computingPower', 'btc'].includes(id);
      case 'upgrades':
        return ['researchTab', 'blockchainBasics', 'cryptoCurrencyBasics', 'walletSecurity', 'cryptoTrading', 'algorithmOptimization', 'proofOfWork'].includes(id);
      case 'actions':
        return ['applyKnowledge', 'miningPower', 'exchangeBtc'].includes(id);
      default:
        return false;
    }
  });
  
  // Проверяем и применяем подходящие разблокировки
  categoryConditions.forEach(([id, condition]) => {
    const shouldCheck = checkShouldApplyUnlock(newState, id);
    
    if (shouldCheck && condition.check(newState)) {
      console.log(`🔓 Применяем категориальную разблокировку для ${id} (категория: ${category})`);
      newState = condition.apply(newState);
      
      if (condition.message) {
        safeDispatchGameEvent(condition.message, condition.type || "info");
      }
    }
  });
  
  return newState;
}

/**
 * Экспортируемые функции-обертки для совместимости с существующим кодом
 */
export function checkBuildingUnlocks(state: GameState): GameState {
  return checkCategoryUnlocks(state, 'buildings');
}

export function checkResourceUnlocks(state: GameState): GameState {
  return checkCategoryUnlocks(state, 'resources');
}

export function checkUpgradeUnlocks(state: GameState): GameState {
  return checkCategoryUnlocks(state, 'upgrades');
}

export function checkActionUnlocks(state: GameState): GameState {
  return checkCategoryUnlocks(state, 'actions');
}

/**
 * Проверка специальных условий разблокировки
 * (сохранено для совместимости с существующим кодом)
 */
export function checkSpecialUnlocks(state: GameState): GameState {
  // Теперь все проверки происходят через единую систему
  return checkAllUnlocks(state);
}
