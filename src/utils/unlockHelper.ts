
import { GameState } from '@/context/types';

/**
 * Проверяет наличие определенного ресурса в состоянии
 */
export const isResourceUnlocked = (state: GameState, resourceId: string): boolean => {
  return state.resources[resourceId]?.unlocked === true;
};

/**
 * Проверяет наличие определенного здания в состоянии
 */
export const isBuildingUnlocked = (state: GameState, buildingId: string): boolean => {
  return state.buildings[buildingId]?.unlocked === true;
};

/**
 * Проверяет наличие определенного улучшения в состоянии
 */
export const isUpgradeUnlocked = (state: GameState, upgradeId: string): boolean => {
  return state.upgrades[upgradeId]?.unlocked === true || 
         state.upgrades[upgradeId]?.purchased === true;
};

/**
 * Создает объект unlocks на основе текущего состояния
 */
export const getUnlocksFromState = (state: GameState): Record<string, boolean> => {
  const unlocks: Record<string, boolean> = {};

  // Проверяем разблокировку ресурсов
  Object.entries(state.resources).forEach(([id, resource]) => {
    if (resource.unlocked) {
      unlocks[id] = true;
    }
  });

  // Проверяем разблокировку зданий
  Object.entries(state.buildings).forEach(([id, building]) => {
    if (building.unlocked) {
      unlocks[id] = true;
    }
  });

  // Проверяем разблокировку улучшений
  Object.entries(state.upgrades).forEach(([id, upgrade]) => {
    if (upgrade.unlocked || upgrade.purchased) {
      unlocks[id] = true;
    }
  });

  // Проверяем состояние счетчика applyKnowledge
  if (state.counters.applyKnowledge && 
      (typeof state.counters.applyKnowledge === 'number' ? 
        state.counters.applyKnowledge > 0 : 
        state.counters.applyKnowledge.value > 0)) {
    unlocks.applyKnowledge = true;
  }

  return unlocks;
};

/**
 * Убеждается, что объект unlocks существует в состоянии
 */
export const ensureUnlocksExist = (state: GameState): GameState => {
  if (!state.unlocks) {
    return {
      ...state,
      unlocks: getUnlocksFromState(state)
    };
  }
  return state;
};
