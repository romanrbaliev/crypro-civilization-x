
import { GameState } from '@/context/types';

/**
 * Проверяет наличие определенного ресурса в состоянии
 */
export const isResourceUnlocked = (state: GameState, resourceId: string): boolean => {
  if (!state?.resources?.[resourceId]) return false;
  return state.resources[resourceId].unlocked === true;
};

/**
 * Проверяет наличие определенного здания в состоянии
 */
export const isBuildingUnlocked = (state: GameState, buildingId: string): boolean => {
  if (!state?.buildings?.[buildingId]) return false;
  return state.buildings[buildingId].unlocked === true;
};

/**
 * Проверяет наличие определенного улучшения в состоянии
 */
export const isUpgradeUnlocked = (state: GameState, upgradeId: string): boolean => {
  if (!state?.upgrades?.[upgradeId]) return false;
  return state.upgrades[upgradeId]?.unlocked === true || 
         state.upgrades[upgradeId]?.purchased === true;
};

/**
 * Создает объект unlocks на основе текущего состояния
 */
export const getUnlocksFromState = (state: GameState): Record<string, boolean> => {
  const unlocks: Record<string, boolean> = {};

  // Проверяем разблокировку ресурсов
  if (state?.resources) {
    Object.entries(state.resources).forEach(([id, resource]) => {
      if (resource && resource.unlocked) {
        unlocks[id] = true;
      }
    });
  }

  // Проверяем разблокировку зданий
  if (state?.buildings) {
    Object.entries(state.buildings).forEach(([id, building]) => {
      if (building && building.unlocked) {
        unlocks[id] = true;
      }
    });
  }

  // Проверяем разблокировку улучшений
  if (state?.upgrades) {
    Object.entries(state.upgrades).forEach(([id, upgrade]) => {
      if (upgrade && (upgrade.unlocked || upgrade.purchased)) {
        unlocks[id] = true;
      }
    });
  }

  // Проверяем состояние счетчика applyKnowledge
  if (state?.counters?.applyKnowledge) {
    const applyKnowledgeValue = typeof state.counters.applyKnowledge === 'number'
      ? state.counters.applyKnowledge
      : (state.counters.applyKnowledge.value || 0);
    
    if (applyKnowledgeValue > 0) {
      unlocks.applyKnowledge = true;
    }
  }

  // Проверяем счетчик кликов знаний (для разблокировки кнопки "Применить знания")
  if (state?.counters?.knowledgeClicks) {
    const clicksValue = typeof state.counters.knowledgeClicks === 'number'
      ? state.counters.knowledgeClicks
      : (state.counters.knowledgeClicks.value || 0);
    
    if (clicksValue >= 3) {
      unlocks.applyKnowledge = true;
    }
  }

  return unlocks;
};

/**
 * Убеждается, что объект unlocks существует в состоянии
 */
export const ensureUnlocksExist = (state: GameState): GameState => {
  if (!state) return state || {} as GameState; // Защита от undefined
  
  // Создаем копию состояния для безопасной модификации
  const newState = { ...state };
  
  if (!newState.unlocks) {
    newState.unlocks = getUnlocksFromState(newState);
  }
  
  return newState;
};
