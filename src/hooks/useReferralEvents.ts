
import { useEffect } from 'react';
import { GameState, GameAction } from '@/context/types';
import { Dispatch } from 'react';

export const useReferralEvents = (
  state: GameState,
  dispatch: Dispatch<GameAction>,
  isLoading: boolean
) => {
  useEffect(() => {
    if (isLoading) return;
    
    const handleReferralStatusUpdate = (event: CustomEvent<any>) => {
      const { referralId, hired, buildingId } = event.detail;
      
      dispatch({
        type: 'UPDATE_REFERRAL_STATUS',
        payload: { referralId, hired, buildingId }
      });
    };
    
    const handleAddReferral = (event: CustomEvent<any>) => {
      const { referral } = event.detail;
      
      dispatch({
        type: 'ADD_REFERRAL',
        payload: { referral }
      });
    };
    
    // Добавляем обработчики событий
    window.addEventListener('referral-status-update', handleReferralStatusUpdate as EventListener);
    window.addEventListener('add-referral', handleAddReferral as EventListener);
    
    // Очищаем обработчики при размонтировании
    return () => {
      window.removeEventListener('referral-status-update', handleReferralStatusUpdate as EventListener);
      window.removeEventListener('add-referral', handleAddReferral as EventListener);
    };
  }, [dispatch, isLoading]);
};
