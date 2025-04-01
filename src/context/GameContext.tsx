
import React, { createContext, useReducer, useState, useCallback } from 'react';
import { gameReducer } from './gameReducer';
import { initialState } from './initialState';
import { GameState, GameAction, GameContextProps } from './types';

// Создаем контекст с начальным значением
export const GameContext = createContext<GameContextProps>({
  state: initialState,
  dispatch: () => null,
  forceUpdate: () => null
});

interface GameProviderProps {
  children: React.ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  // Используем useState и useCallback для forceUpdate
  const [, setTick] = useState(0);
  
  const forceUpdate = useCallback(() => {
    setTick(tick => tick + 1);
    dispatch({ type: 'UPDATE_RESOURCES' });
  }, []);
  
  return (
    <GameContext.Provider value={{ state, dispatch, forceUpdate }}>
      {children}
    </GameContext.Provider>
  );
};
