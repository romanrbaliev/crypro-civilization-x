
import { GameState, GameAction, GameEvent } from './types';
import { initialState } from './initialState';

// Импортируем все обработчики редьюсеров
import { processIncrementResource, processUnlockResource } from './reducers/resourceReducer';
import { processPurchaseBuilding } from './reducers/buildingReducer';
import { processPurchaseUpgrade } from './reducers/upgradeReducer';
import { processResourceUpdate } from './reducers/resourceUpdateReducer';
import { 
  processApplyKnowledge, 
  processMiningPower, 
  processPracticePurchase 
} from './reducers/actionsReducer';
import {
  processUnlockFeature,
  processSetBuildingUnlocked,
  processIncrementCounter
} from './reducers/unlockReducer';
import {
  processStartGame,
  processLoadGame,
  processPrestige,
  processResetGame,
  processRestartComputers
} from './reducers/gameStateReducer';
import { processExchangeBtc } from './reducers/cryptoReducer';

// Максимальное количество хранимых событий
const MAX_EVENTS = 100;

// Вспомогательная функция для добавления игрового события
export const addGameEvent = (state: GameState, message: string, type: GameEvent["type"] = "info"): GameState => {
  const newEvent: GameEvent = {
    id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    message,
    type
  };
  
  // Создаем новый массив событий, добавляя новое событие в начало
  // и ограничивая общее количество событий до MAX_EVENTS
  const events = [newEvent, ...state.events].slice(0, MAX_EVENTS);
  
  return {
    ...state,
    events
  };
};

// Главный редьюсер игры - координирует все остальные редьюсеры
export const gameReducer = (state: GameState = initialState, action: GameAction): GameState => {
  console.log('Received action:', action.type);
  
  switch (action.type) {
    // Инкремент ресурса
    case "INCREMENT_RESOURCE": 
      return processIncrementResource(state, action.payload);
    
    // Обновление ресурсов (выполняется каждый тик)
    case "UPDATE_RESOURCES": 
      return processResourceUpdate(state);
    
    // Покупка здания
    case "PURCHASE_BUILDING": 
      return processPurchaseBuilding(state, action.payload);
    
    // Покупка практики (специальный обработчик)
    case "PRACTICE_PURCHASE": 
      return processPracticePurchase(state);
    
    // Покупка улучшения
    case "PURCHASE_UPGRADE": 
      return processPurchaseUpgrade(state, action.payload);
    
    // Разблокировка фичи
    case "UNLOCK_FEATURE": 
      return processUnlockFeature(state, action.payload);
    
    // Разблокировка ресурса
    case "UNLOCK_RESOURCE": 
      return processUnlockResource(state, action.payload);
    
    // Установка разблокировки здания
    case "SET_BUILDING_UNLOCKED": 
      return processSetBuildingUnlocked(state, action.payload);
    
    // Инкремент счетчика
    case "INCREMENT_COUNTER": 
      return processIncrementCounter(state, action.payload);
    
    // Запуск игры
    case "START_GAME": 
      return processStartGame(state);
    
    // Загрузка сохраненной игры
    case "LOAD_GAME": 
      return processLoadGame(state, action.payload);
    
    // Престиж (перезапуск с бонусами)
    case "PRESTIGE": 
      return processPrestige(state);
    
    // Полный сброс прогресса
    case "RESET_GAME": 
      return processResetGame(state);
    
    // Перезапуск компьютеров
    case "RESTART_COMPUTERS": 
      return processRestartComputers(state);
    
    // Майнинг вычислительной мощности
    case "MINE_COMPUTING_POWER": 
      return processMiningPower(state);
    
    // Применение знаний
    case "APPLY_KNOWLEDGE": 
      return processApplyKnowledge(state);
    
    // Обмен BTC на USDT
    case "EXCHANGE_BTC":
      return processExchangeBtc(state, action.payload);
    
    // Добавление игрового события
    case "ADD_GAME_EVENT":
      return addGameEvent(state, action.payload.message, action.payload.eventType);
    
    default:
      return state;
  }
};
