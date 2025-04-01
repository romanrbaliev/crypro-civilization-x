import { ThrottlerOptions } from '@nestjs/throttler';

export interface Building {
  id: string;
  name: string;
  description: string;
  cost: { [resourceId: string]: number };
  production: { [resourceId: string]: number };
  count: number;
  unlocked: boolean;
  icon?: string;
  specialization?: string;
  effects?: { [effectId: string]: number };
}

export interface Resource {
  id: string;
  name: string;
  description: string;
  type: 'currency' | 'material' | 'science';
  value: number;
  baseProduction: number;
  production: number;
  consumption?: number;
  perSecond: number;
  max: number;
  unlocked: boolean;
  icon?: string;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: { [resourceId: string]: number };
  effect?: { [resourceId: string]: number };
  effects?: { [effectId: string]: number };
  unlocked: boolean;
  purchased: boolean;
  icon?: string;
  requiredUpgrades?: string[];
  unlockCondition?: {
    buildings?: { [buildingId: string]: number };
    resources?: { [resourceId: string]: number };
  };
  specialization?: string;
  tier?: number;
}

export interface Synergy {
  id: string;
  name: string;
  description: string;
  requirements: { [buildingId: string]: number };
  effects: { [resourceId: string]: number };
  unlocked: boolean;
  applied: boolean;
}

export interface GameState {
  resources: { [resourceId: string]: Resource };
  buildings: { [buildingId: string]: Building };
  upgrades: { [upgradeId: string]: Upgrade };
  synergies: { [synergyId: string]: Synergy };
  counters: { [counterId: string]: number | { value: number; updatedAt: number } };
  unlocks: { [unlockId: string]: boolean };
  miningParams?: MiningParams;
  gameStarted: boolean;
  multiBuy: boolean;
  specialization: string | null;
  referralCode: string | null;
  referredBy: string | null;
  referralBonusApplied: boolean;
  eventLog: string[];
  settings: GameSettings;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface MiningParams {
  miningEfficiency: number;
  energyEfficiency: number;
  networkDifficulty: number;
  exchangeRate: number;
  exchangeCommission: number;
  volatility: number;
  exchangePeriod: number;
  baseConsumption: number;
}

export type ResourceAction = {
  type: 'INCREMENT_RESOURCE' | 'DECREMENT_RESOURCE' | 'SET_RESOURCE' | 
        'UPDATE_RESOURCES' | 'FORCE_RESOURCE_UPDATE' | 'APPLY_ALL_KNOWLEDGE' | 'EXCHANGE_BTC';
  payload?: {
    resourceId?: string;
    amount?: number;
    conversionRate?: number;
  };
};

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'PURCHASE_BUILDING'; payload: { buildingId: string } }
  | { type: 'SELL_BUILDING'; payload: { buildingId: string } }
  | { type: 'PURCHASE_UPGRADE'; payload: { upgradeId: string } }
  | { type: 'UNLOCK_BUILDING'; payload: { buildingId: string } }
  | { type: 'TOGGLE_MULTIBUY' }
  | { type: 'CHOOSE_SPECIALIZATION'; payload: { specialization: string } }
  | { type: 'PROCESS_SYNERGY'; payload: { synergyId: string } }
  | { type: 'PROCESS_REFERRAL'; payload: { code: string } }
  | { type: 'CHECK_REFERRAL' }
  | { type: 'FORCE_CHECK_MINER_UNLOCK' }
  | { type: 'INCREMENT_COUNTER'; payload: { counterId: string; value: number } }
  | ResourceAction;

export type GameDispatch = (action: GameAction) => void;

export interface GameContextProps {
  state: GameState;
  dispatch: GameDispatch;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface ThrottlerModuleOptions {
  ttl?: number;
  limit?: number;
  options?: ThrottlerOptions;
}
