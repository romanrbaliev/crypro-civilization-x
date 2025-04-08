
import { GameState, GameAction } from '../types';
import { processUnlockCheck } from './unlockReducer';
import { processPurchaseBuilding } from './buildingReducer';
import { processPurchaseUpgrade } from './upgradeReducer';
import { 
  updateResources, 
  recalculateProduction, 
  incrementResource,
  unlockResource, 
  applyKnowledge, 
  applyAllKnowledge,
  exchangeBitcoin 
} from './resourceReducer';
import { processAddEvent, processEventCleanup } from './eventReducer';
import { processIncrementCounter } from './counterReducer';

// Редьюсер для обработки всех игровых действий
export const gameReducer = (state: GameState, action: GameAction): GameState => {
  // Для удобства отладки выводим тип действия в консоль
  console.log(`gameReducer: ${action.type}`, action.payload);
  
  // Игнорируем действия, если игра не начата (кроме START_GAME)
  if (!state.gameStarted && action.type !== 'START_GAME') {
    return state;
  }
  
  switch (action.type) {
    // Запуск игры
    case 'START_GAME':
      return {
        ...state,
        gameStarted: true,
        lastUpdate: Date.now()
      };
    
    // Обновление ресурсов на основе прошедшего времени
    case 'UPDATE_RESOURCES':
      return updateResources(state, action.payload);
    
    // Пересчет производства ресурсов
    case 'RECALCULATE_PRODUCTION':
      return recalculateProduction(state);
    
    // Увеличение количества ресурса
    case 'INCREMENT_RESOURCE':
      return incrementResource(state, action.payload);
    
    // Разблокировка ресурса
    case 'UNLOCK_RESOURCE':
      return unlockResource(state, action.payload);
    
    // Применение знаний (обмен на USDT)
    case 'APPLY_KNOWLEDGE':
      return applyKnowledge(state);
    
    // Применение всех знаний
    case 'APPLY_ALL_KNOWLEDGE':
      return applyAllKnowledge(state);
    
    // Обмен Bitcoin на USDT
    case 'EXCHANGE_BITCOIN':
      return exchangeBitcoin(state);
    
    // Проверка разблокировок
    case 'CHECK_UNLOCKS':
      return processUnlockCheck(state);
    
    // Покупка здания
    case 'PURCHASE_BUILDING':
      return processPurchaseBuilding(state, action.payload);
    
    // Покупка улучшения
    case 'PURCHASE_UPGRADE':
      return processPurchaseUpgrade(state, action.payload);
    
    // Добавление события в журнал
    case 'ADD_EVENT':
      return processAddEvent(state, action.payload);
    
    // Очистка старых событий
    case 'CLEANUP_EVENTS':
      return processEventCleanup(state);
    
    // Увеличение счетчика
    case 'INCREMENT_COUNTER':
      return processIncrementCounter(state, action.payload);
    
    // Принудительное обновление ресурсов
    case 'FORCE_RESOURCE_UPDATE':
      return recalculateProduction(state);
    
    // Периодическое обновление игры
    case 'TICK':
      const { deltaTime = 0 } = action.payload || {};
      return updateResources(state, { deltaTime });
    
    // Смена языка
    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.payload.language
      };
    
    // Для неизвестных действий возвращаем текущее состояние
    default:
      console.warn(`Неизвестное действие: ${action.type}`);
      return state;
  }
};
