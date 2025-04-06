
import { GameState } from '@/context/types';

/**
 * Проверяет разблокирован ли ресурс
 */
export const isResourceUnlocked = (state: GameState, resourceId: string): boolean => {
  if (!state.resources[resourceId]) return false;
  return state.resources[resourceId].unlocked;
};

/**
 * Проверяет разблокировано ли здание
 */
export const isBuildingUnlocked = (state: GameState, buildingId: string): boolean => {
  if (!state.buildings[buildingId]) return false;
  return state.buildings[buildingId].unlocked;
};

/**
 * Проверяет разблокирован ли апгрейд
 */
export const isUpgradeUnlocked = (state: GameState, upgradeId: string): boolean => {
  if (!state.upgrades[upgradeId]) return false;
  return state.upgrades[upgradeId].unlocked;
};

/**
 * Проверяет куплен ли апгрейд
 */
export const isUpgradePurchased = (state: GameState, upgradeId: string): boolean => {
  if (!state.upgrades[upgradeId]) return false;
  return state.upgrades[upgradeId].purchased;
};

/**
 * Получает совместимый объект unlocks из текущего состояния
 * для обратной совместимости
 */
export const getUnlocksFromState = (state: GameState): Record<string, boolean> => {
  const unlocks: Record<string, boolean> = {};
  
  // Добавляем ресурсы
  Object.entries(state.resources).forEach(([id, resource]) => {
    if (resource.unlocked) {
      unlocks[id] = true;
    }
  });
  
  // Добавляем здания
  Object.entries(state.buildings).forEach(([id, building]) => {
    if (building.unlocked) {
      unlocks[id] = true;
    }
  });
  
  // Добавляем апгрейды
  Object.entries(state.upgrades).forEach(([id, upgrade]) => {
    if (upgrade.unlocked || upgrade.purchased) {
      unlocks[id] = true;
    }
  });
  
  // Проверяем специальные разблокировки
  // Исследования
  const hasUnlockedResearch = Object.values(state.upgrades).some(u => u.unlocked || u.purchased);
  unlocks.research = hasUnlockedResearch;
  
  // Специализация
  unlocks.specialization = !!state.specialization;
  
  // Рефералы
  const hasCryptoCommunity = state.upgrades.cryptoCommunity?.purchased === true;
  unlocks.referrals = hasCryptoCommunity;
  
  // Трейдинг
  const hasCryptoTrading = state.upgrades.cryptoTrading?.purchased === true;
  unlocks.trading = hasCryptoTrading;
  
  // Автопродажа BTC
  const hasTradingBot = state.upgrades.tradingBot?.purchased === true;
  unlocks.autoSell = hasTradingBot;
  
  return unlocks;
};

/**
 * Обновляет состояние, добавляя в него объект unlocks
 * для обратной совместимости
 */
export const ensureUnlocksExist = (state: GameState): GameState => {
  return {
    ...state,
    unlocks: getUnlocksFromState(state)
  };
};
