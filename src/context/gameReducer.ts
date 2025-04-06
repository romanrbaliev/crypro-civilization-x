
import { GameState, GameAction } from './types';
import { initialState } from './initialState';
import { saveGameToServer } from '@/api/gameStorage';
import { checkAllUnlocks } from '@/utils/unlockManager';
import { ensureUnlocksExist } from '@/utils/unlockHelper';

// Импорт редьюсеров для разных типов действий
import { 
  processLearnCrypto, 
  processApplyKnowledge, 
  processApplyAllKnowledge,
  processExchangeBitcoin,
  processDebugAddResources
} from './reducers/actionsReducer';
import { processBuildingPurchase } from './reducers/building';
import { processPurchaseUpgrade } from './reducers/upgradeReducer';

// Импорт вспомогательных функций
import { updateResources, calculateResourceProduction } from './reducers/resourceUpdateReducer';

// Основной редьюсер для обработки всех действий игры
export const gameReducer = (state: GameState, action: GameAction): GameState => {
  // Добавляем логирование действий для отладки
  console.log(`gameReducer: обработка действия ${action.type}`, action.payload);
  
  // Сначала убеждаемся, что структура unlocks существует
  let newState = ensureUnlocksExist(state);
  
  // Ниже идет обработка всех типов действий
  switch (action.type) {
    case 'START_GAME':
      return { ...newState, gameStarted: true };
    
    case 'TICK':
      // Вычисляем прошедшее время
      const currentTime = Date.now();
      const deltaTime = currentTime - newState.lastUpdate;
      
      // Обновляем ресурсы
      newState = updateResources(newState, deltaTime);
      
      // Обновляем lastUpdate
      newState = { ...newState, lastUpdate: currentTime };
      
      return newState;
    
    case 'INCREMENT_RESOURCE':
      // Обрабатываем увеличение ресурса
      return processLearnCrypto(newState);
    
    case 'APPLY_KNOWLEDGE':
      // Обрабатываем применение знаний
      return processApplyKnowledge(newState);
      
    case 'APPLY_ALL_KNOWLEDGE':
      return processApplyAllKnowledge(newState);
    
    case 'EXCHANGE_BTC':
      return processExchangeBitcoin(newState);
    
    case 'BUY_BUILDING':
      // Обрабатываем покупку здания
      return processBuildingPurchase(newState, action.payload);
    
    case 'RESEARCH_UPGRADE':
    case 'PURCHASE_UPGRADE':
      return processPurchaseUpgrade(newState, action.payload);
    
    case 'LOAD_GAME':
      return { ...newState, ...action.payload };
    
    case 'SAVE_GAME':
      saveGameToServer(newState);
      return newState;
    
    case 'RESET_GAME':
      return { ...initialState, gameStarted: true };
    
    case 'DEBUG_ADD_RESOURCES':
      return processDebugAddResources(newState, action.payload);
    
    case 'FORCE_RESOURCE_UPDATE':
      // Принудительно пересчитываем все значения
      newState = calculateResourceProduction(newState);
      return newState;
    
    case 'UPDATE_HELPERS':
      return {
        ...newState,
        referralHelpers: action.payload.updatedHelpers
      };
    
    default:
      return newState;
  }
  
  // Перед возвратом убеждаемся, что все разблокировки проверены и структура unlocks существует
  newState = checkAllUnlocks(newState);
  newState = ensureUnlocksExist(newState);
  
  return newState;
};
