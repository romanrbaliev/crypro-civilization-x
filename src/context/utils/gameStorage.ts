
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

// Рекурсивное объединение объектов для корректного сохранения вложенных структур
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        typeof source[key] === 'object' && 
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        if (key in target && typeof target[key] === 'object' && target[key] !== null) {
          output[key] = deepMerge(target[key], source[key]);
        } else {
          output[key] = { ...source[key] };
        }
      } else {
        output[key] = source[key];
      }
    }
  }
  
  return output;
}

// Загрузка состояния игры из localStorage
export function loadGameState(): GameState | null {
  try {
    const serializedState = localStorage.getItem(GAME_STORAGE_KEY);
    if (serializedState === null) {
      console.log('Сохранение не найдено, начинаем новую игру');
      return null;
    }
    
    const loadedState = JSON.parse(serializedState) as GameState;
    
    // Используем глубокое объединение для правильного слияния всех вложенных объектов
    const mergedState = deepMerge(initialState, loadedState);
    
    // Обновляем timestamp последнего обновления
    mergedState.lastUpdate = Date.now();
    
    console.log('Игра успешно загружена:', new Date().toLocaleTimeString());
    return mergedState;
  } catch (error) {
    console.error('Failed to load game state from localStorage:', error);
    return null;
  }
}
