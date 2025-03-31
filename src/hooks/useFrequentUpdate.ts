
import { useEffect, useState } from 'react';
import { GameState, GameDispatch } from '@/context/types';

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
    if (!state.gameStarted) return;
    
    // Используем более частый интервал для визуально плавной анимации ресурсов
    const interval = 50; // 50 мс (20 раз в секунду) - оптимальный баланс между производительностью и плавностью
    
    console.log(`🔄 Настройка интервала обновления ресурсов: ${interval}мс`);
    
    // Интервал обновления модели
    const updateInterval = setInterval(() => {
      if (isActive && state.gameStarted) {
        // Отправляем запрос на обновление ресурсов
        dispatch({ type: 'UPDATE_RESOURCES' });
      }
    }, interval);
    
    // Очистка при размонтировании
    return () => {
      console.log('🛑 Остановка интервала обновления ресурсов');
      clearInterval(updateInterval);
    };
  }, [dispatch, resourceId, isActive, state.gameStarted]);
  
  // Возвращаем функцию для управления состоянием активности
  return {
    setActive: setIsActive,
    isActive
  };
};

export default useFrequentUpdate;
