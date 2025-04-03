
import { GameState, Building, Upgrade } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

// Полная проверка всех разблокировок
export const checkAllUnlocks = (state: GameState): GameState => {
  console.log('unlockManager: Проверка всех разблокировок');
  
  // По очереди проверяем все типы разблокировок
  let newState = state;
  newState = checkResourceUnlocks(newState);
  newState = checkBuildingUnlocks(newState);
  newState = checkUpgradeUnlocks(newState);
  newState = checkActionUnlocks(newState);
  newState = checkSpecialUnlocks(newState);
  
  return newState;
};

// Полное восстановление всех разблокировок (при загрузке или сомнительном состоянии)
export const rebuildAllUnlocks = (state: GameState): GameState => {
  console.log('unlockManager: Полное восстановление всех разблокировок');
  
  // Сбрасываем все разблокировки и пересоздаем их на основе текущего состояния
  const newUnlocks: Record<string, boolean> = {
    knowledge: true, // Знания всегда разблокированы
  };
  
  // Восстанавливаем основные разблокировки на основе состояния ресурсов
  Object.keys(state.resources).forEach(resourceId => {
    if (state.resources[resourceId] && state.resources[resourceId].unlocked) {
      newUnlocks[resourceId] = true;
    }
  });
  
  // Восстанавливаем разблокировки действий на основе счетчиков
  if (state.counters.knowledgeClicks?.value >= 3) {
    newUnlocks.applyKnowledge = true;
  }
  
  // Разблокировки валют
  if (state.resources.usdt?.unlocked || state.counters.applyKnowledge?.value >= 2) {
    newUnlocks.usdt = true;
  }
  
  // Разблокировки зданий
  if (state.counters.applyKnowledge?.value >= 2) {
    newUnlocks.practice = true;
  }
  
  // Генератор разблокируется при наличии 11+ USDT
  if (state.resources.usdt?.value >= 11) {
    newUnlocks.generator = true;
    newUnlocks.research = true; // Исследования разблокируются вместе с генератором
  }
  
  // Проверяем домашний компьютер (зависит от электричества)
  if (state.resources.electricity?.value >= 50 || state.buildings.homeComputer?.count > 0) {
    newUnlocks.homeComputer = true;
  }
  
  // Проверяем разблокировки, зависящие от исследований
  // Криптобиблиотека зависит от "Основы криптовалют"
  const hasCryptoBasics = state.upgrades.cryptoCurrencyBasics?.purchased || 
                          state.upgrades.cryptoBasics?.purchased;
                          
  if (hasCryptoBasics) {
    newUnlocks.cryptoLibrary = true;
    
    // Если у нас нет криптобиблиотеки в зданиях, создаем ее
    if (!state.buildings.cryptoLibrary) {
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
            unlocked: true,
            production: {},
            productionBoost: {}
          }
        }
      };
      
      safeDispatchGameEvent("Разблокирована криптобиблиотека", "success");
    }
  }
  
  // Система охлаждения зависит от наличия 2+ домашних компьютеров
  if (state.buildings.homeComputer?.count >= 2) {
    newUnlocks.coolingSystem = true;
    
    // Если у нас нет системы охлаждения в зданиях, создаем ее
    if (!state.buildings.coolingSystem) {
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
            unlocked: true,
            production: {},
            productionBoost: {}
          }
        }
      };
      
      safeDispatchGameEvent("Разблокирована система охлаждения", "success");
    }
  }
  
  // Улучшенный кошелек зависит от наличия 5+ криптокошельков
  if (state.buildings.cryptoWallet?.count >= 5) {
    newUnlocks.enhancedWallet = true;
    newUnlocks.improvedWallet = true;
    
    // Если у нас нет улучшенного кошелька в зданиях, создаем его
    if (!state.buildings.enhancedWallet && !state.buildings.improvedWallet) {
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
            unlocked: true,
            production: {},
            productionBoost: {}
          }
        }
      };
      
      safeDispatchGameEvent("Разблокирован улучшенный кошелек", "success");
    }
  }
  
  // Обновляем состояние с новыми разблокировками
  return {
    ...state,
    unlocks: newUnlocks
  };
};

// Проверяет разблокировки ресурсов на основе требований
export const checkResourceUnlocks = (state: GameState): GameState => {
  console.log('unlockManager: Проверка разблокировок ресурсов');
  
  // Если USDT должен быть разблокирован, но не разблокирован
  if (shouldUnlockUsdt(state) && (!state.unlocks.usdt || !state.resources.usdt?.unlocked)) {
    state = unlockUsdt(state);
  }
  
  return state;
};

// Проверяет разблокировки зданий на основе требований
export const checkBuildingUnlocks = (state: GameState): GameState => {
  console.log('unlockManager: Проверка разблокировок зданий');
  
  // Проверка разблокировки для Практики
  if (shouldUnlockPractice(state) && (!state.unlocks.practice || !state.buildings.practice?.unlocked)) {
    state = unlockPractice(state);
  }
  
  // Проверка разблокировки для Генератора
  if (shouldUnlockGenerator(state) && (!state.unlocks.generator || !state.buildings.generator?.unlocked)) {
    state = unlockGenerator(state);
  }
  
  // Проверка разблокировки для Домашнего Компьютера
  if (shouldUnlockHomeComputer(state) && (!state.unlocks.homeComputer || !state.buildings.homeComputer?.unlocked)) {
    state = unlockHomeComputer(state);
  }
  
  // Проверка разблокировки для Криптобиблиотеки
  if (shouldUnlockCryptoLibrary(state) && (!state.unlocks.cryptoLibrary || !state.buildings.cryptoLibrary?.unlocked)) {
    state = unlockCryptoLibrary(state);
  }
  
  // Проверка разблокировки для Системы Охлаждения
  if (shouldUnlockCoolingSystem(state) && (!state.unlocks.coolingSystem || !state.buildings.coolingSystem?.unlocked)) {
    state = unlockCoolingSystem(state);
  }
  
  // Проверка разблокировки для Улучшенного Кошелька
  if (shouldUnlockEnhancedWallet(state) && 
      ((!state.unlocks.enhancedWallet && !state.unlocks.improvedWallet) || 
       (!state.buildings.enhancedWallet?.unlocked && !state.buildings.improvedWallet?.unlocked))) {
    state = unlockEnhancedWallet(state);
  }
  
  return state;
};

// Проверяет разблокировки улучшений на основе требований
export const checkUpgradeUnlocks = (state: GameState): GameState => {
  console.log('unlockManager: Проверка разблокировок исследований');
  
  return state;
};

// Проверяет разблокировки действий на основе требований
export const checkActionUnlocks = (state: GameState): GameState => {
  console.log('unlockManager: Проверка разблокировок действий');
  
  return state;
};

// Проверяет специальные разблокировки
export const checkSpecialUnlocks = (state: GameState): GameState => {
  console.log('unlockManager: Проверка специальных разблокировок');
  
  return state;
};

// --- Функции проверки условий разблокировки для ресурсов ---

// Проверяет, должен ли USDT быть разблокирован
export const shouldUnlockUsdt = (state: GameState): boolean => {
  const knowledgeClicksValue = state.counters.knowledgeClicks?.value || 0;
  const applyKnowledgeCount = state.counters.applyKnowledge?.value || 0;
  const usdtResourceExists = !!state.resources.usdt;
  const usdtResourceUnlocked = state.resources.usdt?.unlocked || false;
  const usdtFlagUnlocked = state.unlocks.usdt || false;
  
  // Выводим отладочную информацию
  console.log("UnlockService - shouldUnlockUsdt:", {
    knowledgeClicksValue,
    applyKnowledgeCount,
    usdtResourceExists,
    usdtResourceUnlocked,
    usdtFlagUnlocked
  });
  
  // USDT разблокируется после 2+ использований "Применить знания"
  const result = applyKnowledgeCount >= 2;
  console.log("UnlockService - shouldUnlockUsdt result:", result);
  
  return result;
};

// Разблокирует USDT
export const unlockUsdt = (state: GameState): GameState => {
  console.log("Разблокируем USDT");
  
  // Создаем или обновляем ресурс USDT
  const updatedResources = { ...state.resources };
  if (!updatedResources.usdt) {
    updatedResources.usdt = {
      id: 'usdt',
      name: 'USDT',
      description: 'Стейблкоин, привязанный к стоимости доллара США',
      value: 0,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 50,
      unlocked: true,
      type: 'currency',
      icon: 'dollar'
    };
  } else {
    updatedResources.usdt = {
      ...updatedResources.usdt,
      unlocked: true
    };
  }
  
  // Обновляем флаг разблокировки
  const updatedUnlocks = {
    ...state.unlocks,
    usdt: true
  };
  
  // Отправляем уведомление, только если USDT не был разблокирован ранее
  if (!state.unlocks.usdt) {
    safeDispatchGameEvent("Разблокирован USDT (стейблкоин)", "success");
  }
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    resources: updatedResources,
    unlocks: updatedUnlocks
  };
};

// --- Функции проверки условий разблокировки для зданий ---

// Проверяет, должна ли Практика быть разблокирована
export const shouldUnlockPractice = (state: GameState): boolean => {
  const applyKnowledge = state.counters.applyKnowledge?.value || 0;
  const practiceExists = !!state.buildings.practice;
  const practiceUnlocked = practiceExists && state.buildings.practice.unlocked ? "Да" : "Нет";
  const practiceInUnlocks = state.unlocks.practice ? "Да" : "Нет";
  
  // Выводим отладочную информацию
  console.log("UnlockService - shouldUnlockPractice:", {
    applyKnowledge,
    practiceExists,
    practiceUnlocked,
    practiceInUnlocks
  });
  
  // Практика разблокируется после 2+ использований "Применить знания"
  const result = applyKnowledge >= 2;
  
  console.log("UnlockService - shouldUnlockPractice:", {
    applyKnowledge,
    practiceExists,
    practiceUnlocked,
    practiceInUnlocks,
    result
  });
  
  return result;
};

// Проверяет, должен ли Генератор быть разблокирован
export const shouldUnlockGenerator = (state: GameState): boolean => {
  const usdtValue = state.resources.usdt?.value || 0;
  const usdtUnlocked = state.resources.usdt?.unlocked || false;
  const generatorUnlocked = state.buildings.generator?.unlocked ? "Да" : "Нет";
  
  // Выводим отладочную информацию
  console.log("UnlockService - shouldUnlockGenerator:", {
    usdtValue,
    usdtUnlocked,
    generatorUnlocked
  });
  
  // Генератор разблокируется при наличии 11+ USDT
  const result = usdtUnlocked && usdtValue >= 11;
  
  console.log("UnlockService - shouldUnlockGenerator:", {
    usdtValue,
    usdtUnlocked,
    generatorUnlocked,
    result
  });
  
  return result;
};

// Проверяет, должен ли домашний компьютер быть разблокирован
export const shouldUnlockHomeComputer = (state: GameState): boolean => {
  const electricityValue = state.resources.electricity?.value || 0;
  const electricityUnlocked = state.resources.electricity?.unlocked || false;
  
  // Домашний компьютер разблокируется при наличии 50+ электричества
  return electricityUnlocked && electricityValue >= 50;
};

// Проверяет, должна ли криптобиблиотека быть разблокирована
export const shouldUnlockCryptoLibrary = (state: GameState): boolean => {
  const hasCryptoBasics = state.upgrades.cryptoCurrencyBasics?.purchased || 
                         state.upgrades.cryptoBasics?.purchased;
                         
  const cryptoLibraryExists = !!state.buildings.cryptoLibrary;
  const cryptoLibraryUnlocked = cryptoLibraryExists && state.buildings.cryptoLibrary.unlocked ? "Да" : "Нет";
  
  // Выводим отладочную информацию
  console.log("UnlockService - shouldUnlockCryptoLibrary:", {
    cryptoBasicsPurchased: hasCryptoBasics,
    cryptoLibraryExists,
    cryptoLibraryUnlocked
  });
  
  // Криптобиблиотека разблокируется после изучения "Основы криптовалют"
  const result = hasCryptoBasics;
  
  console.log("UnlockService - shouldUnlockCryptoLibrary:", {
    cryptoBasicsPurchased: hasCryptoBasics,
    cryptoLibraryExists,
    cryptoLibraryUnlocked,
    result
  });
  
  return result;
};

// Проверяет, должна ли система охлаждения быть разблокирована
export const shouldUnlockCoolingSystem = (state: GameState): boolean => {
  const homeComputerCount = state.buildings.homeComputer?.count || 0;
  const coolingSystemExists = !!state.buildings.coolingSystem;
  const coolingSystemUnlocked = coolingSystemExists && state.buildings.coolingSystem.unlocked ? "Да" : "Нет";
  
  // Выводим отладочную информацию
  console.log("UnlockService - shouldUnlockCoolingSystem:", {
    homeComputerCount,
    coolingSystemExists,
    coolingSystemUnlocked
  });
  
  // Система охлаждения разблокируется при наличии 2+ домашних компьютеров
  const result = homeComputerCount >= 2;
  
  console.log("UnlockService - shouldUnlockCoolingSystem:", {
    homeComputerCount,
    coolingSystemExists,
    coolingSystemUnlocked,
    result
  });
  
  return result;
};

// Проверяет, должен ли улучшенный кошелек быть разблокирован
export const shouldUnlockEnhancedWallet = (state: GameState): boolean => {
  const cryptoWalletCount = state.buildings.cryptoWallet?.count || 0;
  const enhancedWalletExists = !!state.buildings.enhancedWallet;
  const enhancedWalletUnlocked = enhancedWalletExists && state.buildings.enhancedWallet.unlocked ? "Да" : "Нет";
  
  const improvedWalletExists = !!state.buildings.improvedWallet;
  const improvedWalletUnlocked = improvedWalletExists && state.buildings.improvedWallet.unlocked ? "Да" : "Нет";
  
  // Выводим отладочную информацию
  console.log("UnlockService - shouldUnlockEnhancedWallet:", {
    cryptoWalletCount,
    enhancedWalletExists,
    enhancedWalletUnlocked,
    improvedWalletExists,
    improvedWalletUnlocked
  });
  
  // Улучшенный кошелек разблокируется при наличии 5+ криптокошельков
  const result = cryptoWalletCount >= 5;
  
  console.log("UnlockService - shouldUnlockEnhancedWallet:", {
    cryptoWalletCount,
    enhancedWalletExists,
    enhancedWalletUnlocked,
    result
  });
  
  return result;
};

// --- Функции разблокировки зданий ---

// Разблокирует Практику
export const unlockPractice = (state: GameState): GameState => {
  console.log("Разблокируем Практику");
  
  // Создаем или обновляем здание Практика
  const updatedBuildings = { ...state.buildings };
  if (!updatedBuildings.practice) {
    updatedBuildings.practice = {
      id: 'practice',
      name: 'Практика',
      description: 'Автоматическое получение 1 знания/сек',
      cost: {
        usdt: 10
      },
      costMultiplier: 1.12,
      count: 0,
      unlocked: true,
      production: {
        knowledge: 1
      },
      productionBoost: {}
    };
  } else {
    updatedBuildings.practice = {
      ...updatedBuildings.practice,
      unlocked: true
    };
  }
  
  // Обновляем флаг разблокировки
  const updatedUnlocks = {
    ...state.unlocks,
    practice: true
  };
  
  // Отправляем уведомление, только если практика не была разблокирована ранее
  if (!state.unlocks.practice) {
    safeDispatchGameEvent("Разблокирована Практика", "success");
  }
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    buildings: updatedBuildings,
    unlocks: updatedUnlocks
  };
};

// Разблокирует Генератор
export const unlockGenerator = (state: GameState): GameState => {
  console.log("Разблокируем Генератор");
  
  // Создаем или обновляем здание Генератор
  const updatedBuildings = { ...state.buildings };
  if (!updatedBuildings.generator) {
    updatedBuildings.generator = {
      id: 'generator',
      name: 'Генератор',
      description: 'Производит 0.5 электричества/сек',
      cost: {
        usdt: 20
      },
      costMultiplier: 1.12,
      count: 0,
      unlocked: true,
      production: {
        electricity: 0.5
      },
      productionBoost: {}
    };
  } else {
    updatedBuildings.generator = {
      ...updatedBuildings.generator,
      unlocked: true
    };
  }
  
  // Обновляем флаги разблокировки
  const updatedUnlocks = {
    ...state.unlocks,
    generator: true,
    research: true // Исследования разблокируются вместе с генератором
  };
  
  // Отправляем уведомление, только если генератор не был разблокирован ранее
  if (!state.unlocks.generator) {
    safeDispatchGameEvent("Разблокирован Генератор", "success");
    safeDispatchGameEvent("Разблокированы Исследования", "success");
  }
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    buildings: updatedBuildings,
    unlocks: updatedUnlocks
  };
};

// Разблокирует Домашний компьютер
export const unlockHomeComputer = (state: GameState): GameState => {
  console.log("Разблокируем Домашний компьютер");
  
  // Создаем или обновляем здание Домашний компьютер
  const updatedBuildings = { ...state.buildings };
  if (!updatedBuildings.homeComputer) {
    updatedBuildings.homeComputer = {
      id: 'homeComputer',
      name: 'Домашний компьютер',
      description: '+2 вычисл. мощности/сек при потреблении 1 электр./сек',
      cost: {
        usdt: 55
      },
      costMultiplier: 1.15,
      count: 0,
      unlocked: true,
      production: {
        computingPower: 2
      },
      productionBoost: {
        electricity: -1
      }
    };
  } else {
    updatedBuildings.homeComputer = {
      ...updatedBuildings.homeComputer,
      unlocked: true
    };
  }
  
  // Обновляем флаг разблокировки
  const updatedUnlocks = {
    ...state.unlocks,
    homeComputer: true
  };
  
  // Отправляем уведомление, только если домашний компьютер не был разблокирован ранее
  if (!state.unlocks.homeComputer) {
    safeDispatchGameEvent("Разблокирован Домашний компьютер", "success");
  }
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    buildings: updatedBuildings,
    unlocks: updatedUnlocks
  };
};

// Разблокирует Криптобиблиотеку
export const unlockCryptoLibrary = (state: GameState): GameState => {
  console.log("Разблокируем Криптобиблиотеку");
  
  // Создаем или обновляем здание Криптобиблиотека
  const updatedBuildings = { ...state.buildings };
  if (!updatedBuildings.cryptoLibrary) {
    updatedBuildings.cryptoLibrary = {
      id: 'cryptoLibrary',
      name: 'Криптобиблиотека',
      description: 'Увеличивает скорость получения знаний на 50% и максимальное количество знаний на 100',
      cost: {
        usdt: 200,
        knowledge: 200
      },
      costMultiplier: 1.15,
      count: 0,
      unlocked: true,
      production: {},
      productionBoost: {
        knowledge: 0.5
      }
    };
  } else {
    updatedBuildings.cryptoLibrary = {
      ...updatedBuildings.cryptoLibrary,
      unlocked: true
    };
  }
  
  // Обновляем флаг разблокировки
  const updatedUnlocks = {
    ...state.unlocks,
    cryptoLibrary: true
  };
  
  // Отправляем уведомление, только если криптобиблиотека не была разблокирована ранее
  if (!state.unlocks.cryptoLibrary) {
    safeDispatchGameEvent("Разблокирована Криптобиблиотека", "success");
  }
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    buildings: updatedBuildings,
    unlocks: updatedUnlocks
  };
};

// Разблокирует Систему охлаждения
export const unlockCoolingSystem = (state: GameState): GameState => {
  console.log("Разблокируем Систему охлаждения");
  
  // Создаем или обновляем здание Система охлаждения
  const updatedBuildings = { ...state.buildings };
  if (!updatedBuildings.coolingSystem) {
    updatedBuildings.coolingSystem = {
      id: 'coolingSystem',
      name: 'Система охлаждения',
      description: 'Уменьшает потребление вычислительной мощности всеми устройствами на 20%',
      cost: {
        usdt: 200,
        electricity: 50
      },
      costMultiplier: 1.15,
      count: 0,
      unlocked: true,
      production: {},
      productionBoost: {
        computingPower: 0.2
      }
    };
  } else {
    updatedBuildings.coolingSystem = {
      ...updatedBuildings.coolingSystem,
      unlocked: true
    };
  }
  
  // Обновляем флаг разблокировки
  const updatedUnlocks = {
    ...state.unlocks,
    coolingSystem: true
  };
  
  // Отправляем уведомление, только если система охлаждения не была разблокирована ранее
  if (!state.unlocks.coolingSystem) {
    safeDispatchGameEvent("Разблокирована Система охлаждения", "success");
  }
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    buildings: updatedBuildings,
    unlocks: updatedUnlocks
  };
};

// Разблокирует Улучшенный кошелек
export const unlockEnhancedWallet = (state: GameState): GameState => {
  console.log("Разблокируем Улучшенный кошелек");
  
  // Создаем или обновляем здание Улучшенный кошелек
  const updatedBuildings = { ...state.buildings };
  if (!updatedBuildings.enhancedWallet) {
    updatedBuildings.enhancedWallet = {
      id: 'enhancedWallet',
      name: 'Улучшенный кошелек',
      description: 'Увеличивает максимальное хранение USDT на 150, Bitcoin на 1, эффективность конвертации BTC на 8%',
      cost: {
        usdt: 300,
        knowledge: 250
      },
      costMultiplier: 1.15,
      count: 0,
      unlocked: true,
      production: {},
      productionBoost: {
        btcExchangeEfficiency: 0.08
      }
    };
  } else {
    updatedBuildings.enhancedWallet = {
      ...updatedBuildings.enhancedWallet,
      unlocked: true
    };
  }
  
  // Обновляем флаги разблокировки
  const updatedUnlocks = {
    ...state.unlocks,
    enhancedWallet: true,
    improvedWallet: true // Оба названия для совместимости
  };
  
  // Отправляем уведомление, только если улучшенный кошелек не был разблокирован ранее
  if (!state.unlocks.enhancedWallet && !state.unlocks.improvedWallet) {
    safeDispatchGameEvent("Разблокирован Улучшенный кошелек", "success");
  }
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    buildings: updatedBuildings,
    unlocks: updatedUnlocks
  };
};
