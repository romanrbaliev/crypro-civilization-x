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
} from './reducers/gameStateReducer';
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
  // Сохраняем реферальный код в Supabase
  saveReferralInfo(payload.code, state.referredBy).catch(err => 
    console.error("Ошибка при сохранении реферального кода:", err)
  );
  
  return {
    ...state,
    referralCode: payload.code
  };
};

const processAddReferral = (state: GameState, payload: { referral: any }): GameState => {
  // Проверяем, не существует ли уже такой реферал
  const existingReferral = state.referrals.find(ref => ref.id === payload.referral.id);
  if (existingReferral) {
    return state;
  }
  
  // Нормализуем значение поля activated при добавлении
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
  
  // Активируем реферала в Supabase
  activateReferral(payload.referralId).catch(err => 
    console.error("Ошибка при активации реферала:", err)
  );
  
  // Проверяем, существует ли реферал
  const existingReferral = state.referrals.find(ref => ref.id === payload.referralId);
  if (!existingReferral) {
    console.warn(`Реферал ${payload.referralId} не найден в списке рефералов`);
    return state;
  }
  
  // Если реферал уже активирован, ничего не делаем
  if (existingReferral.activated === true) {
    console.log(`Реферал ${payload.referralId} уже активирован`);
    return state;
  }
  
  console.log(`Обновляем статус активации реферала ${payload.referralId} на true`);
  
  // Создаем новый список рефералов с обновленным статусом
  const updatedReferrals = state.referrals.map(ref => 
    ref.id === payload.referralId ? { ...ref, activated: true } : ref
  );
  
  console.log('Обнов��енный спи�����ок рефералов:', updatedReferrals);
  
  // Отправляем событие активации, чтобы обновить интерфейс
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
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    referrals: updatedReferrals
  };
};

// Новые обработчики для системы помощников
const processHireReferralHelper = (state: GameState, payload: { referralId: string; buildingId: string }): GameState => {
  const { referralId, buildingId } = payload;
  
  // Находим реферала
  const referral = state.referrals.find(ref => ref.id === referralId);
  if (!referral) return state;
  
  // Проверяем, существует ли уже такое назначение
  const existingHelper = state.referralHelpers.find(
    h => h.helperId === referralId && h.buildingId === buildingId && h.status === 'pending'
  );
  
  if (existingHelper) {
    console.log('Помощник уже назначен на это здание', existingHelper);
    safeDispatchGameEvent("Этот помощник уже назначен на выбранное здание", "warning");
    return state;
  }
  
  // Также проверяем, есть ли уже принятый помощник для этого реферала
  const existingActiveHelper = state.referralHelpers.find(
    h => h.helperId === referralId && h.status === 'accepted'
  );
  
  if (existingActiveHelper) {
    // Если помощник уже работает на каком-то здании, сначала увольняем ег��
    const updatedHelpers = state.referralHelpers.filter(h => h.id !== existingActiveHelper.id);
    
    // Генерируем уникальный ID для нового помощника
    const helperId = `helper_${generateId()}`;
    
    // Создаем запись помощника с явным указанием типа для status
    const newHelper: ReferralHelper = {
      id: helperId,
      buildingId,
      helperId: referralId,
      status: 'pending' as const,
      createdAt: Date.now()
    };
    
    // Добавляем в список помощников
    const updatedState = {
      ...state,
      referralHelpers: [...updatedHelpers, newHelper]
    };
    
    // Отправляем уведомление
    safeDispatchGameEvent(`Отправлено предложение о работе ${referral.username}`, "info");
    
    return updatedState;
  }
  
  // Генерируем уникальный ID для помощника
  const helperId = `helper_${generateId()}`;
  
  // Создаем запись помощника с явным указанием типа для status
  const newHelper: ReferralHelper = {
    id: helperId,
    buildingId,
    helperId: referralId,
    status: 'pending' as const,
    createdAt: Date.now()
  };
  
  // Добавляем в список помощников
  const updatedState = {
    ...state,
    referralHelpers: [...state.referralHelpers, newHelper]
  };
  
  // Отправляем уведомление
  safeDispatchGameEvent(`Отправлено предложение о работе ${referral.username}`, "info");
  
  return updatedState;
};

// ИСПРАВЛЕНО: Улучшенная реализация ответа на запрос помощника
const processRespondToHelperRequest = (state: GameState, payload: { helperId: string; accepted: boolean }): GameState => {
  const { helperId, accepted } = payload;
  
  // Находим запрос помощника
  const helper = state.referralHelpers.find(h => h.id === helperId);
  if (!helper) {
    console.error('Помощник не найден:', helperId);
    return state;
  }
  
  console.log('Обработка ответа на запрос помощника:', helper, 'accepted:', accepted);
  
  // Если помощник отклонен, просто обновляем его статус
  if (!accepted) {
    // Обновляем статус запроса с явным указанием типа
    const updatedHelpers = state.referralHelpers.map(h => 
      h.id === helperId ? { ...h, status: 'rejected' as const } : h
    );
    
    // Находим имя здания для сообщения
    const building = state.buildings[helper.buildingId];
    const buildingName = building ? building.name : helper.buildingId;
    
    // Отправляем уведомление
    safeDispatchGameEvent(`Вы отклонили предложение о работе для здания "${buildingName}"`, "info");
    
    return {
      ...state,
      referralHelpers: updatedHelpers
    };
  }
  
  // Если помощник принят, нужно проверить, есть ли другие принятые помощники на это здание
  const existingHelpersForBuilding = state.referralHelpers.filter(
    h => h.helperId !== helper.helperId && h.buildingId === helper.buildingId && h.status === 'accepted'
  );
  
  // Удаляем существующих помощников на это здание (от других рефералов)
  let updatedHelpers = state.referralHelpers.filter(h => 
    !(existingHelpersForBuilding.some(eh => eh.id === h.id))
  );
  
  // Теперь обновляем статус текущего помощника
  updatedHelpers = updatedHelpers.map(h => 
    h.id === helperId ? { ...h, status: 'accepted' as const } : h
  );
  
  // Находим имя здания для сообщения
  const building = state.buildings[helper.buildingId];
  const buildingName = building ? building.name : helper.buildingId;
  
  // Отправляем уведомление
  safeDispatchGameEvent(`Вы приняли предложение о работе для здания "${buildingName}"`, "success");
  
  // Проверяем логи после обновления
  console.log('Помощники после обновления:', updatedHelpers);
  
  return {
    ...state,
    referralHelpers: updatedHelpers
  };
};

// Функция для генерации уникального ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Обработка обновления статуса реферала из базы данных
const processUpdateReferralStatus = (state: GameState, payload: { referralId: string; activated: boolean }): GameState => {
  console.log(`Обновление статуса реферала ${payload.referralId} на ${payload.activated} в gameReducer`);
  
  // Проверяем, существует ли реферал в списке
  const referralExists = state.referrals.some(ref => ref.id === payload.referralId);
  if (!referralExists) {
    console.warn(`Реферал ${payload.referralId} не найден в списке при обновлении статуса`);
    return state;
  }
  
  // Обновляем статус реферала с явным указанием типа boolean
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

// Главный редьюсер игры - координирует все остальные редьюсеры
export const gameReducer = (state: GameState = initialState, action: GameAction): GameState => {
  console.log('Received action:', action.type);
  
  switch (action.type) {
    // Инкремент ресурса
    case "INCREMENT_RESOURCE": 
      return processIncrementResource(state, action.payload);
    
    // Обновление ресурсов (выполняется каждый тик)
    case "UPDATE_RESOURCES": 
      return processResourceUpdate(state);
    
    // Покупка здания
    case "PURCHASE_BUILDING": 
      return processPurchaseBuilding(state, action.payload);
    
    // Покупка практики (специальный обработчик)
    case "PRACTICE_PURCHASE": 
      return processPracticePurchase(state);
    
    // Покупка улучшения
    case "PURCHASE_UPGRADE": 
      return processPurchaseUpgrade(state, action.payload);
    
    // Разблокировка фичи
    case "UNLOCK_FEATURE": 
      // Исправляем ошибку: меняем feature на featureId
      return processUnlockFeature(state, { featureId: action.payload.featureId });
    
    // Разблокировка ресурса
    case "UNLOCK_RESOURCE": 
      return processUnlockResource(state, action.payload);
    
    // Установка разблокировки здания
    case "SET_BUILDING_UNLOCKED": 
      return processSetBuildingUnlocked(state, action.payload);
    
    // Инкремент счетчика
    case "INCREMENT_COUNTER": 
      // Исправляем ошибку: меняем counter на counterId
      return processIncrementCounter(state, { counterId: action.payload.counterId, value: action.payload.value });
    
    // Проверка и обновление синергий
    case "CHECK_SYNERGIES":
      return checkSynergies(state);
    
    // Активация синергии
    case "ACTIVATE_SYNERGY":
      return activateSynergy(state, action.payload);
    
    // Загрузка сохраненной игры
    case "LOAD_GAME": {
      console.log('Загрузка сохраненной игры через LOAD_GAME action');
      
      // Инициализируем синергии, если их нет в загруженном состоянии
      let newState = processLoadGame(state, action.payload as GameState);
      
      if (!newState.specializationSynergies || Object.keys(newState.specializationSynergies).length === 0) {
        console.log('Инициализируем отсутствующие синергии в gameReducer');
        newState = initializeSynergies(newState);
      }
      
      // Если нет реферального кода, генерируем его
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
    
    // Запуск игры с генерацией реферального кода
    case "START_GAME": {
      // Сначала обработаем базовую логику START_GAME
      let newState = processStartGame(state);
      
      // Инициализируем синергии, если их нет
      if (!newState.specializationSynergies || Object.keys(newState.specializationSynergies).length === 0) {
        console.log('Инициализируем отсутствующие синергии в START_GAME');
        newState = initializeSynergies(newState);
      }
      
      // Если реферальный код еще не установлен, генерируем его
      if (!newState.referralCode) {
        const code = generateReferralCode();
        newState = {
          ...newState,
          referralCode: code
        };
        console.log(`Сгенерирован реферальный код при старте: ${code}`);
        
        // Сохраняем реферальный код в Supabase
        saveReferralInfo(code, newState.referredBy).catch(err => 
          console.error("Ошибка при сохранении реферального кода:", err)
        );
      }
      
      // Проверяем другие необходимые поля
      if (!newState.referrals) {
        newState.referrals = [];
      }
      
      if (!newState.referralHelpers) {
        newState.referralHelpers = [];
      }
      
      return newState;
    }
    
    // Престиж (перезапуск с бонусами)
    case "PRESTIGE": 
      return processPrestige(state);
    
    // Полный сброс прогресса
    case "RESET_GAME": 
      return processResetGame(state);
    
    // Перезапуск компьютеров
    case "RESTART_COMPUTERS": 
      return processRestartComputers(state);
    
    // Майнинг вычислительной мощност��
    case "MINE_COMPUTING_POWER": 
      return processMiningPower(state);
    
    // Применение знаний
    case "APPLY_KNOWLEDGE": 
      return processApplyKnowledge(state);
      
    // Обмен BTC на USDT
    case "EXCHANGE_BTC": 
      return processExchangeBtc(state);
    
    // Реферальная система
    case "SET_REFERRAL_CODE":
      return processSetReferralCode(state, action.payload);
    
    case "ADD_REFERRAL":
      return processAddReferral(state, action.payload);
    
    case "ACTIVATE_REFERRAL":
      return processActivateReferral(state, action.payload);
    
    // Система помощников
    case "HIRE_REFERRAL_HELPER":
      return processHireReferralHelper(state, action.payload);
    
    case "RESPOND_TO_HELPER_REQUEST":
      return processRespondToHelperRequest(state, action.payload);
      
    // Обновление статуса реферала из базы данных
    case "UPDATE_REFERRAL_STATUS":
      return processUpdateReferralStatus(state, action.payload);
      
    default:
      return state;
  }
};
