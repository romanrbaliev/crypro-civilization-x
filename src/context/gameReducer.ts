// Импорты остаются без изменений
import { GameState, GameAction } from './types';
import { processPurchaseBuilding, processSellBuilding, processUnlockBuilding } from './reducers/building';
import { processIncrementResource, processApplyAllKnowledge } from './reducers/resourceReducer';
import { processPurchaseUpgrade } from './reducers/upgradeReducer';
import { updateResources } from './reducers/resourceUpdateReducer';
import { checkAllUnlocks, rebuildAllUnlocks } from '@/utils/unlockManager';
import { processSynergy } from './reducers/synergyReducer';
import { processReferral, processCheckReferral } from './reducers/referralReducer';
import { processChooseSpecialization } from './reducers/building/chooseSpecialization';

// Редьюсер для обработки игровых действий
export function gameReducer(state: GameState, action: GameAction): GameState {
  // console.log('Обработка действия:', action.type);
  
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        gameStarted: true
      };
      
    case 'PURCHASE_BUILDING':
      return processPurchaseBuilding(state, action.payload);
      
    case 'SELL_BUILDING':
      return processSellBuilding(state, action.payload);
      
    case 'UNLOCK_BUILDING':
      return processUnlockBuilding(state, action.payload);
      
    case 'PURCHASE_UPGRADE':
      return processPurchaseUpgrade(state, action.payload);
      
    case 'INCREMENT_RESOURCE':
      return processIncrementResource(state, action);
      
    case 'DECREMENT_RESOURCE':
      return processIncrementResource(state, {
        ...action,
        payload: {
          ...action.payload,
          amount: -(action.payload?.amount || 0)
        }
      });
      
    case 'SET_RESOURCE':
      return processIncrementResource(state, action);
      
    case 'UPDATE_RESOURCES':
      return updateResources(state);
      
    case 'FORCE_RESOURCE_UPDATE':
      return checkAllUnlocks(updateResources(state));
      
    case 'APPLY_ALL_KNOWLEDGE':
      return processApplyAllKnowledge(state, action);
      
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
        settings: {
          ...state.settings,
          multibuy: !state.settings.multibuy
        }
      };
      
    case 'CHOOSE_SPECIALIZATION':
      return processChooseSpecialization(state, action.payload);
      
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
        ? (state.counters[counterId]?.value || 0)
        : (state.counters[counterId] || 0);
      
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
