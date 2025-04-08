
import { GameState } from '../types';
import { checkAllUnlocks } from '@/utils/unlockManager';

/**
 * Обрабатывает проверку всех разблокировок
 */
export const processUnlockCheck = (state: GameState): GameState => {
  return checkAllUnlocks(state);
};
