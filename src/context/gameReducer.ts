
import { GameState, GameAction } from './types';
import { initialState } from './initialState';
import { saveGameToServer } from '@/api/gameStorage';
import { checkAllUnlocks } from '@/utils/unlockManager';
import { ensureUnlocksExist } from '@/utils/unlockHelper';
import { ResourceSystem } from '@/systems/ResourceSystem';

// Импорт редьюсеров для разных типов действий
import { 
  processLearnCrypto, 
  processApplyKnowledge, 
  processApplyAllKnowledge,
  processExchangeBitcoin
} from './reducers/actionsReducer';
import { 
  processPurchaseBuilding, 
  processSellBuilding,
  processChooseSpecialization 
} from './reducers/building';
import { processPurchaseUpgrade } from './reducers/upgradeReducer';
import { processIncrementResource, processUnlockResource } from './reducers/resourceReducer';

// Импорт вспомогательных функций
import { updateResources, calculateResourceProduction } from './reducers/resourceUpdateReducer';

// Импорт унифицированной системы покупки
import { processPurchase } from './reducers/purchaseSystem/processPurchase';

// Создаем статический экземпляр для использования вне компонентов
const resourceSystem = new ResourceSystem();

// Функция для обработки отладочного добавления ресурсов
const processDebugAddResources = (state: GameState, payload: any): GameState => {
  // Создаем копию состояния
  const newState = { ...state };
  
  // Если указан resourceId, заполняем этот ресурс до максимума
  if (payload.resourceId) {
    const resource = newState.resources[payload.resourceId];
    if (resource) {
      newState.resources[payload.resourceId] = {
        ...resource,
        value: resource.max || 1000 // Заполняем до максимума или 1000, если максимум не определен
      };
    }
  } else {
    // Если resourceId не указан, заполним все ресурсы
    for (const resourceId in newState.resources) {
      const resource = newState.resources[resourceId];
      newState.resources[resourceId] = {
        ...resource,
        value: resource.max || 1000
      };
    }
  }
  
  return newState;
};

// Функция для инкрементирования счетчика
const processIncrementCounter = (
  state: GameState,
  payload: { counterId: string; amount?: number }
): GameState => {
  const { counterId, amount = 1 } = payload;
  const counter = state.counters[counterId];
  
  // Проверяем, существует ли счетчик
  if (!counter) {
    return {
      ...state,
      counters: {
        ...state.counters,
        [counterId]: {
          id: counterId,
          value: amount
        }
      }
    };
  }

  // Инкрементируем существующий счетчик
  return {
    ...state,
    counters: {
      ...state.counters,
      [counterId]: {
        id: counterId,
        value: counter.value + amount
      }
    }
  };
};

// Основной редьюсер для обработки всех действий игры
export const gameReducer = (state: GameState, action: GameAction): GameState => {
  // Добавляем логирование действий для отладки
  console.log(`gameReducer: обработка действия ${action.type}`, action.payload);
  
  // Сначала убеждаемся, что структура unlocks существует
  let newState = ensureUnlocksExist(state);
  
  // Ниже идет обработка всех типов действий
  switch (action.type) {
    case 'START_GAME':
      console.log("Игра запущена, пересчитываем производство и проверяем разблокировки");
      newState = resourceSystem.recalculateAllResourceProduction(newState);
      return checkAllUnlocks({ ...newState, gameStarted: true });
    
    case 'TICK':
      // Вычисляем прошедшее время
      const currentTime = action.payload?.currentTime || Date.now();
      const deltaTime = currentTime - newState.lastUpdate;
      
      if (deltaTime > 0) {
        console.log(`TICK: Обновление ресурсов за ${deltaTime}ms`);
        
        // Обновляем ресурсы
        newState = resourceSystem.updateResources(newState, deltaTime);
        
        // Обновляем lastUpdate
        newState = { ...newState, lastUpdate: currentTime };
        
        // Проверяем разблокировки после обновления ресурсов
        newState = checkAllUnlocks(newState);
        
        console.log(`TICK: Обновлены ресурсы, прошло ${deltaTime}ms`);
      } else {
        console.log(`TICK: Пропускаем обновление, прошло ${deltaTime}ms`);
      }
      
      return newState;
    
    case 'INCREMENT_RESOURCE':
      // Обрабатываем увеличение ресурса и проверяем разблокировки
      return checkAllUnlocks(processIncrementResource(newState, action.payload));
    
    case 'INCREMENT_COUNTER':
      // Обрабатываем увеличение счетчика
      return checkAllUnlocks(processIncrementCounter(newState, action.payload));
      
    case 'APPLY_KNOWLEDGE':
      // Обрабатываем применение знаний и проверяем разблокировки
      return checkAllUnlocks(processApplyKnowledge(newState));
      
    case 'APPLY_ALL_KNOWLEDGE':
      return checkAllUnlocks(processApplyAllKnowledge(newState));
    
    case 'EXCHANGE_BTC':
      return checkAllUnlocks(processExchangeBitcoin(newState));
    
    case 'BUY_BUILDING':
      // Обрабатываем покупку здания и проверяем разблокировки
      console.log("Обработка BUY_BUILDING...");
      return processPurchaseBuilding(newState, action.payload);
    
    case 'SELL_BUILDING':
      // Обрабатываем продажу здания
      return processSellBuilding(newState, action.payload);
    
    case 'RESEARCH_UPGRADE':
    case 'PURCHASE_UPGRADE':
      return checkAllUnlocks(processPurchaseUpgrade(newState, action.payload));
      
    // Новое унифицированное действие покупки
    case 'PURCHASE_ITEM':
      // Используем унифицированную функцию покупки
      console.log("Обработка PURCHASE_ITEM...");
      return processPurchase(newState, action.payload);
    
    case 'LOAD_GAME':
      console.log("Загрузка игры...");
      newState = { ...newState, ...action.payload };
      // Принудительно пересчитываем производство
      console.log("Пересчитываем производство после загрузки...");
      newState = resourceSystem.recalculateAllResourceProduction(newState);
      // Проверяем разблокировки при загрузке игры
      return checkAllUnlocks(newState);
    
    case 'SAVE_GAME':
      saveGameToServer(newState);
      return newState;
    
    case 'RESET_GAME':
      return { ...initialState, gameStarted: true };
    
    case 'DEBUG_ADD_RESOURCES':
      return checkAllUnlocks(processDebugAddResources(newState, action.payload));
    
    case 'FORCE_RESOURCE_UPDATE':
      // Принудительно пересчитываем все значения и проверяем разблокировки
      console.log("FORCE_RESOURCE_UPDATE: Принудительное обновление производства ресурсов");
      if (action.payload) {
        // Если передано новое состояние, используем его
        newState = action.payload;
      } else {
        // Иначе пересчитываем производство
        newState = resourceSystem.recalculateAllResourceProduction(newState);
      }
      return checkAllUnlocks(newState);
    
    case 'UPDATE_HELPERS':
      return {
        ...newState,
        referralHelpers: action.payload.updatedHelpers
      };
    
    case 'UNLOCK_RESOURCE':
      // Разблокировка ресурса
      return checkAllUnlocks(resourceSystem.unlockResource(newState, action.payload));
    
    case 'CHECK_UNLOCKS':
      // Добавляем явную обработку действия проверки разблокировок
      return checkAllUnlocks(newState);
    
    default:
      return newState;
  }
}
