
import { GameState, GameAction } from './types';
import { initialState } from './initialState';
import { GameStateService } from '@/services/GameStateService';
import { UnlockManager } from '@/utils/unifiedUnlockSystem';

// Импортируем все обработчики редьюсеров
import { processIncrementResource, processUnlockResource } from './reducers/resourceReducer';
import { 
  processPurchaseBuilding, 
  processSellBuilding
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

// Импортируем обработчик обновления ресурсов
import { processUpdateResources } from './reducers/resourceUpdateReducer';

export const gameReducer = (state: GameState = initialState, action: GameAction): GameState => {
  console.log('Received action:', action.type);
  
  // Добавляем обработку принудительной проверки всех разблокировок
  if (action.type === 'FORCE_RESOURCE_UPDATE' || action.type === 'FORCE_CHECK_UNLOCKS') {
    console.log('Принудительная проверка всех разблокировок');
    const unlockManager = new UnlockManager(state);
    return unlockManager.forceCheckAllUnlocks();
  }
  
  // Обрабатываем действие
  let newState = handleAction(state, action);
  
  // Если действие может повлиять на разблокировки, проверяем их
  if (shouldCheckUnlocks(action.type)) {
    const unlockManager = new UnlockManager(newState);
    newState = unlockManager.updateGameState(newState);
  }
  
  return newState;
};

/**
 * Проверяет, нужно ли проверять разблокировки после действия
 */
function shouldCheckUnlocks(actionType: string): boolean {
  // Список действий, которые могут повлиять на разблокировки
  const unlockAffectingActions = [
    'INCREMENT_RESOURCE',
    'PURCHASE_BUILDING',
    'PURCHASE_UPGRADE',
    'INCREMENT_COUNTER',
    'APPLY_KNOWLEDGE',
    'APPLY_ALL_KNOWLEDGE',
    'UNLOCK_RESOURCE',
    'UNLOCK_FEATURE',
    'SET_BUILDING_UNLOCKED',
    'SET_UPGRADE_UNLOCKED',
    'LOAD_GAME',
    'START_GAME',
    'MINING_POWER',
    'EXCHANGE_BTC',
    'CHOOSE_SPECIALIZATION',
    'CHECK_EQUIPMENT_STATUS'
  ];
  
  return unlockAffectingActions.includes(actionType);
}

/**
 * Обрабатывает действие без проверки разблокировок
 */
function handleAction(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    // ВАЖНОЕ ИСПРАВЛЕНИЕ: Добавляем обработку обновления ресурсов
    case 'UPDATE_RESOURCES':
      return processUpdateResources(state, action.payload);
      
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
    case 'CHOOSE_SPECIALIZATION':
      return processChooseSpecialization(state, action.payload);
    
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
    
    // Обработка CHECK_EQUIPMENT_STATUS
    case 'CHECK_EQUIPMENT_STATUS':
      return processCheckEquipmentStatus(state);
    
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
      return processUpdateReferralStatus(state, { 
        referralId: action.payload.referralId, 
        activated: action.payload.activated 
      });
    case 'INITIALIZE_REFERRAL_SYSTEM':
      return initializeReferralSystem(state);
      
    default:
      return state;
  }
}

// Вспомогательные функции для обработки специализаций
function processChooseSpecialization(state: GameState, payload: { roleId: string }): GameState {
  return {
    ...state,
    specialization: payload.roleId
  };
}

// Вспомогательная функция для проверки состояния оборудования
function processCheckEquipmentStatus(state: GameState): GameState {
  // Здесь будет логика проверки состояния оборудования
  // Например, проверка электричества для компьютеров
  return state;
}
