
import { useEffect } from 'react';
import { GameState, GameAction } from '@/context/types';

export const useReferralEvents = (
  state: GameState,
  dispatch: React.Dispatch<GameAction>,
  isLoading: boolean
) => {
  useEffect(() => {
    if (!state.gameStarted || isLoading) return;
    
    const handleUpdateReferralStatus = (event: CustomEvent) => {
      const { referralId, activated } = event.detail;
      console.log(`Получено событие обновления статуса реферала: ${referralId}, активирован=${activated}`);
      
      dispatch({
        type: "UPDATE_REFERRAL_STATUS",
        payload: { referralId, activated }
      });
    };
    
    window.addEventListener('update-referral-status', handleUpdateReferralStatus as EventListener);
    
    return () => {
      window.removeEventListener('update-referral-status', handleUpdateReferralStatus as EventListener);
    };
  }, [state, isLoading, dispatch]);
};
