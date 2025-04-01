
import { useContext } from 'react';
import { GameContext } from '../GameContext';
import { GameState, GameAction, ReferralHelper } from '../types';

/**
 * Хук для доступа к состоянию игры и диспетчеру
 */
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

/**
 * Хук для манипуляции помощниками рефералов
 */
export function useHelpers() {
  const { state, dispatch } = useGame();
  
  /**
   * Обновляет статус помощников в состоянии игры
   */
  const updateHelpers = (updatedHelpers: ReferralHelper[]) => {
    dispatch({
      type: 'UPDATE_HELPERS',
      payload: { updatedHelpers }
    });
  };
  
  return {
    helpers: state.referralHelpers || [],
    updateHelpers
  };
}
