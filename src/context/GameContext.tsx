
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

// Интервал автосохранения (15 секунд)
const SAVE_INTERVAL = 15 * 1000;

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  // Загружаем сохраненное состояние при запуске игры
  const [loadedState, setLoadedState] = React.useState<GameState | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Загрузка сохранения при монтировании
  useEffect(() => {
    try {
      const savedState = loadGameState();
      setLoadedState(savedState);
    } catch (err) {
      console.error('Ошибка при загрузке состояния:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Инициализируем состояние и редьюсер только после загрузки
  const [state, dispatch] = useReducer(
    gameReducer, 
    loadedState || { ...initialState, gameStarted: true, lastUpdate: Date.now() }
  );
  
  // Обновление ресурсов каждую секунду
  useEffect(() => {
    if (!state.gameStarted || isLoading) return;
    
    const intervalId = setInterval(() => {
      dispatch({ type: 'UPDATE_RESOURCES' });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [state.gameStarted, isLoading]);
  
  // Автосохранение
  useEffect(() => {
    if (!state.gameStarted || isLoading) return;
    
    // Немедленное сохранение при монтировании
    saveGameState(state);
    
    // Регулярное сохранение
    const intervalId = setInterval(() => {
      saveGameState(state);
    }, SAVE_INTERVAL);
    
    // Сохранение при размонтировании компонента
    return () => {
      clearInterval(intervalId);
      saveGameState(state);
    };
  }, [state,isLoading]);
  
  // Сохранение при закрытии/перезагрузке страницы
  useEffect(() => {
    if (!state.gameStarted || isLoading) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveGameState(state);
      }
    };
    
    const handleBeforeUnload = () => {
      saveGameState(state);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state, isLoading]);
  
  if (isLoading) {
    return null; // или компонент загрузки
  }
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      <GameEventSystem />
      {children}
    </GameContext.Provider>
  );
}
