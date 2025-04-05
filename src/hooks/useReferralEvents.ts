import { useEffect } from 'react';
import { useGame } from '@/context/hooks/useGame';

export const useReferralEvents = (state: any, dispatch: any, isLoading: boolean) => {
  useEffect(() => {
    const handleReferralStatusUpdate = (event: any) => {
      const { referralId, status } = event.detail;
      updateReferralStatus(referralId, status);
    };

    const handleHelperStatusUpdate = (event: any) => {
      const { helperId, accepted } = event.detail;
      respondToHelperRequest(helperId, accepted);
    };

    window.addEventListener('referral-status-update', handleReferralStatusUpdate);
    window.addEventListener('helper-status-update', handleHelperStatusUpdate);

    return () => {
      window.removeEventListener('referral-status-update', handleReferralStatusUpdate);
      window.removeEventListener('helper-status-update', handleHelperStatusUpdate);
    };
  }, [dispatch, isLoading]);

  // Обновляем только callback для статуса реферала
  const updateReferralStatus = (referralId: string, status: string) => {
    dispatch({
      type: "UPDATE_REFERRAL_STATUS",
      payload: {
        referralId,
        status
      }
    });
  };

  const respondToHelperRequest = (helperId: string, accepted: boolean) => {
    dispatch({
      type: "RESPOND_TO_HELPER_REQUEST",
      payload: {
        helperId,
        accepted
      }
    });
  };
};
