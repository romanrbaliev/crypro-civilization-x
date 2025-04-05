
import React, { createContext, useReducer, useEffect } from 'react';
import { gameReducer } from './gameReducer';
import { initialState } from './initialState';
import { GameState, GameDispatch, GameContextProps } from './types';
import { loadGameFromServer } from '@/api/gameStorage';
import { safeDispatchGameEvent } from './utils/eventBusUtils';

// Создаем контекст
export const GameContext = createContext<GameContextProps>({
  state: initialState,
  dispatch: () => {},
  forceUpdate: () => {},
  isPageVisible: true
});

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [isPageVisible, setIsPageVisible] = React.useState(true);
  const [, setForceUpdateCounter] = React.useState(0);
  
  // Функция для принудительного обновления UI
  const forceUpdate = () => {
    setForceUpdateCounter(prev => prev + 1);
  };

  // Обработчик видимости страницы
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      setIsPageVisible(isVisible);
      
      if (isVisible) {
        dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
        console.log("Вкладка стала видимой, принудительное обновление ресурсов");
      } else {
        console.log("Вкладка стала невидимой");
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Загрузка сохраненной игры при монтировании
  useEffect(() => {
    const loadSavedGame = async () => {
      try {
        const savedGame = await loadGameFromServer();
        
        if (savedGame) {
          dispatch({ type: 'LOAD_GAME', payload: savedGame });
          safeDispatchGameEvent('Игра успешно загружена', 'success');
          console.log("Загружено сохранение игры:", savedGame);
        } else {
          dispatch({ type: 'START_GAME' });
          safeDispatchGameEvent('Начата новая игра', 'info');
          console.log("Сохранение не найдено, начата новая игра");
        }
      } catch (error) {
        console.error('Ошибка при загрузке сохранения:', error);
        safeDispatchGameEvent('Ошибка при загрузке игры', 'error');
        dispatch({ type: 'START_GAME' });
      }
    };
    
    loadSavedGame();
  }, []);
  
  const contextValue = {
    state,
    dispatch,
    forceUpdate,
    isPageVisible
  };
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};
