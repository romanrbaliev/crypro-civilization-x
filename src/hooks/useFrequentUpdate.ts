
import { useEffect, useState } from 'react';
import { GameState, GameDispatch } from '@/context/types';
import { getResourceFormat } from '@/utils/resourceFormatConfig';

interface FrequentUpdateProps {
  state: GameState;
  dispatch: GameDispatch;
  resourceId?: string;
}

/**
 * Хук для частого обновления модели игры для создания эффекта непрерывного роста ресурсов
 * @param props - Объект с состоянием, диспетчером и идентификатором ресурса
 */
export const useFrequentUpdate = ({ state, dispatch, resourceId = 'default' }: FrequentUpdateProps) => {
  const [isActive, setIsActive] = useState(true);
  
  useEffect(() => {
    // Используем очень частый интервал для создания плавной анимации ресурсов
    const interval = 15; // Увеличиваем частоту до 15 мс (более 60 раз в секунду)
    
    // Интервал обновления модели
    const updateInterval = setInterval(() => {
      if (isActive && state.gameStarted) {
        // Отправляем запрос на обновление ресурсов
        dispatch({ type: 'UPDATE_RESOURCES' });
      }
    }, interval);
    
    // Очистка при размонтировании
    return () => clearInterval(updateInterval);
  }, [dispatch, resourceId, isActive, state.gameStarted]);
  
  // Возвращаем функцию для управления состоянием активности
  return {
    setActive: setIsActive,
    isActive
  };
};

export default useFrequentUpdate;
