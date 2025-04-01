
import { useEffect, useState, useRef } from 'react';
import { GameState, GameDispatch } from '@/context/types';

interface FrequentUpdateProps {
  state: GameState;
  dispatch: GameDispatch;
  resourceId?: string;
}

/**
 * ВАЖНО: Этот хук больше не используется, т.к. вызывает дублирование обновлений!
 * Все обновления ресурсов теперь происходят через useGameStateUpdateService с фиксированным интервалом 1000 мс.
 * 
 * Хук для частого обновления модели игры для создания эффекта непрерывного роста ресурсов
 * @param props - Объект с состоянием, диспетчером и идентификатором ресурса
 */
export const useFrequentUpdate = ({ state, dispatch, resourceId = 'default' }: FrequentUpdateProps) => {
  const [isActive, setIsActive] = useState(false); // Изменено на false, чтобы отключить
  // Используем ref для оптимизации и предотвращения лишних рендеров
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Используем ref для хранения времени последнего обновления
  const lastUpdateTimeRef = useRef<number>(Date.now());
  
  // ОТКЛЮЧЕНО: Частые обновления могут вызывать рассинхронизацию и некорректные расчеты
  
  /*
  useEffect(() => {
    if (!state.gameStarted) return;
    
    // Очищаем предыдущий интервал, если он был
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Фиксируем начальное время
    lastUpdateTimeRef.current = Date.now();
    
    console.log('⚠️ useFrequentUpdate отключен для предотвращения двойных обновлений ресурсов');
    
    // Очистка при размонтировании
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);
  */
  
  // Возвращаем функцию для управления состоянием активности (всегда неактивно)
  return {
    setActive: setIsActive,
    isActive: false // Всегда возвращаем false
  };
};

export default useFrequentUpdate;
