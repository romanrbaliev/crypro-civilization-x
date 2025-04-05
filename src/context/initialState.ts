import { GameState } from './types';

// Интерфейс MiningParams
export interface MiningParams {
  difficulty: number;
  hashrate: number;
  blockReward: number;
  lastBlockTime: number;
  exchangeRate: number;
  exchangeCommission: number;
  miningEfficiency: number;
  energyEfficiency: number;
  networkDifficulty: number;
  volatility: number;
}

export const initialState: GameState = {
  gameStarted: false,
  lastUpdate: Date.now(),
  lastSaved: Date.now(),
  totalPlayTime: 0,
  rebirths: 0,
  prestigePoints: 0,
  language: 'ru',
  phase: 0,
  counters: {
    learn: { id: 'learn', value: 0 },
    apply: { id: 'apply', value: 0 },
    practiceBuilt: { id: 'practiceBuilt', value: 0 },
    generatorBuilt: { id: 'generatorBuilt', value: 0 },
    computerBuilt: { id: 'computerBuilt', value: 0 },
    walletBuilt: { id: 'walletBuilt', value: 0 }
  },
  
  resources: {
    knowledge: {
      id: 'knowledge',
      name: 'Знания',
      description: 'Знания о криптовалютах и блокчейне',
      type: 'resource',
      icon: 'brain',
      value: 0,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 100,
      unlocked: true,
      consumption: 0
    },
    usdt: {
      id: 'usdt',
      name: 'USDT',
      description: 'Tether - стейблкойн, привязанный к доллару',
      type: 'currency',
      icon: 'dollar-sign',
      value: 0,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 100,
      unlocked: false,
      consumption: 0
    },
    electricity: {
      id: 'electricity',
      name: 'Электричество',
      description: 'Энергия для питания оборудования',
      type: 'resource',
      icon: 'zap',
      value: 0,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 100,
      unlocked: false,
      consumption: 0
    },
    computingPower: {
      id: 'computingPower',
      name: 'Вычислительная мощность',
      description: 'Вычислительная мощность для майнинга',
      type: 'resource',
      icon: 'cpu',
      value: 0,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 1000,
      unlocked: false,
      consumption: 0
    },
    bitcoin: {
      id: 'bitcoin',
      name: 'Bitcoin',
      description: 'Цифровое золото',
      type: 'currency',
      icon: 'bitcoin',
      value: 0,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 0.01,
      unlocked: false,
      consumption: 0
    }
  },
  
  buildings: {
    practice: {
      id: 'practice',
      name: 'Практика',
      description: 'Автоматическое получение знаний о криптовалютах',
      count: 0,
      unlocked: false,
      baseCost: { usdt: 10 },
      cost: { usdt: 10 },
      costMultiplier: 1.12,
      production: { knowledge: 1 },
      consumption: {},
      effects: {}
    },
    generator: {
      id: 'generator',
      name: 'Генератор',
      description: 'Производит электричество для питания оборудования',
      count: 0,
      unlocked: false,
      baseCost: { usdt: 20 },
      cost: { usdt: 20 },
      costMultiplier: 1.12,
      production: { electricity: 0.5 },
      consumption: {},
      effects: {}
    },
    homeComputer: {
      id: 'homeComputer',
      name: 'Домашний компьютер',
      description: 'Производит вычислительную мощность, потребляя электричество',
      count: 0,
      unlocked: false,
      baseCost: { usdt: 55 },
      cost: { usdt: 55 },
      costMultiplier: 1.15,
      production: { computingPower: 2 },
      consumption: { electricity: 1 },
      effects: {}
    },
    cryptoWallet: {
      id: 'cryptoWallet',
      name: 'Криптокошелек',
      description: 'Увеличивает максимальный запас USDT и знаний',
      count: 0,
      unlocked: false,
      baseCost: { usdt: 30, knowledge: 50 },
      cost: { usdt: 30, knowledge: 50 },
      costMultiplier: 1.15,
      production: {},
      consumption: {},
      effects: {
        maxUSDTBoost: 50,
        maxKnowledgePercentBoost: 0.25
      }
    },
    internetChannel: {
      id: 'internetChannel',
      name: 'Интернет-канал',
      description: 'Ускоряет получение знаний и повышает эффективность вычислений',
      count: 0,
      unlocked: false,
      baseCost: { usdt: 75 },
      cost: { usdt: 75 },
      costMultiplier: 1.15,
      production: {},
      consumption: {},
      effects: {
        knowledgeProductionBoost: 0.2,
        computingEfficiencyBoost: 0.05
      }
    },
    miner: {
      id: 'miner',
      name: 'Майнер',
      description: 'Автоматически добывает Bitcoin, используя электричество и вычислительную мощность',
      count: 0,
      unlocked: false,
      baseCost: { usdt: 150 },
      cost: { usdt: 150 },
      costMultiplier: 1.15,
      production: { bitcoin: 0.00005 },
      consumption: { electricity: 1, computingPower: 5 },
      effects: {}
    },
    asicMiner: {
      id: 'asicMiner',
      name: 'ASIC-майнер',
      description: 'Специализированное устройство для эффективного майнинга',
      count: 0,
      unlocked: false,
      baseCost: { usdt: 350 },
      cost: { usdt: 350 },
      costMultiplier: 1.15,
      production: { bitcoin: 0.0002 },
      consumption: { electricity: 2, computingPower: 8 },
      effects: {}
    },
    coolingSystem: {
      id: 'coolingSystem',
      name: 'Система охлаждения',
      description: 'Снижает потребление вычислительной мощности всеми устройствами на 20%',
      count: 0,
      unlocked: false,
      baseCost: { usdt: 200, electricity: 50 },
      cost: { usdt: 200, electricity: 50 },
      costMultiplier: 1.15,
      production: {},
      consumption: {},
      effects: {
        computingConsumptionReduction: 0.2
      }
    },
    cryptoLibrary: {
      id: 'cryptoLibrary',
      name: 'Криптобиблиотека',
      description: 'Ускоряет получение знаний на 50% и увеличивает их максимальный запас',
      count: 0,
      unlocked: false,
      baseCost: { usdt: 200, knowledge: 200 },
      cost: { usdt: 200, knowledge: 200 },
      costMultiplier: 1.15,
      production: {},
      consumption: {},
      effects: {
        knowledgeProductionBoost: 0.5,
        maxKnowledgeBoost: 100
      }
    },
    enhancedWallet: {
      id: 'enhancedWallet',
      name: 'Улучшенный кошелек',
      description: 'Значительно увеличивает хранилище USDT и BTC, а также эффективность конвертации',
      count: 0,
      unlocked: false,
      baseCost: { usdt: 300, knowledge: 250 },
      cost: { usdt: 300, knowledge: 250 },
      costMultiplier: 1.15,
      production: {},
      consumption: {},
      effects: {
        maxUSDTBoost: 150,
        maxBTCBoost: 1,
        btcExchangeEfficiencyBoost: 0.08
      }
    }
  },
  
  upgrades: {
    blockchainBasics: {
      id: 'blockchainBasics',
      name: 'Основы блокчейна',
      description: 'Увеличивает максимальное количество знаний на 50% и скорость их получения на 10%',
      cost: { knowledge: 100 },
      purchased: false,
      unlocked: false,
      type: 'research',
      effects: {
        maxKnowledgePercentBoost: 0.5,
        knowledgeProductionBoost: 0.1
      }
    },
    walletSecurity: {
      id: 'walletSecurity',
      name: 'Безопасность криптокошельков',
      description: 'Увеличивает максимальное хранилище USDT на 25%',
      cost: { knowledge: 175 },
      purchased: false,
      unlocked: false,
      type: 'research',
      effects: {
        maxUSDTPercentBoost: 0.25
      }
    },
    cryptoBasics: {
      id: 'cryptoBasics',
      name: 'Основы криптовалют',
      description: 'Повышает эффективность применения знаний на 10%',
      cost: { knowledge: 200 },
      purchased: false,
      unlocked: false,
      type: 'research',
      effects: {
        knowledgeToUSDTEfficiencyBoost: 0.1
      }
    },
    algorithmOptimization: {
      id: 'algorithmOptimization',
      name: 'Оптимизация алгоритмов',
      description: 'Увеличивает эффективность майнинга на 15%',
      cost: { usdt: 150, knowledge: 100 },
      purchased: false,
      unlocked: false,
      type: 'research',
      effects: {
        miningEfficiencyBoost: 0.15
      }
    },
    proofOfWork: {
      id: 'proofOfWork',
      name: 'Proof of Work',
      description: 'Повышает эффективность майнинга на 25%',
      cost: { usdt: 250, knowledge: 200 },
      purchased: false,
      unlocked: false,
      type: 'research',
      effects: {
        miningEfficiencyBoost: 0.25
      }
    },
    energyEfficientComponents: {
      id: 'energyEfficientComponents',
      name: 'Энергоэффективные компоненты',
      description: 'Снижает потребление электричества всеми устройствами на 10%',
      cost: { knowledge: 400 },
      purchased: false,
      unlocked: false,
      type: 'research',
      effects: {
        electricityConsumptionReduction: 0.1
      }
    },
    cryptoTrading: {
      id: 'cryptoTrading',
      name: 'Криптовалютный трейдинг',
      description: 'Открывает возможность обмена между криптовалютами',
      cost: { usdt: 300, knowledge: 250 },
      purchased: false,
      unlocked: false,
      type: 'research',
      effects: {
        tradingUnlocked: 1
      }
    },
    tradingBot: {
      id: 'tradingBot',
      name: 'Торговый бот',
      description: 'Автоматический обмен BTC по заданным условиям',
      cost: { knowledge: 500 },
      purchased: false,
      unlocked: false,
      type: 'research',
      effects: {
        autoBotTrading: 1
      }
    }
  },
  
  unlocks: {
    usdt: false,
    research: false,
    electricity: false,
    bitcoin: false,
    computingPower: false,
    mining: false,
    trading: false,
    specialization: false,
    offline: false,
    autoSell: false
  },
  
  miningParams: {
    difficulty: 1,
    hashrate: 0,
    blockReward: 6.25,
    lastBlockTime: Date.now(),
    exchangeRate: 25000,
    exchangeCommission: 0.005,
    miningEfficiency: 1,
    energyEfficiency: 1,
    networkDifficulty: 1,
    volatility: 0.05
  },
  
  specializations: {
    miner: {
      id: 'miner',
      name: 'Майнер',
      description: 'Специализация на эффективном майнинге криптовалют',
      level: 0,
      selected: false,
      bonuses: {
        miningEfficiencyBoost: 0.25,
        electricityConsumptionReduction: 0.15
      }
    },
    trader: {
      id: 'trader',
      name: 'Трейдер',
      description: 'Специализация на торговле и обмене криптовалют',
      level: 0,
      selected: false,
      bonuses: {
        exchangeRateBoost: 0.15,
        exchangeCommissionReduction: 0.2
      }
    },
    developer: {
      id: 'developer',
      name: 'Разработчик',
      description: 'Специализация на разработке и оптимизации систем',
      level: 0,
      selected: false,
      bonuses: {
        researchCostReduction: 0.2,
        computingEfficiencyBoost: 0.25
      }
    }
  },
  
  synergies: {
    minerTrader: {
      id: 'minerTrader',
      name: 'Майнер + Трейдер',
      description: 'Синергия между майнингом и трейдингом',
      unlocked: false,
      active: false,
      requiredSpecializations: ['miner', 'trader'],
      bonuses: {
        autoExchangeUnlocked: true,
        exchangeRateBoostForMining: 0.1
      }
    },
    minerDeveloper: {
      id: 'minerDeveloper',
      name: 'Майнер + Разработчик',
      description: 'Синергия между майнингом и разработкой',
      unlocked: false,
      active: false,
      requiredSpecializations: ['miner', 'developer'],
      bonuses: {
        miningAlgorithmEfficiencyBoost: 0.2,
        autoMiningOptimizationEnabled: true
      }
    },
    traderDeveloper: {
      id: 'traderDeveloper',
      name: 'Трейдер + Разработчик',
      description: 'Синергия между трейдингом и разработкой',
      unlocked: false,
      active: false,
      requiredSpecializations: ['trader', 'developer'],
      bonuses: {
        tradingAlgorithmEfficiencyBoost: 0.2,
        predictiveAnalyticsEnabled: true
      }
    }
  },
  
  referralCode: null,
  referrals: [],
  referralHelpers: []
};
