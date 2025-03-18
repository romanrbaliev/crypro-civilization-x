
import React, { createContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { GameState, GameAction, Resource, Building, Upgrade } from './types';
import { initialState } from './initialState';
import { gameReducer } from './gameReducer';
import { saveGameState, loadGameState } from './utils/gameStorage';
import { GameEventSystem } from './GameEventSystem';
import { isTelegramWebAppAvailable } from '@/utils/helpers';
import { toast } from "@/hooks/use-toast";
import { ensureGameEventBus } from './utils/eventBusUtils';
import { checkSupabaseConnection } from '@/api/gameDataService';

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

// Интервал автосохранения (увеличиваем до 15 секунд для меньшей нагрузки)
const SAVE_INTERVAL = 15 * 1000;

// Максимальное время ожидания загрузки (10 секунд)
const LOAD_TIMEOUT = 10000;

// Предотвращение повторных уведомлений
let loadMessageShown = false;
let saveMessageShown = false;
let connectionErrorShown = false;

// Время последнего сохранения (для предотвращения частых сохранений)
let lastSaveTime = 0;
// Флаг для отслеживания процесса сохранения
let isSavingInProgress = false;

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  // Создаем шину событий при инициализации провайдера
  useEffect(() => {
    ensureGameEventBus();
  }, []);
  
  // Загружаем сохраненное состояние при запуске игры
  const [loadedState, setLoadedState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Загрузка игры...");
  const [hasConnection, setHasConnection] = useState(true);
  
  // Предотвращаем повторную инициализацию
  const isMountedRef = React.useRef(false);
  
  // Проверка соединения с Supabase
  useEffect(() => {
    if (!isMountedRef.current) {
      const checkConnection = async () => {
        setLoadingMessage("Проверка соединения с сервером...");
        const isConnected = await checkSupabaseConnection();
        setHasConnection(isConnected);
        
        if (!isConnected && !connectionErrorShown) {
          connectionErrorShown = true;
          toast({
            title: "Ошибка соединения",
            description: "Нет соединения с сервером. Игра работает только при наличии подключения к интернету.",
            variant: "destructive",
          });
        }
      };
      
      checkConnection();
      
      // Периодически проверяем соединение
      const intervalId = setInterval(async () => {
        const isConnected = await checkSupabaseConnection();
        
        // Если состояние соединения изменилось
        if (isConnected !== hasConnection) {
          setHasConnection(isConnected);
          
          if (isConnected) {
            toast({
              title: "Соединение восстановлено",
              description: "Подключение к серверу восстановлено.",
              variant: "success",
            });
          } else {
            toast({
              title: "Соединение потеряно",
              description: "Соединение с сервером потеряно. Проверьте подключение к интернету.",
              variant: "destructive",
            });
          }
        }
      }, 30000); // Проверка каждые 30 секунд
      
      return () => clearInterval(intervalId);
    }
  }, [hasConnection]);
  
  // Инициализация Telegram WebApp
  useEffect(() => {
    if (isMountedRef.current) return;
    isMountedRef.current = true;
    
    console.log('🔍 Проверка Telegram WebApp при запуске GameProvider...');
    if (isTelegramWebAppAvailable()) {
      console.log('✅ Telegram WebApp обнаружен, инициализация...');
      try {
        const tg = window.Telegram.WebApp;
        
        // Включаем принудительный режим Telegram WebApp
        if (typeof window !== 'undefined') {
          window.__FORCE_TELEGRAM_MODE = true;
          console.log('✅ Принудительный режим Telegram WebApp включен');
        }
        
        // Отправка события готовности
        if (typeof tg.ready === 'function') {
          tg.ready();
          console.log('✅ Telegram WebApp ready отправлен');
        }
        
        // Расширяем приложение
        if (typeof tg.expand === 'function') {
          tg.expand();
          console.log('✅ Telegram WebApp расширен на весь экран');
        }
        
        // Логирование информации о пользователе
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
  
  // Показываем экран ошибки при отсутствии соединения
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
  
  // Функция сохранения с защитой от конкурентных вызовов
  const saveGame = async (gameState: GameState) => {
    // Если нет соединения с сервером, не пытаемся сохранить
    if (!hasConnection) {
      console.log('⚠️ Нет соединения с сервером, сохранение пропущено');
      return;
    }
    
    // Проверяем, не идет ли уже процесс сохранения
    if (isSavingInProgress) {
      console.log('⏳ Сохранение уже выполняется, пропускаем...');
      return;
    }
    
    // Проверяем дросселирование
    const now = Date.now();
    if (now - lastSaveTime < 2000) { // 2 секунды минимум между сохранениями
      console.log(`⏱️ Слишком частые сохранения (прошло ${now - lastSaveTime}мс)`);
      return;
    }
    
    // Устанавливаем флаги
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
      // Сбрасываем флаг в любом случае
      isSavingInProgress = false;
    }
  };
  
  // Загрузка сохранения при монтировании с улучшенной обработкой Telegram WebApp
  useEffect(() => {
    const loadSavedGame = async () => {
      try {
        setLoadingMessage("Инициализация игры...");
        // Убедимся, что шина событий создана перед загрузкой
        ensureGameEventBus();
        
        // Проверяем соединение с сервером
        setLoadingMessage("Проверка соединения с сервером...");
        const isConnected = await checkSupabaseConnection();
        setHasConnection(isConnected);
        
        if (!isConnected) {
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
        
        // Дополнительная проверка и инициализация Telegram WebApp
        if (isTelegramWebAppAvailable()) {
          console.log('✅ Обнаружен Telegram WebApp, режим Telegram активен');
          setLoadingMessage("Подключение к Telegram...");
          
          // Небольшая задержка для инициализации Telegram API
          await new Promise(resolve => setTimeout(resolve, 500));
          
          try {
            // Проверка CloudStorage API
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
        
        // Добавляем небольшую задержку для визуального эффекта
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setLoadingMessage("Загрузка данных игры...");
        
        // Устанавливаем таймаут для загрузки
        const loadTimeoutId = setTimeout(() => {
          console.warn('⚠️ Превышено время ожидания загрузки, начинаем новую игру');
          setLoadedState(null);
          setIsLoading(false);
          
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
        
        // Очищаем таймаут, если загрузка завершилась успешно
        clearTimeout(loadTimeoutId);
        
        console.log('✅ Загрузка завершена, состояние:', savedState ? 'найдено' : 'не найдено');
        
        if (savedState) {
          console.log('👉 Загруженное состояние:', JSON.stringify(savedState).substring(0, 100) + '...');
        }
        
        setLoadedState(savedState);
        
        // Показываем всплывающее уведомление при успешной загрузке
        if (savedState && !loadMessageShown && process.env.NODE_ENV !== 'development') {
          loadMessageShown = true;
          // Небольшая задержка для более плавного UX
          setTimeout(() => {
            toast({
              title: "Игра загружена",
              description: "Ваш прогресс успешно восстановлен",
              variant: "default",
            });
          }, 1000);
        } else if (!savedState && !loadMessageShown && process.env.NODE_ENV !== 'development') {
          loadMessageShown = true;
          // Если сохранение не найдено, уведомляем пользователя
          toast({
            title: "Новая игра",
            description: "Сохранения не найдены. Начинаем новую игру.",
            variant: "default",
          });
        }
      } catch (err) {
        console.error('❌ Ошибка при загрузке состояния:', err);
        
        // Показываем уведомление об ошибке
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
  }, []);
  
  // Важное исправление: используем два useReducer
  // Один для начального состояния (без загруженных данных)
  const [initialGameState, initialDispatch] = useReducer(
    gameReducer, 
    { ...initialState, gameStarted: true, lastUpdate: Date.now(), lastSaved: Date.now() }
  );
  
  // Второй для обновления состояния после загрузки сохранения
  const [state, dispatch] = useReducer(
    gameReducer, 
    loadedState || initialGameState
  );
  
  // Применяем загруженное состояние после его получения через dispatch
  useEffect(() => {
    if (loadedState && !isLoading) {
      console.log('🔄 Применяем загруженное состояние через dispatch...');
      dispatch({ type: 'LOAD_GAME', payload: loadedState });
    }
  }, [loadedState, isLoading]);
  
  // Обновление ресурсов каждую секунду
  useEffect(() => {
    if (!state.gameStarted || isLoading) return;
    
    const intervalId = setInterval(() => {
      dispatch({ type: 'UPDATE_RESOURCES' });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [state.gameStarted, isLoading]);
  
  // Автосохранение с защитой от частых сохранений
  useEffect(() => {
    if (!state.gameStarted || isLoading || !hasConnection) return;
    
    console.log('🔄 Настройка автосохранения игры');
    
    // Начальное сохранение с задержкой
    const initialSaveTimeout = setTimeout(() => {
      saveGame(state);
    }, 2000);
    
    // Регулярное сохранение
    const intervalId = setInterval(() => {
      saveGame(state);
    }, SAVE_INTERVAL);
    
    // Сохранение при размонтировании компонента
    return () => {
      clearTimeout(initialSaveTimeout);
      clearInterval(intervalId);
      console.log('🔄 Сохранение при размонтировании');
      saveGame(state);
    };
  }, [state, isLoading, hasConnection]);
  
  // Сохранение при закрытии/перезагрузке страницы или переключении вкладок
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
    
    // Обработчик потери фокуса окном (особенно важно для мобильных устройств)
    const handleBlur = () => {
      console.log('🔄 Окно потеряло фокус, сохранение...');
      saveGame(state);
    };
    
    // Обработчик возвращения онлайн (для сохранения локальных изменений)
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
    
    // Обработчик перехода в офлайн
    const handleOffline = () => {
      console.log('⚠️ Соединение с сетью потеряно');
      setHasConnection(false);
      
      if (!saveMessageShown && process.env.NODE_ENV !== 'development') {
        saveMessageShown = true;
        toast({
          title: "Соединение потеряно",
          description: "Соединение с сервером потеряно. Игра может работать некорректно.",
          variant: "destructive",
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state, isLoading, hasConnection]);
  
  // Отображение экрана загрузки
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
