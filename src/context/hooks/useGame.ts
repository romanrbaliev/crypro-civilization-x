
import { useContext } from 'react';
import { GameContext } from '../GameContext';
import { GameState, GameAction, ReferralHelper } from '../types';

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// Хук для обновления помощников рефералов
export const useUpdateHelpers = () => {
  const { dispatch } = useGame();
  
  const updateHelpers = (updatedHelpers: ReferralHelper[]) => {
    dispatch({
      type: "UPDATE_HELPERS",
      payload: { updatedHelpers }
    });
  };
  
  return updateHelpers;
};
