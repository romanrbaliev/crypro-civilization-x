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
        
        // Расширенное логирование для отладки производства знаний
        const debugMode = action.payload?.debug === true;
        
        if (debugMode) {
          const knowledgeBefore = newState.resources.knowledge?.value || 0;
          const knowledgeProduction = newState.resources.knowledge?.perSecond || 0;
          
          console.log(`TICK: Знания до обновления: ${knowledgeBefore}, производство: ${knowledgeProduction}/сек`);
          
          // Проверяем количество практик
          const practiceCount = newState.buildings.practice?.count || 0;
          if (practiceCount > 0) {
            console.log(`TICK: Количество практик: ${practiceCount}, базовое производство от практик: ${practiceCount * 1}/сек`);
          }
        }
        
        // ИЗМЕНЕНО: Вместо прямого вызова updateResources используем ResourceSystem
        // Также важно убрать дублирование логики между хуком и редьюсером
        if (action.payload?.skipResourceUpdate !== true) {
          newState = resourceSystem.updateResources(newState, deltaTime);
          console.log(`TICK: Обновлены ресурсы, прошло ${deltaTime}ms`);
          
          // Дополнительное логирование после обновления
          if (debugMode) {
            const knowledgeAfter = newState.resources.knowledge?.value || 0;
            console.log(`TICK: Знания после обновления: ${knowledgeAfter}`);
          }
        } else {
          console.log(`TICK: Пропускаем обновление ресурсов, так как skipResourceUpdate = true`);
        }
        
        // Обновляем lastUpdate
        newState = { ...newState, lastUpdate: currentTime };
        
        // Проверяем разблокировки после обновления ресурсов
        newState = checkAllUnlocks(newState);
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
      
      // Логирование для отладки производства знаний
      const knowledgeBeforeUpdate = newState.resources.knowledge?.value || 0;
      const knowledgeProductionBeforeUpdate = newState.resources.knowledge?.perSecond || 0;
      console.log(`FORCE_RESOURCE_UPDATE: Знания до пересчета: ${knowledgeBeforeUpdate}, производство: ${knowledgeProductionBeforeUpdate}/сек`);
      
      if (action.payload) {
        // Если передано новое состояние, используем его
        newState = action.payload;
      } else {
        // Иначе пересчитываем производство
        newState = resourceSystem.recalculateAllResourceProduction(newState);
      }
      
      // Логирование после пересчета
      const knowledgeAfterUpdate = newState.resources.knowledge?.value || 0;
      const knowledgeProductionAfterUpdate = newState.resources.knowledge?.perSecond || 0;
      console.log(`FORCE_RESOURCE_UPDATE: Знания после пересчета: ${knowledgeAfterUpdate}, производство: ${knowledgeProductionAfterUpdate}/сек`);
      
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
