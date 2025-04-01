
export interface ThrottlerOptions {
  ttl?: number;
  limit?: number;
}

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
  consumption?: { [resourceId: string]: number }; 
  costMultiplier?: number;
  productionBoost?: number;
  requirements?: { [resourceId: string]: number };
  resourceProduction?: { [resourceId: string]: number };
  category?: string;
}

export interface Resource {
  id: string;
  name: string;
  description: string;
  type: 'currency' | 'material' | 'science' | 'resource';
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
  category?: string;
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

export interface SpecializationSynergy {
  id: string;
  name: string;
  description: string;
  requiredCategories?: string[];
  requiredCount?: number;
  effects: { [resourceId: string]: number };
  unlocked: boolean;
  active: boolean;
  bonus?: { [key: string]: number };  // Добавляем поле bonus для совместимости
}

export interface ReferralHelper {
  id: string;
  helperId: string;
  userId: string;
  buildingId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
  updatedAt: number;
  boostValue?: number;
}

export interface GameState {
  resources: { [resourceId: string]: Resource };
  buildings: { [buildingId: string]: Building };
  upgrades: { [upgradeId: string]: Upgrade };
  synergies: { [synergyId: string]: Synergy };
  counters: { [counterId: string]: number | { value: number; updatedAt: number } };
  unlocks: { [unlockId: string]: boolean | number };  // Разрешаем как boolean, так и number
  miningParams?: MiningParams;
  gameStarted: boolean;
  multiBuy: boolean;
  specialization: string | null;
  referralCode: string | null;
  referredBy: string | null;
  referralBonusApplied: boolean;
  eventLog: string[];
  settings: GameSettings;
  lastUpdate?: number;
  lastSaved?: number;
  gameTime?: number;
  phase?: number;
  prestigePoints?: number;
  eventMessages?: { [key: string]: any };
  referrals?: any[];
  referralHelpers?: ReferralHelper[];
  specializationSynergies?: { [key: string]: SpecializationSynergy };
  knowledge?: number;
  btcPrice?: number;
  miningPower?: number;
  usdtBalance?: number;
  btcBalance?: number;
  version?: string;
  featureFlags?: { [key: string]: boolean };
  buildingUnlocked?: { [key: string]: boolean };
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  notificationsEnabled: boolean;
  multibuy?: boolean;
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
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'RESET_GAME' }
  | { type: 'SET_BUILDING_UNLOCKED'; payload: { buildingId: string; unlocked: boolean } }
  | { type: 'SET_UPGRADE_UNLOCKED'; payload: { upgradeId: string; unlocked: boolean } }
  | { type: 'ADD_REFERRAL'; payload: { referral: any } }
  | { type: 'RESPOND_TO_HELPER_REQUEST'; payload: { helperId: string; accepted: boolean } }
  | { type: 'SET_REFERRAL_CODE'; payload: { code: string } }
  | { type: 'UPDATE_REFERRAL_STATUS'; payload: { referralId: string; hired: boolean; buildingId?: string } }
  | { type: 'HIRE_REFERRAL_HELPER'; payload: { referralId: string; buildingId: string } }
  | { type: 'UPDATE_HELPERS'; payload: { updatedHelpers: ReferralHelper[] } }
  | { type: 'ACTIVATE_SYNERGY'; payload: { synergyId: string } }
  | { type: 'CHECK_SYNERGIES' }
  | ResourceAction;

export type GameDispatch = (action: GameAction) => void;

export interface GameContextProps {
  state: GameState;
  dispatch: GameDispatch;
  forceUpdate?: () => void;  // Добавляем опциональный метод forceUpdate
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
