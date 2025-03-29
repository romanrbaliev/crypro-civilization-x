
import { GameState } from '../../types';
import { safeDispatchGameEvent } from '../../utils/eventBusUtils';
import { checkBuildingUnlocks as checkBuildingUnlocksBase } from '@/utils/unlockSystem';

// Проверка условий разблокировки зданий (обертка над функцией из unlockSystem)
export const checkBuildingUnlocks = (state: GameState): GameState => {
  return checkBuildingUnlocksBase(state);
};
