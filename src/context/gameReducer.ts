
import { GameState, GameAction } from './types';
import { initialState } from './initialState';
import { GameStateService } from '@/services/GameStateService';

// Импортируем все обработчики редьюсеров
import { processIncrementResource, processUnlockResource } from './reducers/resourceReducer';
import { 
  processPurchaseBuilding, 
  processSellBuilding,
  processChooseSpecialization 
} from './reducers/building';
import { processPurchaseUpgrade } from './reducers/upgradeReducer';
import { processSetLanguage } from './reducers';
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
  activateSynergy
} from './reducers/synergyReducer';

// Импортируем обработчики для реферальной системы
import {
  processSetReferralCode,
  processAddReferral,
  processActivateReferral,
  processHireReferralHelper,
  processRespondToHelperRequest,
  processUpdateReferralStatus
} from './reducers/referralReducer';

// Импортируем обработчики для действий
import {
  processApplyKnowledge,
  processApplyAllKnowledge,
  processExchangeBitcoin
} from './reducers/actionReducers';

// Импортируем централизованную систему разблокировок
import { checkAllUnlocks } from '@/utils/unlockManager';

// Создаем экземпляр централизованного сервиса состояния
const gameStateService = new GameStateService();

export const gameReducer = (state: GameState = initialState, action: GameAction): GameState => {
  console.log('Received action:', action.type);
  
  let newState;
  
  switch (action.type) {
    case "INCREMENT_RESOURCE": 
      newState = processIncrementResource(state, action.payload);
      return checkAllUnlocks(newState);
    
    case "UPDATE_RESOURCES": 
      newState = gameStateService.processGameStateUpdate(state, action.payload?.deltaTime);
      return checkAllUnlocks(newState);
    
    case "PURCHASE_BUILDING": 
      return processPurchaseBuilding(state, action.payload);
    
    case "SET_LANGUAGE":
      return processSetLanguage(state, action.payload);
      
    case "LOAD_GAME": 
      newState = processLoadGame(state, action.payload);
      return checkAllUnlocks(newState);
    
    case "START_GAME": 
      newState = processStartGame(state);
      return checkAllUnlocks(newState);
    
    case "FORCE_RESOURCE_UPDATE": 
      newState = gameStateService.performFullStateSync(state);
      return checkAllUnlocks(newState);
    
    case "SELL_BUILDING": 
      newState = processSellBuilding(state, action.payload);
      return checkAllUnlocks(newState);
    
    case "PRACTICE_PURCHASE": 
      return state; // Заглушка, которую нужно будет реализовать
    
    case "PURCHASE_UPGRADE": 
      newState = processPurchaseUpgrade(state, action.payload);
      return checkAllUnlocks(newState);
    
    case "UNLOCK_FEATURE": 
      newState = processUnlockFeature(state, action.payload);
      return checkAllUnlocks(newState);
    
    case "UNLOCK_RESOURCE": 
      newState = processUnlockResource(state, action.payload);
      return checkAllUnlocks(newState);
    
    case "SET_BUILDING_UNLOCKED": 
      newState = processSetBuildingUnlocked(state, action.payload);
      return checkAllUnlocks(newState);
      
    case "SET_UPGRADE_UNLOCKED": 
      newState = processSetUpgradeUnlocked(state, action.payload);
      return checkAllUnlocks(newState);
    
    case "INCREMENT_COUNTER": 
      newState = processIncrementCounter(state, action.payload);
      return checkAllUnlocks(newState);
    
    case "CHECK_SYNERGIES":
      return checkSynergies(state);
    
    case "ACTIVATE_SYNERGY":
      return activateSynergy(state, action.payload);
    
    case "PRESTIGE": 
      return processPrestige(state);
    
    case "RESET_GAME": 
      return processResetGame(state);
    
    case "RESTART_COMPUTERS": 
      return processRestartComputers(state);
    
    case "MINE_COMPUTING_POWER": 
      return state; // Заглушка, которую нужно будет реализовать
    
    case "CHECK_EQUIPMENT_STATUS": 
      return state; // Заглушка, которую нужно будет реализовать
    
    case "APPLY_KNOWLEDGE": 
      newState = processApplyKnowledge(state);
      return checkAllUnlocks(newState);
        
    case "APPLY_ALL_KNOWLEDGE": 
      newState = processApplyAllKnowledge(state);
      return checkAllUnlocks(newState);
        
    case "EXCHANGE_BTC":
    case "EXCHANGE_BITCOIN": 
      newState = processExchangeBitcoin(state);
      return checkAllUnlocks(newState);
        
    case "SET_REFERRAL_CODE": 
      return processSetReferralCode(state, action.payload);
    
    case "ADD_REFERRAL": 
      return processAddReferral(state, action.payload);
    
    case "ACTIVATE_REFERRAL": 
      return processActivateReferral(state, action.payload);
    
    case "HIRE_REFERRAL_HELPER": 
      return processHireReferralHelper(state, action.payload);
    
    case "RESPOND_TO_HELPER_REQUEST": 
      return processRespondToHelperRequest(state, action.payload);
    
    case "UPDATE_REFERRAL_STATUS": 
      return processUpdateReferralStatus(state, action.payload);
    
    case "UPDATE_HELPERS": 
      return {
        ...state,
        referralHelpers: action.payload.updatedHelpers
      };
    
    case "CHOOSE_SPECIALIZATION": 
      newState = processChooseSpecialization(state, {
        specializationType: action.payload.specializationId
      });
      return checkAllUnlocks(newState);
    
    case "CHECK_UNLOCKS":
      // Прямой вызов централизованной системы разблокировок
      return checkAllUnlocks(state);
      
    default:
      return state;
  }
};
