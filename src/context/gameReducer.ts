
import { GameState, GameAction } from './types';
import { initialState } from './initialState';
import { GameStateService } from '@/services/GameStateService';
import { UnlockManagerService } from '@/services/UnlockManagerService';
import { forceCheckAllUnlocks, forceCheckAdvancedUnlocks } from '@/utils/unlockActions';

// Импортируем все обработчики редьюсеров
import { processIncrementResource, processUnlockResource } from './reducers/resourceReducer';
import { 
  processPurchaseBuilding, 
  processSellBuilding,
  processChooseSpecialization 
} from './reducers/building';
import { processPurchaseUpgrade } from './reducers/upgradeReducer';
import { 
  processApplyKnowledge,
  processApplyAllKnowledge,
  processMiningPower,
  processExchangeBtc,
  processPracticePurchase 
} from './reducers/actionsReducer';
import {
  processUnlockFeature,
  processSetBuildingUnlocked,
  processSetUpgradeUnlocked,
  processIncrementCounter
} from './reducers/unlockReducer';
import {
  processStartGame,
  processLoadGame,
  processPrestige,
  processResetGame,
  processRestartComputers
} from './gameStateReducer';
import { 
  checkSynergies, 
  activateSynergy, 
  initializeSynergies,
  synergyReducer 
} from './reducers/synergyReducer';

// Импортируем обработчики для реферальной системы
import {
  processSetReferralCode,
  processAddReferral,
  processActivateReferral,
  processHireReferralHelper,
  processRespondToHelperRequest,
  processUpdateReferralStatus,
  initializeReferralSystem
} from './reducers/referralReducer';

// Создаем экземпляр централизованного сервиса состояния
const gameStateService = new GameStateService();

export const gameReducer = (state: GameState = initialState, action: GameAction): GameState => {
  console.log('Received action:', action.type);
  
  // Добавляем обработку принудительной проверки всех разблокировок
  if (action.type === 'FORCE_RESOURCE_UPDATE' || action.type === 'FORCE_CHECK_UNLOCKS') {
    console.log('Принудительная проверка всех разблокировок');
    let newState = forceCheckAllUnlocks(state);
    newState = forceCheckAdvancedUnlocks(newState);
    return newState;
  }
  
  switch (action.type) {
    // Обработка ресурсов
    case 'INCREMENT_RESOURCE':
      return processIncrementResource(state, action.payload);
    case 'UNLOCK_RESOURCE':
      return processUnlockResource(state, action.payload);
      
    // Обработка зданий
    case 'PURCHASE_BUILDING':
      return processPurchaseBuilding(state, action.payload);
    case 'SELL_BUILDING':
      return processSellBuilding(state, action.payload);
    
    // Обработка улучшений
    case 'PURCHASE_UPGRADE':
      return processPurchaseUpgrade(state, action.payload);
      
    // Обработка действий
    case 'APPLY_KNOWLEDGE':
      return processApplyKnowledge(state);
    case 'APPLY_ALL_KNOWLEDGE':
      return processApplyAllKnowledge(state);
    case 'MINING_POWER':
      return processMiningPower(state);
    case 'EXCHANGE_BTC':
      return processExchangeBtc(state);
    case 'PRACTICE_PURCHASE':
      return processPracticePurchase(state);
      
    // Обработка разблокировок
    case 'UNLOCK_FEATURE':
      return processUnlockFeature(state, action.payload);
    case 'SET_BUILDING_UNLOCKED':
      return processSetBuildingUnlocked(state, action.payload);
    case 'SET_UPGRADE_UNLOCKED':
      return processSetUpgradeUnlocked(state, action.payload);
    case 'INCREMENT_COUNTER':
      return processIncrementCounter(state, action.payload);
      
    // Обработка состояния игры
    case 'START_GAME':
      return processStartGame(state);
    case 'LOAD_GAME':
      return processLoadGame(state, action.payload);
    case 'PRESTIGE':
      return processPrestige(state);
    case 'RESET_GAME':
      return processResetGame(state);
    case 'RESTART_COMPUTERS':
      return processRestartComputers(state);
      
    // Обработка синергий
    case 'CHECK_SYNERGIES':
      return checkSynergies(state);
    case 'ACTIVATE_SYNERGY':
      return activateSynergy(state, action.payload);
    case 'INITIALIZE_SYNERGIES':
      return initializeSynergies(state);
    case 'SYNERGY_ACTION':
      return synergyReducer(state);
      
    // Обработка реферальной системы
    case 'SET_REFERRAL_CODE':
      return processSetReferralCode(state, action.payload);
    case 'ADD_REFERRAL':
      return processAddReferral(state, action.payload);
    case 'ACTIVATE_REFERRAL':
      return processActivateReferral(state, action.payload);
    case 'HIRE_REFERRAL_HELPER':
      return processHireReferralHelper(state, action.payload);
    case 'RESPOND_TO_HELPER_REQUEST':
      return processRespondToHelperRequest(state, action.payload);
    case 'UPDATE_REFERRAL_STATUS':
      return processUpdateReferralStatus(state, action.payload);
    case 'INITIALIZE_REFERRAL_SYSTEM':
      return initializeReferralSystem(state);
      
    default:
      return state;
  }
};
