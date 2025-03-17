
import { GameState, GameAction } from './types';
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
import {
  processExchangeBtc,
  processToggleAutoMiner,
  processUpdateMiningSettings
} from './reducers/cryptoReducer';

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
    
    // Новые действия для криптоэкономики
    case "EXCHANGE_BTC":
      return processExchangeBtc(state);
    
    case "TOGGLE_AUTO_MINER":
      return processToggleAutoMiner(state, action.payload);
    
    case "UPDATE_MINING_SETTINGS":
      return processUpdateMiningSettings(state, action.payload);
    
    default:
      return state;
  }
};

