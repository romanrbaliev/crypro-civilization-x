
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
    // Используем более редкий интервал, чтобы избежать проблем с накоплением вызовов
    // и предотвратить экспоненциальный рост значений при множественных обновлениях
    const interval = 250; // 250 мс (4 раза в секунду) для более стабильного обновления
    
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
