
import { GameState, GameAction } from './types';
import { initialState } from './initialState';
import { hasEnoughResources, meetsRequirements, updateResourceMaxValues } from './utils/resourceUtils';
import { processIncrementResource } from './reducers/resourceReducer';
import { processPurchaseBuilding } from './reducers/buildingReducer';
import { processPurchaseUpgrade } from './reducers/upgradeReducer';
import { processResourceUpdate } from './reducers/resourceUpdateReducer';
import { processApplyKnowledge, processMiningPower } from './reducers/actionsReducer';

// Главный редьюсер игры
export const gameReducer = (state: GameState = initialState, action: GameAction): GameState => {
  console.log('Received action:', action.type);
  
  switch (action.type) {
    // Инкремент ресурса
    case "INCREMENT_RESOURCE": {
      return processIncrementResource(state, action.payload);
    }
    
    // Обновление ресурсов (выполняется каждый тик)
    case "UPDATE_RESOURCES": {
      return processResourceUpdate(state);
    }
    
    // Покупка здания
    case "PURCHASE_BUILDING": {
      return processPurchaseBuilding(state, action.payload);
    }
    
    // Покупка улучшения
    case "PURCHASE_UPGRADE": {
      return processPurchaseUpgrade(state, action.payload);
    }
    
    // Разблокировка фичи
    case "UNLOCK_FEATURE": {
      const { featureId } = action.payload;
      
      return {
        ...state,
        unlocks: {
          ...state.unlocks,
          [featureId]: true
        }
      };
    }
    
    // Разблокировка ресурса
    case "UNLOCK_RESOURCE": {
      const { resourceId } = action.payload;
      
      if (!state.resources[resourceId]) {
        return state;
      }
      
      return {
        ...state,
        resources: {
          ...state.resources,
          [resourceId]: {
            ...state.resources[resourceId],
            unlocked: true
          }
        }
      };
    }
    
    // Установка разблокировки здания
    case "SET_BUILDING_UNLOCKED": {
      const { buildingId, unlocked } = action.payload;
      
      if (!state.buildings[buildingId]) {
        return state;
      }
      
      return {
        ...state,
        buildings: {
          ...state.buildings,
          [buildingId]: {
            ...state.buildings[buildingId],
            unlocked
          }
        }
      };
    }
    
    // Инкремент счетчика
    case "INCREMENT_COUNTER": {
      const { counterId } = action.payload;
      
      return {
        ...state,
        counters: {
          ...state.counters,
          [counterId]: (state.counters[counterId] || 0) + 1
        }
      };
    }
    
    // Запуск игры
    case "START_GAME": {
      return {
        ...state,
        gameStarted: true,
        lastUpdate: Date.now()
      };
    }
    
    // Загрузка сохраненной игры
    case "LOAD_GAME": {
      // Полностью заменяем состояние загруженным
      return {
        ...action.payload,
        lastUpdate: Date.now()
      };
    }
    
    // Престиж (перезапуск с бонусами)
    case "PRESTIGE": {
      // Рассчитываем очки престижа
      const prestigePoints = Math.floor(
        Math.log(state.resources.usdt.value / 1000) * 10
      );
      
      return {
        ...initialState,
        prestigePoints: state.prestigePoints + Math.max(0, prestigePoints),
        gameStarted: true,
        lastUpdate: Date.now()
      };
    }
    
    // Полный сброс прогресса (только при явном запросе пользователя)
    case "RESET_GAME": {
      return {
        ...initialState,
        gameStarted: true,
        lastUpdate: Date.now()
      };
    }
    
    // Перезапуск компьютеров
    case "RESTART_COMPUTERS": {
      // Перезапускаем компьютеры после нехватки электричества
      return {
        ...state,
        eventMessages: {
          ...state.eventMessages,
          electricityShortage: false
        }
      };
    }
    
    // Майнинг вычислительной мощности
    case "MINE_COMPUTING_POWER": {
      return processMiningPower(state);
    }
    
    // Применение знаний
    case "APPLY_KNOWLEDGE": {
      return processApplyKnowledge(state);
    }
    
    default:
      return state;
  }
};
