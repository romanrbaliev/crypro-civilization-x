
import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Проверяет и применяет все разблокировки
 */
export const checkAllUnlocks = (state: GameState): GameState => {
  console.log('unlockManager: checkAllUnlocks запущен');
  
  try {
    // Проверяем специальные разблокировки на основе счетчиков и других условий
    let newState = checkSpecialUnlocks(state);
    
    // Проверяем разблокировки ресурсов
    newState = checkResourceUnlocks(newState);
    
    // Проверяем разблокировки зданий
    newState = checkBuildingUnlocks(newState);
    
    // Проверяем разблокировки исследований
    newState = checkUpgradeUnlocks(newState);
    
    // Проверяем разблокировки действий
    newState = checkActionUnlocks(newState);
    
    return newState;
  } catch (error) {
    console.error('unlockManager: Ошибка при проверке разблокировок', error);
    return state;
  }
};

/**
 * Проверяет специальные разблокировки на основе счетчиков и других условий
 */
export const checkSpecialUnlocks = (state: GameState): GameState => {
  console.log('unlockManager: checkSpecialUnlocks запущен');
  
  try {
    const newState = { ...state };
    const newUnlocks = { ...state.unlocks };
    const counters = state.counters;
    
    // Строгая проверка, что счетчики существуют
    if (!counters) {
      console.log('unlockManager: Счетчики отсутствуют в состоянии');
      return state;
    }
    
    // ИСПРАВЛЕНО: Проверка разблокировки USDT (нужно 1+ применений знаний)
    if (counters.applyKnowledge) {
      const applyCount = typeof counters.applyKnowledge === 'object' 
        ? counters.applyKnowledge.value 
        : counters.applyKnowledge;
        
      console.log(`unlockManager: Проверка разблокировки USDT, применений знаний: ${applyCount}`);
      
      if (applyCount >= 1) {
        if (!newUnlocks.usdt) {
          console.log('unlockManager: Разблокирован USDT - применено знаний');
          newUnlocks.usdt = true;
        }
      }
    }
    
    // Проверка разблокировки практики (нужно 2+ применений знаний)
    if (counters.applyKnowledge) {
      const applyKnowledgeCount = typeof counters.applyKnowledge === 'object' 
        ? counters.applyKnowledge.value 
        : counters.applyKnowledge;
        
      console.log(`unlockManager: Проверка разблокировки практики, применений: ${applyKnowledgeCount}`);
      
      if (applyKnowledgeCount >= 2) {
        if (!newUnlocks.practice) {
          console.log('unlockManager: Разблокирована практика');
          newUnlocks.practice = true;
        }
      }
    }
    
    // Проверка разблокировки исследований (нужно купить практику)
    if (newState.buildings.practice && newState.buildings.practice.count > 0) {
      if (!newUnlocks.research) {
        console.log('unlockManager: Разблокированы исследования');
        newUnlocks.research = true;
      }
    }
    
    return {
      ...newState,
      unlocks: newUnlocks
    };
  } catch (error) {
    console.error('unlockManager: Ошибка при проверке специальных разблокировок', error);
    return state;
  }
};

/**
 * Проверяет разблокировки ресурсов
 */
export const checkResourceUnlocks = (state: GameState): GameState => {
  console.log('unlockManager: checkResourceUnlocks запущен');
  
  try {
    const newState = { ...state };
    const resources = { ...state.resources };
    const unlocks = { ...state.unlocks };
    
    // Разблокировка электричества ТОЛЬКО при наличии построенного генератора
    // ВАЖНО: Проверяем, что счетчик генератора > 0, а не просто разблокирован
    if (state.buildings.generator && state.buildings.generator.count > 0 && !unlocks.electricity) {
      console.log('unlockManager: Разблокировано электричество');
      unlocks.electricity = true;
      
      if (!resources.electricity) {
        resources.electricity = {
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
      } else {
        resources.electricity = {
          ...resources.electricity,
          unlocked: true
        };
      }
      
      safeDispatchGameEvent('Разблокировано: Электричество', 'success');
    }
    
    return {
      ...newState,
      resources,
      unlocks
    };
  } catch (error) {
    console.error('unlockManager: Ошибка при проверке разблокировок ресурсов', error);
    return state;
  }
};

/**
 * Проверяет разблокировки зданий
 */
export const checkBuildingUnlocks = (state: GameState): GameState => {
  console.log('unlockManager: checkBuildingUnlocks запущен');
  
  try {
    const newState = { ...state };
    let buildings = { ...state.buildings };
    const unlocks = { ...state.unlocks };
    const resources = { ...state.resources };
    
    // Разблокировка "Практика" (нужно 2+ применения знаний)
    if (unlocks.practice && buildings.practice && !buildings.practice.unlocked) {
      console.log('unlockManager: Разблокировано здание Практика');
      buildings.practice.unlocked = true;
      safeDispatchGameEvent('Разблокировано: Практика', 'success');
    }
    
    // ИСПРАВЛЕНО: Разблокировка "Генератор" (нужно 11+ USDT)
    // После разблокировки генератор остается разблокированным навсегда
    if (resources.usdt && resources.usdt.unlocked) {
      const hasEnoughUsdt = resources.usdt.value >= 11;
      const isAlreadyUnlocked = buildings.generator?.count > 0;
      
      // Разблокируем, если достаточно USDT или если уже есть хотя бы один генератор
      if (hasEnoughUsdt || isAlreadyUnlocked) {
        if (!unlocks.generator) {
          console.log('unlockManager: Разблокирована возможность Генератор');
          unlocks.generator = true;
        }
        
        if (buildings.generator && !buildings.generator.unlocked) {
          console.log('unlockManager: Разблокировано здание Генератор');
          buildings.generator.unlocked = true;
          safeDispatchGameEvent('Разблокировано: Генератор', 'success');
        }
      }
    }
    
    // ДОБАВЛЕНО: Разблокировка криптокошелька после покупки Основ блокчейна
    if (state.upgrades.blockchainBasics?.purchased) {
      if (buildings.cryptoWallet && !buildings.cryptoWallet.unlocked) {
        console.log('unlockManager: Разблокировано здание Криптокошелек');
        buildings.cryptoWallet.unlocked = true;
        unlocks.cryptoWallet = true;
        safeDispatchGameEvent('Разблокировано: Криптокошелек', 'success');
      }
    }
    
    // Проверка разблокировки домашнего компьютера (50+ электричества)
    if (resources.electricity && resources.electricity.unlocked && resources.electricity.value >= 50) {
      if (!unlocks.homeComputer) {
        console.log('unlockManager: Разблокирована возможность Домашний компьютер');
        unlocks.homeComputer = true;
      }
      
      if (buildings.homeComputer && !buildings.homeComputer.unlocked) {
        console.log('unlockManager: Разблокировано здание Домашний компьютер');
        buildings.homeComputer.unlocked = true;
        safeDispatchGameEvent('Разблокировано: Домашний компьютер', 'success');
      }
    }
    
    // Разблокировка майнера после покупки "Основы криптовалют"
    if (state.upgrades.cryptoCurrencyBasics?.purchased) {
      if (buildings.miner && !buildings.miner.unlocked) {
        console.log('unlockManager: Разблокировано здание Майнер');
        buildings.miner.unlocked = true;
        unlocks.miner = true;
        safeDispatchGameEvent('Разблокировано: Майнер', 'success');
      }
    }
    
    return {
      ...newState,
      buildings,
      unlocks
    };
  } catch (error) {
    console.error('unlockManager: Ошибка при проверке разблокировок зданий', error);
    return state;
  }
};

/**
 * Проверяет разблокировки исследований
 */
export const checkUpgradeUnlocks = (state: GameState): GameState => {
  console.log('unlockManager: checkUpgradeUnlocks запущен');
  
  try {
    const newState = { ...state };
    const upgrades = { ...state.upgrades };
    const unlocks = { ...state.unlocks };
    
    // Проверка разблокировки исследований
    if (!unlocks.research) {
      // Если исследования не разблокированы, то все исследования должны быть заблокированы
      for (const upgradeId in upgrades) {
        if (upgrades[upgradeId]) {
          upgrades[upgradeId].unlocked = false;
        }
      }
    } else {
      // Разблокировка "Основы блокчейна" (нужен генератор с count > 0)
      if (state.buildings.generator && state.buildings.generator.count > 0) {
        if (upgrades.blockchainBasics && !upgrades.blockchainBasics.unlocked) {
          console.log('unlockManager: Разблокировано исследование Основы блокчейна');
          upgrades.blockchainBasics.unlocked = true;
          safeDispatchGameEvent('Разблокировано исследование: Основы блокчейна', 'success');
        }
      }
      
      // ДОБАВЛЕНО: Разблокировка "Основы криптовалют" после покупки Основ блокчейна
      if (state.upgrades.blockchainBasics?.purchased) {
        if (upgrades.cryptoCurrencyBasics && !upgrades.cryptoCurrencyBasics.unlocked) {
          console.log('unlockManager: Разблокировано исследование Основы криптовалют');
          upgrades.cryptoCurrencyBasics.unlocked = true;
          safeDispatchGameEvent('Разблокировано исследование: Основы криптовалют', 'success');
        }
      }
    }
    
    // Проверяем, нужно ли разблокировать исследования
    // Исследования разблокируются после покупки хотя бы одной практики
    if (state.buildings.practice && state.buildings.practice.count > 0 && !unlocks.research) {
      unlocks.research = true;
      safeDispatchGameEvent('Разблокированы исследования', 'success');
    }
    
    return {
      ...newState,
      upgrades,
      unlocks
    };
  } catch (error) {
    console.error('unlockManager: Ошибка при проверке разблокировок исследований', error);
    return state;
  }
};

/**
 * Проверяет разблокировки действий
 */
export const checkActionUnlocks = (state: GameState): GameState => {
  console.log('unlockManager: checkActionUnlocks запущен');
  
  try {
    const newState = { ...state };
    const unlocks = { ...state.unlocks };
    
    // Здесь можно добавить проверки для разблокировки различных действий
    // Например, для кнопок, специальных возможностей и т.д.
    
    return {
      ...newState,
      unlocks
    };
  } catch (error) {
    console.error('unlockManager: Ошибка при проверке разблокировок действий', error);
    return state;
  }
};

/**
 * Выполняет полную перепроверку всех разблокировок с нуля
 */
export const rebuildAllUnlocks = (state: GameState): GameState => {
  console.log('unlockManager: rebuildAllUnlocks запущен');
  
  // Создаем копию состояния
  const newState = { ...state };
  
  try {
    // Перестраиваем все разблокировки с нуля
    return checkAllUnlocks(newState);
  } catch (error) {
    console.error('unlockManager: Ошибка при полной перепроверке разблокировок', error);
    return state;
  }
};
