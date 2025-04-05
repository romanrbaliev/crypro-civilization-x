
import { GameState } from '@/types/game';

// Начальное состояние игры
export const initialState: GameState = {
  resources: {
    knowledge: {
      id: 'knowledge',
      name: 'Знания',
      description: 'Ваши знания о криптовалютах и блокчейне',
      type: 'primary',
      icon: 'brain',
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
      description: 'Стабильная криптовалюта, привязанная к доллару США',
      type: 'currency',
      icon: 'dollar',
      value: 0,
      max: 100,
      unlocked: false,
      baseProduction: 0,
      production: 0,
      perSecond: 0
    },
    electricity: {
      id: 'electricity',
      name: 'Электричество',
      description: 'Энергия для питания ваших устройств',
      type: 'resource',
      icon: 'zap',
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
      description: 'Вычислительная мощность для майнинга и других операций',
      type: 'resource',
      icon: 'cpu',
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
      description: 'Самая популярная криптовалюта в мире',
      type: 'currency',
      icon: 'bitcoin',
      value: 0,
      max: 1,
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
      description: 'Автоматизирует получение знаний',
      type: 'production',
      count: 0,
      unlocked: false,
      cost: { usdt: 10 },
      costMultiplier: 1.12,
      production: { knowledge: 1 }
    },
    generator: {
      id: 'generator',
      name: 'Генератор',
      description: 'Производит электричество для ваших устройств',
      type: 'production',
      count: 0,
      unlocked: false,
      cost: { usdt: 20 },
      costMultiplier: 1.12,
      production: { electricity: 0.5 }
    },
    cryptoWallet: {
      id: 'cryptoWallet',
      name: 'Криптокошелек',
      description: 'Увеличивает максимальный запас USDT и знаний',
      type: 'storage',
      count: 0,
      unlocked: false,
      cost: { usdt: 30, knowledge: 50 },
      costMultiplier: 1.15,
      effects: { 
        maxUsdt: 50,
        maxKnowledge: 25
      }
    },
    homeComputer: {
      id: 'homeComputer',
      name: 'Домашний компьютер',
      description: 'Производит вычислительную мощность, потребляя электричество',
      type: 'production',
      count: 0,
      unlocked: false,
      cost: { usdt: 55 },
      costMultiplier: 1.15,
      production: { computingPower: 2 },
      consumption: { electricity: 1 }
    }
  },
  upgrades: {
    blockchainBasics: {
      id: 'blockchainBasics',
      name: 'Основы блокчейна',
      description: 'Увеличивает максимальное хранение и производство знаний',
      type: 'research',
      purchased: false,
      unlocked: false,
      cost: { knowledge: 100 },
      effects: {
        maxKnowledgeMultiplier: 1.5,
        knowledgeProductionMultiplier: 1.1
      }
    },
    walletSecurity: {
      id: 'walletSecurity',
      name: 'Безопасность криптокошельков',
      description: 'Увеличивает максимальное хранение USDT',
      type: 'research',
      purchased: false,
      unlocked: false,
      cost: { knowledge: 175 },
      effects: {
        maxUsdtMultiplier: 1.25
      }
    },
    internetConnection: {
      id: 'internetConnection',
      name: 'Интернет-канал',
      description: 'Увеличивает скорость получения знаний и эффективность вычислений',
      type: 'tech',
      purchased: false,
      unlocked: false,
      cost: { usdt: 75 },
      effects: {
        knowledgeProductionMultiplier: 1.2,
        computingPowerMultiplier: 1.05
      }
    }
  },
  counters: {
    applyKnowledge: {
      id: 'applyKnowledge',
      name: 'Применения знаний',
      value: 0
    },
    buildingsPurchased: {
      id: 'buildingsPurchased',
      name: 'Приобретено зданий',
      value: 0
    },
    upgradesPurchased: {
      id: 'upgradesPurchased',
      name: 'Приобретено улучшений',
      value: 0
    }
  },
  knowledge: 0,
  btcPrice: 60000, // Курс BTC к USDT
  miningPower: 0,
  usdtBalance: 0,
  btcBalance: 0,
  gameStarted: false,
  lastUpdate: Date.now(),
  lastSaved: Date.now(),
  version: '0.1.0',
  featureFlags: {},
  buildingUnlocked: {},
  specializationSynergies: {},
  referralCode: null,
  referredBy: null,
  referrals: [],
  referralHelpers: [],
  unlocks: {
    knowledge: true
  },
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
