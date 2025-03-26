
import { useEffect, useState } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { getResourceFormat } from '@/utils/resourceFormatConfig';

/**
 * Хук для частого обновления модели игры для создания эффекта непрерывного роста ресурсов
 * @param resourceId - Идентификатор ресурса для определения частоты обновления
 */
export const useFrequentUpdate = (resourceId: string = 'default') => {
  const { state, dispatch } = useGame();
  const [isActive, setIsActive] = useState(true);
  
  useEffect(() => {
    // Получаем конфигурацию обновления для выбранного ресурса
    const { updateFrequency } = getResourceFormat(resourceId);
    
    // Интервал обновления модели
    const interval = setInterval(() => {
      if (isActive && state.gameStarted) {
        // Отправляем запрос на обновление ресурсов
        dispatch({ type: 'UPDATE_RESOURCES' });
      }
    }, updateFrequency);
    
    // Очистка при размонтировании
    return () => clearInterval(interval);
  }, [dispatch, resourceId, isActive, state.gameStarted]);
  
  // Возвращаем функцию для управления состоянием активности
  return {
    setActive: setIsActive,
    isActive
  };
};

export default useFrequentUpdate;
