import { GameState } from './types';

// Правильно установленное начальное состояние игры
export const initialState: GameState = {
  // Базовые счетчики игровых ресурсов
  knowledge: 0,
  btcPrice: 20000,
  miningPower: 0,
  usdtBalance: 0,
  btcBalance: 0,
  
  // Свойства игры
  gameStarted: false,
  gameTime: 0,
  lastUpdate: Date.now(),
  lastSaved: Date.now(),
  version: '1.0.0',
  phase: 1,
  specialization: null,
  prestigePoints: 0,
  eventMessages: [],
  referredBy: null,
  featureFlags: {},
  buildingUnlocked: {},
  
  unlocks: {
    knowledge: true, // Знания доступны с самого начала
  },
  resources: {
    knowledge: {
      id: 'knowledge',
      name: 'Знания',
      description: 'Знания о криптовалюте и блокчейне',
      type: 'resource',
      icon: 'book',
      value: 0,
      baseProduction: 0, // Базовое производство
      production: 0,
      perSecond: 0,
      max: 100,
      unlocked: true
    }
  },
  buildings: {
    // Все здания изначально заблокированы
    practice: {
      id: 'practice',
      name: 'Практика',
      description: 'Автоматически получает знания о криптовалюте',
      cost: {
        usdt: 10
      },
      costMultiplier: 1.12, // k=1.12 согласно базе знаний
      production: {
        knowledge: 1 // 1 знание/сек согласно базе знаний
      },
      count: 0,
      unlocked: false,
      productionBoost: 0
    },
    generator: {
      id: 'generator',
      name: 'Генератор',
      description: 'Производит электроэнергию для ваших устройств',
      cost: {
        usdt: 20
      },
      costMultiplier: 1.12, // k=1.12 согласно базе знаний
      production: {
        electricity: 0.5 // 0.5 электричества/сек согласно базе знаний
      },
      count: 0,
      unlocked: false,
      productionBoost: 0
    },
    cryptoWallet: {
      id: 'cryptoWallet',
      name: 'Криптокошелек',
      description: 'Позволяет хранить больше USDT и увеличивает максимум знаний',
      cost: {
        usdt: 30,
        knowledge: 50 // Добавляем стоимость в знаниях согласно базе знаний
      },
      costMultiplier: 1.15, // k=1.15 согласно базе знаний
      production: {}, // Добавляем пустой объект production, так как это здание не производит ресурсы
      effects: {
        usdtMax: 50, // +50 к макс. USDT
        knowledgeMaxBoost: 0.25 // +25% к макс. Знаниям
      },
      count: 0,
      unlocked: false,
      productionBoost: 0
    },
    homeComputer: {
      id: 'homeComputer',
      name: 'Домашний компьютер',
      description: 'Обеспечивает вычислительную мощность для майнинга',
      cost: {
        usdt: 55
      },
      costMultiplier: 1.15, // k=1.15 согласно базе знаний
      production: {
        computingPower: 2 // +2 вычисл. мощности/сек
      },
      consumption: {
        electricity: 1 // потребляет 1 электр./сек
      },
      count: 0,
      unlocked: false,
      productionBoost: 0
    },
    internetChannel: {
      id: 'internetChannel',
      name: 'Интернет-канал',
      description: 'Ускоряет получение знаний и повышает эффективность вычислений',
      cost: {
        usdt: 75
      },
      costMultiplier: 1.15, // k=1.15 согласно базе знаний
      production: {}, // Добавляем пустой объект production, так как это здание не производит ресурсы
      effects: {
        knowledgeBoost: 0.2, // +20% к скорости получения знаний
        computingPowerBoost: 0.05 // +5% к эффективности производства вычисл. мощности
      },
      count: 0,
      unlocked: false,
      productionBoost: 0
    }
  },
  upgrades: {
    blockchainBasics: {
      id: 'blockchainBasics',
      name: 'Основы блокчейна',
      description: 'Фундаментальные знания о технологии блокчейна',
      cost: {
        knowledge: 100
      },
      effects: {
        knowledgeMaxBoost: 0.5, // +50% к макс. хранению знаний
        knowledgeBoost: 0.1 // +10% к скорости производства знаний
      },
      purchased: false,
      unlocked: false
    },
    walletSecurity: {
      id: 'walletSecurity',
      name: 'Безопасность криптокошельков',
      description: 'Повышает безопасность и ёмкость ваших криптокошельков',
      cost: {
        knowledge: 175
      },
      effects: {
        usdtMaxBoost: 0.25 // +25% к макс. USDT
      },
      purchased: false,
      unlocked: false,
      requiredUpgrades: ['cryptoWallet']
    },
    cryptoCurrencyBasics: {
      id: 'cryptoCurrencyBasics',
      name: 'Основы криптовалют',
      description: 'Базовые знания о криптовалютах и их использовании',
      cost: {
        knowledge: 200
      },
      effects: {
        knowledgeEfficiencyBoost: 0.1 // +10% к эффективности применения знаний (конвертация 10 знаний в 1.1 USDT)
      },
      purchased: false,
      unlocked: false
    },
    algorithmOptimization: {
      id: 'algorithmOptimization',
      name: 'Оптимизация алгоритмов',
      description: 'Повышает эффективность майнинга криптовалют',
      cost: {
        usdt: 150,
        knowledge: 100
      },
      effects: {
        miningEfficiency: 0.15 // +15% к эффективности майнинга
      },
      purchased: false,
      unlocked: false,
      requiredUpgrades: ['miner']
    },
    proofOfWork: {
      id: 'proofOfWork',
      name: 'Proof of Work',
      description: 'Исследование механизма консенсуса Proof of Work',
      cost: {
        usdt: 250,
        knowledge: 200
      },
      effects: {
        miningEfficiency: 0.25 // +25% к эффективности майнинга
      },
      purchased: false,
      unlocked: false,
      requiredUpgrades: ['algorithmOptimization']
    },
    energyEfficientComponents: {
      id: 'energyEfficientComponents',
      name: 'Энергоэффективные компоненты',
      description: 'Снижает энергопотребление ваших устройств',
      cost: {
        knowledge: 400
      },
      effects: {
        energyEfficiency: 0.1 // -10% к потреблению электричества всеми устройствами
      },
      purchased: false,
      unlocked: false,
      requiredUpgrades: ['coolingSystem']
    },
    cryptoTrading: {
      id: 'cryptoTrading',
      name: 'Криптовалютный трейдинг',
      description: 'Позволяет обменивать различные криптовалюты',
      cost: {
        usdt: 300,
        knowledge: 250
      },
      effects: {
        unlockTrading: true // Открывает раздел Трейдинг
      },
      purchased: false,
      unlocked: false,
      requiredUpgrades: ['enhancedWallet']
    },
    tradingBot: {
      id: 'tradingBot',
      name: 'Торговый бот',
      description: 'Автоматический обмен BTC по заданным условиям',
      cost: {
        knowledge: 500
      },
      effects: {
        autoBtcExchange: true // Автоматизирует обмен BTC
      },
      purchased: false,
      unlocked: false,
      requiredUpgrades: ['cryptoTrading']
    }
  },
  miningParams: {
    miningEfficiency: 1, // Базовая эффективность майнинга 
    networkDifficulty: 1,
    energyEfficiency: 0,
    exchangeRate: 20000, // Базовый курс BTC/USDT
    exchangeCommission: 0.05,
    volatility: 0.2,
    exchangePeriod: 3600,
    baseConsumption: 1
  },
  counters: {
    knowledgeClicks: { id: 'knowledgeClicks', name: 'Клики знаний', value: 0 },
  },
  specializationSynergies: {},
  referralCode: null,
  referrals: [],
  referralHelpers: []
};

// Добавляем экспорт зданий для фазы 2
export const initialPhase2Buildings = {
  miner: {
    id: 'miner',
    name: 'Майнер',
    description: 'Автоматически добывает Bitcoin, используя электричество и вычислительную мощность',
    cost: {
      usdt: 150
    },
    costMultiplier: 1.15, // k=1.15 согласно базе знаний
    production: {
      bitcoin: 0.00005 // 0.00005 BTC/сек согласно базе знаний
    },
    consumption: {
      electricity: 1, // потребляет 1 электр./сек
      computingPower: 5 // потребляет 5 вычисл. мощности/сек
    },
    count: 0,
    unlocked: false,
    productionBoost: 0
  },
  cryptoLibrary: {
    id: 'cryptoLibrary',
    name: 'Криптобиблиотека',
    description: 'Увеличивает скорость получения знаний и их максимальное количество',
    cost: {
      usdt: 200,
      knowledge: 200
    },
    costMultiplier: 1.15, // k=1.15 согласно базе знаний
    production: {}, // Добавляем пустой объект production
    effects: {
      knowledgeBoost: 0.5, // +50% к скорости получения знаний
      knowledgeMax: 100 // +100 к макс. Знаниям
    },
    count: 0,
    unlocked: false,
    productionBoost: 0
  },
  coolingSystem: {
    id: 'coolingSystem',
    name: 'Система охлаждения',
    description: 'Снижает потребление энергии компьютерами на 20%',
    cost: { 
      usdt: 200,
      electricity: 50 
    },
    costMultiplier: 1.15, // k=1.15 согласно базе знаний
    production: {}, // Добавляем пустой объект production
    effects: {
      computingPowerConsumptionReduction: 0.2 // -20% к потреблению вычислительной мощности
    },
    count: 0,
    unlocked: false,
    productionBoost: 0
  },
  enhancedWallet: {
    id: 'enhancedWallet',
    name: 'Улучшенный кошелек',
    description: 'Значительно увеличивает максимальное хранение USDT и Bitcoin',
    cost: {
      usdt: 300,
      knowledge: 250
    },
    costMultiplier: 1.15, // k=1.15 согласно базе знаний
    production: {}, // Добавляем пустой объект production
    effects: {
      usdtMax: 150, // +150 к макс. хранению USDT
      bitcoinMax: 1, // +1 к макс. BTC
      btcExchangeBonus: 0.08 // +8% к эффективности конвертации BTC на USDT
    },
    count: 0,
    unlocked: false,
    productionBoost: 0
  }
};
