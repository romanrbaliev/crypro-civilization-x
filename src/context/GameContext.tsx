
import React, { createContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { GameState, GameAction } from './types';
import { initialState } from './initialState';
import { gameReducer } from './gameReducer';
import { initializeTelegram } from '@/utils/telegramInit';
import { getUserIdentifier } from '@/api/userIdentification';
import { saveGame } from '@/utils/gameSaver';
import { Toaster } from '@/components/ui/toaster';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useGameLoader } from '@/hooks/useGameLoader';

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
  const [initialGameState, initialDispatch] = useReducer(
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
  
  const {
    hasConnection,
    isInitialized,
    cloudflareError,
    loadingMessage,
    setLoadingMessage
  } = useConnectionStatus();
  
  const {
    loadedState,
    isLoading,
    gameInitialized,
    setGameInitialized
  } = useGameLoader(hasConnection, setLoadingMessage);
  
  const [state, dispatch] = useReducer(
    gameReducer, 
    loadedState || initialGameState
  );
  
  const isMountedRef = React.useRef(false);
  
  // Инициализация Telegram
  useEffect(() => {
    if (isMountedRef.current) return;
    isMountedRef.current = true;
    
    initializeTelegram();
  }, []);
  
  // Синхронизация данных пользователя
  useEffect(() => {
    const syncUserData = async () => {
      try {
        const userId = await getUserIdentifier();
        if (userId && window.__game_user_id) {
          setTimeout(() => {
            const event = new CustomEvent('refresh-user-data');
            window.dispatchEvent(event);
          }, 1500);
        }
      } catch (error) {
        console.error('❌ Ошибка при синхронизации данных пользователя:', error);
      }
    };
    
    setTimeout(syncUserData, 2000);
  }, []);
  
  // Применение загруженного состояния
  useEffect(() => {
    if (loadedState && !isLoading && gameInitialized) {
      dispatch({ type: 'LOAD_GAME', payload: loadedState });
      
      setTimeout(() => {
        saveGame(state, hasConnection);
      }, 1000);
    }
  }, [loadedState, isLoading, gameInitialized]);
  
  // Основной интервал обновления игры
  useEffect(() => {
    if (!state.gameStarted || isLoading) return;
    
    const intervalId = setInterval(() => {
      dispatch({ type: 'UPDATE_RESOURCES' });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [state.gameStarted, isLoading]);
  
  // Интервал автосохранения
  useEffect(() => {
    if (!state.gameStarted || isLoading || !hasConnection || !gameInitialized) return;
    
    console.log('🔄 Настройка автосохранения игры');
    
    const initialSaveTimeout = setTimeout(() => {
      saveGame(state, hasConnection);
    }, 2000);
    
    const intervalId = setInterval(() => {
      saveGame(state, hasConnection);
    }, SAVE_INTERVAL);
    
    return () => {
      clearTimeout(initialSaveTimeout);
      clearInterval(intervalId);
    };
  }, [state, isLoading, hasConnection, gameInitialized]);
  
  // Отображение экрана ошибки при проблемах с Cloudflare
  if (isInitialized && cloudflareError) {
    return (
      <ErrorScreen 
        title="Проблема с доступом к серверу"
        description="Возможно, произошла ошибка Cloudflare или сервер временно недоступен."
        onRetry={() => {
          window.__cloudflareRetryCount = 0;
          setGameInitialized(false);
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }}
      />
    );
  }

  // Отображение экрана ошибки при отсутствии соединения
  if (isInitialized && (!hasConnection)) {
    return (
      <ErrorScreen 
        title="Отсутствует соединение"
        description="Для игры в Crypto Civilization требуется стабильное подключение к интернету."
      />
    );
  }

  // Отображение экрана загрузки
  if (isLoading) {
    return <LoadingScreen message={loadingMessage} />;
  }
  
  // Отображение игры с контекстом
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
      <Toaster />
    </GameContext.Provider>
  );
}

// Экспорт хука useGame
export { useGame } from './hooks/useGame';
