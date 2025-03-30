
import { GameState } from '../types';
import { initialState } from '../initialState';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { GameStateService } from '@/services/GameStateService';

const gameStateService = new GameStateService();

// Обработка запуска игры
export const processStartGame = (state: GameState): GameState => {
  if (state.gameStarted) {
    return state;
  }
  
  const newState = {
    ...state,
    gameStarted: true,
    lastUpdate: Date.now()
  };
  
  // Применяем централизованное обновление состояния через сервис
  return gameStateService.performFullStateSync(newState);
};

// Обработка загрузки сохранения
export const processLoadGame = (state: GameState, loadedState: GameState): GameState => {
  console.log('Загрузка сохраненной игры');
  
  const newState = {
    ...loadedState,
    lastUpdate: Date.now()
  };
  
  // Применяем централизованное обновление состояния через сервис
  const syncedState = gameStateService.performFullStateSync(newState);
  
  safeDispatchGameEvent('Игра успешно загружена', 'success');
  return syncedState;
};

// Обработка престижа
export const processPrestige = (state: GameState): GameState => {
  // Расчет очков престижа на основе прогресса
  const currentPrestige = state.prestigePoints || 0;
  const prestigeFromThisRun = calculatePrestigePoints(state);
  
  const newState = {
    ...initialState,
    prestigePoints: currentPrestige + prestigeFromThisRun,
    gameStarted: true,
    lastUpdate: Date.now()
  };
  
  safeDispatchGameEvent(`Вы получили ${prestigeFromThisRun} очков престижа. Всего: ${currentPrestige + prestigeFromThisRun}`, 'success');
  
  // Применяем централизованное обновление состояния через сервис
  return gameStateService.performFullStateSync(newState);
};

// Обработка полного сброса игры
export const processResetGame = (state: GameState): GameState => {
  const newState = {
    ...initialState,
    gameStarted: true,
    lastUpdate: Date.now()
  };
  
  safeDispatchGameEvent('Игра сброшена', 'info');
  
  // Применяем централизованное обновление состояния через сервис
  return gameStateService.performFullStateSync(newState);
};

// Обработка перезапуска компьютеров
export const processRestartComputers = (state: GameState): GameState => {
  // Добавьте здесь логику перезапуска компьютеров
  
  safeDispatchGameEvent('Компьютеры перезапущены', 'success');
  
  // Применяем централизованное обновление состояния через сервис
  return gameStateService.performFullStateSync(state);
};

// Вспомогательная функция для расчета очков престижа
function calculatePrestigePoints(state: GameState): number {
  // Примерная формула: log(общая_стоимость_активов / 1000) * модификатор_сложности
  
  // Подсчет общей стоимости активов (например, USDT + Bitcoin*курс)
  const usdtAmount = state.resources.usdt?.value || 0;
  const bitcoinAmount = state.resources.bitcoin?.value || 0;
  const bitcoinRate = state.miningParams?.exchangeRate || 20000;
  
  const totalAssets = usdtAmount + (bitcoinAmount * bitcoinRate);
  
  if (totalAssets < 1000) return 0; // Минимальный порог для получения очков престижа
  
  const difficultyModifier = 1.0; // Может быть изменен в зависимости от баланса игры
  
  // Формула: натуральный логарифм от (активы/1000) * модификатор
  const prestigePoints = Math.floor(Math.log(totalAssets / 1000) * difficultyModifier);
  
  return Math.max(0, prestigePoints);
}
