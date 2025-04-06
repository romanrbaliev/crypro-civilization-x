import { GameState, GameAction } from './types';
import { initialState } from './initialState';
import { saveGameToServer } from '@/api/gameStorage';
import { checkAllUnlocks } from '@/utils/unlockManager';
import { ensureUnlocksExist } from '@/utils/unlockHelper';
import { ResourceSystem } from '@/systems/ResourceSystem';
import { PurchasableType } from '@/types/purchasable';

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
      return checkAllUnlocks({ ...newState, gameStarted: true });
    
    case 'TICK':
      // Вычисляем прошедшее время
      const currentTime = action.payload?.currentTime || Date.now();
      const deltaTime = currentTime - newState.lastUpdate;
      
      // Обновляем ресурсы через ResourceSystem
      if (deltaTime > 0) {
        // Обновляем производство и потребление
        newState = resourceSystem.updateProductionConsumption(newState);
        
        // Затем обновляем значения ресурсов - самый важный шаг!
        newState = resourceSystem.updateResources(newState, deltaTime);
        
        // Обновляем lastUpdate
        newState = { ...newState, lastUpdate: currentTime };
        
        // Добавляем отладку
        if (Math.random() < 0.01) {
          console.log(`[GameReducer:TICK] Прошло ${deltaTime}мс, обновление ресурсов выполнено`);
          
          // Выводим текущие значения ресурсов
          const resourceValues = Object.entries(newState.resources)
            .filter(([_, r]) => r.unlocked)
            .map(([id, r]) => `${id}: ${r.value?.toFixed(2) || '0'} (+${r.perSecond?.toFixed(2) || '0'}/сек)`);
          
          if (resourceValues.length > 0) {
            console.log(`[GameReducer:TICK] Ресурсы после обновления:`, resourceValues);
          }
        }
      }
      
      // Проверяем разблокировки
      return checkAllUnlocks(newState);
    
    case 'INCREMENT_RESOURCE':
      // Обрабатываем увеличение ресурса и проверяем разблокировки
      return checkAllUnlocks(processIncrementResource(newState, action.payload));
    
    case 'INCREMENT_COUNTER':
      // Обрабатываем увеличение счетчика и проверяем разблокировки
      return checkAllUnlocks(processIncrementCounter(newState, action.payload));
      
    case 'APPLY_KNOWLEDGE':
      // Обрабатываем применение знаний и проверяем разблокировки
      return checkAllUnlocks(processApplyKnowledge(newState));
      
    case 'APPLY_ALL_KNOWLEDGE':
      return checkAllUnlocks(processApplyAllKnowledge(newState));
    
    case 'EXCHANGE_BTC':
      return checkAllUnlocks(processExchangeBitcoin(newState));
    
    case 'BUY_BUILDING':
      // Обрабатываем покупку здания через новую систему
      const buildingPayload = {
        itemId: action.payload.buildingId,
        itemType: 'building' as PurchasableType
      };
      const stateAfterPurchase = processPurchase(newState, buildingPayload);
      
      // Выводим дополнительную отладку о производстве
      console.log('[BUY_BUILDING] Обновление производства после покупки здания:', 
        Object.entries(stateAfterPurchase.resources)
          .filter(([_, r]) => r.unlocked && r.perSecond !== 0)
          .map(([id, r]) => `${id}: ${r.perSecond.toFixed(2)}/сек`)
      );
      
      return stateAfterPurchase;
    
    case 'SELL_BUILDING':
      // Обрабатываем продажу здания, проверяем разблокировки и пересчитываем производство
      newState = processSellBuilding(newState, action.payload);
      // Обновляем ресурсы через ResourceSystem
      return resourceSystem.updateProductionConsumption(resourceSystem.updateResources(newState, 0));
    
    case 'RESEARCH_UPGRADE':
    case 'PURCHASE_UPGRADE':
      // Используем новую систему для покупки исследований
      const upgradePayload = {
        itemId: action.payload.upgradeId,
        itemType: 'upgrade' as PurchasableType
      };
      return processPurchase(newState, upgradePayload);
      
    // Новое унифицированное действие покупки
    case 'PURCHASE_ITEM':
      // Используем унифицированную функцию покупки
      return processPurchase(newState, action.payload);
    
    case 'LOAD_GAME':
      newState = { ...newState, ...action.payload };
      // Обновляем производство и максимумы при загрузке
      newState = resourceSystem.updateProductionConsumption(newState);
      newState = resourceSystem.updateResourceMaxValues(newState);
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
      // Если пришло обновленное состояние, используем его
      if (action.payload) {
        console.log("[FORCE_RESOURCE_UPDATE] Обновляем состояние из payload");
        
        // Выводим отладочную информацию о ресурсах
        const resourceInfo = Object.entries(action.payload.resources)
          .filter(([_, r]) => r.unlocked)
          .map(([id, r]) => `${id}: ${r.value?.toFixed(2) || '0'} (+${r.perSecond?.toFixed(2) || '0'}/сек)`);
        
        if (resourceInfo.length > 0) {
          console.log(`[FORCE_RESOURCE_UPDATE] Ресурсы после обновления:`, resourceInfo);
        }
        
        return checkAllUnlocks(action.payload);
      }
      
      // Иначе пересчитываем производство, максимумы и обновляем ресурсы
      console.log("[FORCE_RESOURCE_UPDATE] Пересчитываем все ресурсы");
      newState = resourceSystem.updateProductionConsumption(newState);
      newState = resourceSystem.updateResourceMaxValues(newState);
      newState = resourceSystem.updateResources(newState, 0);
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
