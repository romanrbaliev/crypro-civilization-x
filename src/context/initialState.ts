
import { GameState } from '../types/game';

// Базовое начальное состояние игры
export const initialState: GameState = {
  resources: {
    knowledge: {
      id: 'knowledge',
      name: 'Знания',
      description: 'Базовые знания о криптовалютах и блокчейне',
      type: 'primary',
      icon: 'knowledge',
      value: 0,
      max: 100,
      unlocked: true,
      baseProduction: 0,
      production: 0,
      perSecond: 0
    },
    usdt: {
      id: 'usdt',
      name: 'USDT',
      description: 'Стабильная криптовалюта, привязанная к доллару',
      type: 'currency',
      icon: 'usdt',
      value: 0,
      max: 50,
      unlocked: false,
      baseProduction: 0,
      production: 0,
      perSecond: 0
    },
    electricity: {
      id: 'electricity',
      name: 'Электричество',
      description: 'Энергия для питания майнинговых ферм и компьютеров',
      type: 'resource',
      icon: 'electricity',
      value: 0,
      max: 100,
      unlocked: false,
      baseProduction: 0,
      production: 0,
      perSecond: 0
    },
    computingPower: {
      id: 'computingPower',
      name: 'Вычислительная мощность',
      description: 'Необходима для майнинга криптовалют',
      type: 'resource',
      icon: 'computing',
      value: 0,
      max: 100,
      unlocked: false,
      baseProduction: 0,
      production: 0,
      perSecond: 0
    },
    bitcoin: {
      id: 'bitcoin',
      name: 'Bitcoin',
      description: 'Первая и основная криптовалюта',
      type: 'currency',
      icon: 'bitcoin',
      value: 0,
      max: 0.01,
      unlocked: false,
      baseProduction: 0,
      production: 0,
      perSecond: 0
    }
  },
  buildings: {
    practice: {
      id: 'practice',
      name: 'Практика',
      description: 'Автоматически генерирует знания',
      type: 'production',
      cost: { usdt: 10 },
      costMultiplier: 1.12,
      count: 0,
      unlocked: false,
      production: { knowledge: 1 }
    },
    generator: {
      id: 'generator',
      name: 'Генератор',
      description: 'Производит электричество',
      type: 'production',
      cost: { usdt: 20 },
      costMultiplier: 1.12,
      count: 0,
      unlocked: false,
      production: { electricity: 0.5 }
    },
    homeComputer: {
      id: 'homeComputer',
      name: 'Домашний компьютер',
      description: 'Производит вычислительную мощность',
      type: 'production',
      cost: { usdt: 55 },
      costMultiplier: 1.15,
      count: 0,
      unlocked: false,
      production: { computingPower: 2 },
      consumption: { electricity: 1 }
    },
    cryptoWallet: {
      id: 'cryptoWallet',
      name: 'Криптокошелек',
      description: 'Увеличивает максимальный запас USDT и знаний',
      type: 'storage',
      cost: { usdt: 30, knowledge: 50 },
      costMultiplier: 1.15,
      count: 0,
      unlocked: false
    },
    internetChannel: {
      id: 'internetChannel',
      name: 'Интернет-канал',
      description: 'Увеличивает скорость получения знаний и эффективность вычислений',
      type: 'boost',
      cost: { usdt: 75 },
      costMultiplier: 1.15,
      count: 0,
      unlocked: false
    },
    miner: {
      id: 'miner',
      name: 'Майнер',
      description: 'Добывает Bitcoin используя электричество и вычислительную мощность',
      type: 'production',
      cost: { usdt: 150 },
      costMultiplier: 1.15,
      count: 0,
      unlocked: false,
      production: { bitcoin: 0.00005 },
      consumption: { electricity: 1, computingPower: 5 }
    }
  },
  upgrades: {
    blockchainBasics: {
      id: 'blockchainBasics',
      name: 'Основы блокчейна',
      description: 'Увеличивает макс. хранение знаний и скорость их получения',
      type: 'research',
      cost: { knowledge: 100 },
      purchased: false,
      unlocked: false,
      effects: { knowledgeMax: 1.5, knowledgeProduction: 1.1 }
    },
    walletSecurity: {
      id: 'walletSecurity',
      name: 'Безопасность криптокошельков',
      description: 'Увеличивает макс. хранение USDT',
      type: 'research',
      cost: { knowledge: 175 },
      purchased: false,
      unlocked: false,
      effects: { usdtMax: 1.25 }
    },
    cryptoBasics: {
      id: 'cryptoBasics',
      name: 'Основы криптовалют',
      description: 'Увеличивает эффективность применения знаний',
      type: 'research',
      cost: { knowledge: 200 },
      purchased: false,
      unlocked: false,
      effects: { knowledgeEfficiency: 1.1 }
    }
  },
  counters: {
    applyKnowledge: {
      id: 'applyKnowledge',
      name: 'Применение знаний',
      value: 0
    },
    practicePurchase: {
      id: 'practicePurchase',
      name: 'Покупка практики',
      value: 0
    }
  },
  knowledge: 0,
  btcPrice: 0,
  miningPower: 0,
  usdtBalance: 0,
  btcBalance: 0,
  gameStarted: false,
  lastUpdate: Date.now(),
  lastSaved: Date.now(),
  version: '1.0.0',
  featureFlags: {},
  buildingUnlocked: {},
  specializationSynergies: {},
  referralCode: null,
  referredBy: null,
  referrals: [],
  referralHelpers: [],
  unlocks: {},
  prestigePoints: 0,
  eventMessages: {},
  gameTime: 0,
  miningParams: {
    miningEfficiency: 1.0,
    networkDifficulty: 1.0,
    energyEfficiency: 1.0,
    exchangeRate: 1.0,
    exchangeCommission: 0.01,
    volatility: 0.05,
    exchangePeriod: 60,
    baseConsumption: 1.0
  },
  phase: 1
};
