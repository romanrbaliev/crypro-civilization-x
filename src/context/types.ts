
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
  // Новые свойства для автомайнера
  active?: boolean;
  consumptionRate?: { [resourceId: string]: number };
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

export interface Unlocks {
  [featureId: string]: boolean;
}

export interface EventMessages {
  [eventId: string]: boolean;
}

export interface Counters {
  [counterId: string]: number;
}

// Новый интерфейс для настроек автомайнера
export interface MiningSettings {
  autoExchange: boolean;
  exchangeThreshold: number;
  notifyOnGoodRate: boolean;
  goodRateThreshold: number;
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
  // Новые свойства для криптоэкономики
  btcExchangeRate: number;
  networkDifficulty: number;
  miningEfficiency: number;
  energyEfficiency: number;
  exchangeFee: number;
  miningSettings: MiningSettings;
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
  | { type: "EXCHANGE_BTC" } // Новое действие для обмена BTC на USDT
  | { type: "TOGGLE_AUTO_MINER"; payload: { minerId: string; active: boolean } } // Включение/выключение автомайнера
  | { type: "UPDATE_MINING_SETTINGS"; payload: Partial<MiningSettings> }; // Обновление настроек майнинга

