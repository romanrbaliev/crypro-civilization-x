
import { GameState, ReferralHelper } from '../types';
import { ReferralStatusUpdate } from '../../api/referral/referralTypes';
import { saveReferralInfo, activateReferral } from '@/api/gameDataService';
import { triggerReferralUIUpdate } from '@/api/referralService';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { generateReferralCode } from '@/utils/helpers';
import { getUserIdentifier } from '@/api/userIdentification';

// Обработка реферальной системы
export const processSetReferralCode = (state: GameState, payload: { code: string }): GameState => {
  saveReferralInfo(payload.code, state.referredBy).catch(err => 
    console.error("Ошибка при сохранении реферального кода:", err)
  );
  
  return {
    ...state,
    referralCode: payload.code
  };
};

export const processAddReferral = (state: GameState, payload: { referral: any }): GameState => {
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

export const processActivateReferral = (state: GameState, payload: { referralId: string }): GameState => {
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
      
      // Принудительно обновляем ресурсы после активации реферала
      const forceUpdateEvent = new CustomEvent('force-resource-update');
      window.dispatchEvent(forceUpdateEvent);
    } catch (error) {
      console.error('Ошибка при отправке события активации реферала:', error);
    }
  }, 0);
  
  return {
    ...state,
    referrals: updatedReferrals
  };
};

// Helper function to generate IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// УЛУЧШЕННЫЕ обработчики для системы помощников
export const processHireReferralHelper = (state: GameState, payload: { referralId: string; buildingId: string }): GameState => {
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
export const processRespondToHelperRequest = (state: GameState, payload: { helperId: string; accepted: boolean }): GameState => {
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
  
  // Обновляем статус помощника на "accepted"
  let updatedHelpers = state.referralHelpers.map(h => 
    h.id === helperId ? { ...h, status: 'accepted' as const } : h
  );
  
  // Обновляем статус реферала и связываем с зданием
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
  
  // Отправляем уведомления и события обновления состояния
  setTimeout(() => {
    try {
      // Отправляем событие обновления статуса реферала
      const { triggerReferralUIUpdate } = require('@/api/referralService');
      if (typeof triggerReferralUIUpdate === 'function') {
        triggerReferralUIUpdate(helper.helperId, true, helper.buildingId);
      }
      
      // Отправляем отладочное событие
      const debugEvent = new CustomEvent('debug-helper-step', {
        detail: { 
          step: 'request-accepted', 
          message: `Запрос принят! Помощник назначен на здание '${buildingName}'`,
          helperId: helper.helperId,
          buildingId: helper.buildingId
        }
      });
      window.dispatchEvent(debugEvent);
    } catch (error) {
      console.error('Ошибка при отправке событий обновления:', error);
    }
  }, 300);
  
  // Обновляем статус в базе данных
  try {
    const { updateReferralHiredStatus, updateHelperRequestStatus } = require('@/api/referralService');
    if (typeof updateReferralHiredStatus === 'function' && typeof updateHelperRequestStatus === 'function') {
      updateReferralHiredStatus(helper.helperId, true, helper.buildingId).catch(err => 
        console.error("Ошибка при обновлении статуса реферала в БД:", err)
      );
      
      updateHelperRequestStatus(helper.id, 'accepted', helper.buildingId).catch(err => 
        console.error("Ошибка при обновлении статуса помощника в БД:", err)
      );
    }
  } catch (error) {
    console.error('Ошибка при импорте функций обновления в БД:', error);
  }
  
  // Создаем обновленное состояние
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
  
  // Запускаем принудительное обновление ресурсов
  setTimeout(() => {
    if (typeof window.dispatchEvent === 'function') {
      const forceUpdateEvent = new CustomEvent('force-resource-update');
      window.dispatchEvent(forceUpdateEvent);
      console.log('Отправлено событие принудительного обновления ресурсов');
    }
  }, 500);
  
  return updatedState;
};

// Улучшенная функция обновления статуса реферала
export const processUpdateReferralStatus = (state: GameState, payload: ReferralStatusUpdate): GameState => {
  console.log(`Обновление статуса реферала ${payload.referralId}:`, payload);
  
  const referralExists = state.referrals.some(ref => ref.id === payload.referralId);
  if (!referralExists) {
    console.warn(`Реферал ${payload.referralId} не найден в списке при обновлении статуса`);
    return state;
  }
  
  // Обновляем статус реферала с учетом всех полей
  const updatedReferrals = state.referrals.map(ref => 
    ref.id === payload.referralId 
      ? { 
          ...ref, 
          activated: payload.activated === true,
          ...(payload.hired !== undefined ? { hired: payload.hired } : {}),
          ...(payload.buildingId !== undefined ? 
              { assignedBuildingId: payload.buildingId === null ? undefined : payload.buildingId } 
              : {})
        } 
      : ref
  );
  
  console.log(`Обновлены статусы рефералов в gameReducer:`, 
    updatedReferrals.map(r => ({ 
      id: r.id, 
      activated: r.activated,
      hired: r.hired,
      buildingId: r.assignedBuildingId
    }))
  );
  
  // Запускаем принудительное обновление ресурсов
  setTimeout(() => {
    const forceUpdateEvent = new CustomEvent('force-resource-update');
    window.dispatchEvent(forceUpdateEvent);
  }, 500);
  
  return {
    ...state,
    referrals: updatedReferrals
  };
};

// Функция инициализации реферальной системы
export const initializeReferralSystem = (state: GameState): GameState => {
  let newState = { ...state };
  
  if (!newState.referralCode) {
    const code = generateReferralCode();
    newState = {
      ...newState,
      referralCode: code
    };
    console.log(`Сгенерирован реферальный код: ${code}`);
    
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
};
