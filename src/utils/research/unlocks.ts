
import { GameState } from "@/context/types";

// Проверяет, изучено ли исследование "Основы блокчейна"
export const isBlockchainBasicsUnlocked = (state: GameState): boolean => {
  return state.upgrades.blockchainBasics?.purchased === true;
};

// Получает разблокированные здания по группе
export const getUnlockedBuildingsByGroup = (
  state: GameState, 
  buildingIds: string[]
): string[] => {
  return buildingIds.filter(id => 
    state.buildings[id]?.unlocked === true
  );
};

// Получает разблокированные исследования по группе
export const getUnlockedUpgradesByGroup = (
  state: GameState, 
  upgradeIds: string[]
): string[] => {
  return upgradeIds.filter(id => 
    state.upgrades[id]?.unlocked === true || state.upgrades[id]?.purchased === true
  );
};
