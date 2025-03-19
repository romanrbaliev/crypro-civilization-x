import { GameState, GameAction, ReferralHelper } from './types';
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
import { generateReferralCode } from '@/utils/helpers';
import { safeDispatchGameEvent } from './utils/eventBusUtils';
import { saveReferralInfo, activateReferral } from '@/api/gameDataService';
import { 
  checkSynergies, 
  activateSynergy, 
  initializeSynergies,
  synergyReducer 
} from './reducers/synergyReducer';

// Обработка реферальной системы
const processSetReferralCode = (state: GameState, payload: { code: string }): GameState => {
  saveReferralInfo(payload.code, state.referredBy).catch(err => 
    console.error("Ошибка при сохранении реферального кода:", err)
  );
  
  return {
    ...state,
    referralCode: payload.code
  };
};

const processAddReferral = (state: GameState, payload: { referral: any }): GameState => {
  const existingReferral = state.referrals.find(ref => ref.id === payload.referral.id);
  if (existingReferral) {
    return state;
  }
  
  const normalizedReferral = {
    ...payload.referral,
    activated: typeof payload.referral.activated === 'boolean' 
      ? payload.referral.activated 
      : String(payload.referral.activated).toLowerCase() === 'true'
  };
  
  console.log('Добавляем нового реферала с нормализованным значением activated:', normalizedReferral);
  
  return {
    ...state,
    referrals: [...state.referrals, normalizedReferral]
  };
};

const processActivateReferral = (state: GameState, payload: { referralId: string }): GameState => {
  console.log(`Активируем реферала ${payload.referralId}`);
  
  activateReferral(payload.referralId).catch(err => 
    console.error("Ошибка при активации реферала:", err)
  );
  
  const existingReferral = state.referrals.find(ref => ref.id === payload.referralId);
  if (!existingReferral) {
    console.warn(`Реферал ${payload.referralId} не найден в списке рефералов`);
    return state;
  }
  
  if (existingReferral.activated === true) {
    console.log(`Реферал ${payload.referralId} уже активирован`);
    return state;
  }
  
  console.log(`Обновляем статус активации реферала ${payload.referralId} на true`);
  
  const updatedReferrals = state.referrals.map(ref => 
    ref.id === payload.referralId ? { ...ref, activated: true } : ref
  );
  
  console.log('Обновленный список рефералов:', updatedReferrals);
  
  setTimeout(() => {
    try {
      const updateEvent = new CustomEvent('referral-activated', {
        detail: { referralId: payload.referralId }
      });
      window.dispatchEvent(updateEvent);
      console.log(`Отправлено событие активации реферала ${payload.referralId}`);
    } catch (error) {
      console.error('Ошибка при отправке события активации реферала:', error);
    }
  }, 0);
  
  return {
    ...state,
    referrals: updatedReferrals
  };
};

// УЛУЧШЕННЫЕ обработчики для системы помощников
const processHireReferralHelper = (state: GameState, payload: { referralId: string; buildingId: string }): GameState => {
  const { referralId, buildingId } = payload;
  
  const referral = state.referrals.find(ref => ref.id === referralId);
  if (!referral) return state;
  
  const existingHelper = state.referralHelpers.find(
    h => h.helperId === referralId && h.buildingId === buildingId && h.status === 'pending'
  );
  
  if (existingHelper) {
    console.log('Помощник уже назначен на это здание', existingHelper);
    safeDispatchGameEvent("Этот помощник уже назначен на выбранное здание", "warning");
    return state;
  }
  
  const existingActiveHelper = state.referralHelpers.find(
    h => h.helperId === referralId && h.status === 'accepted'
  );
  
  if (existingActiveHelper) {
    const updatedHelpers = state.referralHelpers.filter(h => h.id !== existingActiveHelper.id);
    
    const helperId = `helper_${generateId()}`;
    
    const newHelper: ReferralHelper = {
      id: helperId,
      buildingId,
      helperId: referralId,
      status: 'pending' as const,
      createdAt: Date.now()
    };
    
    const updatedState = {
      ...state,
      referralHelpers: [...updatedHelpers, newHelper]
    };
    
    safeDispatchGameEvent(`Отправлено предложение о работе ${referral.username}`, "info");
    
    setTimeout(() => {
      try {
        const confirmEvent = new CustomEvent('debug-helper-step', {
          detail: { 
            step: 'request-sent', 
            message: `Предложение о работе на здание '${state.buildings[buildingId]?.name || buildingId}' отправлено реферралу ${referral.username}`,
            referralId,
            buildingId
          }
        });
        window.dispatchEvent(confirmEvent);
      } catch (error) {
        console.error('Ошибка при отправке события подтверждения:', error);
      }
    }, 500);
    
    return updatedState;
  }
  
  const helperId = `helper_${generateId()}`;
  
  const newHelper: ReferralHelper = {
    id: helperId,
    buildingId,
    helperId: referralId,
    status: 'pending' as const,
    createdAt: Date.now()
  };
  
  const updatedState = {
    ...state,
    referralHelpers: [...state.referralHelpers, newHelper]
  };
  
  safeDispatchGameEvent(`Отправлено предложение о работе ${referral.username}`, "info");
  
  setTimeout(() => {
    try {
      const confirmEvent = new CustomEvent('debug-helper-step', {
        detail: { 
          step: 'request-sent', 
          message: `Предложение о работе на здание '${state.buildings[buildingId]?.name || buildingId}' отправлено реферралу ${referral.username}`,
          referralId,
          buildingId
        }
      });
      window.dispatchEvent(confirmEvent);
    } catch (error) {
      console.error('Ошибка при отправке события подтверждения:', error);
    }
  }, 500);
  
  return updatedState;
};

// УЛУЧШЕННАЯ реализация ответа на запрос помощника
const processRespondToHelperRequest = (state: GameState, payload: { helperId: string; accepted: boolean }): GameState => {
  const { helperId, accepted } = payload;
  
  const helper = state.referralHelpers.find(h => h.id === helperId);
  if (!helper) {
    console.error('Помощник не найден:', helperId);
    safeDispatchGameEvent("Ошибка: запрос помощника не найден", "error");
    return state;
  }
  
  console.log('Обработка ответа на запрос помощника:', helper, 'accepted:', accepted);
  
  if (!accepted) {
    const updatedHelpers = state.referralHelpers.map(h => 
      h.id === helperId ? { ...h, status: 'rejected' as const } : h
    );
    
    const building = state.buildings[helper.buildingId];
    const buildingName = building ? building.name : helper.buildingId;
    
    safeDispatchGameEvent(`Вы отклонили предложение о работе для здания "${buildingName}"`, "info");
    
    try {
      const { updateHelperRequestStatus } = require('@/api/referralService');
      if (typeof updateHelperRequestStatus === 'function') {
        updateHelperRequestStatus(helper.helperId, 'rejected').catch(err => 
          console.error("Ошибка при обновлении статуса помощника в БД:", err)
        );
      }
    } catch (error) {
      console.error('Ошибка при импорте функции updateHelperRequestStatus:', error);
    }
    
    return {
      ...state,
      referralHelpers: updatedHelpers
    };
  }
  
  let updatedHelpers = state.referralHelpers.map(h => 
    h.id === helperId ? { ...h, status: 'accepted' as const } : h
  );
  
  const updatedReferrals = state.referrals.map(ref => 
    ref.id === helper.helperId 
      ? { 
          ...ref, 
          hired: true, 
          assignedBuildingId: helper.buildingId 
        } 
      : ref
  );
  
  console.log(`Реферал ${helper.helperId} теперь нанят на здание ${helper.buildingId}`);
  
  const building = state.buildings[helper.buildingId];
  const buildingName = building ? building.name : helper.buildingId;
  
  safeDispatchGameEvent(`Вы приняли предложение о работе для здания "${buildingName}"`, "success");
  
  setTimeout(() => {
    try {
      const updateEvent = new CustomEvent('referral-status-updated', {
        detail: { 
          referralId: helper.helperId, 
          hired: true, 
          buildingId: helper.buildingId 
        }
      });
      window.dispatchEvent(updateEvent);
      console.log(`Отправлено событие обновления статуса реферала ${helper.helperId}`);
      
      const debugEvent = new CustomEvent('debug-helper-step', {
        detail: { 
          step: 'request-accepted', 
          message: `Запрос принят! Помощник назначен на здание '${buildingName}'`,
          helperId: helper.helperId,
          buildingId: helper.buildingId
        }
      });
      window.dispatchEvent(debugEvent);
      
      const productionEvent = new CustomEvent('helper-production-update', {
        detail: { 
          helperId: helper.helperId,
          buildingId: helper.buildingId,
          buildingName: buildingName
        }
      });
      window.dispatchEvent(productionEvent);
    } catch (error) {
      console.error('Ошибка при отправке событий обновления:', error);
    }
  }, 300);
  
  try {
    const { updateReferralHiredStatus } = require('@/api/referralService');
    if (typeof updateReferralHiredStatus === 'function') {
      updateReferralHiredStatus(helper.helperId, true, helper.buildingId).catch(err => 
        console.error("Ошибка при обновлении статуса реферала в БД:", err)
      );
    }
    
    const { updateHelperRequestStatus } = require('@/api/referralService');
    if (typeof updateHelperRequestStatus === 'function') {
      updateHelperRequestStatus(helper.helperId, 'accepted', helper.buildingId).catch(err => 
        console.error("Ошибка при обновлении статуса помощника в БД:", err)
      );
    }
  } catch (error) {
    console.error('Ошибка при импорте функций обновления в БД:', error);
  }
  
  let updatedState = {
    ...state,
    referralHelpers: updatedHelpers,
    referrals: updatedReferrals
  };
  
  console.log('Состояние обновлено с новым статусом помощника:', 
    `Строение: ${buildingName}`, 
    `Помощник: ${helper.helperId}`, 
    `Статус: accepted`
  );
  
  setTimeout(() => {
    if (typeof window.dispatchEvent === 'function') {
      const forceUpdateEvent = new CustomEvent('force-resource-update');
      window.dispatchEvent(forceUpdateEvent);
      console.log('Отправлено событие принудительного обновления ресурсов');
    }
  }, 500);
  
  return updatedState;
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const processUpdateReferralStatus = (state: GameState, payload: { referralId: string; activated: boolean }): GameState => {
  console.log(`Обновление статуса реферала ${payload.referralId} на ${payload.activated} в gameReducer`);
  
  const referralExists = state.referrals.some(ref => ref.id === payload.referralId);
  if (!referralExists) {
    console.warn(`Реферал ${payload.referralId} не найден в списке при обновлении статуса`);
    return state;
  }
  
  const updatedReferrals = state.referrals.map(ref => 
    ref.id === payload.referralId 
      ? { ...ref, activated: payload.activated === true } 
      : ref
  );
  
  console.log(`Обновлены статусы рефералов из БД в gameReducer:`, 
    updatedReferrals.map(r => ({ id: r.id, activated: r.activated }))
  );
  
  return {
    ...state,
    referrals: updatedReferrals
  };
};

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
      
      if (!newState.referralCode) {
        const code = generateReferralCode();
        newState = {
          ...newState,
          referralCode: code
        };
        console.log(`Сгенерирован реферальный код при загрузке: ${code}`);
      }
      
      return newState;
    }
    
    case "START_GAME": {
      let newState = processStartGame(state);
      
      if (!newState.specializationSynergies || Object.keys(newState.specializationSynergies).length === 0) {
        console.log('Инициализируем отсутствующие синергии в START_GAME');
        newState = initializeSynergies(newState);
      }
      
      if (!newState.referralCode) {
        const code = generateReferralCode();
        newState = {
          ...newState,
          referralCode: code
        };
        console.log(`Сгенерирован реферальный код при старте: ${code}`);
        
        saveReferralInfo(code, newState.referredBy).catch(err => 
          console.error("Ошибка при сохранении реферального кода:", err)
        );
      }
      
      if (!newState.referrals) {
        newState.referrals = [];
      }
      
      if (!newState.referralHelpers) {
        newState.referralHelpers = [];
      }
      
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
