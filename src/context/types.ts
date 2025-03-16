
// Типы ресурсов
export interface Resource {
  id: string;
  name: string;
  icon: string;
  value: number;
  perSecond: number;
  unlocked: boolean;
  max: number;
}

// Типы апгрейдов
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: { [key: string]: number };
  effect: { [key: string]: number };
  unlocked: boolean;
  purchased: boolean;
  requirements?: { [key: string]: number };
}

// Типы зданий
export interface Building {
  id: string;
  name: string;
  description: string;
  cost: { [key: string]: number };
  costMultiplier: number;
  production: { [key: string]: number };
  count: number;
  unlocked: boolean;
  requirements?: { [key: string]: number };
}

// Структура состояния игры
export interface GameState {
  resources: { [key: string]: Resource };
  upgrades: { [key: string]: Upgrade };
  buildings: { [key: string]: Building };
  unlocks: { [key: string]: boolean };
  lastUpdate: number;
  gameStarted: boolean;
  prestigePoints: number;
  phase: number;
}

// Типы действий
export type GameAction =
  | { type: "INCREMENT_RESOURCE"; payload: { resourceId: string; amount: number } }
  | { type: "UPDATE_RESOURCES" }
  | { type: "PURCHASE_BUILDING"; payload: { buildingId: string } }
  | { type: "PURCHASE_UPGRADE"; payload: { upgradeId: string } }
  | { type: "UNLOCK_FEATURE"; payload: { featureId: string } }
  | { type: "SET_BUILDING_UNLOCKED"; payload: { buildingId: string; unlocked: boolean } }
  | { type: "START_GAME" }
  | { type: "LOAD_GAME"; payload: GameState }
  | { type: "PRESTIGE" };
