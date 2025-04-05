
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

// Создаем экземпляр централизованного сервиса состояния
const gameStateService = new GameStateService();

export const gameReducer = (state: GameState = initialState, action: GameAction): GameState => {
  console.log('Received action:', action.type);
  
  let newState;
  
  switch (action.type) {
    case "INCREMENT_RESOURCE": 
      return processIncrementResource(state, action.payload);
    
    case "UPDATE_RESOURCES": 
      return gameStateService.processGameStateUpdate(state, action.payload?.deltaTime);
    
    case "PURCHASE_BUILDING": 
      return processPurchaseBuilding(state, action.payload);
    
    case "SET_LANGUAGE":
      return processSetLanguage(state, action.payload);
      
    case "LOAD_GAME": 
      return processLoadGame(state, action.payload);
    
    case "START_GAME": 
      return processStartGame(state);
    
    case "FORCE_RESOURCE_UPDATE": 
      return gameStateService.performFullStateSync(state);
    
    case "SELL_BUILDING": 
      return processSellBuilding(state, action.payload);
    
    case "PRACTICE_PURCHASE": 
      return state; // Заглушка, которую нужно будет реализовать
    
    case "PURCHASE_UPGRADE": 
      return processPurchaseUpgrade(state, action.payload);
    
    case "UNLOCK_FEATURE": 
      return processUnlockFeature(state, action.payload);
    
    case "UNLOCK_RESOURCE": 
      return processUnlockResource(state, action.payload);
    
    case "SET_BUILDING_UNLOCKED": 
      return processSetBuildingUnlocked(state, action.payload);
      
    case "SET_UPGRADE_UNLOCKED": 
      return processSetUpgradeUnlocked(state, action.payload);
    
    case "INCREMENT_COUNTER": 
      return processIncrementCounter(state, action.payload);
    
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
      return processApplyKnowledge(state);
        
    case "APPLY_ALL_KNOWLEDGE": 
      return processApplyAllKnowledge(state);
        
    case "EXCHANGE_BTC":
    case "EXCHANGE_BITCOIN": 
      return processExchangeBitcoin(state);
        
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
      return processChooseSpecialization(state, {
        specializationType: action.payload.specializationId
      });
    
    default:
      return state;
  }
};
