import { GameState, GameAction } from './types';
import { initialState } from './initialState';
import { saveGameToServer } from '@/api/gameStorage';
import { checkAllUnlocks } from '@/utils/unlockManager';
import { ensureUnlocksExist } from '@/utils/unlockHelper';
import { ResourceSystem } from '@/systems/ResourceSystem';

// Импорт редьюсеров для разных типов действий
import { processPurchaseBuilding, processSellBuilding } from './reducers/building';
import { processPurchaseUpgrade } from './reducers/upgradeReducer';
import { 
  processIncrementResource, 
  processUnlockResource,
  processApplyKnowledge,
  processApplyAllKnowledge,
  processExchangeBitcoin
} from './reducers/resourceReducer';

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
        
        // ВАЖНОЕ ИЗМЕНЕНИЕ: Детальное логирование ресурсов перед обновлением
        const knowledgeBefore = newState.resources.knowledge?.value || 0;
        const knowledgeProduction = newState.resources.knowledge?.perSecond || 0;
        
        console.log(`TICK: Знания до обновления: ${knowledgeBefore.toFixed(4)}, производство: ${knowledgeProduction.toFixed(4)}/сек`);
        
        if (action.payload?.skipResourceUpdate !== true) {
          // Используем новый метод для прямого обновления состояния от ResourceSystem
          newState = resourceSystem.updateResources(newState, deltaTime);
          
          const knowledgeAfter = newState.resources.knowledge?.value || 0;
          console.log(`TICK: Знания после обновления: ${knowledgeAfter.toFixed(4)}, разница: ${(knowledgeAfter - knowledgeBefore).toFixed(4)}`);
          
          // Создаем событие обновления для монитора знаний
          if (knowledgeBefore !== knowledgeAfter) {
            try {
              window.dispatchEvent(new CustomEvent('knowledge-value-updated', { 
                detail: { 
                  oldValue: knowledgeBefore,
                  newValue: knowledgeAfter,
                  delta: knowledgeAfter - knowledgeBefore
                }
              }));
              console.log(`TICK: Отправлено событие обновления знаний: ${knowledgeBefore} → ${knowledgeAfter}`);
            } catch (e) {
              console.error("TICK: Ошибка при отправке события:", e);
            }
          } else if (knowledgeProduction > 0) {
            console.warn(`TICK: Внимание! Производство знаний > 0, но значение не изменилось!`);
          }
        }
        
        // Обновляем lastUpdate
        newState = { ...newState, lastUpdate: currentTime };
        
        // Проверяем разблокировки после обновления ресурсов
        newState = checkAllUnlocks(newState);
      }
      
      return newState;
    
    case 'DIRECT_RESOURCE_UPDATE':
      if (action.payload?.updatedState) {
        console.log('DIRECT_RESOURCE_UPDATE: Прямое обновление состояния ресурсов');
        
        // Используем предоставленное обновленное состояние напрямую
        newState = { 
          ...action.payload.updatedState,
          // Обновляем lastUpdate только если предоставлен deltaTime
          lastUpdate: action.payload.deltaTime > 0 
            ? Date.now() 
            : newState.lastUpdate
        };
        
        // Проверяем разблокировки после прямого обновления
        return checkAllUnlocks(newState);
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
      const buildingState = processPurchaseBuilding(newState, action.payload);
      
      // Дополнительное логирование при покупке практики
      if (action.payload.buildingId === 'practice') {
        const practiceCount = buildingState.buildings.practice?.count || 0;
        const knowledgeProduction = buildingState.resources.knowledge?.perSecond || 0;
        
        console.log(`Куплена практика (${practiceCount}). Текущее производство знаний: ${knowledgeProduction}/сек`);
        console.log(`Ожидаемое производство от практик: ${practiceCount * 1}/сек`);
      }
      
      // После покупки здания пересчитываем производство
      const updatedBuildingState = resourceSystem.recalculateAllResourceProduction(buildingState);
      
      // Еще одно логирование после пересчета
      if (action.payload.buildingId === 'practice') {
        const knowledgeProduction = updatedBuildingState.resources.knowledge?.perSecond || 0;
        console.log(`Производство знаний после пересчета: ${knowledgeProduction}/сек`);
      }
      
      return checkAllUnlocks(updatedBuildingState);
    
    case 'SELL_BUILDING':
      // Обрабатываем продажу здания
      const sellState = processSellBuilding(newState, action.payload);
      // После продажи здания пересчитываем производство
      const updatedSellState = resourceSystem.recalculateAllResourceProduction(sellState);
      return checkAllUnlocks(updatedSellState);
    
    case 'RESEARCH_UPGRADE':
    case 'PURCHASE_UPGRADE':
      const upgradeState = processPurchaseUpgrade(newState, action.payload);
      // После покупки улучшения пересчитываем производство
      const updatedUpgradeState = resourceSystem.recalculateAllResourceProduction(upgradeState);
      return checkAllUnlocks(updatedUpgradeState);
      
    // Новое унифицированное действие покупки
    case 'PURCHASE_ITEM':
      // Используем унифицированную функцию покупки
      console.log("Обработка PURCHASE_ITEM...");
      const purchaseState = processPurchase(newState, action.payload);
      // После покупки пересчитываем производство
      const updatedPurchaseState = resourceSystem.recalculateAllResourceProduction(purchaseState);
      return checkAllUnlocks(updatedPurchaseState);
    
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
      
      // Генерируем событие обновления для монитора знаний
      const knowledgeValue = newState.resources.knowledge?.value || 0;
      try {
        window.dispatchEvent(new CustomEvent('knowledge-value-updated', { 
          detail: { 
            oldValue: knowledgeValue,
            newValue: knowledgeValue,
            delta: 0
          }
        }));
        console.log(`FORCE_RESOURCE_UPDATE: Отправлено событие обновления знаний (refresh)`);
      } catch (e) {
        console.error("FORCE_RESOURCE_UPDATE: Ошибка при отправке события:", e);
      }
      
      return checkAllUnlocks(newState);
    
    case 'UPDATE_HELPERS':
      const helpersState = {
        ...newState,
        referralHelpers: action.payload.updatedHelpers
      };
      // После обновления помощников пересчитываем производство
      const updatedHelpersState = resourceSystem.recalculateAllResourceProduction(helpersState);
      return checkAllUnlocks(updatedHelpersState);
    
    case 'UNLOCK_RESOURCE':
      // Разблокировка ресурса
      const unlockState = resourceSystem.unlockResource(newState, action.payload);
      // После разблокировки ресурса пересчитываем производство
      const updatedUnlockState = resourceSystem.recalculateAllResourceProduction(unlockState);
      return checkAllUnlocks(updatedUnlockState);
    
    case 'CHECK_UNLOCKS':
      // Добавляем явную обработку действия проверки разблокировок
      return checkAllUnlocks(newState);
    
    default:
      return newState;
  }
}
