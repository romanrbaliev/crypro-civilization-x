
import React, { useContext } from 'react';
import { GameContext } from './GameContext';

// Переиспользуем GameContext для совместимости
export const useGameState = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameProvider');
  }
  return context;
};

// Для обратной совместимости с существующим кодом
export const GameStateContext = GameContext;
export { GameProvider as GameStateProvider } from './GameContext';
