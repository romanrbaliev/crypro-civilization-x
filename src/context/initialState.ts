import { Resource, Building, Upgrade, GameState, Counter, MiningParams } from './types';
import { generateReferralCode } from '@/utils/helpers';

// Начальные здания
export const initialBuildings: { [key: string]: Building } = {
  practice: {
    id: "practice",
    name: "Практика",
    description: "Автоматически изучать криптовалюту",
    cost: { usdt: 10 },
    costMultiplier: 1.15,
    production: { knowledge: 0.63 },
    count: 0,
    unlocked: false,
    requirements: { usdt: 10 },
    maxCount: Infinity,
    productionBoost: 0
  },
  generator: {
    id: "generator",
    name: "Генератор",
    description: "Производит электричество для ваших устройств",
    cost: { usdt: 25 },
    costMultiplier: 1.15,
    production: { electricity: 0.5 },
    count: 0,
    unlocked: false,
    requirements: { usdt: 11 },  // Явно установлено на 11 USDT
    productionBoost: 0
  },
  homeComputer: {
    id: "homeComputer",
    name: "Домашний компьютер",
    description: "Обеспечивает вычислительную мощность для майнинга",
    cost: { usdt: 30, electricity: 5 },
    costMultiplier: 1.15,
    production: { computingPower: 2 },
    consumption: { electricity: 1 }, // Явное потребление электричества
    count: 0,
    unlocked: false,
    requirements: { electricity: 10 },
    productionBoost: 0
  },
  autoMiner: {
    id: "autoMiner",
    name: "Майнер",
    description: "Автоматически добывает BTC, потребляя вычислительную мощность и электричество",
    cost: { usdt: 50 },
    costMultiplier: 1.5,
    production: {},
    consumption: { computingPower: 50, electricity: 2 },  // Добавляем явное потребление ресурсов
    count: 0,
    unlocked: false,
    requirements: { homeComputer: 1, electricity: 20 },  // Требуется компьютер и 20 электричества
    productionBoost: 0
  },
  cryptoWallet: {
    id: "cryptoWallet",
    name: "Криптокошелек",
    description: "Увеличивает максимальное хранение USDT и знаний",
    cost: { usdt: 15, knowledge: 25 },
    costMultiplier: 1.2,
    production: { usdtMax: 50, knowledgeMax: 25 },
    count: 0,
    unlocked: false,
    requirements: { basicBlockchain: 1 },
    productionBoost: 0
  },
  internetConnection: {
    id: "internetConnection",
    name: "Интернет-канал",
    description: "Ускоряет получение знаний",
    cost: { usdt: 50 },
    costMultiplier: 1.3,
    production: { knowledgeBoost: 0.2 },
    count: 0,
    unlocked: false,
    requirements: { usdt: 45 },
    productionBoost: 0
  },
  cryptoLibrary: {
    id: "cryptoLibrary",
    name: "Криптобиблиотека",
    description: "Значительно увеличивает скорость получения знаний и их максимум",
    cost: { usdt: 100, knowledge: 150 },
    costMultiplier: 1.25,
    production: { knowledge: 1.5, knowledgeMax: 100 },
    count: 0,
    unlocked: false,
    requirements: { internetConnection: 1, usdt: 80 },
    productionBoost: 0
  },
  coolingSystem: {
    id: "coolingSystem",
    name: "Система охлаждения",
    description: "Снижает потребление электричества компьютеров на 20%",
    cost: { usdt: 120, electricity: 50 },
    costMultiplier: 1.3,
    production: { electricityEfficiencyBoost: 0.2 },
    count: 0,
    unlocked: false,
    requirements: { homeComputer: 2 },
    productionBoost: 0
  }
};

// Начальные улучшения
export const initialUpgrades: { [key: string]: Upgrade } = {
  basicBlockchain: {
    id: "basicBlockchain",
    name: "Основы блокчейна",
    description: "Открывает базовые механики криптовалют и увеличивает хранилище знаний",
    cost: { knowledge: 50 },
    effects: { knowledgeBoost: 0.1, knowledgeMaxBoost: 0.5 },
    unlocked: false,
    purchased: false,
    requirements: { generatorCount: 1 }
  },
  walletSecurity: {
    id: "walletSecurity",
    name: "Безопасность криптокошельков",
    description: "Увеличивает максимальное хранение криптовалют",
    cost: { knowledge: 75 },
    effects: { usdtMaxBoost: 0.25 },
    unlocked: false,
    purchased: false,
    requirements: { cryptoWalletCount: 1 }
  },
  cryptoCurrencyBasics: {
    id: "cryptoCurrencyBasics",
    name: "Основы криптовалют",
    description: "Базовое понимание различных криптовалют",
    cost: { knowledge: 100 },
    effects: { miningEfficiencyBoost: 0.1 },
    unlocked: false,
    purchased: false,
    requirements: { basicBlockchain: 1 }
  },
  algorithmOptimization: {
    id: "algorithmOptimization",
    name: "Оптимизация алгоритмов",
    description: "Увеличивает эффективность майнинга на 15%",
    cost: { knowledge: 150, usdt: 50 },
    effects: { miningEfficiencyBoost: 0.15 },
    unlocked: false,
    purchased: false,
    requirements: { autoMinerCount: 1 }
  },
  energyEfficiency: {
    id: "energyEfficiency",
    name: "Энергоэффективные компоненты",
    description: "Снижает потребление электричества при майнинге на 10%",
    cost: { knowledge: 120, usdt: 75 },
    effects: { energyEfficiencyBoost: 0.1 },
    unlocked: false,
    purchased: false,
    requirements: { autoMinerCount: 1 }
  },
  coolingSystem: {
    id: "coolingSystem",
    name: "Система охлаждения",
    description: "Увеличивает вычислительную мощность на 20% без перегрева",
    cost: { knowledge: 150, usdt: 100 },
    effects: { computingPowerBoost: 0.2 },
    unlocked: false,
    purchased: false,
    requirements: { algorithmOptimization: 1 }
  },
  proofOfWork: {
    id: "proofOfWork",
    name: "Proof of Work",
    description: "Понимание принципа доказательства работы в блокчейне",
    cost: { knowledge: 200, usdt: 50 },
    effects: { miningEfficiencyBoost: 0.25 },
    unlocked: false,
    purchased: false,
    requirements: { cryptoCurrencyBasics: 1, homeComputer: 3 }
  }
};

// Начальные ресурсы
export const initialResources: { [key: string]: Resource } = {
  knowledge: {
    id: "knowledge",
    name: "Знания о крипте",
    description: "Базовые знания о криптовалютах",
    baseProduction: 0,
    production: 0,
    type: "basic",
    icon: "",
    value: 0,
    perSecond: 0,
    unlocked: true,
    max: 100
  },
  usdt: {
    id: "usdt",
    name: "USDT",
    description: "Стейблкоин Tether",
    baseProduction: 0,
    production: 0,
    type: "currency",
    icon: "",
    value: 0,
    perSecond: 0,
    unlocked: false,
    max: 50
  },
  electricity: {
    id: "electricity",
    name: "Электричество",
    description: "Энергия для питания устройств",
    baseProduction: 0,
    production: 0,
    type: "resource",
    icon: "",
    value: 0,
    perSecond: 0,
    unlocked: false,
    max: 1000
  },
  computingPower: {
    id: "computingPower",
    name: "Вычислительная мощность",
    description: "Используется для майнинга криптовалюты",
    baseProduction: 0,
    production: 0,
    type: "resource",
    icon: "💻",
    value: 0,
    perSecond: 0,
    unlocked: false,
    max: Infinity
  },
  btc: {
    id: "btc",
    name: "Bitcoin",
    description: "Криптовалюта Bitcoin",
    baseProduction: 0,
    production: 0,
    type: "crypto",
    icon: "₿",
    value: 0,
    perSecond: 0,
    unlocked: false,
    max: 0.001
  },
  reputation: {
    id: "reputation",
    name: "Репутация",
    description: "Ваша репутация в криптосообществе",
    baseProduction: 0,
    production: 0,
    type: "social",
    icon: "",
    value: 0,
    perSecond: 0,
    unlocked: false,
    max: Infinity
  }
};

// Начальные счетчики
export const initialCounters: { [key: string]: Counter } = {
  applyKnowledge: {
    id: "applyKnowledge",
    name: "Применение знаний",
    value: 0
  },
  mining: {
    id: "mining",
    name: "Майнинг",
    value: 0
  }
};

// Упрощенные параметры майнинга
export const initialMiningParams: MiningParams = {
  miningEfficiency: 0.00001,
  networkDifficulty: 1.0,
  energyEfficiency: 0,
  exchangeRate: 20000, // Уменьшаем курс в 5 раз (было 100000)
  exchangeCommission: 0.05,
  volatility: 0.2,
  exchangePeriod: 3600,
  baseConsumption: 1
};

// Начальное состояние игры
export const initialState: GameState = {
  resources: initialResources,
  buildings: initialBuildings,
  upgrades: initialUpgrades,
  unlocks: {
    applyKnowledge: false,
    practice: false,
    research: false
  },
  counters: initialCounters,
  lastUpdate: Date.now(),
  lastSaved: Date.now(),
  gameStarted: false,
  prestigePoints: 0,
  phase: 1,
  eventMessages: {},
  gameTime: 0,
  miningParams: initialMiningParams,
  referralCode: "",
  referredBy: null,
  referrals: [],
  referralHelpers: [],
  specializationSynergies: {},
  knowledge: 0,
  btcPrice: 0,
  miningPower: 0,
  usdtBalance: 0,
  btcBalance: 0,
  version: "1.0.0",
  featureFlags: {},
  buildingUnlocked: {}
};
