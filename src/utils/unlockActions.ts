
import { GameState } from '@/context/types';
import { UnlockManagerService } from '@/services/UnlockManagerService';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { UnlockManager, ensureBuildingsCostProperty } from '@/utils/unifiedUnlockSystem';

/**
 * Принудительно проверяет и применяет все разблокировки
 */
export function forceCheckAllUnlocks(state: GameState): GameState {
  console.log("UnlockActions: Принудительная проверка всех разблокировок");
  
  // Используем новую систему разблокировок
  const unlockManager = new UnlockManager(state);
  let updatedState = unlockManager.forceCheckAllUnlocks();
  
  // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Проверяем и добавляем свойство cost для новых зданий
  updatedState = ensureBuildingsCostProperty(updatedState);
  
  return updatedState;
}

/**
 * Проверяет наличие продвинутых разблокировок
 */
export function forceCheckAdvancedUnlocks(state: GameState): GameState {
  console.log("UnlockActions: Проверка продвинутых разблокировок");
  
  // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Проверяем и добавляем свойство cost для новых зданий
  let updatedState = ensureBuildingsCostProperty(state);
  
  // Используем новую систему разблокировок
  const unlockManager = new UnlockManager(updatedState);
  return unlockManager.forceCheckAllUnlocks();
}
