
import { GameState } from '../types';
import { initialState } from '../initialState';

// Константа с именем ключа локального хранилища
export const GAME_STORAGE_KEY = 'cryptoCivilizationSave';

// Сохранение состояния игры в localStorage
export function saveGameState(state: GameState): void {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(GAME_STORAGE_KEY, serializedState);
    console.log('Игра успешно сохранена:', new Date().toLocaleTimeString());
  } catch (error) {
    console.error('Failed to save game state to localStorage:', error);
  }
}

// Загрузка состояния игры из localStorage
export function loadGameState(): GameState | null {
  try {
    const serializedState = localStorage.getItem(GAME_STORAGE_KEY);
    if (serializedState === null) {
      console.log('Сохранение не найдено, начинаем новую игру');
      return null;
    }
    
    const state = JSON.parse(serializedState) as GameState;
    
    // Объединяем загруженное состояние с начальным, чтобы учесть новые поля
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
    
    console.log('Игра успешно загружена:', new Date().toLocaleTimeString());
    return mergedState;
  } catch (error) {
    console.error('Failed to load game state from localStorage:', error);
    return null;
  }
}
