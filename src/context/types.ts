
// Базовые типы
export type ResourceType = 'basic' | 'currency' | 'power' | 'computational' | 'crypto' | 'social' | 'resource';

export interface Resource {
  id: string;
  name: string;
  description: string;
  icon?: string;
  type: ResourceType;
  value: number;
  max: number;
  unlocked: boolean;
  baseProduction: number;
  production: number;
  perSecond: number;
  consumption: number;
}

export interface Building {
  id: string;
  name: string;
  description: string;
  count: number;
  unlocked: boolean;
  baseCost?: { [resourceId: string]: number }; // Базовая стоимость здания
  cost: { [resourceId: string]: number }; // Текущая стоимость здания (обязательное поле)
  costMultiplier: number;
  production?: { [resourceId: string]: number };
  consumption?: { [resourceId: string]: number };
  effects?: { [effectId: string]: number | string };
  requirements?: { [resourceId: string]: number };
  maxLevel?: number;
  specialization?: string;
  resourceProduction?: { [resourceId: string]: number }; // Добавляем свойство resourceProduction
  type?: string;
  productionBoost?: { [resourceId: string]: number };
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: Record<string, number>;
  purchased: boolean;
  unlocked: boolean;
  type: string;
  effects: any;
  effect?: any;
  category?: string;
  tier?: number;
  specialization?: string;
  unlockCondition?: Record<string, any>;
  requiredUpgrades?: string[];
}

// Тип для игрового состояния
export interface GameState {
  gameStarted: boolean;
  lastUpdate: number;
  lastSaved: number;
  totalPlayTime: number;
  rebirths: number;
  prestigePoints: number;
  language: string;
  phase: number;
  counters: Record<string, { id: string; value: number }>;
  resources: Record<string, Resource>;
  buildings: Record<string, Building>;
  upgrades: Record<string, Upgrade>;
  unlocks: Record<string, boolean>;
  miningParams: {
    difficulty: number;
    hashrate: number;
    blockReward: number;
    lastBlockTime: number;
    exchangeRate?: number;
    exchangeCommission?: number;
    miningEfficiency?: number;
    energyEfficiency?: number;
    networkDifficulty?: number;
    volatility?: number;
  };
  specializations?: Record<string, any>;
  synergies?: Record<string, any>;
  referralCode?: string | null;
  referrals?: any[];
  referralHelpers?: any[];
  player?: Record<string, any>;
}

// Типы действий для редьюсера
export type GameAction = {
  type: string;
  payload?: any;
};
