
import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, GameAction, Resource, Building, Upgrade } from './types';
import { initialState } from './initialState';
import { gameReducer } from './gameReducer';
import { saveGameState, loadGameState } from './utils/gameStorage';
import { GameEventSystem } from './GameEventSystem';

export type { Resource, Building, Upgrade };

// Тип контекста игры
export interface GameContextProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

// Создание контекста
export const GameContext = createContext<GameContextProps | undefined>(undefined);

// Экспорт хука useGame переехал в отдельный файл
export { useGame } from './hooks/useGame';

// Интервал автосохранения (30 секунд)
const SAVE_INTERVAL = 30 * 1000;

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  // Загружаем сохраненное состояние при запуске игры
  const loadedState = loadGameState();
  
  // Инициализируем состояние и редьюсер
  const [state, dispatch] = useReducer(
    gameReducer, 
    loadedState || { ...initialState, gameStarted: true, lastUpdate: Date.now() }
  );
  
  // Обновление ресурсов каждую секунду
  useEffect(() => {
    if (!state.gameStarted) return;
    
    const intervalId = setInterval(() => {
      dispatch({ type: 'UPDATE_RESOURCES' });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [state.gameStarted]);
  
  // Автосохранение каждые 30 секунд
  useEffect(() => {
    if (!state.gameStarted) return;
    
    const intervalId = setInterval(() => {
      saveGameState(state);
    }, SAVE_INTERVAL);
    
    // Также сохраняем игру при закрытии/перезагрузке страницы
    const handleBeforeUnload = () => {
      saveGameState(state);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state]);
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      <GameEventSystem />
      {children}
    </GameContext.Provider>
  );
}
