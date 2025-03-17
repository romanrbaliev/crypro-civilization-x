
import { Resource, Building, Upgrade, GameState, Counters } from './types';

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
    description: "Автоматически конвертирует вычислительную мощность в USDT",
    cost: { usdt: 50 },
    costMultiplier: 1.2,
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
  lastSaved: Date.now(), // Добавляем свойство lastSaved
  gameStarted: false,
  prestigePoints: 0,
  phase: 1,
  eventMessages: {},
  counters: initialCounters
};
