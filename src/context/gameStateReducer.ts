
import { GameState } from './types';
import { initialState } from './initialState';

export const processStartGame = (state: GameState): GameState => {
  return {
    ...state,
    gameStarted: true,
    lastUpdate: Date.now()
  };
};

export const processLoadGame = (state: GameState, payload: GameState): GameState => {
  return {
    ...state,
    ...payload,
    gameStarted: true,
    lastUpdate: Date.now(),
    lastSaved: Date.now()
  };
};

export const processPrestige = (state: GameState): GameState => {
  // Расчет очков престижа
  const prestigePoints = state.prestigePoints || 0;
  const newPrestigePoints = prestigePoints + calculatePrestigePoints(state);
  
  // Возвращаем состояние к начальному, но сохраняем некоторые значения
  return {
    ...initialState,
    prestigePoints: newPrestigePoints,
    gameStarted: true,
    lastUpdate: Date.now(),
    lastSaved: Date.now(),
    language: state.language // Сохраняем языковые настройки
  };
};

export const processResetGame = (state: GameState): GameState => {
  return {
    ...initialState,
    gameStarted: true,
    lastUpdate: Date.now(),
    lastSaved: Date.now(),
    language: state.language // Сохраняем языковые настройки
  };
};

export const processRestartComputers = (state: GameState): GameState => {
  // Логика перезапуска компьютеров
  return state;
};

// Вспомогательная функция для расчета очков престижа
const calculatePrestigePoints = (state: GameState): number => {
  // Здесь можно реализовать логику расчета очков престижа
  return 1; // Заглушка
};
