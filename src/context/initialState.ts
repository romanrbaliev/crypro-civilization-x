
import { Resource, Building, Upgrade, GameState } from './types';

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
    requirements: { usdt: 1 }
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
    requirements: { usdt: 20 }
  },
  homeComputer: {
    id: "homeComputer",
    name: "Домашний компьютер",
    description: "Обеспечивает вычислительную мощность, потребляет 1 эл/сек",
    cost: { usdt: 30, electricity: 5 },
    costMultiplier: 1.15,
    production: { computingPower: 2 },
    count: 0,
    unlocked: false,
    requirements: { usdt: 25, electricity: 10 }
  },
  cryptoWallet: {
    id: "cryptoWallet",
    name: "Криптокошелек",
    description: "Увеличивает максимальное хранение USDT",
    cost: { usdt: 15, knowledge: 25 },
    costMultiplier: 1.2,
    production: { usdtMax: 50 },
    count: 0,
    unlocked: false,
    requirements: { knowledge: 20 }
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
    description: "Открывает базовые механики криптовалют",
    cost: { knowledge: 50 },
    effect: { knowledgeBoost: 0.1 },
    unlocked: false,
    purchased: false,
    requirements: { knowledge: 45 }
  },
  cryptoTrading: {
    id: "cryptoTrading",
    name: "Криптовалютный трейдинг",
    description: "Открывает возможность обмена между криптовалютами",
    cost: { knowledge: 100, usdt: 20 },
    effect: { conversionRate: 0.15 },
    unlocked: false,
    purchased: false,
    requirements: { knowledge: 80, usdt: 15 }
  },
  walletSecurity: {
    id: "walletSecurity",
    name: "Безопасность криптокошельков",
    description: "Увеличивает максимальное хранение криптовалют",
    cost: { knowledge: 75 },
    effect: { usdtMaxBoost: 0.25 },
    unlocked: false,
    purchased: false,
    requirements: { knowledge: 70 }
  }
};

// Начальные ресурсы
export const initialResources: { [key: string]: Resource } = {
  knowledge: {
    id: "knowledge",
    name: "Знания о крипте",
    icon: "🧠",
    value: 0,
    perSecond: 0,
    unlocked: true,
    max: 100
  },
  usdt: {
    id: "usdt",
    name: "USDT",
    icon: "💰",
    value: 0,
    perSecond: 0,
    unlocked: false,
    max: 50
  },
  electricity: {
    id: "electricity",
    name: "Электричество",
    icon: "⚡",
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
    max: 1000
  },
  reputation: {
    id: "reputation",
    name: "Репутация",
    icon: "⭐",
    value: 0,
    perSecond: 0,
    unlocked: false,
    max: Infinity
  }
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
  gameStarted: false,
  prestigePoints: 0,
  phase: 1,
  eventMessages: {}
};
