
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, GameAction, Resource, Building, Upgrade } from './types';
import { initialState } from './initialState';
import { gameReducer } from './gameReducer';

// Экспортируем типы для использования в других компонентах
export type { Resource, Building, Upgrade };

// Создаем контекст с начальным значением
interface GameContextProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

// Хук для использования контекста в компонентах
export function useGame() {
  const context = useContext(GameContext);
  
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
}

// Интервал для сохранения игры (каждые 30 секунд)
const SAVE_INTERVAL = 30 * 1000;

// Провайдер контекста
interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  // Загружаем сохраненное состояние игры из localStorage при инициализации
  const loadedState = loadGameState();
  
  // Используем useReducer для управления состоянием игры
  const [state, dispatch] = useReducer(gameReducer, loadedState || initialState);
  
  // Обновляем ресурсы каждую секунду
  useEffect(() => {
    // Запускаем только если игра началась
    if (!state.gameStarted) return;
    
    const intervalId = setInterval(() => {
      dispatch({ type: 'UPDATE_RESOURCES' });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [state.gameStarted]);
  
  // Автоматически сохраняем состояние игры
  useEffect(() => {
    // Запускаем только если игра началась
    if (!state.gameStarted) return;
    
    const intervalId = setInterval(() => {
      saveGameState(state);
    }, SAVE_INTERVAL);
    
    return () => clearInterval(intervalId);
  }, [state]);
  
  // Предоставляем контекст всем дочерним компонентам
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// Функция для сохранения состояния игры в localStorage
function saveGameState(state: GameState) {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('cryptoCivGame', serializedState);
  } catch (error) {
    console.error('Failed to save game state to localStorage:', error);
  }
}

// Функция для загрузки состояния игры из localStorage
function loadGameState(): GameState | null {
  try {
    const serializedState = localStorage.getItem('cryptoCivGame');
    if (serializedState === null) {
      return null;
    }
    const state = JSON.parse(serializedState) as GameState;
    
    // Добавляем новые свойства, которые могли быть добавлены в обновлении игры
    const mergedState = {
      ...initialState,
      ...state,
      resources: {
        ...initialState.resources,
        ...state.resources
      },
      buildings: {
        ...initialState.buildings,
        ...state.buildings
      },
      upgrades: {
        ...initialState.upgrades,
        ...state.upgrades
      },
      unlocks: {
        ...initialState.unlocks,
        ...state.unlocks
      }
    };
    
    // Обновляем временную метку
    mergedState.lastUpdate = Date.now();
    
    // Убираем сообщение о загрузке прогресса
    return mergedState;
  } catch (error) {
    console.error('Failed to load game state from localStorage:', error);
    return null;
  }
}
