
import { GameState } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

export const processSetReferralCode = (
  state: GameState,
  payload: { code: string }
): GameState => {
  return {
    ...state,
    referralCode: payload.code
  };
};

export const processAddReferral = (
  state: GameState,
  payload: { referral: any }
): GameState => {
  const newReferrals = state.referrals || [];
  const exists = newReferrals.some(ref => ref.id === payload.referral.id);
  
  if (exists) {
    // Обновляем существующего реферала
    return {
      ...state,
      referrals: newReferrals.map(ref => 
        ref.id === payload.referral.id ? { ...ref, ...payload.referral } : ref
      )
    };
  }
  
  // Добавляем нового реферала
  return {
    ...state,
    referrals: [...newReferrals, payload.referral]
  };
};

export const processActivateReferral = (
  state: GameState,
  payload: { referralId: string }
): GameState => {
  if (!state.referrals) return state;
  
  const updatedReferrals = state.referrals.map(ref => {
    if (ref.id === payload.referralId) {
      return { ...ref, activated: true };
    }
    return ref;
  });
  
  return {
    ...state,
    referrals: updatedReferrals
  };
};

export const processHireReferralHelper = (
  state: GameState,
  payload: { referralId: string; buildingId: string }
): GameState => {
  if (!state.referrals) return state;
  
  // Создаем новый запрос на помощь
  const helperRequest: ReferralHelper = {
    id: `helper_${payload.referralId}_${payload.buildingId}_${Date.now()}`,
    helperId: payload.referralId,
    buildingId: payload.buildingId,
    requestedAt: Date.now(),
    status: 'pending', // pending, accepted, rejected
    userId: payload.referralId,
    name: `Помощник ${payload.referralId.substring(0, 6)}`,
    level: 1,
    productivity: 1,
    createdAt: Date.now()
  };
  
  // Добавляем в список запросов помощи
  const referralHelpers = state.referralHelpers || [];
  
  safeDispatchGameEvent(`Отправлен запрос на помощь рефералу`, 'info');
  
  return {
    ...state,
    referralHelpers: [...referralHelpers, helperRequest]
  };
};

export const processRespondToHelperRequest = (
  state: GameState,
  payload: { helperId: string; accepted: boolean }
): GameState => {
  if (!state.referralHelpers) return state;
  
  const updatedHelpers = state.referralHelpers.map(helper => {
    if (helper.id === payload.helperId) {
      return { 
        ...helper, 
        status: payload.accepted ? 'accepted' : 'rejected',
        respondedAt: Date.now()
      };
    }
    return helper;
  });
  
  safeDispatchGameEvent(
    payload.accepted 
      ? `Запрос на помощь принят` 
      : `Запрос на помощь отклонен`, 
    payload.accepted ? 'success' : 'info'
  );
  
  return {
    ...state,
    referralHelpers: updatedHelpers
  };
};

export const processUpdateReferralStatus = (
  state: GameState,
  payload: { referralId: string; status: any }
): GameState => {
  if (!state.referrals) return state;
  
  const updatedReferrals = state.referrals.map(ref => {
    if (ref.id === payload.referralId) {
      return { ...ref, ...payload.status };
    }
    return ref;
  });
  
  return {
    ...state,
    referrals: updatedReferrals
  };
};

export const initializeReferralSystem = (state: GameState): GameState => {
  // Инициализируем систему рефералов, если она отсутствует
  if (!state.referrals) {
    return {
      ...state,
      referrals: [],
      referralHelpers: []
    };
  }
  
  return state;
};
