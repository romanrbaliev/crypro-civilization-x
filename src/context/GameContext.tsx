
import React, { createContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { GameState, GameAction, Resource, Building, Upgrade } from './types';
import { initialState } from './initialState';
import { gameReducer } from './gameReducer';
import { saveGameState, loadGameState } from './utils/gameStorage';
import { GameEventSystem } from './GameEventSystem';
import { isTelegramWebAppAvailable } from '@/utils/helpers';
import { toast } from "@/hooks/use-toast";

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

// Интервал автосохранения (увеличиваем до 5 секунд, чтобы меньше тостов)
const SAVE_INTERVAL = 5 * 1000;

// Максимальное время ожидания загрузки (5 секунд)
const LOAD_TIMEOUT = 5000;

// Предотвращение повторных уведомлений
let loadMessageShown = false;
let saveMessageShown = false;

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  // Загружаем сохраненное состояние при запуске игры
  const [loadedState, setLoadedState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Загрузка игры...");
  
  // Предотвращаем повторную инициализацию
  const isMountedRef = React.useRef(false);
  
  // Инициализация Telegram WebApp
  useEffect(() => {
    if (isMountedRef.current) return;
    isMountedRef.current = true;
    
    console.log('🔍 Проверка Telegram WebApp при запуске GameProvider...');
    if (isTelegramWebAppAvailable()) {
      console.log('✅ Telegram WebApp обнаружен, инициализация...');
      try {
        const tg = window.Telegram.WebApp;
        
        // Отправка события готовности
        if (typeof tg.ready === 'function') {
          tg.ready();
          console.log('✅ Telegram WebApp ready отправлен');
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
  
  // Загрузка сохранения при монтировании с таймаутом
  useEffect(() => {
    const loadSavedGame = async () => {
      try {
        setLoadingMessage("Проверка наличия сохранения...");
        console.log('🔄 Начинаем загрузку сохраненной игры...');
        
        // Добавляем небольшую задержку для визуального эффекта
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setLoadingMessage("Загрузка данных игры...");
        
        // Устанавливаем таймаут для загрузки
        const loadTimeoutId = setTimeout(() => {
          console.warn('⚠️ Превышено время ожидания загрузки, начинаем новую игру');
          setLoadedState(null);
          setIsLoading(false);
          
          if (!loadMessageShown) {
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
        
        setLoadedState(savedState);
        
        // Показываем всплывающее уведомление при успешной загрузке
        if (savedState && !loadMessageShown) {
          loadMessageShown = true;
          // Небольшая задержка для более плавного UX
          setTimeout(() => {
            toast({
              title: "Игра загружена",
              description: "Ваш прогресс успешно восстановлен",
              variant: "default",
            });
          }, 1000);
        } else if (!savedState && !loadMessageShown) {
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
        if (!loadMessageShown) {
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
  
  // Инициализируем состояние и редьюсер только после загрузки
  const [state, dispatch] = useReducer(
    gameReducer, 
    loadedState || { ...initialState, gameStarted: true, lastUpdate: Date.now(), lastSaved: Date.now() }
  );
  
  // Обновление ресурсов каждую секунду
  useEffect(() => {
    if (!state.gameStarted || isLoading) return;
    
    const intervalId = setInterval(() => {
      dispatch({ type: 'UPDATE_RESOURCES' });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [state.gameStarted, isLoading]);
  
  // Автосохранение - используем ref для предотвращения множественных сохранений
  const lastSaveTimeRef = React.useRef(Date.now());
  
  useEffect(() => {
    if (!state.gameStarted || isLoading) return;
    
    console.log('🔄 Настройка автосохранения игры');
    
    // Немедленное сохранение при монтировании
    const handleFirstSave = async () => {
      await saveGameState(state);
      lastSaveTimeRef.current = Date.now();
    };
    
    handleFirstSave();
    
    // Регулярное сохранение
    const intervalId = setInterval(async () => {
      // Проверяем, прошло ли достаточно времени с последнего сохранения
      if (Date.now() - lastSaveTimeRef.current >= SAVE_INTERVAL) {
        await saveGameState(state);
        lastSaveTimeRef.current = Date.now();
      }
    }, SAVE_INTERVAL);
    
    // Сохранение при размонтировании компонента
    return () => {
      clearInterval(intervalId);
      console.log('🔄 Сохранение при размонтировании');
      saveGameState(state);
    };
  }, [state, isLoading]);
  
  // Сохранение при закрытии/перезагрузке страницы или переключении вкладок
  useEffect(() => {
    if (!state.gameStarted || isLoading) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('🔄 Страница скрыта, сохранение...');
        saveGameState(state);
      }
    };
    
    const handleBeforeUnload = () => {
      console.log('🔄 Страница закрывается, сохранение...');
      saveGameState(state);
    };
    
    // Обработчик потери фокуса окном (особенно важно для мобильных устройств)
    const handleBlur = () => {
      console.log('🔄 Окно потеряло фокус, сохранение...');
      saveGameState(state);
    };
    
    // Обработчик возвращения онлайн (для сохранения локальных изменений)
    const handleOnline = () => {
      console.log('🔄 Подключение к сети восстановлено, сохранение...');
      saveGameState(state);
      
      if (!saveMessageShown) {
        saveMessageShown = true;
        toast({
          title: "Подключение восстановлено",
          description: "Соединение с сервером восстановлено. Прогресс будет синхронизирован.",
          variant: "default",
        });
      }
    };
    
    // Обработчик перехода в офлайн
    const handleOffline = () => {
      console.log('⚠️ Соединение с сетью потеряно');
      
      if (!saveMessageShown) {
        saveMessageShown = true;
        toast({
          title: "Автономный режим",
          description: "Соединение с сервером потеряно. Игра продолжится в автономном режиме.",
          variant: "warning",
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
  }, [state, isLoading]);
  
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
