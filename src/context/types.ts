export interface Resource {
  id: string;
  name: string;
  icon: string;
  value: number;
  perSecond: number;
  unlocked: boolean;
  max: number;
}

export interface Building {
  id: string;
  name: string;
  description: string;
  cost: { [resourceId: string]: number };
  costMultiplier: number;
  production: { [resourceId: string]: number };
  count: number;
  unlocked: boolean;
  requirements?: { [resourceId: string]: number };
  maxCount?: number;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: { [resourceId: string]: number };
  effect: { [effectId: string]: number };
  unlocked: boolean;
  purchased: boolean;
  requirements?: { [key: string]: number };
  category?: string;
  tier?: number;
  requiredUpgrades?: string[];
  unlockCondition?: {
    buildings?: { [buildingId: string]: number };
    resources?: { [resourceId: string]: number };
  };
  specialization?: string | null;
  synergy?: { [specializationId: string]: number };
}

export interface SpecializationSynergy {
  id: string;
  name: string;
  description: string;
  requiredCategories: string[];
  requiredCount: number;
  bonus: { [effectId: string]: number };
  unlocked: boolean;
  active: boolean;
}

export interface Referral {
  id: string;
  username: string;
  activated: boolean;
  joinedAt: number;
  helperStatus?: ReferralHelper;
}

export interface Unlocks {
  [featureId: string]: boolean;
}

export interface EventMessages {
  [eventId: string]: boolean;
}

export interface Counters {
  [counterId: string]: number;
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

export interface GameState {
  resources: { [key: string]: Resource };
  buildings: { [key: string]: Building };
  upgrades: { [key: string]: Upgrade };
  unlocks: { [key: string]: boolean };
  lastUpdate: number;
  lastSaved: number;
  gameStarted: boolean;
  prestigePoints: number;
  phase: number;
  eventMessages: { [key: string]: any };
  counters: Counters;
  miningParams: MiningParams;
  gameTime: number;
  referralCode: string;
  referredBy: string | null;
  referrals: Referral[];
  referralHelpers: ReferralHelper[];
  specializationSynergies: { [key: string]: SpecializationSynergy };
}

export type GameAction =
  | { type: "INCREMENT_RESOURCE"; payload: { resourceId: string; amount?: number } }
  | { type: "UPDATE_RESOURCES" }
  | { type: "PURCHASE_BUILDING"; payload: { buildingId: string } }
  | { type: "PRACTICE_PURCHASE" }
  | { type: "PURCHASE_UPGRADE"; payload: { upgradeId: string } }
  | { type: "UNLOCK_FEATURE"; payload: { featureId: string } }
  | { type: "UNLOCK_RESOURCE"; payload: { resourceId: string } }
  | { type: "SET_BUILDING_UNLOCKED"; payload: { buildingId: string; unlocked: boolean } }
  | { type: "INCREMENT_COUNTER"; payload: { counterId: string } }
  | { type: "START_GAME" }
  | { type: "LOAD_GAME"; payload: GameState }
  | { type: "PRESTIGE" }
  | { type: "RESET_GAME" }
  | { type: "RESTART_COMPUTERS" }
  | { type: "APPLY_KNOWLEDGE" }
  | { type: "MINE_COMPUTING_POWER" }
  | { type: "EXCHANGE_BTC" }
  | { type: "SET_REFERRAL_CODE"; payload: { code: string } }
  | { type: "ADD_REFERRAL"; payload: { referral: Referral } }
  | { type: "ACTIVATE_REFERRAL"; payload: { referralId: string } }
  | { type: "HIRE_REFERRAL_HELPER"; payload: { referralId: string; buildingId: string } }
  | { type: "RESPOND_TO_HELPER_REQUEST"; payload: { helperId: string; accepted: boolean } }
  | { type: "CHECK_SYNERGIES" }
  | { type: "ACTIVATE_SYNERGY"; payload: { synergyId: string } };
