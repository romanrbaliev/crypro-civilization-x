
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
}

export interface Resource {
  id: string;
  name: string;
  description: string;
  value: number;
  baseProduction: number;
  production: number;
  unlockedBy?: string;
  unlocked: boolean;
  type: string;
  perSecond: number;
  max: number;
  icon: string;
}

export interface Building {
  id: string;
  name: string;
  description: string;
  cost: { [key: string]: number };
  production: { [key: string]: number };
  count: number;
  unlocked: boolean;
  unlockedBy?: string;
  productionBoost: number;
  costMultiplier: number;
  requirements?: { [key: string]: number };
  maxCount?: number;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: { [key: string]: number };
  effects: { [key: string]: any };
  effect?: { [key: string]: any }; // For backwards compatibility
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

export type GameAction =
  | { type: "INCREMENT_RESOURCE"; payload: { resourceId: string; amount: number } }
  | { type: "UPDATE_RESOURCES" }
  | { type: "PURCHASE_BUILDING"; payload: { buildingId: string } }
  | { type: "PRACTICE_PURCHASE" }
  | { type: "PURCHASE_UPGRADE"; payload: { upgradeId: string } }
  | { type: "UNLOCK_FEATURE"; payload: { featureId: string } }
  | { type: "UNLOCK_RESOURCE"; payload: { resourceId: string } }
  | { type: "SET_BUILDING_UNLOCKED"; payload: { buildingId: string; unlocked: boolean } }
  | { type: "INCREMENT_COUNTER"; payload: { counterId: string; value?: number } }
  | { type: "CHECK_SYNERGIES" }
  | { type: "ACTIVATE_SYNERGY"; payload: { synergyId: string } }
  | { type: "LOAD_GAME"; payload: Partial<GameState> }
  | { type: "START_GAME" }
  | { type: "PRESTIGE" }
  | { type: "RESET_GAME" }
  | { type: "RESTART_COMPUTERS" }
  | { type: "MINE_COMPUTING_POWER" }
  | { type: "APPLY_KNOWLEDGE" }
  | { type: "EXCHANGE_BTC" }
  | { type: "SET_REFERRAL_CODE"; payload: { code: string } }
  | { type: "ADD_REFERRAL"; payload: { referral: any } }
  | { type: "ACTIVATE_REFERRAL"; payload: { referralId: string } }
  | { type: "HIRE_REFERRAL_HELPER"; payload: { referralId: string; buildingId: string } }
  | { type: "RESPOND_TO_HELPER_REQUEST"; payload: { helperId: string; accepted: boolean } }
  | { type: "UPDATE_REFERRAL_STATUS"; payload: { referralId: string; activated: boolean } };
