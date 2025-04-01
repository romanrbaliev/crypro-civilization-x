
import { useState, useEffect } from 'react';
import { GameState } from '@/context/types';
import { initialState } from '@/context/initialState';
import { loadGame } from '@/utils/gameLoader';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

// Вспомогательная функция для получения значения счетчика
const getCounterValue = (state: GameState, counterId: string): number => {
  const counter = state.counters[counterId];
  if (!counter) return 0;
  
  if (typeof counter === 'object' && 'value' in counter) {
    return counter.value;
  }
  
  return typeof counter === 'number' ? counter : 0;
};

export function useGameLoader(
  hasConnection: boolean,
  setLoadingMessage: (message: string) => void
) {
  const [loadedState, setLoadedState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [gameInitialized, setGameInitialized] = useState<boolean>(false);
  
  useEffect(() => {
    const loadGameData = async () => {
      try {
        if (!hasConnection) {
          setLoadedState(null);
          setIsLoading(false);
          setGameInitialized(true);
          return;
        }
        
        setLoadingMessage('Загружаем данные игры...');
        setIsLoading(true);
        
        // Загружаем игру с сервера или из localStorage
        const result = await loadGame();
        
        if (!result) {
          // Если данные не загружены, используем начальное состояние
          setLoadedState({
            ...initialState,
            gameStarted: true,
            lastUpdate: Date.now(),
            lastSaved: Date.now()
          });
          setLoadingMessage('Начинаем новую игру...');
          safeDispatchGameEvent('Начинаем новую игру', 'info');
        } else {
          // Используем загруженные данные
          setLoadedState(result);
          setLoadingMessage('Восстанавливаем прогресс...');
          safeDispatchGameEvent('Прогресс восстановлен', 'success');
          
          console.log('Применение прогресса из сохранения');
        }
        
        setTimeout(() => {
          setIsLoading(false);
          setGameInitialized(true);
        }, 1500);
        
      } catch (error) {
        console.error('❌ Ошибка при загрузке игры:', error);
        safeDispatchGameEvent('Ошибка при загрузке игры', 'error');
        
        // В случае ошибки используем начальное состояние
        setLoadedState({
          ...initialState,
          gameStarted: true,
          lastUpdate: Date.now(),
          lastSaved: Date.now()
        });
        
        setLoadingMessage('Начинаем новую игру...');
        
        setTimeout(() => {
          setIsLoading(false);
          setGameInitialized(true);
        }, 1500);
      }
    };
    
    if (hasConnection && !gameInitialized) {
      loadGameData();
    }
  }, [hasConnection, setLoadingMessage, gameInitialized]);
  
  return {
    loadedState,
    isLoading,
    gameInitialized,
    setGameInitialized
  };
}
