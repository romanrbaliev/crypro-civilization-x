
import { GameState, GameAction, ReferralHelper } from './types';
import { initialState } from './initialState';

// Импортируем все обработчики редьюсеров
import { processIncrementResource, processUnlockResource } from './reducers/resourceReducer';
import { processPurchaseBuilding } from './reducers/buildingReducer';
import { processPurchaseUpgrade } from './reducers/upgradeReducer';
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
  
  return {
    ...state,
    referrals: [...state.referrals, payload.referral]
  };
};

const processActivateReferral = (state: GameState, payload: { referralId: string }): GameState => {
  // Активируем реферала в Supabase
  activateReferral(payload.referralId).catch(err => 
    console.error("Ошибка при активации реферала:", err)
  );
  
  return {
    ...state,
    referrals: state.referrals.map(ref => 
      ref.id === payload.referralId ? { ...ref, activated: true } : ref
    )
  };
};

// Новые обработчики для системы помощников
const processHireReferralHelper = (state: GameState, payload: { referralId: string; buildingId: string }): GameState => {
  const { referralId, buildingId } = payload;
  
  // Находим реферала
  const referral = state.referrals.find(ref => ref.id === referralId);
  if (!referral) return state;
  
  // Генерируем уникальный ID для помощника
  const helperId = `helper_${generateId()}`;
  
  // Создаем запись помощника с явным указанием типа status
  const newHelper: ReferralHelper = {
    id: helperId,
    buildingId,
    helperId: referralId,
    status: 'pending',
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

const processRespondToHelperRequest = (state: GameState, payload: { helperId: string; accepted: boolean }): GameState => {
  const { helperId, accepted } = payload;
  
  // Обновляем статус запроса с явным указанием типа
  const updatedHelpers = state.referralHelpers.map(helper => 
    helper.id === helperId 
      ? { ...helper, status: accepted ? 'accepted' as const : 'rejected' as const }
      : helper
  );
  
  const helper = state.referralHelpers.find(h => h.id === helperId);
  if (!helper) return state;
  
  // Находим имя здания для сообщения
  const building = state.buildings[helper.buildingId];
  const buildingName = building ? building.name : helper.buildingId;
  
  // Отправляем уведомление
  if (accepted) {
    safeDispatchGameEvent(`Вы приняли предложение о работе для здания "${buildingName}"`, "success");
  } else {
    safeDispatchGameEvent(`Вы отклонили предложение о работе для здания "${buildingName}"`, "info");
  }
  
  return {
    ...state,
    referralHelpers: updatedHelpers
  };
};

// Функция для генерации уникального ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
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
      return processUnlockFeature(state, action.payload);
    
    // Разблокировка ресурса
    case "UNLOCK_RESOURCE": 
      return processUnlockResource(state, action.payload);
    
    // Установка разблокировки здания
    case "SET_BUILDING_UNLOCKED": 
      return processSetBuildingUnlocked(state, action.payload);
    
    // Инкремент счетчика
    case "INCREMENT_COUNTER": 
      return processIncrementCounter(state, action.payload);
    
    // Запуск игры с генерацией реферального кода
    case "START_GAME": {
      // Сначала обработаем базовую логику START_GAME
      let newState = processStartGame(state);
      
      // Если реферальный код еще не установлен, генерируем его
      if (!newState.referralCode) {
        const code = generateReferralCode();
        newState = {
          ...newState,
          referralCode: code
        };
        console.log(`Сгенерирован реферальный код: ${code}`);
        
        // Сохраняем реферальный код в Supabase
        saveReferralInfo(code, newState.referredBy).catch(err => 
          console.error("Ошибка при сохранении реферального кода:", err)
        );
      }
      
      return newState;
    }
    
    // Загрузка сохраненной игры
    case "LOAD_GAME": 
      return processLoadGame(state, action.payload);
    
    // Престиж (перезапуск с бонусами)
    case "PRESTIGE": 
      return processPrestige(state);
    
    // Полный сброс прогресса
    case "RESET_GAME": 
      return processResetGame(state);
    
    // Перезапуск компьютеров
    case "RESTART_COMPUTERS": 
      return processRestartComputers(state);
    
    // Майнинг вычислительной мощности
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
      
    default:
      return state;
  }
};
