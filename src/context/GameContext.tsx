
import React, { createContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { GameState, GameAction, Resource, Building, Upgrade } from './types';
import { initialState } from './initialState';
import { gameReducer } from './gameReducer';
import { saveGameState, loadGameState } from './utils/gameStorage';
import { GameEventSystem } from './GameEventSystem';
import { 
  isTelegramWebAppAvailable, 
  isTelegramCloudStorageAvailable, 
  forceTelegramCloudSave 
} from '@/utils/helpers';
import { GAME_STORAGE_KEY } from './utils/gameStorage';

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
  
  // Инициализация Telegram WebApp
  useEffect(() => {
    console.log('Проверка наличия Telegram WebApp...');
    if (isTelegramWebAppAvailable()) {
      console.log('Telegram WebApp обнаружен, инициализация...');
      try {
        const tg = window.Telegram.WebApp;
        
        // Отправка события готовности
        if (typeof tg.ready === 'function') {
          tg.ready();
          console.log('Telegram WebApp ready отправлен');
        } else {
          console.warn('Telegram WebApp.ready отсутствует');
        }
        
        // Проверка инициализации данных
        if (tg.initData) {
          console.log(`Telegram WebApp initData присутствует, длина: ${tg.initData.length}`);
          
          // Проверка информации о пользователе
          if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            console.log(`Пользователь идентифицирован: id=${tg.initDataUnsafe.user.id}, username=${tg.initDataUnsafe.user.username || 'нет'}`);
          } else {
            console.warn('Информация о пользователе отсутствует');
          }
        } else {
          console.warn('Telegram WebApp initData отсутствует или пуст');
        }
        
        // Проверка доступности CloudStorage
        if (isTelegramCloudStorageAvailable()) {
          console.log('Telegram CloudStorage доступен и будет использован для сохранения данных');
        } else {
          console.warn('Telegram CloudStorage недоступен, будет использован localStorage');
        }
      } catch (error) {
        console.error('Ошибка при инициализации Telegram WebApp:', error);
      }
    } else {
      console.log('Telegram WebApp не обнаружен, использование стандартного режима');
    }
  }, []);
  
  // Загрузка сохранения при монтировании
  useEffect(() => {
    const loadSavedGame = async () => {
      try {
        console.log('Начинаем загрузку сохраненной игры...');
        const savedState = await loadGameState();
        console.log('Загрузка завершена, состояние:', savedState ? 'найдено' : 'не найдено');
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
  
  // Настройка обработчиков для Telegram WebApp
  useEffect(() => {
    // Не выполняем настройку, если игра не запущена или еще загружается
    if (!state.gameStarted || isLoading) return;
    
    // Инициализация Telegram WebApp
    if (isTelegramWebAppAvailable()) {
      console.log('Настройка обработчиков Telegram WebApp');
      const tg = window.Telegram.WebApp;
      
      // Установка поведения при изменении размера окна
      if (typeof tg.onEvent === 'function') {
        const viewportChangedHandler = async () => {
          console.log('Telegram viewportChanged зафиксирован, принудительное сохранение');
          
          // Принудительное сохранение с повторными попытками
          await saveGameState(state);
          
          // Дополнительное прямое сохранение в CloudStorage, если доступно
          if (isTelegramCloudStorageAvailable()) {
            try {
              const serialized = JSON.stringify(state);
              await forceTelegramCloudSave(serialized, GAME_STORAGE_KEY);
            } catch (e) {
              console.error('Ошибка при прямом сохранении в CloudStorage:', e);
            }
          }
        };
        
        tg.onEvent('viewportChanged', viewportChangedHandler);
        
        // Очистка при размонтировании
        return () => {
          if (typeof tg.offEvent === 'function') {
            tg.offEvent('viewportChanged', viewportChangedHandler);
          }
        };
      }
      
      // Установка обработчика Back Button, если он доступен
      if (tg.BackButton && typeof tg.BackButton.onClick === 'function') {
        tg.BackButton.onClick(async () => {
          console.log('Telegram BackButton нажата, принудительное сохранение');
          await saveGameState(state);
          
          // Дополнительное прямое сохранение
          if (isTelegramCloudStorageAvailable()) {
            try {
              const serialized = JSON.stringify(state);
              await forceTelegramCloudSave(serialized, GAME_STORAGE_KEY);
            } catch (e) {
              console.error('Ошибка при прямом сохранении в CloudStorage:', e);
            }
          }
        });
      }
      
      // Вызывается при закрытии приложения
      const handleClose = async () => {
        console.log('Telegram закрытие приложения, принудительное сохранение');
        await saveGameState(state);
        
        // Дополнительное прямое сохранение
        if (isTelegramCloudStorageAvailable()) {
          try {
            const serialized = JSON.stringify(state);
            await forceTelegramCloudSave(serialized, GAME_STORAGE_KEY);
          } catch (e) {
            console.error('Ошибка при прямом сохранении в CloudStorage:', e);
          }
        }
      };
      
      // Настройка для закрытия главной кнопкой, если она доступна
      if (tg.MainButton && typeof tg.MainButton.onClick === 'function') {
        tg.MainButton.onClick(handleClose);
      }
      
      // Принудительное сохранение при монтировании компонента
      saveGameState(state).then(() => {
        console.log('Принудительное сохранение при монтировании завершено');
      });
    }
  }, [state, isLoading]);
  
  // Автосохранение
  useEffect(() => {
    if (!state.gameStarted || isLoading) return;
    
    console.log('Настройка автосохранения игры');
    
    // Немедленное сохранение при монтировании
    saveGameState(state);
    
    // Регулярное сохранение
    const intervalId = setInterval(() => {
      saveGameState(state);
    }, SAVE_INTERVAL);
    
    // Сохранение при размонтировании компонента
    return () => {
      clearInterval(intervalId);
      console.log('Сохранение при размонтировании');
      saveGameState(state);
    };
  }, [state, isLoading]);
  
  // Сохранение при закрытии/перезагрузке страницы или переключении вкладок
  useEffect(() => {
    if (!state.gameStarted || isLoading) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('Страница скрыта, сохранение...');
        saveGameState(state);
      }
    };
    
    const handleBeforeUnload = () => {
      console.log('Страница закрывается, сохранение...');
      saveGameState(state);
    };
    
    // Обработчик потери фокуса окном (особенно важно для мобильных устройств)
    const handleBlur = () => {
      console.log('Окно потеряло фокус, сохранение...');
      saveGameState(state);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('blur', handleBlur);
    
    // Дополнительное сохранение для Telegram при закрытии приложения
    if (isTelegramWebAppAvailable()) {
      window.addEventListener('popstate', handleBeforeUnload);
      console.log('Настроено сохранение при закрытии Telegram WebApp');
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
