
import { GameState } from '../types';

export const processSetLanguage = (
  state: GameState, 
  payload: { language: string }
): GameState => {
  return {
    ...state,
    language: payload.language
  };
};
