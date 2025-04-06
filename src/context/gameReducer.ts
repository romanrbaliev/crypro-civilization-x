
import { GameState, GameAction } from './types';
import { initialState } from './initialState';
import { saveGameToServer } from '@/api/gameStorage';
import { checkAllUnlocks } from '@/utils/unlockManager';
import { ensureUnlocksExist } from '@/utils/unlockHelper';
import { ResourceManager } from '@/managers/ResourceManager';

// Импорт обработчиков для различных действий
import { processLearnCrypto, processExchangeBitcoin } from './reducers/actionsReducer';
import { processSellBuilding, processChooseSpecialization } from './reducers/building';

// Обработка отладочного добавления ресурсов
const processDebugAddResources = (state: GameState, payload: any): GameState => {
  // Создаем копию состояния
  const newState = { ...state };
  
  // Если указан resourceId, заполняем этот ресурс до максимума
  if (payload.resourceId) {
    const resource = newState.resources[payload.resourceId];
    if (resource) {
      newState.resources[payload.resourceId] = {
        ...resource,
        value: resource.max || 1000
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

// Инкрементирование счетчика
const processIncrementCounter = (
  state: GameState,
  payload: { counterId: string; amount?: number }
): GameState => {
  const { counterId, amount = 1 } = payload;
  const counter = state.counters[counterId];
  
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

// Обработка покупки элемента (здания, улучшения и т.д.)
const processPurchaseItem = (
  state: GameState, 
  payload: { itemId: string, itemType: string }
): GameState => {
  const { itemId, itemType } = payload;
  
  // Определение типа покупаемого элемента
  let item;
  if (itemType === 'building') {
    item = state.buildings[itemId];
  } else if (itemType === 'upgrade' || itemType === 'research') {
    item = state.upgrades[itemId];
  } else {
    console.error(`Неизвестный тип элемента: ${itemType}`);
    return state;
  }

  // Проверка существования элемента
  if (!item) {
    console.error(`Элемент с ID ${itemId} не найден в категории ${itemType}`);
    return state;
  }

  // Для исследований проверяем, что оно еще не куплено
  if ((itemType === 'upgrade' || itemType === 'research') && item.purchased) {
    console.log(`Исследование ${item.name} уже куплено`);
    return state;
  }

  // Проверка наличия ресурсов для покупки
  if (!ResourceManager.canAfford(state, item.cost)) {
    console.log(`Недостаточно ресурсов для покупки ${item.name}`);
    return state;
  }

  // Списываем ресурсы
  let updatedState = ResourceManager.spendResources(state, item.cost);

  // Обработка покупки в зависимости от типа
  if (itemType === 'building') {
    // Рассчитываем новую стоимость здания
    const newCost = { ...item.cost };
    for (const [resourceId, amount] of Object.entries(item.cost)) {
      newCost[resourceId] = Math.floor(Number(amount) * item.costMultiplier);
    }

    // Обновляем здание
    updatedState = {
      ...updatedState,
      buildings: {
        ...updatedState.buildings,
        [itemId]: {
          ...item,
          count: item.count + 1,
          cost: newCost
        }
      }
    };

    // Обновляем счетчики
    if (itemId === 'practice') {
      updatedState = processIncrementCounter(updatedState, { counterId: 'practiceBuilt' });
    } else if (itemId === 'generator') {
      updatedState = processIncrementCounter(updatedState, { counterId: 'generatorBuilt' });
    } else if (itemId === 'homeComputer') {
      updatedState = processIncrementCounter(updatedState, { counterId: 'computerBuilt' });
    } else if (itemId === 'cryptoWallet') {
      updatedState = processIncrementCounter(updatedState, { counterId: 'walletBuilt' });
    }
  } else if (itemType === 'upgrade' || itemType === 'research') {
    // Отмечаем улучшение как купленное
    updatedState = {
      ...updatedState,
      upgrades: {
        ...updatedState.upgrades,
        [itemId]: {
          ...item,
          purchased: true
        }
      }
    };
  }

  // Пересчитываем производство ресурсов
  updatedState = ResourceManager.recalculateAllProduction(updatedState);
  
  // Проверяем разблокировки
  return checkAllUnlocks(updatedState);
};

// Основной редьюсер
export const gameReducer = (state: GameState, action: GameAction): GameState => {
  console.log(`gameReducer: обработка действия ${action.type}`, action.payload);
  
  // Убеждаемся, что структура unlocks существует
  let newState = ensureUnlocksExist(state);
  
  switch (action.type) {
    case 'START_GAME':
      console.log("Игра запущена, пересчитываем производство и проверяем разблокировки");
      newState = ResourceManager.recalculateAllProduction(newState);
      return checkAllUnlocks({ ...newState, gameStarted: true });
    
    case 'TICK':
      // Получаем текущее время
      const currentTime = action.payload?.currentTime || Date.now();
      const deltaTime = currentTime - newState.lastUpdate;
      
      if (deltaTime > 0) {
        console.log(`TICK: Обновление ресурсов за ${deltaTime}ms`);
        
        // Обновляем ресурсы
        newState = ResourceManager.updateResources(newState, deltaTime);
        
        // Обновляем lastUpdate
        newState = { ...newState, lastUpdate: currentTime };
        
        // Проверяем разблокировки
        newState = checkAllUnlocks(newState);
        
        console.log(`TICK: Обновлены ресурсы, прошло ${deltaTime}ms`);
      }
      
      return newState;
    
    // Обработка новых действий с ресурсами
    case 'UPDATE_RESOURCES':
    case 'UPDATE_PRODUCTION':
    case 'UPDATE_MAX_VALUES':
    case 'SPEND_RESOURCES':
      return checkAllUnlocks(action.payload);
    
    case 'INCREMENT_RESOURCE':
      return checkAllUnlocks(ResourceManager.incrementResource(
        newState,
        action.payload.resourceId,
        action.payload.amount || 1
      ));
    
    case 'INCREMENT_COUNTER':
      return checkAllUnlocks(processIncrementCounter(newState, action.payload));
    
    case 'APPLY_KNOWLEDGE':
      return checkAllUnlocks(ResourceManager.applyKnowledge(newState));
    
    case 'APPLY_ALL_KNOWLEDGE':
      return checkAllUnlocks(ResourceManager.applyKnowledge(newState));
    
    case 'EXCHANGE_BTC':
      return checkAllUnlocks(processExchangeBitcoin(newState));
    
    case 'PURCHASE_ITEM':
      return processPurchaseItem(newState, action.payload);
    
    case 'BUY_BUILDING':
      return processPurchaseItem(newState, { 
        itemId: action.payload.buildingId, 
        itemType: 'building' 
      });
    
    case 'SELL_BUILDING':
      return processSellBuilding(newState, action.payload);
    
    case 'RESEARCH_UPGRADE':
    case 'PURCHASE_UPGRADE':
      return processPurchaseItem(newState, { 
        itemId: action.payload.upgradeId, 
        itemType: 'upgrade' 
      });
    
    case 'APPLY_KNOWLEDGE_COMPLETE':
    case 'APPLY_ALL_KNOWLEDGE_COMPLETE':
    case 'INCREMENT_RESOURCE_COMPLETE':
      return checkAllUnlocks(action.payload.state);
    
    case 'UNLOCK_RESOURCE_COMPLETE':
      return checkAllUnlocks(action.payload.state);
    
    case 'LOAD_GAME':
      console.log("Загрузка игры...");
      newState = { ...newState, ...action.payload };
      // Пересчитываем производство после загрузки
      newState = ResourceManager.recalculateAllProduction(newState);
      return checkAllUnlocks(newState);
    
    case 'SAVE_GAME':
      saveGameToServer(newState);
      return newState;
    
    case 'RESET_GAME':
      return { ...initialState, gameStarted: true };
    
    case 'DEBUG_ADD_RESOURCES':
      return checkAllUnlocks(processDebugAddResources(newState, action.payload));
    
    case 'FORCE_RESOURCE_UPDATE':
      // Принудительно пересчитываем производство
      return checkAllUnlocks(ResourceManager.recalculateAllProduction(newState));
    
    case 'UPDATE_HELPERS':
      return {
        ...newState,
        referralHelpers: action.payload.updatedHelpers
      };
    
    case 'UNLOCK_RESOURCE':
      return checkAllUnlocks(ResourceManager.unlockResource(newState, action.payload.resourceId));
    
    case 'CHECK_UNLOCKS':
      return checkAllUnlocks(newState);
    
    default:
      return newState;
  }
};
