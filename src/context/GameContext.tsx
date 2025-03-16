
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { gameReducer } from './gameReducer';
import { GameState, GameAction } from './types';
import { initialState } from './initialState';

// Создаем контекст
type GameContextType = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

// Хук для использования контекста
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// Провайдер контекста
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Загружаем сохраненное состояние из localStorage или используем начальное
  const loadState = (): GameState => {
    try {
      const savedState = localStorage.getItem('cryptoGameState');
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    }
    return initialState;
  };

  const [state, dispatch] = useReducer(gameReducer, loadState());

  // Сохраняем состояние в localStorage при изменении
  useEffect(() => {
    try {
      localStorage.setItem('cryptoGameState', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }, [state]);

  // Обновляем ресурсы каждую секунду
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'UPDATE_RESOURCES' });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// Реэкспортируем типы
export type { GameState, GameAction, Resource, Building, Upgrade } from './types';
