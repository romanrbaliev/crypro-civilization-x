
import { GameState, GameAction } from './types';
import { initialState } from './initialState';

// Импортируем все обработчики редьюсеров
import { processIncrementResource, processUnlockResource } from './reducers/resourceReducer';
import { processPurchaseBuilding } from './reducers/buildingReducer';
import { processPurchaseUpgrade, checkUpgradeUnlocks } from './reducers/upgradeReducer';
import { processResourceUpdate } from './reducers/resourceUpdateReducer';
import { 
  processApplyKnowledge, 
  processMiningPower,
  processExchangeBtc,
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

export const gameReducer = (state: GameState = initialState, action: GameAction): GameState => {
  console.log('Received action:', action.type);
  
  switch (action.type) {
    case "INCREMENT_RESOURCE": 
      return processIncrementResource(state, action.payload);
    
    case "UPDATE_RESOURCES": 
      return processResourceUpdate(state);
    
    case "PURCHASE_BUILDING": 
      return processPurchaseBuilding(state, action.payload);
    
    case "PRACTICE_PURCHASE": 
      return processPracticePurchase(state);
    
    case "PURCHASE_UPGRADE": 
      return processPurchaseUpgrade(state, action.payload);
    
    case "UNLOCK_FEATURE": 
      return processUnlockFeature(state, { featureId: action.payload.featureId });
    
    case "UNLOCK_RESOURCE": 
      return processUnlockResource(state, action.payload);
    
    case "SET_BUILDING_UNLOCKED": 
      return processSetBuildingUnlocked(state, action.payload);
    
    case "INCREMENT_COUNTER": 
      return processIncrementCounter(state, { counterId: action.payload.counterId, value: action.payload.value });
    
    case "CHECK_SYNERGIES":
      return checkSynergies(state);
    
    case "ACTIVATE_SYNERGY":
      return activateSynergy(state, action.payload);
    
    case "LOAD_GAME": {
      console.log('Загрузка сохраненной игры через LOAD_GAME action');
      
      let newState = processLoadGame(state, action.payload as GameState);
      
      if (!newState.specializationSynergies || Object.keys(newState.specializationSynergies).length === 0) {
        console.log('Инициализируем отсутствующие синергии в gameReducer');
        newState = initializeSynergies(newState);
      }
      
      newState = initializeReferralSystem(newState);
      
      return newState;
    }
    
    case "START_GAME": {
      let newState = processStartGame(state);
      
      if (!newState.specializationSynergies || Object.keys(newState.specializationSynergies).length === 0) {
        console.log('Инициализируем отсутствующие синергии в START_GAME');
        newState = initializeSynergies(newState);
      }
      
      newState = initializeReferralSystem(newState);
      
      return newState;
    }
    
    case "PRESTIGE": 
      return processPrestige(state);
    
    case "RESET_GAME": 
      return processResetGame(state);
    
    case "RESTART_COMPUTERS": 
      return processRestartComputers(state);
    
    case "MINE_COMPUTING_POWER": 
      return processMiningPower(state);
    
    case "APPLY_KNOWLEDGE": 
      return processApplyKnowledge(state);
      
    case "EXCHANGE_BTC": 
      return processExchangeBtc(state);
    
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
      
    case "FORCE_RESOURCE_UPDATE":
      console.log("Принудительное обновление ресурсов и бонусов");
      return processResourceUpdate(state);
      
    default:
      return state;
  }
};
