
import { Resource, Building, Upgrade, GameState, Counters, MiningParams } from './types';

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
    description: "Автоматически добывает BTC, потребляя вычислительную мощность и электричество",
    cost: { usdt: 50 },
    costMultiplier: 1.5, // Увеличен множитель стоимости
    production: {},
    count: 0,
    unlocked: false,
    requirements: { computingPower: 50 }
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
  algorithmOptimization: {
    id: "algorithmOptimization",
    name: "Оптимизация алгоритмов",
    description: "Увеличивает эффективность майнинга на 15%",
    cost: { knowledge: 100, usdt: 50 },
    effect: { miningEfficiencyBoost: 0.15 },
    unlocked: false,
    purchased: false,
    requirements: { autoMinerCount: 1 }
  },
  energyEfficiency: {
    id: "energyEfficiency",
    name: "Энергоэффективные компоненты",
    description: "Снижает потребление электричества при майнинге на 10%",
    cost: { knowledge: 120, usdt: 75 },
    effect: { energyEfficiencyBoost: 0.1 },
    unlocked: false,
    purchased: false,
    requirements: { autoMinerCount: 1 }
  },
  coolingSystem: {
    id: "coolingSystem",
    name: "Система охлаждения",
    description: "Увеличивает вычислительную мощность на 20% без перегрева",
    cost: { knowledge: 150, usdt: 100 },
    effect: { computingPowerBoost: 0.2 },
    unlocked: false,
    purchased: false,
    requirements: { algorithmOptimization: 1 }
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
    max: 10
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

// Начальные параметры майнинга
export const initialMiningParams: MiningParams = {
  miningEfficiency: 0.0001,
  networkDifficulty: 1.0,
  energyEfficiency: 0,
  exchangeRate: 100000, // 100,000 USDT за 1 BTC
  exchangeCommission: 0.05,
  volatility: 0.2,
  exchangePeriod: 3600, // 1 час игрового времени
  baseConsumption: 0.5
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
  miningParams: initialMiningParams,
  gameTime: 0
};
