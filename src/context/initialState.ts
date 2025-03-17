
import { Resource, Building, Upgrade, GameState, Counters, MiningSettings } from './types';

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
    maxCount: Infinity
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
    requirements: { usdt: 11 }
  },
  homeComputer: {
    id: "homeComputer",
    name: "Домашний компьютер",
    description: "Обеспечивает вычислительную мощность, потребляет 0.5 электричества/сек за каждую единицу",
    cost: { usdt: 30, electricity: 5 },
    costMultiplier: 1.15,
    production: { computingPower: 2 },
    count: 0,
    unlocked: false,
    requirements: { electricity: 10 }
  },
  autoMiner: {
    id: "autoMiner",
    name: "Автомайнер",
    description: "Автоматически добывает BTC, используя вычислительную мощность и электричество",
    cost: { usdt: 50 },
    costMultiplier: 1.2,
    production: { btc: 0.0001 },  // Скорость производства BTC в секунду
    count: 0,
    unlocked: false,
    requirements: { computingPower: 50 },
    active: true,
    consumptionRate: { electricity: 0.5, computingPower: 1 } // Потребление в секунду
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
    requirements: { basicBlockchain: 1 }
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
    requirements: { usdt: 45 }
  }
};

// Начальные улучшения
export const initialUpgrades: { [key: string]: Upgrade } = {
  basicBlockchain: {
    id: "basicBlockchain",
    name: "Основы блокчейна",
    description: "Открывает базовые механики криптовалют и увеличивает хранилище знаний",
    cost: { knowledge: 50 },
    effect: { knowledgeBoost: 0.1, knowledgeMaxBoost: 0.5 },
    unlocked: false,
    purchased: false,
    requirements: { generatorCount: 1 }
  },
  walletSecurity: {
    id: "walletSecurity",
    name: "Безопасность криптокошельков",
    description: "Увеличивает максимальное хранение криптовалют",
    cost: { knowledge: 75 },
    effect: { usdtMaxBoost: 0.25 },
    unlocked: false,
    purchased: false,
    requirements: { cryptoWalletCount: 1 }
  },
  miningOptimization: {
    id: "miningOptimization",
    name: "Оптимизация алгоритмов",
    description: "Повышает эффективность майнинга на 15%",
    cost: { knowledge: 100, usdt: 50 },
    effect: { miningEfficiencyBoost: 0.15 },
    unlocked: false,
    purchased: false,
    requirements: { autoMinerCount: 1 }
  },
  energyEfficiency: {
    id: "energyEfficiency",
    name: "Энергоэффективные компоненты",
    description: "Снижает потребление электричества на 10%",
    cost: { knowledge: 120, usdt: 70 },
    effect: { energyEfficiencyBoost: 0.10 },
    unlocked: false,
    purchased: false,
    requirements: { autoMinerCount: 1 }
  },
  coolingSystem: {
    id: "coolingSystem",
    name: "Система охлаждения",
    description: "Увеличивает производительность майнинга на 20% без увеличения потребления",
    cost: { knowledge: 150, usdt: 100, electricity: 200 },
    effect: { miningPowerBoost: 0.20 },
    unlocked: false,
    purchased: false,
    requirements: { autoMinerCount: 2 }
  },
  tradingBot: {
    id: "tradingBot",
    name: "Торговый бот",
    description: "Автоматизирует обмен BTC по заданным условиям",
    cost: { knowledge: 200, usdt: 150 },
    effect: { autoTradingEnabled: 1, exchangeFeeReduction: 0.02 },
    unlocked: false,
    purchased: false,
    requirements: { autoMinerCount: 1, btc: 0.001 }
  }
};

// Начальные ресурсы
export const initialResources: { [key: string]: Resource } = {
  knowledge: {
    id: "knowledge",
    name: "Знания о крипте",
    icon: "",
    value: 0,
    perSecond: 0,
    unlocked: true,
    max: 100
  },
  usdt: {
    id: "usdt",
    name: "USDT",
    icon: "",
    value: 0,
    perSecond: 0,
    unlocked: false,
    max: 50
  },
  electricity: {
    id: "electricity",
    name: "Электричество",
    icon: "",
    value: 0,
    perSecond: 0,
    unlocked: false,
    max: 1000
  },
  computingPower: {
    id: "computingPower",
    name: "Вычислительная мощность",
    icon: "💻",
    value: 0,
    perSecond: 0,
    unlocked: false,
    max: Infinity
  },
  btc: {
    id: "btc",
    name: "Bitcoin",
    icon: "₿",
    value: 0,
    perSecond: 0,
    unlocked: false,
    max: Infinity
  },
  reputation: {
    id: "reputation",
    name: "Репутация",
    icon: "",
    value: 0,
    perSecond: 0,
    unlocked: false,
    max: Infinity
  }
};

// Начальные счетчики
export const initialCounters: Counters = {
  applyKnowledge: 0,
  mining: 0
};

// Начальные настройки майнинга
export const initialMiningSettings: MiningSettings = {
  autoExchange: false,
  exchangeThreshold: 0.001,
  notifyOnGoodRate: true,
  goodRateThreshold: 1.1 // Курс на 10% выше базового
};

// Начальное состояние игры
export const initialState: GameState = {
  resources: initialResources,
  buildings: initialBuildings,
  upgrades: initialUpgrades,
  unlocks: {
    applyKnowledge: false,
    practice: false
  },
  lastUpdate: Date.now(),
  lastSaved: Date.now(),
  gameStarted: false,
  prestigePoints: 0,
  phase: 1,
  eventMessages: {},
  counters: initialCounters,
  // Начальные параметры криптоэкономики
  btcExchangeRate: 20000, // Базовый курс BTC к USDT
  networkDifficulty: 1.0, // Начальная сложность сети
  miningEfficiency: 0.0001, // Базовая эффективность майнинга
  energyEfficiency: 0, // Начальная энергоэффективность (0-1)
  exchangeFee: 0.05, // Комиссия за обмен (5%)
  miningSettings: initialMiningSettings
};

