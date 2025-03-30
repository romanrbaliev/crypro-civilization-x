
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { gameReducer } from './gameReducer';
import { GameState, GameAction } from './types';
import { initialState } from './initialState';

// Создаем контекст с типизированными значениями по умолчанию
export const GameStateContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Провайдер для контекста состояния игры
export const GameStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GameStateContext.Provider>
  );
};

// Хук для использования контекста состояния игры
export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};
