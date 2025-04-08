
import { GameState, GameEvent } from '../types';
import { generateId } from '@/utils/helpers';

export const processAddEvent = (
  state: GameState,
  payload: { message: string; type: string }
): GameState => {
  const { message, type } = payload;
  
  // Создаем новое событие
  const newEvent: GameEvent = {
    id: generateId(),
    message,
    type,
    timestamp: Date.now()
  };
  
  // Добавляем событие в начало списка
  return {
    ...state,
    events: [newEvent, ...(state.events || [])]
  };
};

export const processEventCleanup = (state: GameState): GameState => {
  // Оставляем только события не старше 24 часов
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  
  return {
    ...state,
    events: (state.events || []).filter(event => event.timestamp >= oneDayAgo)
  };
};
