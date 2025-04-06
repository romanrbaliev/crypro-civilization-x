import { GameState, GameAction } from './types';
import { initialState } from './initialState';
import { saveGameToServer } from '@/api/gameStorage';
import { checkAllUnlocks } from '@/utils/unlockManager';
import { ensureUnlocksExist } from '@/utils/unlockHelper';
import { ResourceSystem } from '@/systems/ResourceSystem';

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

import { updateResources, calculateResourceProduction } from './reducers/resourceUpdateReducer';

import { processPurchase } from './reducers/purchaseSystem/processPurchase';

const resourceSystem = new ResourceSystem();

const processDebugAddResources = (state: GameState, payload: any): GameState => {
  const newState = { ...state };
  
  if (payload.resourceId) {
    const resource = newState.resources[payload.resourceId];
    if (resource) {
      newState.resources[payload.resourceId] = {
        ...resource,
        value: resource.max || 1000
      };
    }
  } else {
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

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  console.log(`gameReducer: обработка действия ${action.type}`, action.payload);
  
  let newState = ensureUnlocksExist(state);
  
  switch (action.type) {
    case 'START_GAME':
      console.log("Игра запущена, пересчитываем производство и проверяем разблокировки");
      newState = resourceSystem.recalculateAllResourceProduction(newState);
      return checkAllUnlocks({ ...newState, gameStarted: true });
    
    case 'TICK':
      const currentTime = action.payload?.currentTime || Date.now();
      const deltaTime = action.payload?.deltaTime || (currentTime - newState.lastUpdate);
      
      if (deltaTime > 0) {
        console.log(`TICK: Обновление ресурсов за ${deltaTime}ms`);
        
        newState = resourceSystem.updateResources(newState, deltaTime);
        newState = { ...newState, lastUpdate: currentTime };
        newState = checkAllUnlocks(newState);
        
        console.log(`TICK: Обновлены ресурсы, прошло ${deltaTime}ms`);
        
        if (newState.resources.knowledge) {
          console.log(`Knowledge: ${newState.resources.knowledge.value.toFixed(2)} (${newState.resources.knowledge.perSecond}/сек)`);
        }
        if (newState.resources.usdt) {
          console.log(`USDT: ${newState.resources.usdt.value.toFixed(2)}`);
        }
      } else {
        console.log(`TICK: Пропускаем обновление, прошло ${deltaTime}ms`);
      }
      
      return newState;
    
    case 'INCREMENT_RESOURCE':
      return checkAllUnlocks(processIncrementResource(newState, action.payload));
    
    case 'INCREMENT_COUNTER':
      return checkAllUnlocks(processIncrementCounter(newState, action.payload));
      
    case 'APPLY_KNOWLEDGE':
      return checkAllUnlocks(processApplyKnowledge(newState));
      
    case 'APPLY_ALL_KNOWLEDGE':
      return checkAllUnlocks(processApplyAllKnowledge(newState));
    
    case 'EXCHANGE_BTC':
      return checkAllUnlocks(processExchangeBitcoin(newState));
    
    case 'BUY_BUILDING':
      console.log("Обработка BUY_BUILDING...");
      return processPurchaseBuilding(newState, action.payload);
    
    case 'SELL_BUILDING':
      return processSellBuilding(newState, action.payload);
    
    case 'RESEARCH_UPGRADE':
    case 'PURCHASE_UPGRADE':
      return checkAllUnlocks(processPurchaseUpgrade(newState, action.payload));
      
    case 'PURCHASE_ITEM':
      console.log("Обработка PURCHASE_ITEM...");
      return processPurchase(newState, action.payload);
    
    case 'LOAD_GAME':
      console.log("Загрузка игры...");
      newState = { ...newState, ...action.payload };
      console.log("Пересчитываем производство после загрузки...");
      newState = resourceSystem.recalculateAllResourceProduction(newState);
      return checkAllUnlocks(newState);
    
    case 'SAVE_GAME':
      saveGameToServer(newState);
      return newState;
    
    case 'RESET_GAME':
      return { ...initialState, gameStarted: true };
    
    case 'DEBUG_ADD_RESOURCES':
      return checkAllUnlocks(processDebugAddResources(newState, action.payload));
    
    case 'FORCE_RESOURCE_UPDATE':
      console.log("FORCE_RESOURCE_UPDATE: Принудительное обновление производства ресурсов");
      if (action.payload) {
        newState = action.payload;
      } else {
        newState = resourceSystem.recalculateAllResourceProduction(newState);
        
        for (const resourceId in newState.resources) {
          const resource = newState.resources[resourceId];
          if (resource.unlocked) {
            console.log(`Ресурс ${resourceId}: ${resource.value.toFixed(2)}/${resource.max || "∞"}, производство ${resource.perSecond || 0}/сек`);
          }
        }
      }
      return checkAllUnlocks(newState);
    
    case 'UPDATE_HELPERS':
      return {
        ...newState,
        referralHelpers: action.payload.updatedHelpers
      };
    
    case 'UNLOCK_RESOURCE':
      return checkAllUnlocks(resourceSystem.unlockResource(newState, action.payload));
    
    case 'CHECK_UNLOCKS':
      return checkAllUnlocks(newState);
    
    default:
      return newState;
  }
}
