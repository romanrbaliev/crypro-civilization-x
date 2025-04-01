import { GameState } from './types';

export const initialState: GameState = {
  knowledge: 0,
  btcPrice: 20000,
  miningPower: 0,
  usdtBalance: 0,
  btcBalance: 0,
  
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
    knowledge: true,
  },
  resources: {
    knowledge: {
      id: 'knowledge',
      name: 'Знания',
      description: 'Знания о криптовалюте и блокчейне',
      type: 'resource',
      icon: 'book',
      value: 0,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 100,
      unlocked: true
    }
  },
  buildings: {
    practice: {
      id: 'practice',
      name: 'Практика',
      description: 'Автоматически получает знания о криптовалюте',
      cost: {
        usdt: 10
      },
      costMultiplier: 1.12,
      production: {
        knowledge: 1
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
      costMultiplier: 1.12,
      production: {
        electricity: 0.5
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
        knowledge: 50
      },
      costMultiplier: 1.15,
      production: {},
      effects: {
        usdtMax: 50,
        knowledgeMaxBoost: 0.25
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
      costMultiplier: 1.15,
      production: {
        computingPower: 2
      },
      consumption: {
        electricity: 1
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
      costMultiplier: 1.15,
      effects: {
        knowledgeBoost: 0.2,
        computingPowerBoost: 0.05
      },
      production: {},
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
        knowledgeMaxBoost: 0.5,
        knowledgeBoost: 0.1
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
        usdtMaxBoost: 0.25
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
        knowledgeEfficiencyBoost: 0.1
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
        miningEfficiency: 0.15
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
        miningEfficiency: 0.25
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
        energyEfficiency: 0.1
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
        unlockTrading: true
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
        autoBtcExchange: true
      },
      purchased: false,
      unlocked: false,
      requiredUpgrades: ['cryptoTrading']
    }
  },
  miningParams: {
    miningEfficiency: 1,
    networkDifficulty: 1,
    energyEfficiency: 0,
    exchangeRate: 20000,
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

export const initialPhase2Buildings = {
  miner: {
    id: 'miner',
    name: 'Майнер',
    description: 'Автоматически добывает Bitcoin, используя электричество и вычислительную мощность',
    cost: {
      usdt: 150
    },
    costMultiplier: 1.15,
    production: {
      bitcoin: 0.00005
    },
    consumption: {
      electricity: 1,
      computingPower: 5
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
    costMultiplier: 1.15,
    production: {},
    effects: {
      knowledgeBoost: 0.5,
      knowledgeMax: 100
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
    costMultiplier: 1.15,
    production: {},
    effects: {
      computingPowerConsumptionReduction: 0.2
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
    costMultiplier: 1.15,
    production: {},
    effects: {
      usdtMax: 150,
      bitcoinMax: 1,
      btcExchangeBonus: 0.08
    },
    count: 0,
    unlocked: false,
    productionBoost: 0
  }
};
