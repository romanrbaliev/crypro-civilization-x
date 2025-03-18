import React, { createContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { GameState, GameAction, Resource, Building, Upgrade } from './types';
import { initialState } from './initialState';
import { gameReducer } from './gameReducer';
import { saveGameState, loadGameState } from './utils/gameStorage';
import { GameEventSystem } from './GameEventSystem';
import { isTelegramWebAppAvailable } from '@/utils/helpers';
import { toast } from "@/hooks/use-toast";
import { ensureGameEventBus } from './utils/eventBusUtils';
import { checkSupabaseConnection, createSavesTableIfNotExists } from '@/api/gameDataService';

export type { Resource, Building, Upgrade };

export interface GameContextProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const GameContext = createContext<GameContextProps | undefined>(undefined);

export { useGame } from './hooks/useGame';

const SAVE_INTERVAL = 15 * 1000;
const LOAD_TIMEOUT = 10000;

let loadMessageShown = false;
let saveMessageShown = false;
let connectionErrorShown = false;

let lastSaveTime = 0;
let isSavingInProgress = false;

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  useEffect(() => {
    ensureGameEventBus();
  }, []);
  
  const [loadedState, setLoadedState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Загрузка игры...");
  const [hasConnection, setHasConnection] = useState(true);
  const [gameInitialized, setGameInitialized] = useState(false);
  
  const isMountedRef = React.useRef(false);
  
  useEffect(() => {
    if (!isMountedRef.current) {
      const checkConnection = async () => {
        setLoadingMessage("Проверка соединения с сервером...");
        const isConnected = await checkSupabaseConnection();
        setHasConnection(isConnected);
        
        if (isConnected) {
          await createSavesTableIfNotExists();
        } else if (!connectionErrorShown) {
          connectionErrorShown = true;
          toast({
            title: "Ошибка соединения",
            description: "Нет соединения с сервером. Игра работает только при наличии подключения к интернету.",
            variant: "destructive",
          });
        }
      };
      
      checkConnection();
      
      const intervalId = setInterval(async () => {
        const isConnected = await checkSupabaseConnection();
        
        if (isConnected !== hasConnection) {
          setHasConnection(isConnected);
          
          if (isConnected) {
            toast({
              title: "Соединение восстановлено",
              description: "Подключение к серверу восстановлено.",
              variant: "success",
            });
            
            await createSavesTableIfNotExists();
          } else {
            toast({
              title: "Соединение потеряно",
              description: "Соединение с сервером потеряно. Проверьте подключение к интернету.",
              variant: "destructive",
            });
          }
        }
      }, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [hasConnection]);
  
  useEffect(() => {
    if (isMountedRef.current) return;
    isMountedRef.current = true;
    
    console.log('🔍 Проверка Telegram WebApp при запуске GameProvider...');
    if (isTelegramWebAppAvailable()) {
      console.log('✅ Telegram WebApp обнаружен, инициализация...');
      try {
        const tg = window.Telegram.WebApp;
        
        if (typeof window !== 'undefined') {
          window.__FORCE_TELEGRAM_MODE = true;
          console.log('✅ Принудительный режим Telegram WebApp включен');
        }
        
        if (typeof tg.ready === 'function') {
          tg.ready();
          console.log('✅ Telegram WebApp ready отправлен');
        }
        
        if (typeof tg.expand === 'function') {
          tg.expand();
          console.log('✅ Telegram WebApp расширен на весь экран');
        }
        
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
          console.log(`✅ Пользователь идентифицирован: id=${tg.initDataUnsafe.user.id}, username=${tg.initDataUnsafe.user.username || 'нет'}`);
        }
      } catch (error) {
        console.error('❌ Ошибка при инициализации Telegram WebApp:', error);
      }
    } else {
      console.log('ℹ️ Telegram WebApp не обнаружен, использование стандартного режима');
    }
  }, []);
  
  if (!hasConnection && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-50 to-white text-center p-6">
        <div className="w-16 h-16 text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Нет соединения с сервером</h1>
        <p className="mb-6 text-gray-600">Для работы игры требуется подключение к интернету. Пожалуйста, проверьте ваше соединение и обновите страницу.</p>
        <button 
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => window.location.reload()}
        >
          Обновить страницу
        </button>
      </div>
    );
  }
  
  const saveGame = async (gameState: GameState) => {
    if (!hasConnection) {
      console.log('⚠️ Нет соединения с сервером, сохранение пропущено');
      return;
    }
    
    if (isSavingInProgress) {
      console.log('⏳ Сохранение уже выполняется, пропускаем...');
      return;
    }
    
    const now = Date.now();
    if (now - lastSaveTime < 2000) {
      console.log(`⏱️ Слишком частые сохранения (прошло ${now - lastSaveTime}мс)`);
      return;
    }
    
    isSavingInProgress = true;
    lastSaveTime = now;
    
    try {
      console.log(`🔄 Запуск сохранения игры из GameContext (размер: ~${JSON.stringify(gameState).length}b)`);
      
      const success = await saveGameState(gameState);
      
      if (success) {
        console.log('✅ Игра успешно сохранена через GameContext');
      } else {
        console.warn('⚠️ Возникли проблемы при сохранении игры через GameContext');
      }
    } catch (error) {
      console.error('❌ Ошибка при сохранении игры:', error);
    } finally {
      isSavingInProgress = false;
    }
  };
  
  useEffect(() => {
    const loadSavedGame = async () => {
      try {
        if (gameInitialized) return;
        
        setLoadingMessage("Инициализация игры...");
        ensureGameEventBus();
        
        setLoadingMessage("Проверка соединения с сервером...");
        const isConnected = await checkSupabaseConnection();
        setHasConnection(isConnected);
        
        if (isConnected) {
          await createSavesTableIfNotExists();
        } else {
          setLoadingMessage("Нет соединения с сервером");
          setIsLoading(false);
          
          if (!connectionErrorShown) {
            connectionErrorShown = true;
            toast({
              title: "Ошибка соединения",
              description: "Нет соединения с сервером. Игра работает только при наличии подключения к интернету.",
              variant: "destructive",
            });
          }
          
          return;
        }
        
        setLoadingMessage("Проверка наличия сохранения...");
        console.log('🔄 Начинаем загрузку сохраненной игры...');
        
        if (isTelegramWebAppAvailable()) {
          console.log('✅ Обнаружен Telegram WebApp, режим Telegram активен');
          setLoadingMessage("Подключение к Telegram...");
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
          try {
            if (window.Telegram?.WebApp?.CloudStorage) {
              setLoadingMessage("Проверка сохранений в Telegram...");
              console.log('✅ CloudStorage API доступен, проверяем наличие сохранений...');
            } else {
              console.warn('⚠️ CloudStorage API недоступен');
            }
          } catch (telegramError) {
            console.error('❌ Ошибка при подготовке Telegram:', telegramError);
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setLoadingMessage("Загрузка данных игры...");
        
        const loadTimeoutId = setTimeout(() => {
          console.warn('⚠️ Превышено время ожидания загрузки, начинаем новую игру');
          setLoadedState(null);
          setIsLoading(false);
          setGameInitialized(true);
          
          if (!loadMessageShown && process.env.NODE_ENV !== 'development') {
            loadMessageShown = true;
            toast({
              title: "Ошибка загрузки",
              description: "Превышено время ожидания загрузки. Начинаем новую игру.",
              variant: "destructive",
            });
          }
        }, LOAD_TIMEOUT);
        
        const savedState = await loadGameState();
        
        clearTimeout(loadTimeoutId);
        
        console.log('✅ Загрузка завершена, состояние:', savedState ? 'найдено' : 'не найдено');
        
        if (savedState) {
          console.log('👉 Загруженное состояние:', JSON.stringify(savedState).substring(0, 100) + '...');
        }
        
        setLoadedState(savedState);
        setGameInitialized(true);
        
        if (savedState && !loadMessageShown && process.env.NODE_ENV !== 'development') {
          loadMessageShown = true;
          setTimeout(() => {
            toast({
              title: "Игра загружена",
              description: "Ваш прогресс успешно восстановлен",
              variant: "default",
            });
          }, 1000);
        } else if (!savedState && !loadMessageShown && process.env.NODE_ENV !== 'development') {
          loadMessageShown = true;
          toast({
            title: "Новая игра",
            description: "Сохранения не найдены. Начинаем новую игру.",
            variant: "default",
          });
        }
      } catch (err) {
        console.error('❌ Ошибка при загрузке состояния:', err);
        setGameInitialized(true);
        
        if (!loadMessageShown && process.env.NODE_ENV !== 'development') {
          loadMessageShown = true;
          toast({
            title: "Ошибка загрузки",
            description: "Не удалось загрузить сохраненную игру. Начинаем новую игру.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedGame();
  }, [gameInitialized]);
  
  const [initialGameState, initialDispatch] = useReducer(
    gameReducer, 
    { ...initialState, gameStarted: true, lastUpdate: Date.now(), lastSaved: Date.now() }
  );
  
  const [state, dispatch] = useReducer(
    gameReducer, 
    loadedState || initialGameState
  );
  
  useEffect(() => {
    if (loadedState && !isLoading && gameInitialized) {
      dispatch({ type: 'LOAD_GAME', payload: loadedState });
      
      setTimeout(() => {
        saveGame(state);
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
      saveGame(state);
    }, 2000);
    
    const intervalId = setInterval(() => {
      saveGame(state);
    }, SAVE_INTERVAL);
    
    return () => {
      clearTimeout(initialSaveTimeout);
      clearInterval(intervalId);
      console.log('🔄 Сохранение при размонтировании');
      saveGame(state);
    };
  }, [state, isLoading, hasConnection, gameInitialized]);
  
  useEffect(() => {
    if (!state.gameStarted || isLoading || !hasConnection) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('🔄 Страница скрыта, сохранение...');
        saveGame(state);
      }
    };
    
    const handleBeforeUnload = () => {
      console.log('🔄 Страница закрывается, сохранение...');
      saveGame(state);
    };
    
    const handleBlur = () => {
      console.log('🔄 Окно потеряло фокус, сохранение...');
      saveGame(state);
    };
    
    const handleOnline = () => {
      console.log('🔄 Подключение к сети восстановлено, сохранение...');
      setHasConnection(true);
      saveGame(state);
      
      if (!saveMessageShown && process.env.NODE_ENV !== 'development') {
        saveMessageShown = true;
        toast({
          title: "Подключение восстановлено",
          description: "Соединение с сервером восстановлено. Прогресс будет синхронизирован.",
          variant: "success",
        });
      }
    };
    
    const handleOffline = () => {
      console.log('⚠️ Соединение с сетью потеряно');
      setHasConnection(false);
      
      if (!saveMessageShown && process.env.NODE_ENV !== 'development') {
        saveMessageShown = true;
        toast({
          title: "Соединение по��еряно",
          description: "Соединение с сервером потеряно. Игра может работать некорректно.",
          variant: "destructive",
        });
      }
    };
    
    const handleUpdateReferralStatus = (event: CustomEvent) => {
      const { referralId, activated } = event.detail;
      console.log(`Получено событие обновления статуса реферала в GameContext: ${referralId}, активирован=${activated}`);
      
      dispatch({
        type: "UPDATE_REFERRAL_STATUS",
        payload: { referralId, activated }
      });
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('update-referral-status', handleUpdateReferralStatus as EventListener);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('update-referral-status', handleUpdateReferralStatus as EventListener);
    };
  }, [state, isLoading, hasConnection]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
        <div className="text-xl font-bold mb-2">{loadingMessage}</div>
        <div className="text-sm text-gray-300">Пожалуйста, подождите...</div>
      </div>
    );
  }
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      <GameEventSystem />
      {children}
    </GameContext.Provider>
  );
}
