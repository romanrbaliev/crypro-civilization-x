
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
      return checkAllUnlocks({ ...newState, gameStarted: true });
    
    case 'TICK':
      // Вычисляем прошедшее время
      const currentTime = Date.now();
      const deltaTime = currentTime - newState.lastUpdate;
      
      // Обновляем ресурсы
      newState = updateResources(newState, deltaTime);
      
      // Обновляем lastUpdate
      newState = { ...newState, lastUpdate: currentTime };
      
      // Проверяем разблокировки
      return checkAllUnlocks(newState);
    
    case 'INCREMENT_RESOURCE':
      // Обрабатываем увеличение ресурса и проверяем разблокировки
      return checkAllUnlocks(processLearnCrypto(newState));
    
    case 'APPLY_KNOWLEDGE':
      // Обрабатываем применение знаний и проверяем разблокировки
      return checkAllUnlocks(processApplyKnowledge(newState));
      
    case 'APPLY_ALL_KNOWLEDGE':
      return checkAllUnlocks(processApplyAllKnowledge(newState));
    
    case 'EXCHANGE_BTC':
      return checkAllUnlocks(processExchangeBitcoin(newState));
    
    case 'BUY_BUILDING':
      // Обрабатываем покупку здания и проверяем разблокировки
      return checkAllUnlocks(processBuildingPurchase(newState, action.payload));
    
    case 'RESEARCH_UPGRADE':
    case 'PURCHASE_UPGRADE':
      return checkAllUnlocks(processPurchaseUpgrade(newState, action.payload));
    
    case 'LOAD_GAME':
      newState = { ...newState, ...action.payload };
      // Проверяем разблокировки при загрузке игры
      return checkAllUnlocks(newState);
    
    case 'SAVE_GAME':
      saveGameToServer(newState);
      return newState;
    
    case 'RESET_GAME':
      return { ...initialState, gameStarted: true };
    
    case 'DEBUG_ADD_RESOURCES':
      return checkAllUnlocks(processDebugAddResources(newState, action.payload));
    
    case 'FORCE_RESOURCE_UPDATE':
      // Принудительно пересчитываем все значения и проверяем разблокировки
      newState = calculateResourceProduction(newState);
      return checkAllUnlocks(newState);
    
    case 'UPDATE_HELPERS':
      return {
        ...newState,
        referralHelpers: action.payload.updatedHelpers
      };
    
    case 'CHECK_UNLOCKS':
      // Добавляем явную обработку действия проверки разблокировок
      return checkAllUnlocks(newState);
    
    default:
      return newState;
  }
}
