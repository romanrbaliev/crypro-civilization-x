
// Функции для проверки и обработки разблокировок возможностей в игре
// ЭТОТ ФАЙЛ СОХРАНЕН ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ
// ВСЯ ЛОГИКА ТЕПЕРЬ НАХОДИТСЯ В unifiedUnlockSystem.ts

import { GameState } from '@/context/types';
import { 
  checkAllUnlocks as checkAllUnlocksUnified,
  forceCheckAllUnlocks as forceCheckAllUnlocksUnified,
  isUnlocked as isUnlockedUnified
} from './unifiedUnlockSystem';

// Проверяет все возможные разблокировки
export const checkAllUnlocks = (state: GameState): GameState => {
  // Добавляем дополнительный консоль-лог для отладки
  console.log('unlockSystem: checkAllUnlocks вызван (перенаправлено в unifiedUnlockSystem)');
  return checkAllUnlocksUnified(state);
};

// Проверяет специальные разблокировки, зависящие от счетчиков и других условий
export const checkSpecialUnlocks = (state: GameState): GameState => {
  console.log('unlockSystem: checkSpecialUnlocks вызван (перенаправлено в unifiedUnlockSystem)');
  return checkAllUnlocksUnified(state);
};

// Проверяет разблокировки ресурсов на основе требований
export const checkResourceUnlocks = (state: GameState): GameState => {
  console.log('unlockSystem: checkResourceUnlocks вызван (перенаправлено в unifiedUnlockSystem)');
  return checkAllUnlocksUnified(state);
};

// Проверяет разблокировки зданий на основе требований
export const checkBuildingUnlocks = (state: GameState): GameState => {
  console.log('unlockSystem: checkBuildingUnlocks вызван (перенаправлено в unifiedUnlockSystem)');
  return checkAllUnlocksUnified(state);
};

// Проверяет разблокировки исследований на основе требований
export const checkUpgradeUnlocks = (state: GameState): GameState => {
  console.log('unlockSystem: checkUpgradeUnlocks вызван (перенаправлено в unifiedUnlockSystem)');
  return checkAllUnlocksUnified(state);
};

// Проверяет разблокировки действий на основе требований
export const checkActionUnlocks = (state: GameState): GameState => {
  console.log('unlockSystem: checkActionUnlocks вызван (перенаправлено в unifiedUnlockSystem)');
  return checkAllUnlocksUnified(state);
};
