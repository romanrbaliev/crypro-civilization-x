
import React, { createContext, useReducer, useEffect, ReactNode, useState } from 'react';
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

// Интервал автосохранения (5 секунд)
const SAVE_INTERVAL = 5 * 1000;

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  // Загружаем сохраненное состояние при запуске игры
  const [loadedState, setLoadedState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Загрузка сохранения при монтировании
  useEffect(() => {
    const loadSavedGame = async () => {
      try {
        const savedState = await loadGameState();
        setLoadedState(savedState);
      } catch (err) {
        console.error('Ошибка при загрузке состояния:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedGame();
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
  }, [state, isLoading]);
  
  // Сохранение при закрытии/перезагрузке страницы или переключении вкладок
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
    
    // Обработчик потери фокуса окном (особенно важно для мобильных устройств)
    const handleBlur = () => {
      saveGameState(state);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('blur', handleBlur);
    
    // Дополнительное сохранение для Telegram при закрытии приложения
    if (window.Telegram && window.Telegram.WebApp) {
      window.addEventListener('popstate', handleBeforeUnload);
      
      if (window.Telegram.WebApp.BackButton) {
        window.Telegram.WebApp.BackButton.onClick(handleBeforeUnload);
      }
      
      if (window.Telegram.WebApp.MainButton) {
        window.Telegram.WebApp.MainButton.onClick(handleBeforeUnload);
      }
    }
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('popstate', handleBeforeUnload);
    };
  }, [state, isLoading]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-xl font-bold">Загрузка игры...</div>
    </div>;
  }
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      <GameEventSystem />
      {children}
    </GameContext.Provider>
  );
}

// Добавляем типы для WebApp Telegram API
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        CloudStorage?: {
          getItem: (key: string) => Promise<string | null>;
          setItem: (key: string, value: string) => Promise<void>;
          removeItem: (key: string) => Promise<void>;
        };
        BackButton?: {
          onClick: (callback: () => void) => void;
        };
        MainButton?: {
          onClick: (callback: () => void) => void;
        };
      };
    };
  }
}
