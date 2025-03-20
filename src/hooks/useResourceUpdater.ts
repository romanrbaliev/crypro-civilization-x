
import { useEffect } from 'react';
import { useGame } from '@/context/hooks/useGame';

/**
 * Хук для периодического обновления ресурсов
 */
export function useResourceUpdater() {
  const { dispatch } = useGame();

  useEffect(() => {
    // Обновляем ресурсы каждую секунду
    const updateInterval = setInterval(() => {
      dispatch({ type: 'UPDATE_RESOURCES' });
    }, 1000);

    return () => {
      clearInterval(updateInterval);
    };
  }, [dispatch]);
}
