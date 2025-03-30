
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
    // USDT разблокируется после нескольких применений знаний
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
        // Если здание не существует, создаем его
        updatedBuildings.practice = {
          id: 'practice',
          name: 'Практика',
          description: 'Автоматическое накопление знаний',
          cost: { usdt: 10 },
          count: 0,
          unlocked: true,
          costMultiplier: 1.15,
          production: { knowledge: 0.63 },
          consumption: {},
          productionBoost: 0,
          unlockedBy: 'applyKnowledge_2'
        };
      } else {
        // Если здание существует, обновляем его свойство unlocked
        updatedBuildings.practice = {
          ...updatedBuildings.practice,
          unlocked: true
        };
      }
    }
  }

  // Проверка разблокировки Generator (Генератор)
  if ((!updatedBuildings.generator || !updatedBuildings.generator.unlocked) && state.resources.usdt?.value >= 11) {
    console.log("🔓 Разблокировка Generator: USDT >= 11");
    
    updatedUnlocks.generator = true;
    
    if (!updatedBuildings.generator) {
      // Если здание не существует, создаем его
      updatedBuildings.generator = {
        id: 'generator',
        name: 'Генератор',
        description: 'Вырабатывает электричество',
        cost: { usdt: 25 },
        count: 0,
        unlocked: true,
        costMultiplier: 1.15,
        production: { electricity: 0.5 },
        consumption: {},
        productionBoost: 0,
        unlockedBy: 'usdt_11'
      };
    } else {
      // Если здание существует, обновляем его свойство unlocked
      updatedBuildings.generator = {
        ...updatedBuildings.generator,
        unlocked: true
      };
    }
  }

  // Проверка разблокировки Home Computer (Домашний компьютер)
  if ((!updatedBuildings.homeComputer || !updatedBuildings.homeComputer.unlocked) && 
      state.resources.electricity && state.resources.electricity.value >= 10) {
    console.log("🔓 Разблокировка Home Computer: Electricity >= 10");
    
    updatedUnlocks.homeComputer = true;
    
    if (!updatedBuildings.homeComputer) {
      // Если здание не существует, создаем его
      updatedBuildings.homeComputer = {
        id: 'homeComputer',
        name: 'Домашний компьютер',
        description: 'Создает вычислительную мощность',
        cost: { usdt: 30 },
        count: 0,
        unlocked: true,
        costMultiplier: 1.15,
        production: { computingPower: 2 },
        consumption: { electricity: 1 },
        productionBoost: 0,
        unlockedBy: 'electricity_10'
      };
    } else {
      // Если здание существует, обновляем его свойство unlocked
      updatedBuildings.homeComputer = {
        ...updatedBuildings.homeComputer,
        unlocked: true
      };
    }
  }

  // Проверка разблокировки Crypto Wallet (Криптокошелек)
  if ((!updatedBuildings.cryptoWallet || !updatedBuildings.cryptoWallet.unlocked) && 
      state.upgrades.blockchainBasics && state.upgrades.blockchainBasics.purchased) {
    console.log("🔓 Разблокировка Crypto Wallet: исследование Blockchain Basics куплено");
    
    updatedUnlocks.cryptoWallet = true;
    
    if (!updatedBuildings.cryptoWallet) {
      // Если здание не существует, создаем его
      updatedBuildings.cryptoWallet = {
        id: 'cryptoWallet',
        name: 'Криптокошелек',
        description: 'Увеличивает максимальный объем хранения криптовалют',
        cost: { usdt: 15, knowledge: 25 },
        count: 0,
        unlocked: true,
        costMultiplier: 1.15,
        production: {},
        consumption: {},
        productionBoost: 0,
        unlockedBy: 'blockchainBasics'
      };
    } else {
      // Если здание существует, обновляем его свойство unlocked
      updatedBuildings.cryptoWallet = {
        ...updatedBuildings.cryptoWallet,
        unlocked: true
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

  // Проверка разблокировки Blockchain Basics
  if ((!updatedUpgrades.blockchainBasics || !updatedUpgrades.blockchainBasics.unlocked) && 
      state.buildings.generator && state.buildings.generator.count > 0) {
    console.log("🔓 Разблокировка Blockchain Basics: есть генератор");
    
    updatedUnlocks.blockchainBasics = true;
    
    if (!updatedUpgrades.blockchainBasics) {
      // Если исследование не существует, создаем его
      updatedUpgrades.blockchainBasics = {
        id: 'blockchainBasics',
        name: 'Основы блокчейна',
        description: 'Базовые знания о блокчейн-технологиях',
        cost: { knowledge: 50 },
        effects: {
          maxStorage: { knowledge: 50 }
        },
        purchased: false,
        unlocked: true,
        unlockedBy: 'generator'
      };
    } else {
      // Если исследование существует, обновляем его свойство unlocked
      updatedUpgrades.blockchainBasics = {
        ...updatedUpgrades.blockchainBasics,
        unlocked: true
      };
    }
  }

  // Проверка разблокировки Wallet Security
  if ((!updatedUpgrades.walletSecurity || !updatedUpgrades.walletSecurity.unlocked) && 
      state.buildings.cryptoWallet && state.buildings.cryptoWallet.count > 0) {
    console.log("🔓 Разблокировка Wallet Security: есть криптокошелек");
    
    updatedUnlocks.walletSecurity = true;
    
    if (!updatedUpgrades.walletSecurity) {
      // Если исследование не существует, создаем его
      updatedUpgrades.walletSecurity = {
        id: 'walletSecurity',
        name: 'Безопасность кошельков',
        description: 'Улучшает защиту ваших криптоактивов',
        cost: { knowledge: 75 },
        effects: {
          maxStorage: { usdt: 25 },
          security: 5
        },
        purchased: false,
        unlocked: true,
        unlockedBy: 'cryptoWallet'
      };
    } else {
      // Если исследование существует, обновляем его свойство unlocked
      updatedUpgrades.walletSecurity = {
        ...updatedUpgrades.walletSecurity,
        unlocked: true
      };
    }
  }

  // Проверка разблокировки Crypto Currency Basics
  if ((!updatedUpgrades.cryptoCurrencyBasics || !updatedUpgrades.cryptoCurrencyBasics.unlocked) && 
      updatedUpgrades.blockchainBasics && updatedUpgrades.blockchainBasics.purchased) {
    console.log("🔓 Разблокировка Crypto Currency Basics: исследование Blockchain Basics куплено");
    
    updatedUnlocks.cryptoCurrencyBasics = true;
    
    if (!updatedUpgrades.cryptoCurrencyBasics) {
      // Если исследование не существует, создаем его
      updatedUpgrades.cryptoCurrencyBasics = {
        id: 'cryptoCurrencyBasics',
        name: 'Основы криптовалют',
        description: 'Повышает эффективность управления криптовалютами',
        cost: { knowledge: 100 },
        effects: {
          efficiency: { applyKnowledge: 10 }
        },
        purchased: false,
        unlocked: true,
        unlockedBy: 'blockchainBasics'
      };
    } else {
      // Если исследование существует, обновляем его свойство unlocked
      updatedUpgrades.cryptoCurrencyBasics = {
        ...updatedUpgrades.cryptoCurrencyBasics,
        unlocked: true
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
    unlocks
  };
};

/**
 * Проверяет специальные разблокировки, зависящие от счетчиков и других условий
 */
export const checkSpecialUnlocks = (state: GameState): GameState => {
  // Создаем базовые копии для модификации
  let updatedState = { ...state };

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
              costMultiplier: 1.15,
              production: { knowledge: 0.63 },
              consumption: {},
              productionBoost: 0,
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
