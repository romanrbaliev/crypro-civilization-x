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

export const GameContext = createContext<GameState | undefined>(undefined);
export const GameDispatch = createContext<React.Dispatch<GameAction> | undefined>(undefined);

const SAVE_INTERVAL = 15 * 1000;

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
  
  useEffect(() => {
    ensureGameEventBus();
  }, []);
  
  useEffect(() => {
    if (isMountedRef.current) return;
    isMountedRef.current = true;
    
    initializeTelegram();
  }, []);
  
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
  
  useEffect(() => {
    if (loadedState && !isLoading && gameInitialized) {
      console.log("GameContext: Загрузка сохраненного состояния");
      
      if (loadedState.buildings && loadedState.buildings.practice && loadedState.buildings.practice.count > 0) {
        if (!loadedState.unlocks.research) {
          console.log("GameContext: Принудительная разблокировка исследований");
          loadedState.unlocks.research = true;
        }
      }
      
      if (loadedState.buildings && loadedState.buildings.generator && loadedState.buildings.generator.count > 0) {
        if (!loadedState.unlocks.electricity) {
          console.log("GameContext: Принудительная разблокировка электричества");
          loadedState.unlocks.electricity = true;
        }
        
        if (loadedState.resources.electricity && !loadedState.resources.electricity.unlocked) {
          loadedState.resources.electricity.unlocked = true;
        }
      }
      
      dispatch({ type: 'LOAD_GAME', payload: loadedState });
      dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
      
      setTimeout(() => {
        console.log("Текущие разблокированные функции:", 
          Object.entries(loadedState.unlocks)
            .filter(([_, value]) => value === true)
            .map(([key]) => key)
            .join(", ")
        );
        
        console.log("Вкладка исследований разблокирована:", loadedState.unlocks.research === true);
      }, 1000);
      
      setTimeout(() => {
        saveGame(state, hasConnection);
      }, 1000);
    }
  }, [loadedState, isLoading, gameInitialized]);
  
  useEffect(() => {
    if (!state.gameStarted || isLoading) return;
    
    const intervalId = setInterval(() => {
      dispatch({ type: 'UPDATE_RESOURCES' });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [state.gameStarted, isLoading]);
  
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
  
  useGameSaveEvents(state, isLoading, hasConnection, gameInitialized);
  
  useConnectionEvents(state, isLoading, hasConnection, (connected) => {
    if (connected !== hasConnection) {
      window.dispatchEvent(new CustomEvent('connection-changed', { detail: { connected } }));
    }
  });
  
  useReferralEvents(state, dispatch, isLoading);
  
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

  if (isInitialized && (!hasConnection)) {
    return (
      <ErrorScreen 
        title="Отсутствует соединение"
        description="Для игры в Crypto Civilization требуется стабильное подключение к интернету."
      />
    );
  }

  if (isLoading) {
    return <LoadingScreen message={loadingMessage} />;
  }
  
  return (
    <GameContext.Provider value={state}>
      <GameDispatch.Provider value={dispatch}>
        <GameEventSystem />
        {children}
        <Toaster />
      </GameDispatch.Provider>
    </GameContext.Provider>
  );
}

export { useGame } from './hooks/useGame';
