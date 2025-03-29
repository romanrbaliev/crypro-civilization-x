
// Функции для проверки и обработки разблокировок возможностей в игре

import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { isBlockchainBasicsUnlocked } from './researchUtils';

// Проверяет все возможные разблокировки
export const checkAllUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Проверяем разблокировки ресурсов
  newState = checkResourceUnlocks(newState);
  
  // Проверяем разблокировки зданий
  newState = checkBuildingUnlocks(newState);
  
  // Проверяем разблокировки исследований
  newState = checkUpgradeUnlocks(newState);
  
  // Проверяем разблокировки действий
  newState = checkActionUnlocks(newState);
  
  // Проверяем специальные разблокировки на основе счетчиков
  newState = checkSpecialUnlocks(newState);
  
  // Финальная проверка статуса USDT после всех проверок разблокировок
  if (newState.resources.usdt) {
    // Проверяем условие для разблокировки USDT
    if (!newState.counters.applyKnowledge || newState.counters.applyKnowledge.value < 2) {
      // Если условие не выполнено, принудительно блокируем USDT
      newState.resources.usdt.unlocked = false;
      newState.unlocks.usdt = false;
    } else {
      // Если условие выполнено - разблокируем
      newState.resources.usdt.unlocked = true;
      newState.unlocks.usdt = true;
    }
  }
  
  return newState;
};

// Проверяет специальные разблокировки, зависящие от счетчиков и других условий
export const checkSpecialUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Проверяем разблокировку "Применить знания"
  if (!state.unlocks.applyKnowledge && 
      state.counters.knowledgeClicks && 
      state.counters.knowledgeClicks.value >= 3) {
    console.log("🔓 Разблокировано действие 'Применить знания'");
    newState = {
      ...newState,
      unlocks: {
        ...newState.unlocks,
        applyKnowledge: true
      }
    };
    safeDispatchGameEvent("Открыто действие «Применить знания»", "success");
  }
  
  // Проверяем разблокировку "Практика"
  if (!state.unlocks.practice && 
      state.counters.applyKnowledge && 
      state.counters.applyKnowledge.value >= 2) {
    console.log("🔓 Разблокировано здание 'Практика'");
    newState = {
      ...newState,
      unlocks: {
        ...newState.unlocks,
        practice: true
      },
      buildings: {
        ...newState.buildings,
        practice: {
          ...newState.buildings.practice,
          unlocked: true
        }
      }
    };
    safeDispatchGameEvent("Открыта возможность приобрести «Практика»", "success");
  }
  
  // Проверка для разблокировки ресурсов электричество и вычислительная мощность
  if (!state.unlocks.electricity && 
      state.buildings.generator && 
      state.buildings.generator.count > 0) {
    console.log("🔓 Разблокирован ресурс 'Электричество'");
    newState = {
      ...newState,
      unlocks: {
        ...newState.unlocks,
        electricity: true
      },
      resources: {
        ...newState.resources,
        electricity: {
          ...newState.resources.electricity,
          unlocked: true,
          name: "Электричество"
        }
      }
    };
    safeDispatchGameEvent("Открыт ресурс «Электричество»", "success");
  }
  
  if (!state.unlocks.computingPower && 
      state.buildings.homeComputer && 
      state.buildings.homeComputer.count > 0) {
    console.log("🔓 Разблокирован ресурс 'Вычислительная мощность'");
    newState = {
      ...newState,
      unlocks: {
        ...newState.unlocks,
        computingPower: true
      },
      resources: {
        ...newState.resources,
        computingPower: {
          ...newState.resources.computingPower,
          unlocked: true,
          name: "Вычислительная мощность"
        }
      }
    };
    safeDispatchGameEvent("Открыт ресурс «Вычислительная мощность»", "success");
  }
  
  // Проверка для разблокировки BTC (биткоин)
  if (!state.unlocks.btc && 
      state.buildings.autoMiner && 
      state.buildings.autoMiner.count > 0) {
    console.log("🔓 Разблокирован ресурс 'BTC'");
    newState = {
      ...newState,
      unlocks: {
        ...newState.unlocks,
        btc: true
      },
      resources: {
        ...newState.resources,
        btc: {
          ...newState.resources.btc,
          unlocked: true,
          name: "BTC"
        }
      }
    };
    safeDispatchGameEvent("Открыт ресурс «BTC»", "success");
  }
  
  // Проверка для разблокировки улучшения "Криптовалютный трейдинг"
  if (state.upgrades && state.upgrades.cryptoTrading && !state.upgrades.cryptoTrading.unlocked && 
      state.buildings.improvedWallet && 
      state.buildings.improvedWallet.count > 0) {
    console.log("🔓 Разблокировано исследование 'Криптовалютный трейдинг'");
    newState = {
      ...newState,
      upgrades: {
        ...newState.upgrades,
        cryptoTrading: {
          ...newState.upgrades.cryptoTrading,
          unlocked: true
        }
      }
    };
    safeDispatchGameEvent("Открыто исследование «Криптовалютный трейдинг»", "success");
  }
  
  return newState;
};

// Проверяет разблокировки ресурсов на основе требований
export const checkResourceUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  // USDT разблокируется СТРОГО только после 2-х применений знаний
  if (state.resources.usdt && !state.resources.usdt.unlocked && 
      state.counters.applyKnowledge && state.counters.applyKnowledge.value >= 2) {
    console.log("🔓 Разблокирован ресурс 'USDT', счетчик применений знаний:", state.counters.applyKnowledge.value);
    newState = {
      ...newState,
      resources: {
        ...newState.resources,
        usdt: {
          ...newState.resources.usdt,
          unlocked: true
        }
      },
      unlocks: {
        ...newState.unlocks,
        usdt: true // Добавляем также флаг разблокировки в общие unlocks
      }
    };
    safeDispatchGameEvent("Открыт ресурс «USDT»", "success");
  } else if (state.resources.usdt && state.resources.usdt.unlocked &&
      (!state.counters.applyKnowledge || state.counters.applyKnowledge.value < 2)) {
    // Если USDT разблокирован, но условие не выполнено - блокируем
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
    console.log("🔒 Заблокирован ресурс 'USDT', не выполнено условие разблокировки");
  }
  
  return newState;
};

// Проверяет разблокировки зданий на основе требований
export const checkBuildingUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Генератор появляется при достижении 11 USDT
  if (state.buildings.generator && !state.buildings.generator.unlocked && 
      state.resources.usdt && state.resources.usdt.unlocked &&
      state.resources.usdt.value >= 11) {
    console.log("🔓 Разблокировано здание 'Генератор'");
    newState = {
      ...newState,
      buildings: {
        ...newState.buildings,
        generator: {
          ...newState.buildings.generator,
          unlocked: true
        }
      }
    };
    safeDispatchGameEvent("Открыта возможность приобрести «Генератор»", "success");
  }
  
  // Домашний компьютер появляется при наличии 10 единиц электричества
  if (state.buildings.homeComputer && !state.buildings.homeComputer.unlocked && 
      state.resources.electricity && state.resources.electricity.unlocked &&
      state.resources.electricity.value >= 10) {
    console.log("🔓 Разблокировано здание 'Домашний компьютер'");
    newState = {
      ...newState,
      buildings: {
        ...newState.buildings,
        homeComputer: {
          ...newState.buildings.homeComputer,
          unlocked: true
        }
      }
    };
    safeDispatchGameEvent("Открыта возможность приобрести «Домашний компьютер»", "success");
  }
  
  // Криптокошелек разблокируется после изучения основ блокчейна
  if (state.buildings.cryptoWallet && !state.buildings.cryptoWallet.unlocked && 
      isBlockchainBasicsUnlocked(state)) {
    console.log("🔓 Разблокировано здание 'Криптокошелек' (центральная система)");
    newState = {
      ...newState,
      buildings: {
        ...newState.buildings,
        cryptoWallet: {
          ...newState.buildings.cryptoWallet,
          unlocked: true
        }
      }
    };
    safeDispatchGameEvent("Открыта возможность приобрести «Криптокошелек»", "success");
  }
  
  // Улучшенный кошелек появляется при наличии 10 обычных кошельков
  if (state.buildings.improvedWallet && !state.buildings.improvedWallet.unlocked && 
      state.buildings.cryptoWallet && 
      state.buildings.cryptoWallet.count >= 10) {
    console.log("🔓 Разблокировано здание 'Улучшенный кошелек'");
    newState = {
      ...newState,
      buildings: {
        ...newState.buildings,
        improvedWallet: {
          ...newState.buildings.improvedWallet,
          unlocked: true
        }
      }
    };
    safeDispatchGameEvent("Открыта возможность приобрести «Улучшенный кошелек»", "success");
  }
  
  return newState;
};

// Проверяет разблокировки исследований на основе требований
export const checkUpgradeUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Проверяем, что state.upgrades существует
  if (!state.upgrades) {
    console.warn("❌ Объект upgrades не найден в состоянии");
    return state;
  }
  
  // Основы блокчейна разблокируются после покупки генератора
  if (state.upgrades.blockchainBasics && !state.upgrades.blockchainBasics.unlocked && 
      state.buildings.generator && 
      state.buildings.generator.count > 0) {
    console.log("🔓 Разблокировано исследование 'Основы блокчейна' (blockchainBasics)");
    newState = {
      ...newState,
      upgrades: {
        ...newState.upgrades,
        blockchainBasics: {
          ...newState.upgrades.blockchainBasics,
          unlocked: true
        }
      },
      unlocks: {
        ...newState.unlocks,
        research: true // Разблокируем вкладку исследований
      }
    };
    safeDispatchGameEvent("Открыто исследование «Основы блокчейна»", "success");
  }
  
  // Альтернативный ID для основ блокчейна
  if (state.upgrades.blockchain_basics && !state.upgrades.blockchain_basics.unlocked && 
      state.buildings.generator && 
      state.buildings.generator.count > 0) {
    console.log("🔓 Разблокировано исследование 'Основы блокчейна' (blockchain_basics)");
    newState = {
      ...newState,
      upgrades: {
        ...newState.upgrades,
        blockchain_basics: {
          ...newState.upgrades.blockchain_basics,
          unlocked: true
        }
      },
      unlocks: {
        ...newState.unlocks,
        research: true // Разблокируем вкладку исследований
      }
    };
    safeDispatchGameEvent("Открыто исследование «Основы блокчейна»", "success");
  }
  
  // Ещё один альтернативный ID для основ блокчейна
  if (state.upgrades.basicBlockchain && !state.upgrades.basicBlockchain.unlocked && 
      state.buildings.generator && 
      state.buildings.generator.count > 0) {
    console.log("🔓 Разблокировано исследование 'Основы блокчейна' (basicBlockchain)");
    newState = {
      ...newState,
      upgrades: {
        ...newState.upgrades,
        basicBlockchain: {
          ...newState.upgrades.basicBlockchain,
          unlocked: true
        }
      },
      unlocks: {
        ...newState.unlocks,
        research: true // Разблокируем вкладку исследований
      }
    };
    safeDispatchGameEvent("Открыто исследование «Основы блокчейна»", "success");
  }
  
  // Основы криптовалют разблокируются после изучения основ блокчейна
  if (state.upgrades.cryptoCurrencyBasics && !state.upgrades.cryptoCurrencyBasics.unlocked && 
      isBlockchainBasicsUnlocked(state)) {
    console.log("🔓 Разблокировано исследование 'Основы криптовалют' после покупки основ блокчейна");
    newState = {
      ...newState,
      upgrades: {
        ...newState.upgrades,
        cryptoCurrencyBasics: {
          ...newState.upgrades.cryptoCurrencyBasics,
          unlocked: true
        }
      }
    };
    safeDispatchGameEvent("Открыто исследование «Основы криптовалют»", "success");
  }
  
  // Безопасность криптокошельков разблокируется после покупки криптокошелька
  if (state.upgrades.walletSecurity && !state.upgrades.walletSecurity.unlocked && 
      state.buildings.cryptoWallet && 
      state.buildings.cryptoWallet.count > 0) {
    console.log("🔓 Разблокировано исследование 'Безопасность криптокошельков'");
    newState = {
      ...newState,
      upgrades: {
        ...newState.upgrades,
        walletSecurity: {
          ...newState.upgrades.walletSecurity,
          unlocked: true
        }
      }
    };
    safeDispatchGameEvent("Открыто исследование «Безопасность криптокошельков»", "success");
  }
  
  return newState;
};

// Проверяет разблокировки действий на основе требований
export const checkActionUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Майнинг мощности разблокируется при наличии вычислительной мощности
  if (!state.unlocks.miningPower && 
      state.resources.computingPower && 
      state.resources.computingPower.unlocked) {
    console.log("🔓 Разблокировано действие 'Майнинг мощности'");
    newState = {
      ...newState,
      unlocks: {
        ...newState.unlocks,
        miningPower: true
      }
    };
    safeDispatchGameEvent("Открыто действие «Майнинг»", "success");
  }
  
  // Обмен BTC разблокируется при наличии BTC
  if (!state.unlocks.exchangeBtc && 
      state.resources.btc && 
      state.resources.btc.unlocked) {
    console.log("🔓 Разблокировано действие 'Обмен BTC'");
    newState = {
      ...newState,
      unlocks: {
        ...newState.unlocks,
        exchangeBtc: true
      }
    };
    safeDispatchGameEvent("Открыто действие «Обмен BTC»", "success");
  }
  
  return newState;
};
