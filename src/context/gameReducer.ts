
import { GameState, GameAction } from './types';
import { initialState } from './initialState';

// Импортируем все обработчики редьюсеров
import { processIncrementResource, processUnlockResource } from './reducers/resourceReducer';
import { processPurchaseBuilding, processSellBuilding, checkBuildingUnlocks } from './reducers/buildingReducer';
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

// Импортируем утилиты для работы с ресурсами
import { updateResourceMaxValues } from './utils/resourceUtils';

export const gameReducer = (state: GameState = initialState, action: GameAction): GameState => {
  console.log('Received action:', action.type);
  
  let newState;
  
  switch (action.type) {
    case "INCREMENT_RESOURCE": 
      return processIncrementResource(state, action.payload);
    
    case "UPDATE_RESOURCES": {
      // Обновляем ресурсы
      const updatedState = processResourceUpdate(state);
      
      // Проверяем условия разблокировки зданий после обновления ресурсов
      const stateWithNewBuildings = checkBuildingUnlocks(updatedState);
      
      // Пересчитываем максимальные значения ресурсов после каждого обновления
      return updateResourceMaxValues(stateWithNewBuildings);
    }
    
    case "PURCHASE_BUILDING": {
      // Покупаем здание
      newState = processPurchaseBuilding(state, action.payload);
      // Явно пересчитываем максимумы ресурсов после покупки зданий
      return updateResourceMaxValues(newState);
    }
    
    case "SELL_BUILDING": {
      // Продаем здание
      newState = processSellBuilding(state, action.payload);
      // Явно пересчитываем максимумы ресурсов после продажи зданий
      return updateResourceMaxValues(newState);
    }
    
    case "PRACTICE_PURCHASE": 
      return processPracticePurchase(state);
    
    case "PURCHASE_UPGRADE": {
      // Покупаем улучшение
      newState = processPurchaseUpgrade(state, action.payload);
      // Явно пересчитываем максимумы ресурсов после покупки улучшений
      return updateResourceMaxValues(newState);
    }
    
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
      
      newState = processLoadGame(state, action.payload as GameState);
      
      if (!newState.specializationSynergies || Object.keys(newState.specializationSynergies).length === 0) {
        console.log('Инициализируем отсутствующие синергии в gameReducer');
        newState = initializeSynergies(newState);
      }
      
      newState = initializeReferralSystem(newState);
      
      // ВАЖНО: Принудительно проверяем состояние системы охлаждения при загрузке игры
      if (newState.buildings.coolingSystem) {
        if (!newState.buildings.homeComputer || newState.buildings.homeComputer.count < 2) {
          console.log('🔒 Принудительно блокируем систему охлаждения при загрузке игры');
          newState.buildings.coolingSystem.unlocked = false;
        }
      }
      
      // Проверяем, должен ли генератор быть разблокирован
      if (newState.resources.usdt.value >= 11 && newState.buildings.generator) {
        newState.buildings.generator.unlocked = true;
      }
      
      // Принудительно пересчитываем максимальные значения ресурсов
      newState = updateResourceMaxValues(newState);
      return newState;
    }
    
    case "START_GAME": {
      newState = processStartGame(state);
      
      if (!newState.specializationSynergies || Object.keys(newState.specializationSynergies).length === 0) {
        console.log('Инициализируем отсутствующие синергии в START_GAME');
        newState = initializeSynergies(newState);
      }
      
      newState = initializeReferralSystem(newState);
      
      // ВАЖНО: Принудительно проверяем состояние системы охлаждения при запуске игры
      if (newState.buildings.coolingSystem) {
        if (!newState.buildings.homeComputer || newState.buildings.homeComputer.count < 2) {
          console.log('🔒 Принудительно блокируем систему охлаждения при старте игры');
          newState.buildings.coolingSystem.unlocked = false;
        }
      }
      
      // Принудительно пересчитываем максимальные значения ресурсов
      newState = updateResourceMaxValues(newState);
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
    
    case "APPLY_KNOWLEDGE": {
      // После применения знаний принудительно пересчитываем максимумы ресурсов
      newState = processApplyKnowledge(state);
      return updateResourceMaxValues(newState);
    }
      
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
      
    case "FORCE_RESOURCE_UPDATE": {
      console.log("Принудительное обновление ресурсов и бонусов");
      // Сначала обновляем производство ресурсов
      const updatedState = processResourceUpdate(state);
      // Затем пересчитываем максимальные значения ресурсов
      return updateResourceMaxValues(updatedState);
    }
      
    case "UPDATE_HELPERS": {
      // Обработчик события обновления помощников
      console.log("Обновление списка помощников из базы данных");
      const updatedState = {
        ...state,
        referralHelpers: action.payload.updatedHelpers || state.referralHelpers
      };
      
      // После обновления помощников пересчитываем ресурсы и их максимумы
      const resourcesUpdated = processResourceUpdate(updatedState);
      return updateResourceMaxValues(resourcesUpdated);
    }
    
    default:
      return state;
  }
};
