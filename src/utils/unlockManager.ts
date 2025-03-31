import { GameState, Building, Upgrade } from '@/context/types';

/**
 * Проверяет все возможные разблокировки
 */
export const checkAllUnlocks = (state: GameState): GameState => {
  // Создаем безопасную копию состояния для модификации
  let newState = { ...state };

  // Последовательно применяем все проверки разблокировок
  newState = checkResourceUnlocks(newState);
  newState = checkBuildingUnlocks(newState);
  newState = checkUpgradeUnlocks(newState);
  newState = checkActionUnlocks(newState);
  newState = checkSpecialUnlocks(newState);

  return newState;
};

/**
 * Проверяет разблокировки ресурсов на основе требований
 */
export const checkResourceUnlocks = (state: GameState): GameState => {
  // Создаем безопасные копии объектов для модификации
  const updatedResources = { ...state.resources };
  const updatedUnlocks = { ...state.unlocks };

  // Проверка разблокировки USDT
  if (!updatedResources.usdt?.unlocked) {
    // USDT разблокируется после первого применения знаний
    const applyKnowledgeCounter = state.counters.applyKnowledge;
    if (applyKnowledgeCounter && 
        ((typeof applyKnowledgeCounter === 'object' && applyKnowledgeCounter.value >= 1) || 
         (typeof applyKnowledgeCounter === 'number' && applyKnowledgeCounter >= 1))) {
      
      console.log("🔓 Разблокировка USDT: счетчик применения знаний достиг порогового значения");
      
      // Проверяем существование ресурса USDT
      if (!updatedResources.usdt) {
        // Если ресурс USDT не существует, создаем его
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
        // Если ресурс USDT существует, обновляем его свойство unlocked
        updatedResources.usdt = {
          ...updatedResources.usdt,
          unlocked: true
        };
      }
      
      updatedUnlocks.usdt = true;
    }
  }

  // Проверка разблокировки Electricity
  if (!updatedResources.electricity?.unlocked && state.buildings.generator && state.buildings.generator.count > 0) {
    console.log("🔓 Разблокировка Electricity: есть генератор");
    
    if (!updatedResources.electricity) {
      // Если ресурс Electricity не существует, создаем его
      updatedResources.electricity = {
        id: 'electricity',
        name: 'Электричество',
        description: 'Энергия для питания оборудования',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 1000,
        unlocked: true,
        type: 'resource',
        icon: 'zap'
      };
    } else {
      // Если ресурс Electricity существует, обновляем его свойство unlocked
      updatedResources.electricity = {
        ...updatedResources.electricity,
        unlocked: true
      };
    }
    
    updatedUnlocks.electricity = true;
  }

  // Проверка разблокировки Computing Power
  if (!updatedResources.computingPower?.unlocked && 
      state.buildings.homeComputer && 
      state.buildings.homeComputer.count > 0 && 
      updatedResources.electricity?.unlocked) {
    console.log("🔓 Разблокировка Computing Power: есть компьютер и электричество");
    
    if (!updatedResources.computingPower) {
      // Если ресурс не существует, создаем его
      updatedResources.computingPower = {
        id: 'computingPower',
        name: 'Вычислительная мощность',
        description: 'Мощность для вычислений и майнинга',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 500,
        unlocked: true,
        type: 'resource',
        icon: 'cpu'
      };
    } else {
      // Если ресурс существует, обновляем его свойство unlocked
      updatedResources.computingPower = {
        ...updatedResources.computingPower,
        unlocked: true
      };
    }
    
    updatedUnlocks.computingPower = true;
  }

  // Проверка разблокировки Bitcoin
  if (!updatedResources.bitcoin?.unlocked && updatedResources.computingPower?.unlocked) {
    console.log("🔓 Разблокировка Bitcoin: есть вычислительная мощность");
    
    if (!updatedResources.bitcoin) {
      // Если ресурс не существует, создаем его
      updatedResources.bitcoin = {
        id: 'bitcoin',
        name: 'Bitcoin',
        description: 'Криптовалюта, добываемая майнингом',
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
      // Если ресурс существует, обновляем его свойство unlocked
      updatedResources.bitcoin = {
        ...updatedResources.bitcoin,
        unlocked: true
      };
    }
    
    updatedUnlocks.bitcoin = true;
  }

  return {
    ...state,
    resources: updatedResources,
    unlocks: updatedUnlocks
  };
};

/**
 * Проверяет разблокировки зданий на основе требований
 */
export const checkBuildingUnlocks = (state: GameState): GameState => {
  // Создаем безопасные копии объектов для модификации
  const updatedBuildings = { ...state.buildings };
  const updatedUnlocks = { ...state.unlocks };

  // Проверка разблокировки Practice (Практика)
  if (!updatedBuildings.practice || !updatedBuildings.practice.unlocked) {
    // Practice разблокируется после 2-х использований "Применить знания"
    const applyKnowledgeCounter = state.counters.applyKnowledge;
    
    if (applyKnowledgeCounter && 
        ((typeof applyKnowledgeCounter === 'object' && applyKnowledgeCounter.value >= 2) || 
         (typeof applyKnowledgeCounter === 'number' && applyKnowledgeCounter >= 2))) {
      
      console.log("🔓 Разблокировка Practice: счетчик применения знаний >= 2");
      
      updatedUnlocks.practice = true;
      
      if (!updatedBuildings.practice) {
        // Если здание не существует, создаем его с обновленными параметрами из таблицы
        updatedBuildings.practice = {
          id: 'practice',
          name: 'Практика',
          description: 'Автоматическое накопление знаний',
          cost: { usdt: 10 },
          count: 0,
          unlocked: true,
          costMultiplier: 1.12, // Обновлено согласно таблице (k=1.12)
          production: { knowledge: 0.63 },
          consumption: {},
          productionBoost: {},
          unlockedBy: 'applyKnowledge_2'
        };
      } else {
        // Если здание существует, обновляем его свойства
        updatedBuildings.practice = {
          ...updatedBuildings.practice,
          unlocked: true,
          costMultiplier: 1.12, // Обновлено согласно таблице
          cost: { usdt: 10 }
        };
      }
    }
  }

  // Проверка разблокировки Generator (Генератор)
  if ((!updatedBuildings.generator || !updatedBuildings.generator.unlocked) && state.resources.usdt?.value >= 11) {
    console.log("🔓 Разблокировка Generator: USDT >= 11");
    
    updatedUnlocks.generator = true;
    
    if (!updatedBuildings.generator) {
      // Если здание не существует, создаем его с обновленными параметрами из таблицы
      updatedBuildings.generator = {
        id: 'generator',
        name: 'Генератор',
        description: 'Вырабатывает электричество',
        cost: { usdt: 25 }, // Согласно таблице
        count: 0,
        unlocked: true,
        costMultiplier: 1.15,
        production: { electricity: 0.5 }, // Согласно таблице
        consumption: {},
        productionBoost: {},
        unlockedBy: 'usdt_11'
      };
    } else {
      // Если здание существует, обновляем его свойства
      updatedBuildings.generator = {
        ...updatedBuildings.generator,
        unlocked: true,
        cost: { usdt: 25 },
        production: { electricity: 0.5 }
      };
    }
  }

  // Проверка разблокировки Home Computer (Домашний компьютер)
  if ((!updatedBuildings.homeComputer || !updatedBuildings.homeComputer.unlocked) && 
      state.resources.electricity && state.resources.electricity.value >= 50) { // Обновлено согласно таблице (было 10)
    console.log("🔓 Разблокировка Home Computer: Electricity >= 50");
    
    updatedUnlocks.homeComputer = true;
    
    if (!updatedBuildings.homeComputer) {
      // Если здание не существует, создаем его с обновленными параметрами из таблицы
      updatedBuildings.homeComputer = {
        id: 'homeComputer',
        name: 'Домашний компьютер',
        description: 'Создает вычислительную мощность',
        cost: { usdt: 55 }, // Обновлено согласно таблице (было 30)
        count: 0,
        unlocked: true,
        costMultiplier: 1.15,
        production: { computingPower: 2 }, // Согласно таблице
        consumption: { electricity: 1 },
        productionBoost: {},
        unlockedBy: 'electricity_50' // Обновлено
      };
    } else {
      // Если здание существует, обновляем его свойства
      updatedBuildings.homeComputer = {
        ...updatedBuildings.homeComputer,
        unlocked: true,
        cost: { usdt: 55 },
        production: { computingPower: 2 },
        consumption: { electricity: 1 }
      };
    }
  }

  // Проверка разблокировки Crypto Wallet (Криптокошелек)
  if ((!updatedBuildings.cryptoWallet || !updatedBuildings.cryptoWallet.unlocked) && 
      state.upgrades.blockchainBasics && state.upgrades.blockchainBasics.purchased) {
    console.log("🔓 Разблокировка Crypto Wallet: исследование Blockchain Basics куплено");
    
    updatedUnlocks.cryptoWallet = true;
    
    if (!updatedBuildings.cryptoWallet) {
      // Если здание не существует, создаем его с обновленными параметрами из таблицы
      updatedBuildings.cryptoWallet = {
        id: 'cryptoWallet',
        name: 'Криптокошелек',
        description: 'Увеличивает максимальный объем хранения криптовалют',
        cost: { usdt: 30, knowledge: 60 }, // Обновлено согласно таблице (было 15, 25)
        count: 0,
        unlocked: true,
        costMultiplier: 1.15,
        production: {},
        consumption: {},
        productionBoost: {},
        unlockedBy: 'blockchainBasics'
      };
    } else {
      // Если здание существует, обновляем его свойства
      updatedBuildings.cryptoWallet = {
        ...updatedBuildings.cryptoWallet,
        unlocked: true,
        cost: { usdt: 30, knowledge: 60 }
      };
    }
  }
  
  // Проверка разблокировки Internet Channel (Интернет-канал)
  if ((!updatedBuildings.internetChannel || !updatedBuildings.internetChannel.unlocked) && 
      state.buildings.homeComputer && state.buildings.homeComputer.count > 0) {
    console.log("🔓 Разблокировка Internet Channel: есть домашний компьютер");
    
    updatedUnlocks.internetChannel = true;
    
    if (!updatedBuildings.internetChannel) {
      // Если здание не существует, создаем его с обновленными параметрами из таблицы
      updatedBuildings.internetChannel = {
        id: 'internetChannel',
        name: 'Интернет-канал',
        description: 'Улучшает скорость получения знаний и эффективность вычислений',
        cost: { usdt: 100 }, // Согласно таблице
        count: 0,
        unlocked: true,
        costMultiplier: 1.15,
        production: {},
        consumption: {},
        productionBoost: {
          knowledge: 0.2, // +20% к скорости получения знаний
          computingPower: 0.05 // +5% к эффективности вычислительной мощности
        },
        unlockedBy: 'homeComputer'
      };
    } else {
      // Если здание существует, обновляем его свойства
      updatedBuildings.internetChannel = {
        ...updatedBuildings.internetChannel,
        unlocked: true,
        cost: { usdt: 100 },
        productionBoost: {
          knowledge: 0.2,
          computingPower: 0.05
        }
      };
    }
  }
  
  // Проверка разблокировки Crypto Library (Криптобиблиотека)
  if ((!updatedBuildings.cryptoLibrary || !updatedBuildings.cryptoLibrary.unlocked) && 
      state.upgrades.cryptoCurrencyBasics && state.upgrades.cryptoCurrencyBasics.purchased) {
    console.log("🔓 Разблокировка Crypto Library: исследование Crypto Currency Basics куплено");
    
    updatedUnlocks.cryptoLibrary = true;
    
    if (!updatedBuildings.cryptoLibrary) {
      // Если здание не существует, создаем его с обновленными параметрами из таблицы
      updatedBuildings.cryptoLibrary = {
        id: 'cryptoLibrary',
        name: 'Криптобиблиотека',
        description: 'Существенно увеличивает скорость получения знаний и их максимальное хранение',
        cost: { usdt: 200, knowledge: 300 }, // Согласно таблице
        count: 0,
        unlocked: true,
        costMultiplier: 1.15,
        production: { knowledge: 0.5 }, // +50% к скорости получения знаний
        consumption: {},
        productionBoost: {
          knowledgeMax: 100 // +100 к максимальному хранению знаний
        },
        unlockedBy: 'cryptoCurrencyBasics'
      };
    } else {
      // Если здание существует, обновляем его свойства
      updatedBuildings.cryptoLibrary = {
        ...updatedBuildings.cryptoLibrary,
        unlocked: true,
        cost: { usdt: 200, knowledge: 300 },
        production: { knowledge: 0.5 },
        productionBoost: {
          knowledgeMax: 100
        }
      };
    }
  }

  // Проверка разблокировки Auto Miner (Майнер)
  if ((!updatedBuildings.autoMiner || !updatedBuildings.autoMiner.unlocked) && 
      state.upgrades.cryptoCurrencyBasics && state.upgrades.cryptoCurrencyBasics.purchased) {
    console.log("🔓 Разблокировка Auto Miner: исследование Crypto Currency Basics куплено");
    
    updatedUnlocks.autoMiner = true;
    
    if (!updatedBuildings.autoMiner) {
      // Если здание не существует, создаем его с обновленными параметрами из таблицы
      updatedBuildings.autoMiner = {
        id: 'autoMiner',
        name: 'Майнер',
        description: 'Автоматически майнит Bitcoin',
        cost: { usdt: 150 }, // Согласно таблице
        count: 0,
        unlocked: true,
        costMultiplier: 1.15,
        production: { bitcoin: 0.00005 }, // Согласно таблице
        consumption: { electricity: 2, computingPower: 2 }, // Согласно таблице
        productionBoost: {},
        unlockedBy: 'cryptoCurrencyBasics'
      };
    } else {
      // Если здание существует, обновляем его свойства
      updatedBuildings.autoMiner = {
        ...updatedBuildings.autoMiner,
        unlocked: true,
        cost: { usdt: 150 },
        production: { bitcoin: 0.00005 },
        consumption: { electricity: 2, computingPower: 2 }
      };
    }
  }

  return {
    ...state,
    buildings: updatedBuildings,
    unlocks: updatedUnlocks
  };
};

/**
 * Проверяет разблокировки исследований на основе требований
 */
export const checkUpgradeUnlocks = (state: GameState): GameState => {
  // Создаем безопасные копии объектов для модификации
  const updatedUpgrades = { ...state.upgrades };
  const updatedUnlocks = { ...state.unlocks };

  // Проверка разблокировки Blockchain Basics (Основы блокчейна)
  if ((!updatedUpgrades.blockchainBasics || !updatedUpgrades.blockchainBasics.unlocked) && 
      state.buildings.generator && state.buildings.generator.count > 0) {
    console.log("🔓 Разблокировка Blockchain Basics: есть генератор");
    
    updatedUnlocks.blockchainBasics = true;
    
    if (!updatedUpgrades.blockchainBasics) {
      // Если исследование не существует, создаем его с обновленными параметрами из таблицы
      updatedUpgrades.blockchainBasics = {
        id: 'blockchainBasics',
        name: 'Основы блокчейна',
        description: 'Базовые знания о блокчейн-технологиях',
        cost: { knowledge: 100 }, // Обновлено согласно таблице (было 50)
        effects: { 
          maxStorage: { knowledge: 50 }, // +50% к макс. хранению знаний
          productionBonus: { knowledge: 10 }, // +10% к производству знаний
          unlockFeatures: ['cryptoWallet', 'research'] // Открывает новые механики
        },
        purchased: false,
        unlocked: true,
        unlockedBy: 'generator'
      };
    } else {
      // Если исследование существует, обновляем его свойства
      updatedUpgrades.blockchainBasics = {
        ...updatedUpgrades.blockchainBasics,
        unlocked: true,
        cost: { knowledge: 100 },
        effects: {
          maxStorage: { knowledge: 50 },
          productionBonus: { knowledge: 10 },
          unlockFeatures: ['cryptoWallet', 'research']
        }
      };
    }
  }

  // Проверка разблокировки Wallet Security (Безопасность криптокошельков)
  if ((!updatedUpgrades.walletSecurity || !updatedUpgrades.walletSecurity.unlocked) && 
      state.buildings.cryptoWallet && state.buildings.cryptoWallet.count > 0) {
    console.log("🔓 Разблокировка Wallet Security: есть криптокошелек");
    
    updatedUnlocks.walletSecurity = true;
    
    if (!updatedUpgrades.walletSecurity) {
      // Если исследование не существует, создаем его с обновленными параметрами из таблицы
      updatedUpgrades.walletSecurity = {
        id: 'walletSecurity',
        name: 'Безопасность криптокошельков',
        description: 'Улучшает защиту ваших криптоактивов',
        cost: { knowledge: 175 }, // Обновлено согласно таблице (было 75)
        effects: {
          maxStorage: { usdt: 25 }, // +25% к макс. хранению криптовалют
          security: 5 // -5% к вероятности взлома
        },
        purchased: false,
        unlocked: true,
        unlockedBy: 'cryptoWallet'
      };
    } else {
      // Если исследование существует, обновляем его свойства
      updatedUpgrades.walletSecurity = {
        ...updatedUpgrades.walletSecurity,
        unlocked: true,
        cost: { knowledge: 175 },
        effects: {
          maxStorage: { usdt: 25 },
          security: 5
        }
      };
    }
  }

  // Проверка разблокировки Crypto Currency Basics (Основы криптовалют)
  if ((!updatedUpgrades.cryptoCurrencyBasics || !updatedUpgrades.cryptoCurrencyBasics.unlocked) && 
      updatedUpgrades.blockchainBasics && updatedUpgrades.blockchainBasics.purchased) {
    console.log("🔓 Разблокировка Crypto Currency Basics: исследование Blockchain Basics куплено");
    
    updatedUnlocks.cryptoCurrencyBasics = true;
    
    if (!updatedUpgrades.cryptoCurrencyBasics) {
      // Если исследование не существует, создаем его с обновленными параметрами из таблицы
      updatedUpgrades.cryptoCurrencyBasics = {
        id: 'cryptoCurrencyBasics',
        name: 'Основы криптовалют',
        description: 'Повышает эффективность управления криптовалютами',
        cost: { knowledge: 200 }, // Обновлено согласно таблице (было 100)
        effects: {
          efficiency: { applyKnowledge: 10 }, // +10% к эффективности применения знаний
          unlockFeatures: ['autoMiner', 'cryptoLibrary'] // Открывает новые механики
        },
        purchased: false,
        unlocked: true,
        unlockedBy: 'blockchainBasics'
      };
    } else {
      // Если исследование существует, обновляем его свойства
      updatedUpgrades.cryptoCurrencyBasics = {
        ...updatedUpgrades.cryptoCurrencyBasics,
        unlocked: true,
        cost: { knowledge: 200 },
        effects: {
          efficiency: { applyKnowledge: 10 },
          unlockFeatures: ['autoMiner', 'cryptoLibrary']
        }
      };
    }
  }

  // Проверка разблокировки Algorithm Optimization (Оптимизация алгоритмов)
  if ((!updatedUpgrades.algorithmOptimization || !updatedUpgrades.algorithmOptimization.unlocked) && 
      state.buildings.autoMiner && state.buildings.autoMiner.count > 0) {
    console.log("🔓 Разблокировка Algorithm Optimization: есть автомайнер");
    
    updatedUnlocks.algorithmOptimization = true;
    
    if (!updatedUpgrades.algorithmOptimization) {
      // Если исследование не существует, создаем его согласно таблице
      updatedUpgrades.algorithmOptimization = {
        id: 'algorithmOptimization',
        name: 'Оптимизация алгоритмов',
        description: 'Повышает эффективность майнинга',
        cost: { knowledge: 200, usdt: 100 }, // Согласно таблице
        effects: {
          efficiency: { mining: 15 } // +15% к эффективности майнинга
        },
        purchased: false,
        unlocked: true,
        unlockedBy: 'autoMiner'
      };
    } else {
      // Если исследование существует, обновляем его свойства
      updatedUpgrades.algorithmOptimization = {
        ...updatedUpgrades.algorithmOptimization,
        unlocked: true,
        cost: { knowledge: 200, usdt: 100 },
        effects: {
          efficiency: { mining: 15 }
        }
      };
    }
  }

  // Проверка разблокировки Proof of Work
  if ((!updatedUpgrades.proofOfWork || !updatedUpgrades.proofOfWork.unlocked) && 
      state.buildings.autoMiner && state.buildings.autoMiner.count > 0) {
    console.log("🔓 Разблокировка Proof of Work: есть автомайнер");
    
    updatedUnlocks.proofOfWork = true;
    
    if (!updatedUpgrades.proofOfWork) {
      // Если исследование не существует, создаем его согласно таблице
      updatedUpgrades.proofOfWork = {
        id: 'proofOfWork',
        name: 'Proof of Work',
        description: 'Углубленное понимание механизма консенсуса для майнинга',
        cost: { knowledge: 250, usdt: 150 }, // Согласно таблице
        effects: {
          efficiency: { mining: 25 }, // +25% к эффективности майнинга
          unlockFeatures: ['miningFarm'] // Открывает возможность строить майнинг-фермы
        },
        purchased: false,
        unlocked: true,
        unlockedBy: 'autoMiner'
      };
    } else {
      // Если исследование существует, обновляем его свойства
      updatedUpgrades.proofOfWork = {
        ...updatedUpgrades.proofOfWork,
        unlocked: true,
        cost: { knowledge: 250, usdt: 150 },
        effects: {
          efficiency: { mining: 25 },
          unlockFeatures: ['miningFarm']
        }
      };
    }
  }

  return {
    ...state,
    upgrades: updatedUpgrades,
    unlocks: updatedUnlocks
  };
};

/**
 * Проверяет разблокировки действий на основе требований
 */
export const checkActionUnlocks = (state: GameState): GameState => {
  // Создаем копию unlocks для модификации
  const updatedUnlocks = { ...state.unlocks };

  // Проверка разблокировки кнопки "Применить знания" - после 3 нажатий на "Изучить крипту"
  if (!updatedUnlocks.applyKnowledge) {
    const knowledgeClicksCounter = state.counters.knowledgeClicks;
    if (knowledgeClicksCounter && 
        ((typeof knowledgeClicksCounter === 'object' && knowledgeClicksCounter.value >= 3) || 
         (typeof knowledgeClicksCounter === 'number' && knowledgeClicksCounter >= 3))) {
      console.log("🔓 Разблокировка Apply Knowledge: кликов по кнопке знаний >= 3");
      updatedUnlocks.applyKnowledge = true;
    }
  }

  // Проверка разблокировки Mining - становится доступно при наличии вычислительной мощности
  if (!updatedUnlocks.mining && state.resources.computingPower?.unlocked) {
    console.log("🔓 Разблокировка Mining: есть вычислительная мощность");
    updatedUnlocks.mining = true;
  }

  // Проверка разблокировки Auto Mining - если есть здание autoMiner
  if (!updatedUnlocks.autoMining && state.buildings.autoMiner?.count > 0) {
    console.log("🔓 Разблокировка Auto Mining: есть здание autoMiner");
    updatedUnlocks.autoMining = true;
  }

  // Проверка разблокировки Exchange BTC - становится доступно при наличии Bitcoin
  if (!updatedUnlocks.exchangeBtc && state.resources.bitcoin?.unlocked) {
    console.log("🔓 Разблокировка Exchange BTC: есть bitcoin");
    updatedUnlocks.exchangeBtc = true;
  }

  // Проверка разблокировки Research - после покупки генератора
  if (!updatedUnlocks.research && state.buildings.generator && state.buildings.generator.count > 0) {
    console.log("🔓 Разблокировка Research: есть генератор");
    updatedUnlocks.research = true;
  }

  return {
    ...state,
    unlocks: updatedUnlocks
  };
};

/**
 * Проверяет специальные разблокировки, зависящие от счетчиков и других условий
 */
export const checkSpecialUnlocks = (state: GameState): GameState => {
  // Создаем базовые копии для модификации
  let updatedState = { ...state };

  // Проверка разблокировки кнопки "Применить знания" после 3 нажатий на "Изучить крипту"
  const knowledgeClicksCounter = state.counters.knowledgeClicks;
  if (knowledgeClicksCounter) {
    const knowledgeClicksCount = typeof knowledgeClicksCounter === 'object' 
      ? knowledgeClicksCounter.value 
      : knowledgeClicksCounter;

    if (knowledgeClicksCount >= 3 && !state.unlocks.applyKnowledge) {
      console.log("🔍 Особая проверка: разблокировка кнопки Применить знания, счетчик кликов знаний >= 3");
      
      // Обновляем флаги разблокировки
      updatedState = {
        ...updatedState,
        unlocks: {
          ...updatedState.unlocks,
          applyKnowledge: true
        }
      };
    }
  }

  // Проверка Practice после 2-го применения знаний
  const applyKnowledgeCounter = state.counters.applyKnowledge;
  if (applyKnowledgeCounter) {
    const applyKnowledgeCount = typeof applyKnowledgeCounter === 'object' 
      ? applyKnowledgeCounter.value 
      : applyKnowledgeCounter;

    if (applyKnowledgeCount >= 2 && (!state.unlocks.practice || !state.buildings.practice?.unlocked)) {
      console.log("🔍 Особая проверка Practice: счетчик применения знаний >= 2");
      
      // Обновляем флаги разблокировки
      updatedState = {
        ...updatedState,
        unlocks: {
          ...updatedState.unlocks,
          practice: true
        },
        buildings: {
          ...updatedState.buildings,
          practice: {
            ...(updatedState.buildings.practice || {
              id: 'practice',
              name: 'Практика',
              description: 'Автоматическое накопление знаний',
              cost: { usdt: 10 },
              count: 0,
              costMultiplier: 1.12, // Обновлено согласно таблице
              production: { knowledge: 0.63 },
              consumption: {},
              productionBoost: {},
              unlockedBy: 'applyKnowledge_2'
            }),
            unlocked: true
          }
        }
      };
    }
  }

  return updatedState;
};

// Добавляем новую функцию для принудительной полной перепроверки всех разблокировок
export const rebuildAllUnlocks = (state: GameState): GameState => {
  console.log("UnlockService: Полная перепроверка всех разблокировок");
  
  // Для начала сохраняем все важные счетчики и значения
  const counters = { ...state.counters };
  const resources = { ...state.resources };
  
  // Принудительно проверяем все разблокировки с нуля
  let newState = checkAllUnlocks(state);
  
  // После проверки всех разблокировок проверяем ключевые элементы
  // Обеспечиваем безусловную разблокировку USDT при наличии счетчика applyKnowledge >= 1
  if (counters.applyKnowledge && 
      ((typeof counters.applyKnowledge === 'object' && counters.applyKnowledge.value >= 1) || 
       (typeof counters.applyKnowledge === 'number' && counters.applyKnowledge >= 1))) {
    
    console.log("UnlockService: Принудительная разблокировка USDT при счетчике applyKnowledge >= 1");
    
    // Обновляем ресурс USDT
    if (!newState.resources.usdt) {
      newState.resources.usdt = {
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
      newState.resources.usdt = {
        ...newState.resources.usdt,
        unlocked: true
      };
    }
    
    // Обновляем флаг разблокировки USDT
    newState.unlocks.usdt = true;
  }
  
  // Обеспечиваем безусловную разблокировку Practice при наличии счетчика applyKnowledge >= 2
  if (counters.applyKnowledge && 
      ((typeof counters.applyKnowledge === 'object' && counters.applyKnowledge.value >= 2) || 
       (typeof counters.applyKnowledge === 'number' && counters.applyKnowledge >= 2))) {
    
    console.log("UnlockService: Принудительная разблокировка Practice при счетчике applyKnowledge >= 2");
    
    // Обновляем health Practice
    if (!newState.buildings.practice) {
      newState.buildings.practice = {
        id: 'practice',
        name: 'Практика',
        description: 'Автоматическое накопление знаний',
        cost: { usdt: 10 },
        count: 0,
        unlocked: true,
        costMultiplier: 1.12, // Обновлено согласно таблице
        production: { knowledge: 0.63 },
        consumption: {},
        productionBoost: {},
        unlockedBy: 'applyKnowledge_2'
      };
    } else {
      newState.buildings.practice = {
        ...newState.buildings.practice,
        unlocked: true
      };
    }
    
    // Обновляем флаг разблокировки Practice
    newState.unlocks.practice = true;
  }
  
  // Обеспечиваем разблокировку кнопки применения знаний после 3+ кликов на "Изучить"
  if (counters.knowledgeClicks && 
      ((typeof counters.knowledgeClicks === 'object' && counters.knowledgeClicks.value >= 3) || 
       (typeof counters.knowledgeClicks === 'number' && counters.knowledgeClicks >= 3))) {
    
    console.log("UnlockService: Принудительная разблокировка кнопки применения знаний при счетчике knowledgeClicks >= 3");
    
    // Обновляем флаг разблокировки кнопки применения знаний
    newState.unlocks.applyKnowledge = true;
  }
  
  return newState;
}
