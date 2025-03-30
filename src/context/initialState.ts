
import { GameState } from './types';

// Правильно установленное начальное состояние игры
export const initialState: GameState = {
  gameStarted: false,
  gameTime: 0,
  lastUpdate: Date.now(),
  phase: 1,
  specialization: null,
  prestigePoints: 0,
  eventMessages: [],
  unlocks: {
    knowledge: true, // Знания доступны с самого начала
  },
  resources: {
    knowledge: {
      id: 'knowledge',
      name: 'Знания',
      description: 'Знания о криптовалюте и блокчейне',
      type: 'resource',
      icon: 'book',
      value: 0,
      baseProduction: 0, // Базовое производство
      production: 0,
      perSecond: 0,
      max: 100,
      unlocked: true
    }
  },
  buildings: {
    // Все здания изначально заблокированы
  },
  upgrades: {
    // Здесь будут определены исследования, которые будут разблокированы позже
  },
  miningParams: {
    miningEfficiency: 1, // Базовая эффективность майнинга 
    networkDifficulty: 1,
    energyEfficiency: 0,
    exchangeRate: 20000, // Базовый курс BTC/USDT
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

// Добавляем экспорт начальных зданий для инициализации
export const initialBuildings = {
  coolingSystem: {
    id: 'coolingSystem',
    name: 'Система охлаждения',
    description: 'Снижает потребление энергии компьютерами на 20%',
    cost: { 
      usdt: 120,
      electricity: 50 
    },
    count: 0,
    unlocked: false,
    productionBoost: 0,
    // другие свойства системы охлаждения
  }
  // Здесь могут быть определены другие здания
};
