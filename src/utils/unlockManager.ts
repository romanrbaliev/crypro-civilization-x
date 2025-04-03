import { GameState, Building, Upgrade } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

// Основная функция для проверки всех разблокировок
export const checkAllUnlocks = (state: GameState): GameState => {
  console.log('unlockManager: Проверка всех разблокировок');
  
  // Последовательно проверяем различные типы разблокировок
  state = checkResourceUnlocks(state);
  state = checkBuildingUnlocks(state);
  state = checkUpgradeUnlocks(state);
  state = checkActionUnlocks(state);
  state = checkSpecialUnlocks(state);
  
  return state;
};

// Функция для полного пересоздания всех разблокировок с нуля
export const rebuildAllUnlocks = (state: GameState): GameState => {
  console.log('unlockManager: Полное восстановление всех разблокировок');
  
  // Сбрасываем все разблокировки и пересоздаем их на основе текущего состояния
  const newUnlocks: Record<string, boolean> = {
    knowledge: true, // Знания всегда разблокированы
  };
  
  // Проверяем условия разблокировок для всех объектов
  for (const [key, building] of Object.entries(state.buildings)) {
    if (building.unlocked) {
      newUnlocks[key] = true;
    }
  }
  
  for (const [key, upgrade] of Object.entries(state.upgrades)) {
    if (upgrade.unlocked || upgrade.purchased) {
      newUnlocks[key] = true;
    }
  }
  
  // Восстанавливаем состояния для ключевых объектов
  // USDT разблокирован после первого применения знаний
  if (state.counters.applyKnowledge?.value >= 1) {
    newUnlocks.usdt = true;
    if (state.resources.usdt) {
      state.resources.usdt.unlocked = true;
    }
  }
  
  // Практика разблокирована после 2 применений знаний
  if (state.counters.applyKnowledge?.value >= 2) {
    newUnlocks.practice = true;
    if (state.buildings.practice) {
      state.buildings.practice.unlocked = true;
    }
  }
  
  // Генератор разблокирован при 11+ USDT
  if (state.resources.usdt?.value >= 11) {
    newUnlocks.generator = true;
    if (state.buildings.generator) {
      state.buildings.generator.unlocked = true;
    }
  }
  
  // Исследования доступны после покупки генератора
  if (state.buildings.generator?.count > 0) {
    newUnlocks.research = true;
  }
  
  // Домашний компьютер разблокируется при 50+ электричества
  if (state.resources.electricity?.value >= 50) {
    newUnlocks.homeComputer = true;
    if (state.buildings.homeComputer) {
      state.buildings.homeComputer.unlocked = true;
    }
  }
  
  // Криптобиблиотека разблокируется после покупки "Основы криптовалют"
  const hasCryptoBasics = 
    state.upgrades.cryptoCurrencyBasics?.purchased || 
    state.upgrades.cryptoBasics?.purchased;
    
  if (hasCryptoBasics) {
    newUnlocks.cryptoLibrary = true;
    
    // НОВОЕ: Создаем здание, если оно не существует
    if (!state.buildings.cryptoLibrary) {
      state.buildings.cryptoLibrary = {
        id: "cryptoLibrary",
        name: "Криптобиблиотека",
        description: "Увеличивает скорость получения знаний на 50% и максимальное количество знаний на 100",
        cost: {
          usdt: 200,
          knowledge: 200
        },
        costMultiplier: 1.15,
        count: 0,
        unlocked: true
      };
      
      console.log('unlockManager: СОЗДАНА новая криптобиблиотека');
    } else {
      state.buildings.cryptoLibrary.unlocked = true;
    }
  }
  
  // Система охлаждения разблокируется после 2+ уровней домашнего компьютера
  if (state.buildings.homeComputer?.count >= 2) {
    newUnlocks.coolingSystem = true;
    
    // НОВОЕ: Создаем здание, если оно не существует
    if (!state.buildings.coolingSystem) {
      state.buildings.coolingSystem = {
        id: "coolingSystem",
        name: "Система охлаждения",
        description: "Уменьшает потребление вычислительной мощности всеми устройствами на 20%",
        cost: {
          usdt: 200,
          electricity: 50
        },
        costMultiplier: 1.15,
        count: 0,
        unlocked: true
      };
      
      console.log('unlockManager: СОЗДАНА новая система охлаждения');
    } else {
      state.buildings.coolingSystem.unlocked = true;
    }
  }
  
  // Улучшенный кошелек разблокируется после 5+ уровней криптокошелька
  if (state.buildings.cryptoWallet?.count >= 5) {
    newUnlocks.enhancedWallet = true;
    newUnlocks.improvedWallet = true; // Альтернативное название
    
    // НОВОЕ: Создаем один из вариантов улучшенного кошелька, если ни одного нет
    if (!state.buildings.enhancedWallet && !state.buildings.improvedWallet) {
      state.buildings.enhancedWallet = {
        id: "enhancedWallet",
        name: "Улучшенный кошелек",
        description: "Увеличивает максимальное хранение USDT на 150, Bitcoin на 1, эффективность конвертации BTC на 8%",
        cost: {
          usdt: 300,
          knowledge: 250
        },
        costMultiplier: 1.15,
        count: 0,
        unlocked: true
      };
      
      console.log('unlockManager: СОЗДАН новый улучшенный кошелек (enhancedWallet)');
    } else {
      // Разблокируем существующие варианты
      if (state.buildings.enhancedWallet) {
        state.buildings.enhancedWallet.unlocked = true;
      }
      
      if (state.buildings.improvedWallet) {
        state.buildings.improvedWallet.unlocked = true;
      }
    }
  }
  
  // Обновляем общие разблокировки
  state = {
    ...state,
    unlocks: newUnlocks
  };
  
  return state;
};

// Проверка разблокировок ресурсов
export const checkResourceUnlocks = (state: GameState): GameState => {
  console.log('unlockManager: Проверка разблокировок ресурсов');
  
  // USDT разблокируется после 1+ применения знаний
  if (state.counters.applyKnowledge?.value >= 1 && state.resources.usdt && !state.resources.usdt.unlocked) {
    state = {
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
    };
  }
  
  return state;
};

// Проверка разблокировок зданий
export const checkBuildingUnlocks = (state: GameState): GameState => {
  console.log('unlockManager: Проверка разблокировок зданий');
  const buildingUpdates: Record<string, Partial<Building>> = {};
  const unlockUpdates: Record<string, boolean> = {};
  
  // Практика разблокируется после 2+ применений знаний
  if (state.counters.applyKnowledge?.value >= 2 && state.buildings.practice) {
    if (!state.buildings.practice.unlocked) {
      console.log('unlockManager: Разблокировка Практики');
      buildingUpdates.practice = { unlocked: true };
      unlockUpdates.practice = true;
    }
  }
  
  // Генератор разблокируется при 11+ USDT
  if (state.resources.usdt?.value >= 11 && state.buildings.generator) {
    if (!state.buildings.generator.unlocked) {
      console.log('unlockManager: Разблокировка Генератора');
      buildingUpdates.generator = { unlocked: true };
      unlockUpdates.generator = true;
    }
  }
  
  // Домашний компьютер разблокируется при 50+ электричества
  if (state.resources.electricity?.value >= 50 && state.resources.electricity?.unlocked && state.buildings.homeComputer) {
    if (!state.buildings.homeComputer.unlocked) {
      console.log('unlockManager: Разблокировка Домашнего компьютера');
      buildingUpdates.homeComputer = { unlocked: true };
      unlockUpdates.homeComputer = true;
    }
  }
  
  // Криптобиблиотека разблокируется после покупки "Основы криптовалют"
  const hasCryptoBasics = 
    state.upgrades.cryptoCurrencyBasics?.purchased || 
    state.upgrades.cryptoBasics?.purchased;
    
  if (hasCryptoBasics) {
    // НОВОЕ: Проверяем существование и создаем при необходимости
    if (!state.buildings.cryptoLibrary) {
      console.log('unlockManager: Создание и разблокировка Криптобиблиотеки');
      
      // Создаем новое здание
      state = {
        ...state,
        buildings: {
          ...state.buildings,
          cryptoLibrary: {
            id: "cryptoLibrary",
            name: "Криптобиблиотека",
            description: "Увеличивает скорость получения знаний на 50% и максимальное количество знаний на 100",
            cost: {
              usdt: 200,
              knowledge: 200
            },
            costMultiplier: 1.15,
            count: 0,
            unlocked: true
          }
        },
        unlocks: {
          ...state.unlocks,
          cryptoLibrary: true
        }
      };
    }
    else if (!state.buildings.cryptoLibrary.unlocked) {
      console.log('unlockManager: Разблокировка существующей Криптобиблиотеки');
      buildingUpdates.cryptoLibrary = { unlocked: true };
      unlockUpdates.cryptoLibrary = true;
    }
  }
  
  // Система охлаждения разблокируется после 2+ уровней домашнего компьютера
  if (state.buildings.homeComputer?.count >= 2) {
    // НОВОЕ: Проверяем существование и создаем при необходимости
    if (!state.buildings.coolingSystem) {
      console.log('unlockManager: Создание и разблокировка Системы охлаждения');
      
      // Создаем новое здание
      state = {
        ...state,
        buildings: {
          ...state.buildings,
          coolingSystem: {
            id: "coolingSystem",
            name: "Система охлаждения",
            description: "Уменьшает потребление вычислительной мощности всеми устройствами на 20%",
            cost: {
              usdt: 200,
              electricity: 50
            },
            costMultiplier: 1.15,
            count: 0,
            unlocked: true
          }
        },
        unlocks: {
          ...state.unlocks,
          coolingSystem: true
        }
      };
    }
    else if (!state.buildings.coolingSystem.unlocked) {
      console.log('unlockManager: Разблокировка существующей Системы охлаждения');
      buildingUpdates.coolingSystem = { unlocked: true };
      unlockUpdates.coolingSystem = true;
    }
  }
  
  // Улучшенный кошелек разблокируется после 5+ уровней криптокошелька
  if (state.buildings.cryptoWallet?.count >= 5) {
    // НОВОЕ: Проверяем наличие любого варианта улучшенного кошелька
    if (!state.buildings.enhancedWallet && !state.buildings.improvedWallet) {
      console.log('unlockManager: Создание и разблокировка Улучшенного кошелька');
      
      // Создаем новое здание
      state = {
        ...state,
        buildings: {
          ...state.buildings,
          enhancedWallet: {
            id: "enhancedWallet",
            name: "Улучшенный кошелек",
            description: "Увеличивает максимальное хранение USDT на 150, Bitcoin на 1, эффективность конвертации BTC на 8%",
            cost: {
              usdt: 300,
              knowledge: 250
            },
            costMultiplier: 1.15,
            count: 0,
            unlocked: true
          }
        },
        unlocks: {
          ...state.unlocks,
          enhancedWallet: true
        }
      };
    }
    else {
      // Разблокируем существующие варианты
      if (state.buildings.enhancedWallet && !state.buildings.enhancedWallet.unlocked) {
        console.log('unlockManager: Разблокировка существующего Улучшенного кошелька (enhancedWallet)');
        buildingUpdates.enhancedWallet = { unlocked: true };
        unlockUpdates.enhancedWallet = true;
      }
      
      if (state.buildings.improvedWallet && !state.buildings.improvedWallet.unlocked) {
        console.log('unlockManager: Разблокировка существующего Улучшенного кошелька (improvedWallet)');
        buildingUpdates.improvedWallet = { unlocked: true };
        unlockUpdates.improvedWallet = true;
      }
    }
  }
  
  // Применяем обновления зданий, только если они есть
  if (Object.keys(buildingUpdates).length > 0) {
    const updatedBuildings = { ...state.buildings };
    
    for (const [buildingId, updates] of Object.entries(buildingUpdates)) {
      updatedBuildings[buildingId] = {
        ...updatedBuildings[buildingId],
        ...updates
      };
    }
    
    state = {
      ...state,
      buildings: updatedBuildings,
      unlocks: {
        ...state.unlocks,
        ...unlockUpdates
      }
    };
  }
  
  return state;
};

// Проверка разблокировок исследований
export const checkUpgradeUnlocks = (state: GameState): GameState => {
  console.log('unlockManager: Проверка разблокировок исследований');
  const upgradeUpdates: Record<string, Partial<Upgrade>> = {};
  const unlockUpdates: Record<string, boolean> = {};
  
  // Основы блокчейна разблокируются после покупки генератора
  if (state.buildings.generator?.count > 0 && state.upgrades.blockchainBasics && !state.upgrades.blockchainBasics.unlocked) {
    console.log('unlockManager: Разблокировка Основы блокчейна');
    upgradeUpdates.blockchainBasics = { unlocked: true };
    unlockUpdates.blockchainBasics = true;
  }
  
  // Применяем обновления исследований, только если они есть
  if (Object.keys(upgradeUpdates).length > 0) {
    const updatedUpgrades = { ...state.upgrades };
    
    for (const [upgradeId, updates] of Object.entries(upgradeUpdates)) {
      updatedUpgrades[upgradeId] = {
        ...updatedUpgrades[upgradeId],
        ...updates
      };
    }
    
    state = {
      ...state,
      upgrades: updatedUpgrades,
      unlocks: {
        ...state.unlocks,
        ...unlockUpdates
      }
    };
  }
  
  return state;
};

// Проверка разблокировок действий
export const checkActionUnlocks = (state: GameState): GameState => {
  console.log('unlockManager: Проверка разблокировок действий');
  const unlockUpdates: Record<string, boolean> = {};
  
  // Возможность "применить знания" доступна после 3+ кликов на знания
  if (state.counters.knowledgeClicks?.value >= 3 && !state.unlocks.applyKnowledge) {
    console.log('unlockManager: Разблокировка "Применить знания"');
    unlockUpdates.applyKnowledge = true;
  }
  
  // Применяем обновления разблокировок действий, только если они есть
  if (Object.keys(unlockUpdates).length > 0) {
    state = {
      ...state,
      unlocks: {
        ...state.unlocks,
        ...unlockUpdates
      }
    };
  }
  
  return state;
};

// Проверка специальных разблокировок
export const checkSpecialUnlocks = (state: GameState): GameState => {
  console.log('unlockManager: Проверка специальных разблокировок');
  
  // Знания всегда разблокированы
  if (!state.unlocks.knowledge) {
    state = {
      ...state,
      unlocks: {
        ...state.unlocks,
        knowledge: true
      }
    };
  }
  
  // Счетчики для отслеживания прогресса
  
  // Счетчик кликов по знаниям (для разблокировки "применить знания")
  if (state.resources.knowledge && state.resources.knowledge.value > 0) {
    if (!state.counters.knowledgeClicks) {
      console.log('unlockManager: Создание счетчика кликов по знаниям');
      state = {
        ...state,
        counters: {
          ...state.counters,
          knowledgeClicks: { id: 'knowledgeClicks', name: 'Клики по знаниям', value: 1 }
        }
      };
    }
    
    // Проверяем, можно ли разблокировать "применить знания"
    if (state.counters.knowledgeClicks?.value >= 3 && !state.unlocks.applyKnowledge) {
      console.log('unlockManager: Разблокировка "Применить знания"');
      state = {
        ...state,
        unlocks: {
          ...state.unlocks,
          applyKnowledge: true
        }
      };
    }
  }
  
  // Коррекция разблокировки исследований
  if (state.buildings.generator?.count > 0 && !state.unlocks.research) {
    console.log('unlockManager: Разблокировка исследований');
    
    state = {
      ...state,
      unlocks: {
        ...state.unlocks,
        research: true
      }
    };
  }
  
  return state;
};
