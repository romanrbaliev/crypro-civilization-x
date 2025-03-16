import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, GameAction, Resource, Building, Upgrade } from './types';
import { initialState } from './initialState';
import { gameReducer } from './gameReducer';

export type { Resource, Building, Upgrade };

interface GameContextProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export function useGame() {
  const context = useContext(GameContext);
  
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
}

const SAVE_INTERVAL = 30 * 1000;

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const loadedState = loadGameState();
  
  const [state, dispatch] = useReducer(gameReducer, loadedState || initialState);
  
  useEffect(() => {
    const eventBus = document.createElement('div');
    
    const handleGameEvent = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.message) {
        const message = event.detail.message;
        
        if (message.includes("Открыта новая функция: Применить знания")) {
          const detailEvent = new CustomEvent('game-event', { 
            detail: { 
              message: "Накопите 10 знаний, чтобы применить их и получить USDT",
              type: "info"
            } 
          });
          setTimeout(() => eventBus.dispatchEvent(detailEvent), 200);
        }
        else if (message.includes("После применения знаний открыта функция 'Практика'")) {
          const detailEvent = new CustomEvent('game-event', { 
            detail: { 
              message: "Накопите 10 USDT, чтобы начать практиковаться и включить фоновое накопление знаний",
              type: "info"
            } 
          });
          setTimeout(() => eventBus.dispatchEvent(detailEvent), 200);
        }
        else if (message.includes("Открыто новое оборудование: Генератор")) {
          const detailEvent = new CustomEvent('game-event', { 
            detail: { 
              message: "Генератор позволяет вырабатывать электричество, необходимое для других устройств",
              type: "info"
            } 
          });
          setTimeout(() => eventBus.dispatchEvent(detailEvent), 200);
        }
        else if (message.includes("Открыто новое оборудование: Домашний компьютер")) {
          const detailEvent = new CustomEvent('game-event', { 
            detail: { 
              message: "Домашний компьютер потребляет 1 электричество/сек и производит вычислительную мощность",
              type: "info"
            } 
          });
          setTimeout(() => eventBus.dispatchEvent(detailEvent), 200);
        }
        else if (message.includes("Открыто новое оборудование: Автомайнер")) {
          const detailEvent = new CustomEvent('game-event', { 
            detail: { 
              message: "Автомайнер автоматически обменивает 50 единиц вычислительной мощности на 5 USDT каждые 5 секунд",
              type: "info"
            } 
          });
          setTimeout(() => eventBus.dispatchEvent(detailEvent), 200);
        }
        else if (message.includes("Разблокировано исследование 'Основы блокчейна'")) {
          const detailEvent = new CustomEvent('game-event', { 
            detail: { 
              message: "Исследование дает +50% к максимальному хранению знаний и открывает криптокошелек",
              type: "info"
            } 
          });
          setTimeout(() => eventBus.dispatchEvent(detailEvent), 200);
        }
        else if (message.includes("Разблокировано исследование 'Безопасность криптокошельков'")) {
          const detailEvent = new CustomEvent('game-event', { 
            detail: { 
              message: "Исследование дает +25% к максимальному хранению USDT",
              type: "info"
            } 
          });
          setTimeout(() => eventBus.dispatchEvent(detailEvent), 200);
        }
      }
    };
    
    window.gameEventBus = eventBus;
    eventBus.addEventListener('game-event', handleGameEvent);
    
    if (state.unlocks.practice && !state.buildings.practice.count) {
      setTimeout(() => {
        const practiceEvent = new CustomEvent('game-event', {
          detail: {
            message: "Функция 'Практика' разблокирована",
            type: "info"
          }
        });
        eventBus.dispatchEvent(practiceEvent);
        
        setTimeout(() => {
          const detailEvent = new CustomEvent('game-event', {
            detail: {
              message: "Накопите 10 USDT, чтобы начать практиковаться и включить фоновое накопление знаний",
              type: "info"
            }
          });
          eventBus.dispatchEvent(detailEvent);
        }, 200);
      }, 500);
    }
    
    return () => {
      eventBus.removeEventListener('game-event', handleGameEvent);
      delete window.gameEventBus;
    };
  }, [state.unlocks.practice, state.buildings.practice.count]);
  
  useEffect(() => {
    if (!state.gameStarted) return;
    
    const intervalId = setInterval(() => {
      dispatch({ type: 'UPDATE_RESOURCES' });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [state.gameStarted]);
  
  useEffect(() => {
    if (!state.gameStarted) return;
    
    const intervalId = setInterval(() => {
      saveGameState(state);
    }, SAVE_INTERVAL);
    
    return () => clearInterval(intervalId);
  }, [state]);
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

function saveGameState(state: GameState) {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('cryptoCivGame', serializedState);
  } catch (error) {
    console.error('Failed to save game state to localStorage:', error);
  }
}

function loadGameState(): GameState | null {
  try {
    const serializedState = localStorage.getItem('cryptoCivGame');
    if (serializedState === null) {
      return null;
    }
    const state = JSON.parse(serializedState) as GameState;
    
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
      },
      counters: {
        ...initialState.counters,
        ...state.counters
      }
    };
    
    mergedState.lastUpdate = Date.now();
    
    return mergedState;
  } catch (error) {
    console.error('Failed to load game state from localStorage:', error);
    return null;
  }
}

declare global {
  interface Window {
    gameEventBus?: HTMLDivElement;
  }
}
