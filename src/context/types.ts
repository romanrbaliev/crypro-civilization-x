
// Базовые интерфейсы для игры

// Тип ресурса
export interface Resource {
  id: string;
  name: string;
  description: string;
  type: "currency" | "material" | "science" | "resource";
  icon?: string;
  value: number;
  baseProduction: number;
  production: number;
  consumption?: number;
  perSecond: number;
  max: number;
  unlocked: boolean;
}

// Тип здания
export interface Building {
  id: string;
  name: string;
  description: string;
  cost: { [resourceId: string]: number };
  costMultiplier: number;
  production: { [resourceId: string]: number };
  consumption?: { [resourceId: string]: number };
  effects?: { [key: string]: number };
  count: number;
  unlocked: boolean;
  productionBoost?: number;
  category?: string;
  tier?: number;
  specialization?: string;
  requirements?: { [resourceId: string]: number };
  unlockCondition?: { [key: string]: any };
}

// Тип апгрейда
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: { [resourceId: string]: number };
  effects: { [key: string]: number };
  purchased: boolean;
  unlocked: boolean;
  requiredUpgrades?: string[];
  category?: string;
  tier?: number;
  specialization?: string;
}

// Тип для синергий специализаций
export interface SpecializationSynergy {
  id: string;
  name: string;
  description: string;
  requiredCategories?: string[];
  requiredCount?: number;
  effects: { [resourceId: string]: number };
  unlocked: boolean;
  active: boolean;
  bonus?: { [key: string]: number };
}

// Тип для рефералов
export interface Referral {
  id: string;
  userId: string;
  name: string;
  activated: boolean;
  hired: boolean;
  assignedBuildingId?: string;
  createdAt: number;
  updatedAt?: number;
}

// Тип для хелперов рефералов
export interface ReferralHelper {
  id: string;
  userId: string;
  buildingId: string;
  helperId: string;
  status: "pending" | "accepted" | "rejected" | "working";
  createdAt: number;
  updatedAt: number;
}

// Действия для ресурсов
export interface ResourceAction {
  resourceId: string;
  amount: number;
}

// Полный тип состояния игры
export interface GameState {
  knowledge: number;
  btcPrice: number;
  miningPower: number;
  usdtBalance: number;
  btcBalance: number;
  
  gameStarted: boolean;
  multiBuy: boolean;
  referralBonusApplied: boolean;
  eventLog: string[];
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    notificationsEnabled: boolean;
    multibuy: boolean;
  };
  
  gameTime: number;
  lastUpdate: number;
  lastSaved: number;
  version: string;
  phase: number;
  specialization: string | null;
  prestigePoints: number;
  eventMessages: { [key: string]: any };
  referredBy: string | null;
  featureFlags: { [key: string]: boolean };
  buildingUnlocked: { [key: string]: boolean };
  
  synergies: { [key: string]: any };
  unlocks: { [key: string]: boolean };
  resources: { [resourceId: string]: Resource };
  buildings: { [buildingId: string]: Building };
  upgrades: { [upgradeId: string]: Upgrade };
  specializationSynergies: { [synergyId: string]: SpecializationSynergy };
  counters: { [counterId: string]: number | { value: number; updatedAt: number } };
  referrals: Referral[];
  referralHelpers: ReferralHelper[];
  miningParams?: {
    exchangeRate: number;
    exchangeCommission: number;
  };
}

// Типы действий для редюсера
export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'INCREMENT_RESOURCE'; payload: ResourceAction }
  | { type: 'DECREMENT_RESOURCE'; payload: ResourceAction }
  | { type: 'SET_RESOURCE'; payload: ResourceAction }
  | { type: 'UPDATE_RESOURCES' }
  | { type: 'FORCE_RESOURCE_UPDATE' }
  | { type: 'APPLY_ALL_KNOWLEDGE'; payload?: any }
  | { type: 'EXCHANGE_BTC' }
  | { type: 'PURCHASE_BUILDING'; payload: { buildingId: string; count?: number } }
  | { type: 'SELL_BUILDING'; payload: { buildingId: string } }
  | { type: 'UNLOCK_BUILDING'; payload: { buildingId: string } }
  | { type: 'SET_BUILDING_UNLOCKED'; payload: { buildingId: string; unlocked: boolean } }
  | { type: 'PURCHASE_UPGRADE'; payload: { upgradeId: string } }
  | { type: 'SET_UPGRADE_UNLOCKED'; payload: { upgradeId: string; unlocked: boolean } }
  | { type: 'TOGGLE_MULTIBUY' }
  | { type: 'CHOOSE_SPECIALIZATION'; payload: { specialization: string } }
  | { type: 'PROCESS_SYNERGY'; payload: { synergyId: string } }
  | { type: 'PROCESS_REFERRAL'; payload: { referralId: string } }
  | { type: 'CHECK_REFERRAL' }
  | { type: 'INCREMENT_COUNTER'; payload: { counterId: string; value: number } }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'RESET_GAME' }
  | { type: 'ADD_REFERRAL'; payload: { referral: Referral } }
  | { type: 'UPDATE_REFERRAL_STATUS'; payload: { referralId: string; hired: boolean; buildingId?: string } }
  | { type: 'HIRE_REFERRAL_HELPER'; payload: { referralId: string; buildingId: string } }
  | { type: 'RESPOND_TO_HELPER_REQUEST'; payload: { requestId: string; accept: boolean } }
  | { type: 'SET_REFERRAL_CODE'; payload: { code: string } }
  | { type: 'UPDATE_HELPERS'; payload: { updatedHelpers: ReferralHelper[] } }
  | { type: 'ACTIVATE_SYNERGY'; payload: { synergyId: string } }
  | { type: 'CHECK_SYNERGIES' }
  | { type: 'FORCE_CHECK_MINER_UNLOCK' };

// Тип для контекста игры
export interface GameContextProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  forceUpdate: () => void;
}

// Тип диспетчера игровых действий
export type GameDispatch = React.Dispatch<GameAction>;
