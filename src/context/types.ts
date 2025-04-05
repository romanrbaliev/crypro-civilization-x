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

// Интерфейс для майнинга параметров
export interface MiningParams {
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
  referralHelpers?: ReferralHelper[];
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
  miningParams?: MiningParams;
  eventMessages?: string[];
  gameTime?: number;
  totalPlayTime?: number;
  rebirths?: number;
  specializations?: Record<string, any>;
  synergies?: Record<string, any>;
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
  // Дополнительные типы действий
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
  | { type: "UPDATE_REFERRAL_STATUS"; payload: { referralId: string; status: any; activated?: boolean; hired?: boolean; buildingId?: string } }
  | { type: "UPDATE_HELPERS"; payload: { updatedHelpers: any[] } }
  | { type: "UNLOCK_BUILDING"; payload: { buildingId: string } }
  | { type: "RESEARCH_UPGRADE"; payload: { upgradeId: string } }
  | { type: "UNLOCK_RESEARCH" }
  | { type: "UNLOCK_BITCOIN_EXCHANGE" }
  | { type: "DEBUG_ADD_RESOURCES"; payload: { resources: Record<string, number> } }
  | { type: "UNLOCK_BUILDING_PRACTICE" }
  | { type: "UNLOCK_BUILDING_GENERATOR" };

// Интерфейс для специализации синергий
export interface SpecializationSynergy {
  id: string;
  name: string;
  description: string;
  requiredCategories: string[];
  requiredCount: number;
  bonus: Record<string, number>;
  unlocked?: boolean;
  active?: boolean;
}

// Тип для объекта диспетчера действий
export type GameDispatch = React.Dispatch<GameAction>;

// Тип для хелперов рефералов
export interface ReferralHelper {
  id: string;
  buildingId: string;
  helperId: string;
  status: string;
  request?: {
    buildingId: string;
  };
}

// Интерфейс для GameContext
export interface GameContextProps {
  state: GameState;
  dispatch: GameDispatch;
  forceUpdate?: () => void;
  isPageVisible?: boolean;
}

// Добавляем интерфейс GameEvent для использования в ReferralsTab
export interface GameEvent {
  id: string;
  timestamp: number;
  message: string;
  type: "success" | "warning" | "info" | "error";
}
