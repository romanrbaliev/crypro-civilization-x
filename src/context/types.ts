
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
}

export interface Referral {
  id: string;
  username: string;
  activated: boolean;
  joinedAt: number;
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

// Упрощенные параметры для механики майнинга
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
  // Новые параметры для механики майнинга
  miningParams: MiningParams;
  gameTime: number; // Игровое время в секундах для расчета волатильности
  // Реферальная система
  referralCode: string; // Реферальный код пользователя
  referredBy: string | null; // Код пользователя, пригласившего текущего
  referrals: Referral[]; // Список рефералов
}

// Типы действий для редьюсера игры
export type GameAction =
  | { type: "INCREMENT_RESOURCE"; payload: { resourceId: string; amount?: number } }
  | { type: "UPDATE_RESOURCES" }
  | { type: "PURCHASE_BUILDING"; payload: { buildingId: string } }
  | { type: "PRACTICE_PURCHASE" } // Добавлено новое действие для покупки практики
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
  | { type: "ACTIVATE_REFERRAL"; payload: { referralId: string } };
