import { ReferralStatusUpdate } from '../api/referral/referralTypes';

export type ResourceType = 'primary' | 'currency' | 'resource';

export interface GameState {
  resources: { [key: string]: Resource };
  buildings: { [key: string]: Building };
  upgrades: { [key: string]: Upgrade };
  counters: { [key: string]: Counter };
  knowledge: number;
  btcPrice: number;
  miningPower: number;
  usdtBalance: number;
  btcBalance: number;
  gameStarted: boolean;
  lastUpdate: number;
  lastSaved: number;
  version: string;
  featureFlags: { [key: string]: boolean };
  buildingUnlocked: { [key: string]: boolean };
  specializationSynergies: { [key: string]: SpecializationSynergy };
  referralCode: string | null;
  referredBy: string | null;
  referrals: any[];
  referralHelpers: ReferralHelper[];
  unlocks: { [key: string]: boolean };
  prestigePoints: number;
  eventMessages: { [key: string]: any };
  gameTime: number;
  miningParams: MiningParams;
  phase: number;
  specialization?: string;
}

export interface Resource {
  id: string;
  name: string;
  description: string;
  icon?: string;
  type: ResourceType;
  value: number;
  unlocked: boolean;
  max: number;
  baseProduction: number;
  production: number;
  perSecond: number;
  consumption?: number;
}

export interface Building {
  id: string;
  name: string;
  description: string;
  count: number;
  unlocked: boolean;
  cost: { [key: string]: number };
  costMultiplier?: number;
  production?: { [key: string]: number };
  consumption?: { [key: string]: number };
  effects?: { [key: string]: number };
  unlockedAt?: number;
  disabled?: boolean;
  capacity?: number;
  specialization?: string;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: { [key: string]: number };
  effects: { [key: string]: any };
  effect?: { [key: string]: any };
  purchased: boolean;
  unlocked: boolean;
  unlockedBy?: string;
  category?: string;
  tier?: number;
  specialization?: string;
  requirements?: { [key: string]: any };
  unlockCondition?: { 
    buildings?: { [key: string]: number },
    resources?: { [key: string]: number }
  };
  requiredUpgrades?: string[];
  type?: string;
}

export interface Counter {
  id: string;
  name: string;
  value: number;
}

export interface Synergy {
  id: string;
  name: string;
  description: string;
  effects: { [key: string]: any };
  isActivated: boolean;
  activationCost: number;
  type: string;
  unlocked: boolean;
  active: boolean;
  requiredCategories?: string[];
  requiredCount?: number;
  bonus?: { [key: string]: number };
}

export interface SpecializationSynergy {
  id: string;
  name: string;
  description: string;
  requiredCategories: string[];
  requiredCount: number;
  bonus: { [key: string]: number };
  unlocked: boolean;
  active: boolean;
}

export interface ReferralHelper {
  id: string;
  buildingId: string;
  helperId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
  employerId?: string;
}

export interface MiningParams {
  miningEfficiency: number;
  networkDifficulty: number;
  energyEfficiency: number;
  exchangeRate: number;
  exchangeCommission: number;
  volatility: number;
  exchangePeriod: number;
  baseConsumption: number;
}

export type Counters = { [key: string]: Counter };

export type GameDispatch = React.Dispatch<GameAction>;

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'SET_GAME_DATA'; payload: GameState }
  | { type: 'LEARN_CRYPTO' }
  | { type: 'APPLY_KNOWLEDGE' }
  | { type: 'APPLY_ALL_KNOWLEDGE' }
  | { type: 'UPDATE_RESOURCES' }
  | { type: 'FORCE_RESOURCE_UPDATE' }
  | { type: 'SET_TAB'; payload: { tab: string } }
  | { type: 'PURCHASE_BUILDING'; payload: { buildingId: string } }
  | { type: 'SELL_BUILDING'; payload: { buildingId: string } }
  | { type: 'UNLOCK_BUILDING'; payload: { buildingId: string } }
  | { type: 'RESEARCH_UPGRADE'; payload: { upgradeId: string } }
  | { type: 'UNLOCK_RESEARCH' }
  | { type: 'UNLOCK_BITCOIN_EXCHANGE' }
  | { type: 'EXCHANGE_BITCOIN' }
  | { type: 'DEBUG_ADD_RESOURCES'; payload: { resourceId: string; amount: number } }
  | { type: 'UNLOCK_BUILDING_PRACTICE' }
  | { type: 'UNLOCK_BUILDING_GENERATOR' }
  | { type: 'CHOOSE_SPECIALIZATION'; payload: { specializationId: string } }
  | { type: 'SET_LANGUAGE'; payload: { language: string } };
