
import { GameState, Resource, Building, Upgrade, ResourceType } from './types';

// Определение начальных ресурсов
const initialResources: Record<string, Resource> = {
  knowledge: {
    id: 'knowledge',
    name: 'Знания',
    description: 'Базовые знания о криптовалютах и блокчейне',
    icon: 'book',
    type: 'basic' as ResourceType,
    value: 0,
    max: 100,
    unlocked: false,
    baseProduction: 0,
    production: 0,
    perSecond: 0,
    consumption: 0
  },
  usdt: {
    id: 'usdt',
    name: 'USDT',
    description: 'Стейблкоин, привязанный к стоимости доллара США',
    icon: 'dollar',
    type: 'currency' as ResourceType,
    value: 0,
    max: 50,
    unlocked: false,
    baseProduction: 0,
    production: 0,
    perSecond: 0,
    consumption: 0
  },
  electricity: {
    id: 'electricity',
    name: 'Электричество',
    description: 'Энергия для работы компьютеров и майнеров',
    icon: 'zap',
    type: 'power' as ResourceType,
    value: 0,
    max: 5,
    unlocked: false,
    baseProduction: 0,
    production: 0,
    perSecond: 0,
    consumption: 0
  },
  computingPower: {
    id: 'computingPower',
    name: 'Вычислительная мощность',
    description: 'Используется для майнинга и других вычислительных операций',
    icon: 'cpu',
    type: 'computational' as ResourceType,
    value: 0,
    max: 0,
    unlocked: false,
    baseProduction: 0,
    production: 0,
    perSecond: 0,
    consumption: 0
  },
  bitcoin: {
    id: 'bitcoin',
    name: 'Bitcoin',
    description: 'Самая первая и популярная криптовалюта',
    icon: 'bitcoin',
    type: 'crypto' as ResourceType,
    value: 0,
    max: 0,
    unlocked: false,
    baseProduction: 0,
    production: 0,
    perSecond: 0,
    consumption: 0
  }
};

// Определение начальных зданий
const initialBuildings: Record<string, Building> = {
  practice: {
    id: 'practice',
    name: 'Практика',
    description: 'Автоматически генерирует знания о криптовалютах',
    count: 0,
    unlocked: false,
    baseCost: { usdt: 10 },
    costMultiplier: 1.12,
    production: { knowledge: 1 },
    consumption: {}
  },
  generator: {
    id: 'generator',
    name: 'Генератор',
    description: 'Производит электричество для работы оборудования',
    count: 0,
    unlocked: false,
    baseCost: { usdt: 20 },
    costMultiplier: 1.12,
    production: { electricity: 0.5 },
    consumption: {}
  },
  homeComputer: {
    id: 'homeComputer',
    name: 'Домашний компьютер',
    description: 'Производит вычислительную мощность, но потребляет электричество',
    count: 0,
    unlocked: false,
    baseCost: { usdt: 55 },
    costMultiplier: 1.15,
    production: { computingPower: 2 },
    consumption: { electricity: 1 }
  },
  cryptoWallet: {
    id: 'cryptoWallet',
    name: 'Криптокошелек',
    description: 'Увеличивает максимальный размер хранения USDT и знаний',
    count: 0,
    unlocked: false,
    baseCost: { usdt: 30, knowledge: 50 },
    costMultiplier: 1.15,
    production: {},
    consumption: {}
  },
  internetChannel: {
    id: 'internetChannel',
    name: 'Интернет-канал',
    description: 'Увеличивает скорость получения знаний и эффективность вычислений',
    count: 0,
    unlocked: false,
    baseCost: { usdt: 75 },
    costMultiplier: 1.15,
    production: {},
    consumption: {}
  },
  miner: {
    id: 'miner',
    name: 'Майнер',
    description: 'Автоматически добывает Bitcoin, используя электричество и вычислительную мощность',
    count: 0,
    unlocked: false,
    baseCost: { usdt: 150 },
    costMultiplier: 1.15,
    production: { bitcoin: 0.00005 },
    consumption: { electricity: 1, computingPower: 5 }
  },
  autoMiner: {
    id: 'autoMiner',
    name: 'Авто-майнер',
    description: 'Улучшенная версия майнера с оптимизированным энергопотреблением',
    count: 0,
    unlocked: false,
    baseCost: { usdt: 300 },
    costMultiplier: 1.15,
    production: { bitcoin: 0.0001 },
    consumption: { electricity: 1.5, computingPower: 8 }
  },
  coolingSystem: {
    id: 'coolingSystem',
    name: 'Система охлаждения',
    description: 'Снижает потребление вычислительной мощности всеми устройствами',
    count: 0,
    unlocked: false,
    baseCost: { usdt: 200, electricity: 50 },
    costMultiplier: 1.15,
    production: {},
    consumption: {}
  },
  improvedWallet: {
    id: 'improvedWallet',
    name: 'Улучшенный кошелек',
    description: 'Значительно увеличивает максимальное хранение USDT и Bitcoin',
    count: 0,
    unlocked: false,
    baseCost: { usdt: 300, knowledge: 250 },
    costMultiplier: 1.15,
    production: {},
    consumption: {}
  },
  cryptoLibrary: {
    id: 'cryptoLibrary',
    name: 'Криптобиблиотека',
    description: 'Увеличивает скорость получения знаний и их максимальное хранение',
    count: 0,
    unlocked: false,
    baseCost: { usdt: 200, knowledge: 200 },
    costMultiplier: 1.15,
    production: {},
    consumption: {}
  }
};

// Определение начальных улучшений
const initialUpgrades: Record<string, Upgrade> = {
  blockchainBasics: {
    id: 'blockchainBasics',
    name: 'Основы блокчейна',
    description: '+50% к макс. хранению знаний, +10% к скорости производства знаний',
    cost: { knowledge: 100 },
    purchased: false,
    unlocked: false,
    type: 'research',
    effects: {
      knowledgeMaxBoost: 0.5,
      knowledgeProductionBoost: 0.1
    }
  },
  walletSecurity: {
    id: 'walletSecurity',
    name: 'Безопасность криптокошельков',
    description: '+25% к макс. USDT',
    cost: { knowledge: 175 },
    purchased: false,
    unlocked: false,
    type: 'research',
    effects: {
      usdtMaxBoost: 0.25
    }
  },
  cryptoCurrencyBasics: {
    id: 'cryptoCurrencyBasics',
    name: 'Основы криптовалют',
    description: '+10% к эффективности применения знаний',
    cost: { knowledge: 200 },
    purchased: false,
    unlocked: false,
    type: 'research',
    effects: {
      knowledgeEfficiencyBoost: 0.1
    }
  },
  algorithmOptimization: {
    id: 'algorithmOptimization',
    name: 'Оптимизация алгоритмов',
    description: '+15% к эффективности майнинга',
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
    description: '+25% к эффективности майнинга',
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
    description: '-10% к потреблению электричества всеми устройствами',
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
    description: 'Открывает возможность обмена между различными криптовалютами',
    cost: { usdt: 300, knowledge: 250 },
    purchased: false,
    unlocked: false,
    type: 'research',
    effects: {
      tradingUnlocked: true
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
      autotradingUnlocked: true
    }
  },
  cryptoCommunity: {
    id: 'cryptoCommunity',
    name: 'Криптосообщество',
    description: 'Открывает возможность приглашать других пользователей',
    cost: { knowledge: 300 },
    purchased: false,
    unlocked: false,
    type: 'research',
    effects: {
      referralsUnlocked: true
    }
  }
};

// Начальное состояние
export const initialState: GameState = {
  resources: initialResources,
  buildings: initialBuildings,
  upgrades: initialUpgrades,
  counters: {
    knowledgeClicks: { id: 'knowledgeClicks', value: 0 },
    applyKnowledge: { id: 'applyKnowledge', value: 0 }
  },
  unlocks: {
    usdt: false,
    practice: false,
    research: false,
    specialization: false,
    referrals: false
  },
  gameStarted: false,
  lastUpdate: Date.now(),
  lastSaved: Date.now(),
  phase: 0,
  prestigePoints: 0,
  language: 'ru' // Устанавливаем русский язык по умолчанию
};
