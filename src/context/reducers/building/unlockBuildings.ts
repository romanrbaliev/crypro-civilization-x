
import { GameState } from '../../types';
import { safeDispatchGameEvent } from '../../utils/eventBusUtils';
import { checkBuildingUnlocks as checkBuildingUnlocksFromUnlockManager } from '@/utils/unlockManager';

// Проверка условий разблокировки зданий (обертка над функцией из unlockManager)
export const checkBuildingUnlocks = (state: GameState): GameState => {
  console.log("Проверка разблокировки зданий через централизованную систему...");
  return checkBuildingUnlocksFromUnlockManager(state);
};
