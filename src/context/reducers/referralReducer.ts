
import { GameState } from '../types';
import { ReferralHelper } from '../types';

/**
 * Обрабатывает добавление реферала
 */
export const processAddReferral = (
  state: GameState,
  payload: { referral: any }
): GameState => {
  const { referral } = payload;
  
  // Инициализируем массив рефералов, если он не существует
  if (!state.referrals) {
    return {
      ...state,
      referrals: [referral]
    };
  }
  
  // Проверяем, существует ли уже такой реферал
  const existingIndex = state.referrals.findIndex(ref => ref.id === referral.id);
  
  if (existingIndex >= 0) {
    // Обновляем существующий реферал
    const updatedReferrals = [...state.referrals];
    updatedReferrals[existingIndex] = {
      ...updatedReferrals[existingIndex],
      ...referral
    };
    
    return {
      ...state,
      referrals: updatedReferrals
    };
  }
  
  // Добавляем новый реферал
  return {
    ...state,
    referrals: [...state.referrals, referral]
  };
};

/**
 * Обрабатывает найм реферального помощника
 */
export const processHireReferralHelper = (
  state: GameState,
  payload: { referralId: string; buildingId: string }
): GameState => {
  const { referralId, buildingId } = payload;
  
  // Инициализируем массив помощников, если он не существует
  if (!state.referralHelpers) {
    state.referralHelpers = [];
  }
  
  // Создаем нового помощника
  const newHelper: ReferralHelper = {
    id: `helper_${Date.now()}`,
    helperId: referralId,
    userId: 'current_user',
    buildingId: buildingId,
    status: 'pending',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  // Добавляем нового помощника
  return {
    ...state,
    referralHelpers: [...state.referralHelpers, newHelper]
  };
};

/**
 * Обрабатывает ответ на запрос помощи
 */
export const processRespondToHelperRequest = (
  state: GameState,
  payload: { helperId: string; accepted: boolean }
): GameState => {
  const { helperId, accepted } = payload;
  
  // Проверяем существование массива помощников
  if (!state.referralHelpers) {
    return state;
  }
  
  // Находим помощника по ID
  const helperIndex = state.referralHelpers.findIndex(helper => helper.id === helperId);
  
  // Если помощник не найден, возвращаем исходное состояние
  if (helperIndex < 0) {
    return state;
  }
  
  // Получаем текущего помощника
  const currentHelper = state.referralHelpers[helperIndex];
  
  // Обновляем статус помощника
  const updatedHelper: ReferralHelper = {
    ...currentHelper,
    status: accepted ? 'accepted' : 'rejected',
    updatedAt: Date.now()
  };
  
  // Обновляем массив помощников
  const updatedHelpers = [...state.referralHelpers];
  updatedHelpers[helperIndex] = updatedHelper;
  
  return {
    ...state,
    referralHelpers: updatedHelpers
  };
};

/**
 * Обрабатывает обновление статуса реферала
 */
export const processUpdateReferralStatus = (
  state: GameState,
  payload: { referralId: string; hired: boolean; buildingId?: string }
): GameState => {
  const { referralId, hired, buildingId } = payload;
  
  // Проверяем существование массива рефералов
  if (!state.referrals) {
    return state;
  }
  
  // Обновляем статус реферала
  const updatedReferrals = state.referrals.map(ref => 
    ref.id === referralId 
      ? { ...ref, hired, assignedBuildingId: buildingId }
      : ref
  );
  
  return {
    ...state,
    referrals: updatedReferrals
  };
};

/**
 * Обрабатывает обновление помощников
 */
export const processUpdateHelpers = (
  state: GameState,
  payload: { updatedHelpers: ReferralHelper[] }
): GameState => {
  const { updatedHelpers } = payload;
  
  return {
    ...state,
    referralHelpers: updatedHelpers
  };
};

/**
 * Обрабатывает установку кода реферала
 */
export const processSetReferralCode = (
  state: GameState,
  payload: { code: string }
): GameState => {
  const { code } = payload;
  
  return {
    ...state,
    referralCode: code
  };
};

/**
 * Обрабатывает проверку реферала
 */
export const processCheckReferral = (state: GameState): GameState => {
  // Пример реализации: просто возвращаем состояние
  console.log('Проверка реферала');
  return state;
};

/**
 * Обрабатывает процесс реферала
 */
export const processReferral = (
  state: GameState,
  payload: { code: string }
): GameState => {
  const { code } = payload;
  
  if (!code) {
    return state;
  }
  
  // Пример реализации: просто устанавливаем код реферала
  return {
    ...state,
    referredBy: code
  };
};
