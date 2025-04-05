
import { GameState, GameAction } from '../types';

// Обработчик для установки языка
export const processSetLanguage = (
  state: GameState,
  payload: { language: string }
): GameState => {
  return {
    ...state,
    language: payload.language
  };
};
