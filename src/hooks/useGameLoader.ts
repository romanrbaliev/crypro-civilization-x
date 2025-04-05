
import { useState, useEffect } from 'react';
import { GameState } from '@/context/types';
import { loadGameState } from '@/api/gameStorage';
import { initialState } from '@/context/initialState';

/**
 * Хук для загрузки состояния игры
 */
export function useGameLoader(
  hasConnection: boolean,
  setLoadingMessage: (message: string) => void
) {
  const [loadedState, setLoadedState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [gameInitialized, setGameInitialized] = useState<boolean>(false);
  
  // Загрузка состояния при инициализации
  useEffect(() => {
    async function loadGame() {
      try {
        setIsLoading(true);
        setLoadingMessage('Подключение к серверу...');
        
        if (!hasConnection) {
          setLoadingMessage('Нет соединения с сервером. Загрузка локального состояния...');
          setIsLoading(false);
          
          // Возвращаем начальное состояние при отсутствии соединения
          const defaultState = {
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
          };
          
          setLoadedState(defaultState);
          setGameInitialized(true);
          return;
        }
        
        setLoadingMessage('Загрузка прогресса...');
        
        // Загружаем состояние с сервера
        const state = await loadGameState();
        
        if (state) {
          setLoadedState(state);
          setLoadingMessage('Прогресс успешно загружен');
        } else {
          console.log('Сохранение не найдено, используем начальное состояние');
          setLoadingMessage('Начинаем новую игру');
          
          // Используем начальное состояние, если нет сохранения
          const defaultState = {
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
          };
          
          setLoadedState(defaultState);
        }
        
        setIsLoading(false);
        setGameInitialized(true);
      } catch (error) {
        console.error('Ошибка при загрузке игры:', error);
        setLoadingMessage('Ошибка при загрузке. Начинаем новую игру');
        
        // В случае ошибки используем начальное состояние
        const defaultState = {
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
        };
        
        setLoadedState(defaultState);
        setIsLoading(false);
        setGameInitialized(true);
      }
    }
    
    if (!gameInitialized) {
      loadGame();
    }
  }, [hasConnection, gameInitialized, setLoadingMessage]);
  
  return {
    loadedState,
    isLoading,
    gameInitialized,
    setGameInitialized
  };
}
