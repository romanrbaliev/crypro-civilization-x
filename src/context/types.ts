
// Базовые типы
export type ResourceType = 'basic' | 'currency' | 'power' | 'computational' | 'crypto' | 'social';

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
  baseCost: Record<string, number>;
  costMultiplier: number;
  production: Record<string, number>;
  consumption?: Record<string, number>;
  maxCount?: number;
  requirements?: Record<string, number>;
  resourceProduction?: Record<string, number>;
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
}

export interface GameState {
  resources: { [key: string]: Resource };
  buildings: { [key: string]: Building };
  upgrades: { [key: string]: Upgrade };
  counters: { [key: string]: { id: string; value: number } };
  unlocks: { [key: string]: boolean };
  gameStarted: boolean;
  lastUpdate: number;
  lastSaved: number;
  phase: number;
  tab?: string;
  specializationSynergies?: Record<string, any>;
  specialization?: string;
  prestigePoints?: number;
  referralCode?: string;
  referredBy?: string;
  referrals?: any[];
  referralHelpers?: any[];
  stats?: {
    totalKnowledgeGained?: number;
    totalUsdtGained?: number;
    totalClicks?: number;
  };
  effects?: {
    knowledgeEfficiencyBoost?: number;
  };
  player?: {
    specialization: string | null;
  };
  research?: {
    [key: string]: {
      researched: boolean;
      cost: Record<string, number>;
    };
  };
  language?: string;
}

// Типы действий
export type GameAction =
  | { type: "START_GAME" }
  | { type: "RESET_GAME" }
  | { type: "SET_GAME_DATA"; payload: any }
  | { type: "LEARN_CRYPTO" }
  | { type: "APPLY_KNOWLEDGE" }
  | { type: "APPLY_ALL_KNOWLEDGE" }
  | { type: "UPDATE_RESOURCES"; payload?: { deltaTime: number } }
  | { type: "FORCE_RESOURCE_UPDATE" }
  | { type: "SET_TAB"; payload: { tab: string } }
  | { type: "PURCHASE_BUILDING"; payload: { buildingId: string } }
  | { type: "SELL_BUILDING"; payload: { buildingId: string } }
  | { type: "PURCHASE_UPGRADE"; payload: { upgradeId: string } }
  | { type: "CHOOSE_SPECIALIZATION"; payload: { specializationId: string } }
  | { type: "SET_LANGUAGE"; payload: { language: string } }
  // Добавляем недостающие типы действий
  | { type: "INCREMENT_RESOURCE"; payload: { resourceId: string; amount?: number } }
  | { type: "UNLOCK_RESOURCE"; payload: { resourceId: string } }
  | { type: "SET_BUILDING_UNLOCKED"; payload: { buildingId: string; unlocked: boolean } }
  | { type: "SET_UPGRADE_UNLOCKED"; payload: { upgradeId: string; unlocked: boolean } }
  | { type: "UNLOCK_FEATURE"; payload: { featureId: string } }
  | { type: "INCREMENT_COUNTER"; payload: { counterId: string; value?: number } }
  | { type: "PRACTICE_PURCHASE" }
  | { type: "CHECK_SYNERGIES" }
  | { type: "ACTIVATE_SYNERGY"; payload: { synergyId: string } }
  | { type: "PRESTIGE" }
  | { type: "RESTART_COMPUTERS" }
  | { type: "MINE_COMPUTING_POWER" }
  | { type: "CHECK_EQUIPMENT_STATUS" }
  | { type: "EXCHANGE_BTC" }
  | { type: "EXCHANGE_BITCOIN" }
  | { type: "LOAD_GAME"; payload: GameState }
  | { type: "SET_REFERRAL_CODE"; payload: { code: string } }
  | { type: "ADD_REFERRAL"; payload: { referral: any } }
  | { type: "ACTIVATE_REFERRAL"; payload: { referralId: string } }
  | { type: "HIRE_REFERRAL_HELPER"; payload: { referralId: string; buildingId: string } }
  | { type: "RESPOND_TO_HELPER_REQUEST"; payload: { helperId: string; accepted: boolean } }
  | { type: "UPDATE_REFERRAL_STATUS"; payload: { referralId: string; status: any } }
  | { type: "UPDATE_HELPERS"; payload: { updatedHelpers: any[] } };
