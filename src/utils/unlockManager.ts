
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
    
    // Проверка разблокировки USDT (нужно 3+ кликов на "Изучить крипту")
    if (counters.knowledgeClicks) {
      const knowledgeClicks = typeof counters.knowledgeClicks === 'object' 
        ? counters.knowledgeClicks.value 
        : counters.knowledgeClicks;
        
      console.log(`unlockManager: Проверка разблокировки USDT, кликов: ${knowledgeClicks}`);
      
      if (knowledgeClicks >= 3) {
        if (!newUnlocks.usdt) {
          console.log('unlockManager: Разблокирован USDT');
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
    
    // Разблокировка электричества при наличии генератора
    if (unlocks.generator && !unlocks.electricity) {
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
    
    // Разблокировка "Генератор" (нужно 11+ USDT)
    if (resources.usdt && resources.usdt.unlocked && resources.usdt.value >= 11) {
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
    
    // Дополнительная проверка, чтобы избежать преждевременной разблокировки зданий
    // Проверяем, что все разблокированные здания действительно должны быть разблокированы
    
    // Открытие очередных зданий только на основе четких условий
    for (const buildingId in buildings) {
      const building = buildings[buildingId];
      
      // Для каждого здания проверяем конкретные условия разблокировки
      switch(buildingId) {
        case 'practice':
          // Проверяем только счетчик applyKnowledge
          if (!unlocks.practice) {
            building.unlocked = false;
          }
          break;
          
        case 'generator':
          // Строгая проверка наличия достаточного количества USDT
          if (!resources.usdt || !resources.usdt.unlocked || resources.usdt.value < 11) {
            building.unlocked = false;
            unlocks.generator = false;
          }
          break;
          
        case 'homeComputer':
          // Проверяем наличие достаточного количества электричества
          if (!resources.electricity || resources.electricity.value < 50) {
            building.unlocked = false;
            unlocks.homeComputer = false;
          }
          break;
          
        // Можно добавить другие здания по мере необходимости
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
      // Иначе разблокируем доступные исследования
      
      // Разблокировка "Основы блокчейна" (нужен генератор)
      if (state.buildings.generator && state.buildings.generator.count > 0) {
        if (upgrades.blockchainBasics && !upgrades.blockchainBasics.unlocked) {
          console.log('unlockManager: Разблокировано исследование Основы блокчейна');
          upgrades.blockchainBasics.unlocked = true;
          safeDispatchGameEvent('Разблокировано исследование: Основы блокчейна', 'success');
        }
      }
      
      // Другие исследования можно добавить здесь...
    }
    
    return {
      ...newState,
      upgrades
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
