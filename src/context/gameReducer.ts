// Импорты оставляем без изменений
import { GameState, GameAction } from './types';
import { processPurchaseBuilding, processSellBuilding } from './reducers/building';
import { applyAllKnowledge, processApplyAllKnowledge } from './reducers/resourceReducer';
import { processPurchaseUpgrade } from './reducers/upgradeReducer';
import { processResourceUpdate } from './reducers/resourceUpdateReducer';
import { checkAllUnlocks, rebuildAllUnlocks } from '@/utils/unlockManager';
import { processSpecialization } from './reducers/building/chooseSpecialization';
import { processLoadGame, processResetGame, processStartGame } from './gameStateReducer';

// Заглушки для пока отсутствующих процессов
const processSynergy = (state: GameState, payload: any): GameState => {
  console.log('processSynergy: Этот метод еще не реализован', payload);
  return state;
};

const processReferral = (state: GameState, payload: any): GameState => {
  console.log('processReferral: Этот метод еще не реализован', payload);
  return state;
};

const processCheckReferral = (state: GameState): GameState => {
  console.log('processCheckReferral: Этот метод еще не реализован');
  return state;
};

// Редьюсер для обработки игровых действий
export function gameReducer(state: GameState, action: GameAction): GameState {
  // console.log('Обработка действия:', action.type);
  
  switch (action.type) {
    case 'START_GAME':
      return processStartGame(state);
      
    case 'PURCHASE_BUILDING':
      return processPurchaseBuilding(state, action.payload);
      
    case 'SELL_BUILDING':
      return processSellBuilding(state, action.payload);
      
    case 'UNLOCK_BUILDING':
      // Поскольку функция processUnlockBuilding не существует в импортах, 
      // используем правильную функцию из модуля building.
      return {
        ...state,
        buildings: {
          ...state.buildings,
          [action.payload.buildingId]: {
            ...state.buildings[action.payload.buildingId],
            unlocked: true
          }
        },
        unlocks: {
          ...state.unlocks,
          [action.payload.buildingId]: true
        }
      };
      
    case 'SET_BUILDING_UNLOCKED':
      return {
        ...state,
        buildings: {
          ...state.buildings,
          [action.payload.buildingId]: {
            ...state.buildings[action.payload.buildingId],
            unlocked: action.payload.unlocked
          }
        }
      };
      
    case 'SET_UPGRADE_UNLOCKED':
      return {
        ...state,
        upgrades: {
          ...state.upgrades,
          [action.payload.upgradeId]: {
            ...state.upgrades[action.payload.upgradeId],
            unlocked: action.payload.unlocked
          }
        }
      };
      
    case 'PURCHASE_UPGRADE':
      return processPurchaseUpgrade(state, action.payload);
      
    case 'INCREMENT_RESOURCE':
      // Обработка увеличения ресурса
      if (!action.payload?.resourceId || !action.payload?.amount) return state;
      
      return {
        ...state,
        resources: {
          ...state.resources,
          [action.payload.resourceId]: {
            ...state.resources[action.payload.resourceId],
            value: (state.resources[action.payload.resourceId]?.value || 0) + action.payload.amount
          }
        }
      };
      
    case 'DECREMENT_RESOURCE':
      // Обработка уменьшения ресурса
      if (!action.payload?.resourceId || !action.payload?.amount) return state;
      
      return {
        ...state,
        resources: {
          ...state.resources,
          [action.payload.resourceId]: {
            ...state.resources[action.payload.resourceId],
            value: Math.max(0, (state.resources[action.payload.resourceId]?.value || 0) - action.payload.amount)
          }
        }
      };
      
    case 'SET_RESOURCE':
      // Обработка установки значения ресурса
      if (!action.payload?.resourceId || action.payload?.amount === undefined) return state;
      
      return {
        ...state,
        resources: {
          ...state.resources,
          [action.payload.resourceId]: {
            ...state.resources[action.payload.resourceId],
            value: action.payload.amount
          }
        }
      };
      
    case 'UPDATE_RESOURCES':
      return processResourceUpdate(state);
      
    case 'FORCE_RESOURCE_UPDATE':
      return checkAllUnlocks(processResourceUpdate(state));
      
    case 'APPLY_ALL_KNOWLEDGE':
      // Используем импортированную функцию applyAllKnowledge
      return applyAllKnowledge(state, action);
      
    case 'EXCHANGE_BTC':
      // Обмен BTC на USDT
      const btcValue = state.resources.bitcoin?.value || 0;
      
      // Если нет BTC, ничего не делаем
      if (btcValue <= 0) return state;
      
      // Получаем курс обмена и комиссию
      const exchangeRate = state.miningParams?.exchangeRate || 20000;
      const commission = state.miningParams?.exchangeCommission || 0.05;
      
      // Рассчитываем сумму USDT до комиссии
      const usdtBeforeCommission = btcValue * exchangeRate;
      
      // Рассчитываем комиссию и итоговую сумму
      const commissionAmount = usdtBeforeCommission * commission;
      const finalUsdtAmount = usdtBeforeCommission - commissionAmount;
      
      // Обновляем ресурсы
      return {
        ...state,
        resources: {
          ...state.resources,
          bitcoin: {
            ...state.resources.bitcoin,
            value: 0
          },
          usdt: {
            ...state.resources.usdt,
            value: (state.resources.usdt?.value || 0) + finalUsdtAmount
          }
        }
      };
      
    case 'TOGGLE_MULTIBUY':
      return {
        ...state,
        multiBuy: !state.multiBuy
      };
      
    case 'CHOOSE_SPECIALIZATION':
      return processSpecialization(state, { specializationType: action.payload.specialization });
      
    case 'PROCESS_SYNERGY':
      return processSynergy(state, action.payload);
      
    case 'PROCESS_REFERRAL':
      return processReferral(state, action.payload);
      
    case 'CHECK_REFERRAL':
      return processCheckReferral(state);
      
    case 'INCREMENT_COUNTER':
      const { counterId, value } = action.payload;
      
      // Получаем текущее значение счетчика
      const currentValue = typeof state.counters[counterId] === 'object'
        ? (state.counters[counterId] as { value: number })?.value || 0
        : (state.counters[counterId] as number || 0);
      
      // Обновляем счетчик
      return {
        ...state,
        counters: {
          ...state.counters,
          [counterId]: {
            value: currentValue + value,
            updatedAt: Date.now()
          }
        }
      };
      
    case 'LOAD_GAME':
      return processLoadGame(state, action.payload);
      
    case 'RESET_GAME':
      return processResetGame(state);
      
    case 'ADD_REFERRAL':
      if (!state.referrals) {
        return {
          ...state,
          referrals: [action.payload.referral]
        };
      }
      
      return {
        ...state,
        referrals: [...state.referrals, action.payload.referral]
      };
      
    case 'UPDATE_REFERRAL_STATUS':
      if (!state.referrals) return state;
      
      return {
        ...state,
        referrals: state.referrals.map(ref => 
          ref.id === action.payload.referralId 
            ? { ...ref, hired: action.payload.hired, assignedBuildingId: action.payload.buildingId }
            : ref
        )
      };
      
    case 'HIRE_REFERRAL_HELPER':
      console.log('Найм реферального помощника:', action.payload);
      return state;
      
    case 'RESPOND_TO_HELPER_REQUEST':
      console.log('Ответ на запрос помощи:', action.payload);
      return state;
      
    case 'SET_REFERRAL_CODE':
      return {
        ...state,
        referralCode: action.payload.code
      };
      
    case 'UPDATE_HELPERS':
      return {
        ...state,
        referralHelpers: action.payload.updatedHelpers
      };
      
    case 'ACTIVATE_SYNERGY':
      console.log('Активация синергии:', action.payload);
      return state;
      
    case 'CHECK_SYNERGIES':
      console.log('Проверка синергий');
      return state;
      
    case 'FORCE_CHECK_MINER_UNLOCK':
      console.log('gameReducer: Принудительная проверка разблокировки майнера');
      
      // Проверяем наличие исследования "Основы криптовалют"
      const hasCryptoBasics = 
        (state.upgrades.cryptoCurrencyBasics?.purchased === true) || 
        (state.upgrades.cryptoBasics?.purchased === true);
      
      if (!hasCryptoBasics) {
        console.log('gameReducer: Исследование "Основы криптовалют" не куплено');
        return state;
      }
      
      console.log('gameReducer: Текущее состояние майнера:', {
        minerExists: !!state.buildings.miner,
        minerUnlocked: state.buildings.miner?.unlocked,
        autoMinerExists: !!state.buildings.autoMiner,
        autoMinerUnlocked: state.buildings.autoMiner?.unlocked
      });
      
      // Создаем копию состояния для модификации
      let newState = { ...state };
      
      // Разблокируем майнер если существует
      if (newState.buildings.miner) {
        newState.buildings.miner = {
          ...newState.buildings.miner,
          unlocked: true
        };
        
        console.log('gameReducer: Майнер принудительно разблокирован');
      }
      
      // Разблокируем автомайнер если существует
      if (newState.buildings.autoMiner) {
        newState.buildings.autoMiner = {
          ...newState.buildings.autoMiner,
          unlocked: true
        };
        
        console.log('gameReducer: Автомайнер принудительно разблокирован');
      }
      
      // Устанавливаем флаги разблокировки
      newState.unlocks = {
        ...newState.unlocks,
        miner: true,
        autoMiner: true
      };
      
      // Проверяем и разблокируем Bitcoin
      if (newState.resources.bitcoin) {
        newState.resources.bitcoin = {
          ...newState.resources.bitcoin,
          unlocked: true
        };
        
        console.log('gameReducer: Bitcoin принудительно разблокирован');
      } else {
        // Создаем ресурс биткоин если не существует
        newState.resources.bitcoin = {
          id: 'bitcoin',
          name: 'Bitcoin',
          description: 'Bitcoin - первая и основная криптовалюта',
          type: 'currency',
          icon: 'bitcoin',
          value: 0,
          baseProduction: 0,
          production: 0,
          perSecond: 0,
          max: 0.01,
          unlocked: true
        };
        
        console.log('gameReducer: Bitcoin создан и разблокирован');
      }
      
      newState.unlocks = {
        ...newState.unlocks,
        bitcoin: true
      };
      
      return newState;
      
    default:
      return state;
  }
}
