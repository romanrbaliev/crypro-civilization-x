
// Базовые типы игровых объектов
export interface Resource {
  id: string;
  name: string;
  description?: string;
  type: string;
  icon?: string;
  value: number;
  max: number;
  unlocked: boolean;
  baseProduction: number;
  production: number;
  perSecond: number;
  consumption?: number;
}

export interface Building {
  id: string;
  name: string;
  description?: string;
  type: string;
  count: number;
  unlocked: boolean;
  cost: { [key: string]: number };
  costMultiplier: number;
  production?: { [key: string]: number };
  consumption?: { [key: string]: number };
  productionBoost?: number;
  effects?: { [key: string]: number };
}

export interface Upgrade {
  id: string;
  name: string;
  description?: string;
  type: string;
  purchased: boolean;
  unlocked: boolean;
  cost: { [key: string]: number };
  effects?: { [key: string]: number };
  category?: string;
  tier?: number;
  specialization?: string;
}

export interface Counter {
  id: string;
  name: string;
  value: number;
}

export interface ReferralInfo {
  id: string;
  username?: string;
  activated: boolean;
  hired?: boolean;
  assignedBuildingId?: string;
}

export interface ReferralHelper {
  id: string;
  helperId: string;
  employerId: string;
  buildingId: string;
  status: string;
  created?: number;
}

// Специализации
export interface SpecializationSynergy {
  id: string;
  name: string;
  description: string;
  active: boolean;
  effects: { [key: string]: number };
  requirement?: { [key: string]: number };
  requiredCategories?: string[];
  bonus?: number;
}

// Параметры майнинга
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

// Обновляем интерфейс для обновления статуса реферала
export interface ReferralStatusUpdate {
  referralId: string;
  activated: boolean;
}

// Основное состояние игры
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
  specializationSynergies: { [key: string]: any };
  specialization?: string;
  referralCode: string | null;
  referredBy: string | null;
  referrals: ReferralInfo[];
  referralHelpers: ReferralHelper[];
  unlocks: { [key: string]: boolean };
  prestigePoints: number;
  eventMessages: { [key: string]: any };
  gameTime: number;
  miningParams: MiningParams;
  phase: number;
}

// Типы действий для редьюсера
export type GameAction =
  | { type: 'INCREMENT_RESOURCE'; payload: { resourceId: string; amount: number } }
  | { type: 'UNLOCK_RESOURCE'; payload: { resourceId: string } }
  | { type: 'PURCHASE_BUILDING'; payload: { buildingId: string } }
  | { type: 'SELL_BUILDING'; payload: { buildingId: string } }
  | { type: 'PURCHASE_UPGRADE'; payload: { upgradeId: string } }
  | { type: 'APPLY_KNOWLEDGE'; }
  | { type: 'APPLY_ALL_KNOWLEDGE'; }
  | { type: 'MINING_POWER'; }
  | { type: 'EXCHANGE_BTC'; }
  | { type: 'PRACTICE_PURCHASE'; }
  | { type: 'UNLOCK_FEATURE'; payload: { featureId: string } }
  | { type: 'SET_BUILDING_UNLOCKED'; payload: { buildingId: string; unlocked: boolean } }
  | { type: 'SET_UPGRADE_UNLOCKED'; payload: { upgradeId: string; unlocked: boolean } }
  | { type: 'INCREMENT_COUNTER'; payload: { counterId: string; amount: number } }
  | { type: 'START_GAME'; }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'PRESTIGE'; }
  | { type: 'RESET_GAME'; }
  | { type: 'RESTART_COMPUTERS'; }
  | { type: 'CHECK_SYNERGIES'; }
  | { type: 'ACTIVATE_SYNERGY'; payload: { synergyId: string } }
  | { type: 'INITIALIZE_SYNERGIES'; }
  | { type: 'SYNERGY_ACTION'; }
  | { type: 'SET_REFERRAL_CODE'; payload: { code: string } }
  | { type: 'ADD_REFERRAL'; payload: ReferralInfo }
  | { type: 'ACTIVATE_REFERRAL'; payload: { referralId: string } }
  | { type: 'HIRE_REFERRAL_HELPER'; payload: { referralId: string; buildingId: string } }
  | { type: 'RESPOND_TO_HELPER_REQUEST'; payload: { helperId: string; accepted: boolean } }
  | { type: 'UPDATE_REFERRAL_STATUS'; payload: { referralId: string; activated: boolean } }
  | { type: 'INITIALIZE_REFERRAL_SYSTEM'; }
  | { type: 'UPDATE_RESOURCES'; payload?: any }
  | { type: 'FORCE_RESOURCE_UPDATE'; }
  | { type: 'FORCE_CHECK_UNLOCKS'; }
  | { type: 'UPDATE_HELPERS'; payload: { updatedHelpers: ReferralHelper[] } }
  | { type: 'CHOOSE_SPECIALIZATION'; payload: { roleId: string } }
  | { type: 'CHECK_EQUIPMENT_STATUS'; };
