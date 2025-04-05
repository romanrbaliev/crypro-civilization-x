import { useEffect, useRef } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { GameDispatch } from '@/context/types';

/**
 * Хук для частого обновления состояния игры
 * @param intervalMs Интервал обновления в миллисекундах
 */
export const useFrequentUpdate = (intervalMs: number = 1000) => {
  const { dispatch } = useGame();
  
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'UPDATE_RESOURCES' });
    }, intervalMs);
    
    return () => clearInterval(interval);
  }, [dispatch, intervalMs]);
};

/**
 * Хук для проверки статуса оборудования
 * @param intervalMs Интервал проверки в миллисекундах
 */
export const useEquipmentStatusCheck = (intervalMs: number = 5000) => {
  const { dispatch } = useGame();
  
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'CHECK_EQUIPMENT_STATUS' });
    }, intervalMs);
    
    return () => clearInterval(interval);
  }, [dispatch, intervalMs]);
};

export default useFrequentUpdate;
