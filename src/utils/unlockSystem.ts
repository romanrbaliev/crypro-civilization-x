
// Функции для проверки и обработки разблокировок возможностей в игре
// ЭТОТ ФАЙЛ СОХРАНЕН ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ
// ВСЯ ЛОГИКА ТЕПЕРЬ НАХОДИТСЯ В unlockManager.ts

import { GameState } from '@/context/types';
import { 
  checkAllUnlocks as checkAllUnlocksManager,
  checkBuildingUnlocks as checkBuildingUnlocksManager,
  checkResourceUnlocks as checkResourceUnlocksManager,
  checkUpgradeUnlocks as checkUpgradeUnlocksManager,
  checkActionUnlocks as checkActionUnlocksManager,
  checkSpecialUnlocks as checkSpecialUnlocksManager
} from './unlockManager';

// Проверяет все возможные разблокировки
export const checkAllUnlocks = (state: GameState): GameState => {
  return checkAllUnlocksManager(state);
};

// Проверяет специальные разблокировки, зависящие от счетчиков и других условий
export const checkSpecialUnlocks = (state: GameState): GameState => {
  return checkSpecialUnlocksManager(state);
};

// Проверяет разблокировки ресурсов на основе требований
export const checkResourceUnlocks = (state: GameState): GameState => {
  return checkResourceUnlocksManager(state);
};

// Проверяет разблокировки зданий на основе требований
export const checkBuildingUnlocks = (state: GameState): GameState => {
  return checkBuildingUnlocksManager(state);
};

// Проверяет разблокировки исследований на основе требований
export const checkUpgradeUnlocks = (state: GameState): GameState => {
  return checkUpgradeUnlocksManager(state);
};

// Проверяет разблокировки действий на основе требований
export const checkActionUnlocks = (state: GameState): GameState => {
  return checkActionUnlocksManager(state);
};
