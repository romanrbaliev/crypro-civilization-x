
import React, { useContext } from 'react';
import { GameContext, GameDispatch } from './GameContext';
import { GameState, GameAction } from './types';

// Создаем интерфейс для useGameState
export interface GameStateContextProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

// Исправляем хук useGameState для возврата правильной структуры
export const useGameState = (): GameStateContextProps => {
  const state = useContext(GameContext);
  const dispatch = useContext(GameDispatch);
  
  if (!state || !dispatch) {
    throw new Error('useGameState must be used within a GameProvider');
  }
  
  return { state, dispatch };
};

// Для обратной совместимости с существующим кодом
export const GameStateContext = GameContext;
export { GameProvider as GameStateProvider } from './GameContext';
