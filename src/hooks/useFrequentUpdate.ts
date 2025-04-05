
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
  // ПОЛНОСТЬЮ ОТКЛЮЧЕН - всегда возвращает неактивное состояние
  const [isActive, setIsActive] = useState(false);
  
  // Возвращаем функцию для управления состоянием активности (всегда неактивно)
  return {
    setActive: () => {}, // Пустая функция, ничего не делающая
    isActive: false // Всегда возвращаем false
  };
};

export default useFrequentUpdate;
