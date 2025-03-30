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
  
  let newState;
  
  switch (action.type) {
    case "INCREMENT_RESOURCE": 
      newState = processIncrementResource(state, action.payload);
      // После каждого клика на кнопку знания проверяем разблокировки
      if (action.payload.resourceId === "knowledge") {
        console.log("Обработка клика по знаниям - запуск проверки разблокировок");
      }
      return gameStateService.processGameStateUpdate(newState);
    
    case "UPDATE_RESOURCES": {
      // Пересчитываем ресурсы и проверяем разблокировки через сервис
      return gameStateService.processGameStateUpdate(state);
    }
    
    case "PURCHASE_BUILDING": {
      // Покупаем здание и обрабатываем изменения через сервис
      newState = processPurchaseBuilding(state, action.payload);
      return gameStateService.processBuildingPurchase(newState, action.payload.buildingId);
    }
    
    case "LOAD_GAME": {
      console.log('Загрузка сохраненной игры через LOAD_GAME action');
      
      newState = processLoadGame(state, action.payload as GameState);
      
      if (!newState.specializationSynergies || Object.keys(newState.specializationSynergies).length === 0) {
        console.log('Инициализируем отсутствующие синергии в gameReducer');
        newState = initializeSynergies(newState);
      }
      
      newState = initializeReferralSystem(newState);
      
      // Полная синхронизация состояния через сервис
      return gameStateService.performFullStateSync(newState);
    }
    
    case "START_GAME": {
      newState = processStartGame(state);
      
      if (!newState.specializationSynergies || Object.keys(newState.specializationSynergies).length === 0) {
        console.log('Инициализируем отсутствующие синергии в START_GAME');
        newState = initializeSynergies(newState);
      }
      
      newState = initializeReferralSystem(newState);
      
      // Полная синхронизация состояния через сервис
      return gameStateService.performFullStateSync(newState);
    }
    
    case "FORCE_RESOURCE_UPDATE": {
      console.log("Принудительное обновление ресурсов и бонусов");
      // Полный пересчет состояния через сервис
      return gameStateService.performFullStateSync(state);
    }
    
    case "SELL_BUILDING": {
      // Продаем здание
      newState = processSellBuilding(state, action.payload);
      // Пересчитываем состояние
      return gameStateService.processGameStateUpdate(newState);
    }
    
    case "PRACTICE_PURCHASE": {
      // Покупаем практику
      console.log("Обработка PRACTICE_PURCHASE");
      newState = processPracticePurchase(state);
      // Пересчитываем состояние
      return gameStateService.processGameStateUpdate(newState);
    }
    
    case "PURCHASE_UPGRADE": {
      // Покупаем улучшение
      newState = processPurchaseUpgrade(state, action.payload);
      // Обрабатываем изменения через сервис
      return gameStateService.processUpgradePurchase(newState, action.payload.upgradeId);
    }
    
    case "UNLOCK_FEATURE": 
      newState = processUnlockFeature(state, action.payload);
      return gameStateService.processGameStateUpdate(newState);
    
    case "UNLOCK_RESOURCE": 
      newState = processUnlockResource(state, action.payload);
      return gameStateService.processGameStateUpdate(newState);
    
    case "SET_BUILDING_UNLOCKED": 
      newState = processSetBuildingUnlocked(state, action.payload);
      return gameStateService.processGameStateUpdate(newState);
      
    case "SET_UPGRADE_UNLOCKED": 
      newState = processSetUpgradeUnlocked(state, action.payload);
      return gameStateService.processGameStateUpdate(newState);
    
    case "INCREMENT_COUNTER": {
      // Инкрементируем счетчик
      console.log(`Инкремент счетчика: ${action.payload.counterId}, значение: ${action.payload.value}`);
      newState = processIncrementCounter(state, { counterId: action.payload.counterId, value: action.payload.value });
      // Обновляем состояние через сервис
      return gameStateService.processGameStateUpdate(newState);
    }
    
    case "CHECK_SYNERGIES":
      newState = checkSynergies(state);
      return gameStateService.processGameStateUpdate(newState);
    
    case "ACTIVATE_SYNERGY":
      newState = activateSynergy(state, action.payload);
      return gameStateService.processGameStateUpdate(newState);
    
    case "PRESTIGE": 
      return processPrestige(state);
    
    case "RESET_GAME": 
      return processResetGame(state);
    
    case "RESTART_COMPUTERS": 
      return processRestartComputers(state);
    
    case "MINE_COMPUTING_POWER": 
      newState = processMiningPower(state);
      return gameStateService.processGameStateUpdate(newState);
    
    case "APPLY_KNOWLEDGE": {
      // После применения знаний обновляем состояние через сервис
      console.log("Обработка APPLY_KNOWLEDGE");
      newState = processApplyKnowledge(state);
      console.log("Обработан APPLY_KNOWLEDGE, проверка разблокировок...");
      return gameStateService.processGameStateUpdate(newState);
    }
    
    case "APPLY_ALL_KNOWLEDGE": {
      // После применения всех знаний обновляем состояние через сервис
      console.log("Обработка APPLY_ALL_KNOWLEDGE");
      newState = processApplyAllKnowledge(state);
      console.log("Обработан APPLY_ALL_KNOWLEDGE, проверка разблокировок...");
      return gameStateService.processGameStateUpdate(newState);
    }
      
    case "EXCHANGE_BTC": 
      newState = processExchangeBtc(state);
      return gameStateService.processGameStateUpdate(newState);
    
    case "SET_REFERRAL_CODE":
      newState = processSetReferralCode(state, action.payload);
      return gameStateService.processGameStateUpdate(newState);
    
    case "ADD_REFERRAL":
      newState = processAddReferral(state, action.payload);
      return gameStateService.processGameStateUpdate(newState);
    
    case "ACTIVATE_REFERRAL":
      newState = processActivateReferral(state, action.payload);
      return gameStateService.processGameStateUpdate(newState);
    
    case "HIRE_REFERRAL_HELPER":
      newState = processHireReferralHelper(state, action.payload);
      return gameStateService.processGameStateUpdate(newState);
    
    case "RESPOND_TO_HELPER_REQUEST":
      newState = processRespondToHelperRequest(state, action.payload);
      return gameStateService.processGameStateUpdate(newState);
      
    case "UPDATE_REFERRAL_STATUS":
      newState = processUpdateReferralStatus(state, action.payload);
      return gameStateService.processGameStateUpdate(newState);
      
    case "UPDATE_HELPERS": {
      // Обработчик события обновления помощников
      console.log("Обновление списка помощников из базы данных");
      newState = {
        ...state,
        referralHelpers: action.payload.updatedHelpers || state.referralHelpers
      };
      
      // Обновляем состояние через сервис
      return gameStateService.processGameStateUpdate(newState);
    }
    
    case "CHOOSE_SPECIALIZATION": 
      newState = processChooseSpecialization(state, action.payload);
      return gameStateService.processGameStateUpdate(newState);
    
    default:
      return state;
  }
};
