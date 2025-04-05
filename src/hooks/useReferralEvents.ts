
import { useEffect } from 'react';
import { useLocalReducer } from './useLocalReducer';
import { useGame } from '@/context/hooks/useGame';

/**
 * Хук для обработки событий рефералов
 */
export const useReferralEvents = () => {
  const { dispatch } = useGame();

  useEffect(() => {
    // Обработчик события обновления статуса реферала
    const handleReferralStatusUpdate = (event: CustomEvent) => {
      const { referralId, activated } = event.detail;
      
      // Диспатчим действие обновления статуса реферала
      dispatch({
        type: 'UPDATE_REFERRAL_STATUS',
        payload: {
          referralId,
          activated
        }
      });
    };

    // Подписываемся на событие
    window.addEventListener('referral-status-updated', handleReferralStatusUpdate as EventListener);

    // Отписываемся при размонтировании
    return () => {
      window.removeEventListener('referral-status-updated', handleReferralStatusUpdate as EventListener);
    };
  }, [dispatch]);
};
