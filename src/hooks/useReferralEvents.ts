
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Хук для обработки событий рефералов
 */
export const useReferralEvents = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Обработчик события обновления статуса реферала
    const handleReferralStatusUpdate = (event: CustomEvent) => {
      const { referralId, hired, buildingId } = event.detail;
      
      // Диспатчим действие обновления статуса реферала
      dispatch({
        type: 'UPDATE_REFERRAL_STATUS',
        payload: {
          referralId,
          activated: true
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
