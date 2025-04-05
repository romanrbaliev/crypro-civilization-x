
import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, GameAction } from '../types/game';
import { initialState } from './initialState';
import { gameReducer } from './gameReducer';
import { Toast } from '@/components/ui/toast';
import { Toaster } from '@/components/ui/toaster';

export interface GameContextProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const GameContext = createContext<GameContextProps | undefined>(undefined);

const SAVE_INTERVAL = 15 * 1000; // 15 секунд

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(
    gameReducer, 
    { 
      ...initialState, 
      gameStarted: true,
      lastUpdate: Date.now(), 
      lastSaved: Date.now(),
      resources: {
        ...initialState.resources,
        knowledge: {
          ...initialState.resources.knowledge,
          unlocked: true
        }
      }
    }
  );
  
  const isMountedRef = React.useRef(false);
  
  // Инициализация при монтировании
  useEffect(() => {
    if (isMountedRef.current) return;
    isMountedRef.current = true;
    
    // Здесь можно добавить дополнительную инициализацию
    console.log('🎮 Игра инициализирована');
  }, []);
  
  // Основной интервал обновления игры
  useEffect(() => {
    if (!state.gameStarted) return;
    
    const intervalId = setInterval(() => {
      dispatch({ type: 'UPDATE_RESOURCES' });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [state.gameStarted]);
  
  // Интервал автосохранения
  useEffect(() => {
    if (!state.gameStarted) return;
    
    console.log('🔄 Настройка автосохранения игры');
    
    const initialSaveTimeout = setTimeout(() => {
      // Здесь будет логика сохранения
      console.log('💾 Игра сохранена (первичное сохранение)');
    }, 2000);
    
    const intervalId = setInterval(() => {
      // Здесь будет логика сохранения
      console.log('💾 Игра сохранена (регулярное сохранение)');
    }, SAVE_INTERVAL);
    
    return () => {
      clearTimeout(initialSaveTimeout);
      clearInterval(intervalId);
    };
  }, [state.gameStarted]);
  
  // Отображение игрового интерфейса с контекстом
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
      <Toaster />
    </GameContext.Provider>
  );
}

// Хук для использования игрового контекста
export const useGame = () => {
  const context = React.useContext(GameContext);
  
  if (!context) {
    console.error("GameContext не найден. Убедитесь, что компонент находится внутри GameProvider");
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
};
