
import { GameState, GameAction } from './types';
import { initialState } from './initialState';

// Импортируем все обработчики редьюсеров
import { processIncrementResource, processUnlockResource } from './reducers/resourceReducer';
import { 
  processPurchaseBuilding, 
  processSellBuilding 
} from './reducers/building';
import { processPurchaseUpgrade } from './reducers/upgradeReducer';
import { processResourceUpdate } from './reducers/resourceUpdateReducer';
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

// Импортируем новую систему разблокировок
import { checkAllUnlocks, checkSpecialUnlocks } from '@/utils/unlockSystem';

export const gameReducer = (state: GameState = initialState, action: GameAction): GameState => {
  console.log('Received action:', action.type);
  
  let newState;
  
  switch (action.type) {
    case "INCREMENT_RESOURCE": 
      return processIncrementResource(state, action.payload);
    
    case "UPDATE_RESOURCES": {
      // Обновляем ресурсы
      const updatedState = processResourceUpdate(state);
      
      // Проверяем условия разблокировки, используя новую систему
      const checkedState = checkAllUnlocks(updatedState);
      
      // Пересчитываем максимальные значения ресурсов после каждого обновления
      return updateResourceMaxValues(checkedState);
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
    
    case "PRACTICE_PURCHASE": {
      // Покупаем практику
      newState = processPracticePurchase(state);
      // Явно пересчитываем максимумы ресурсов и производство после покупки практики
      newState = updateResourceMaxValues(newState);
      // Принудительно обновляем ресурсы сразу после покупки практики
      return processResourceUpdate(newState);
    }
    
    case "PURCHASE_UPGRADE": {
      // Покупаем улучшение
      newState = processPurchaseUpgrade(state, action.payload);
      // Явно пересчитываем максимумы ресурсов после покупки улучшений
      newState = updateResourceMaxValues(newState);
      // Принудительно обновляем ресурсы сразу после покупки улучшения
      return processResourceUpdate(newState);
    }
    
    case "UNLOCK_FEATURE": 
      return processUnlockFeature(state, { featureId: action.payload.featureId });
    
    case "UNLOCK_RESOURCE": 
      return processUnlockResource(state, action.payload);
    
    case "SET_BUILDING_UNLOCKED": 
      return processSetBuildingUnlocked(state, action.payload);
    
    case "INCREMENT_COUNTER": {
      // Инкрементируем счетчик
      newState = processIncrementCounter(state, { counterId: action.payload.counterId, value: action.payload.value });
      // Проверяем специальные разблокировки, зависящие от счетчиков
      return checkSpecialUnlocks(newState);
    }
    
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
    
    case "APPLY_ALL_KNOWLEDGE": {
      // После прим��нения всех знаний принудительно пересчитываем максимумы ресурсов
      newState = processApplyAllKnowledge(state);
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
      // Проверяем разблокиров��и
      const checkedState = checkAllUnlocks(updatedState);
      // Затем пересчитываем максимальные значения ресурсов
      return updateResourceMaxValues(checkedState);
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
