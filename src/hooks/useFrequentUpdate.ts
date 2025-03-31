
import { useEffect, useState, useRef } from 'react';
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
  // Используем ref для оптимизации и предотвращения лишних рендеров
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Используем ref для хранения времени последнего обновления
  const lastUpdateTimeRef = useRef<number>(Date.now());
  
  useEffect(() => {
    if (!state.gameStarted) return;
    
    // Очищаем предыдущий интервал, если он был
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Фиксируем начальное время
    lastUpdateTimeRef.current = Date.now();
    
    // Используем более частый интервал для визуально плавной анимации ресурсов
    const interval = 100; // 100 мс (10 раз в секунду) - оптимальный баланс между производительностью и плавностью
    
    console.log(`🔄 Настройка интервала обновления ресурсов: ${interval}мс`);
    
    // Интервал обновления модели
    intervalRef.current = setInterval(() => {
      if (isActive && state.gameStarted) {
        const now = Date.now();
        const deltaTime = now - lastUpdateTimeRef.current;
        lastUpdateTimeRef.current = now;
        
        // Отправляем запрос на обновление ресурсов с указанием прошедшего времени
        dispatch({ 
          type: 'UPDATE_RESOURCES', 
          payload: { 
            deltaTime: deltaTime, 
            resourceId: resourceId 
          }
        });
      }
    }, interval);
    
    // Очистка при размонтировании
    return () => {
      console.log('🛑 Остановка интервала обновления ресурсов');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [dispatch, resourceId, isActive, state.gameStarted]);
  
  // Возвращаем функцию для управления состоянием активности
  return {
    setActive: setIsActive,
    isActive
  };
};

export default useFrequentUpdate;
