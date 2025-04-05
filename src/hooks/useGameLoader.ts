
import { useState, useEffect } from 'react';
import { GameState } from '@/context/types';
import { loadGameState } from '@/api/gameStorage';

/**
 * Хук для загрузки состояния игры
 * @param hasConnection Есть ли соединение с сервером
 * @param setLoadingMessage Функция для установки сообщения загрузки
 */
export const useGameLoader = (
  hasConnection: boolean,
  setLoadingMessage: (message: string) => void
) => {
  const [loadedState, setLoadedState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gameInitialized, setGameInitialized] = useState(false);

  // Загрузка состояния игры при монтировании компонента
  useEffect(() => {
    const loadGame = async () => {
      if (!hasConnection) {
        setIsLoading(false);
        return;
      }
      
      setLoadingMessage("Загрузка сохраненной игры...");
      
      try {
        const savedState = await loadGameState();
        
        if (savedState) {
          setLoadedState(savedState);
          setLoadingMessage("Игра успешно загружена!");
        } else {
          setLoadingMessage("Создание новой игры...");
        }
      } catch (error) {
        console.error('Ошибка при загрузке игры:', error);
        setLoadingMessage("Ошибка при загрузке, создание новой игры...");
      } finally {
        setIsLoading(false);
        setGameInitialized(true);
      }
    };
    
    if (hasConnection) {
      loadGame();
    } else {
      setIsLoading(false);
    }
  }, [hasConnection, setLoadingMessage]);

  return {
    loadedState,
    isLoading,
    gameInitialized,
    setGameInitialized
  };
};
