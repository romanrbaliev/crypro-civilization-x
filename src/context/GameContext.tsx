
import React, { createContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { GameState, GameAction, Resource, Building, Upgrade } from './types';
import { initialState } from './initialState';
import { gameReducer } from './gameReducer';
import { GameEventSystem } from './GameEventSystem';
import { ensureGameEventBus } from './utils/eventBusUtils';
import { saveGame } from '@/utils/gameSaver';
import { initializeTelegram } from '@/utils/telegramInit';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useGameLoader } from '@/hooks/useGameLoader';
import { useGameSaveEvents } from '@/hooks/useGameSaveEvents';
import { useConnectionEvents } from '@/hooks/useConnectionEvents';
import { useReferralEvents } from '@/hooks/useReferralEvents';
import { getUserIdentifier } from '@/api/gameDataService';
import { Toaster } from '@/components/ui/toaster';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';

export type { Resource, Building, Upgrade };

export interface GameContextProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const GameContext = createContext<GameContextProps | undefined>(undefined);

export { useGame } from './hooks/useGame';

const SAVE_INTERVAL = 15 * 1000;

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [initialGameState, initialDispatch] = useReducer(
    gameReducer, 
    { ...initialState, gameStarted: true, lastUpdate: Date.now(), lastSaved: Date.now() }
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
  
  // Initialize event bus
  useEffect(() => {
    ensureGameEventBus();
  }, []);
  
  // Initialize Telegram
  useEffect(() => {
    if (isMountedRef.current) return;
    isMountedRef.current = true;
    
    initializeTelegram();
  }, []);
  
  // Sync referral data
  useEffect(() => {
    const syncHelperData = async () => {
      try {
        const userId = await getUserIdentifier();
        if (userId && window.__game_user_id) {
          setTimeout(() => {
            const event = new CustomEvent('refresh-referrals');
            window.dispatchEvent(event);
          }, 1500);
        }
      } catch (error) {
        console.error('❌ Ошибка при синхронизации данных помощников при запуске:', error);
      }
    };
    
    setTimeout(syncHelperData, 2000);
  }, []);
  
  // Apply loaded state
  useEffect(() => {
    if (loadedState && !isLoading && gameInitialized) {
      dispatch({ type: 'LOAD_GAME', payload: loadedState });
      
      setTimeout(() => {
        saveGame(state, hasConnection);
      }, 1000);
    }
  }, [loadedState, isLoading, gameInitialized]);
  
  // Main game update interval
  useEffect(() => {
    if (!state.gameStarted || isLoading) return;
    
    const intervalId = setInterval(() => {
      dispatch({ type: 'UPDATE_RESOURCES' });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [state.gameStarted, isLoading]);
  
  // Auto-save interval
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
  
  // Set up event listeners for save triggers
  useGameSaveEvents(state, isLoading, hasConnection, gameInitialized);
  
  // Set up event listeners for connection changes
  useConnectionEvents(state, isLoading, hasConnection, (connected) => {
    // This is a workaround since we can't use the setter from useConnectionStatus
    // In a real refactor, we might want to further restructure the hooks
    if (connected !== hasConnection) {
      window.dispatchEvent(new CustomEvent('connection-changed', { detail: { connected } }));
    }
  });
  
  // Set up event listeners for referral status updates
  useReferralEvents(state, dispatch, isLoading);
  
  // Render error screen if cloudflare error
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

  // Render error screen if no connection
  if (isInitialized && (!hasConnection)) {
    return (
      <ErrorScreen 
        title="Отсутствует соединение"
        description="Для игры в Crypto Civilization требуется стабильное подключение к интернету."
      />
    );
  }

  // Render loading screen while loading
  if (isLoading) {
    return <LoadingScreen message={loadingMessage} />;
  }
  
  // Render game with context
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      <GameEventSystem />
      {children}
      <Toaster />
    </GameContext.Provider>
  );
}
