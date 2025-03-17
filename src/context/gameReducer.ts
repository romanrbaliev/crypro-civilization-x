
import { GameState, GameAction } from './types';
import { initialState } from './initialState';
import { hasEnoughResources, meetsRequirements, updateResourceMaxValues } from './utils/resourceUtils';
import { processIncrementResource } from './reducers/resourceReducer';
import { processPurchaseBuilding } from './reducers/buildingReducer';
import { processPurchaseUpgrade } from './reducers/upgradeReducer';
import { processResourceUpdate } from './reducers/resourceUpdateReducer';
import { processApplyKnowledge, processMiningPower } from './reducers/actionsReducer';
import { safeDispatchGameEvent } from './utils/eventBusUtils';

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
      const newState = processPurchaseBuilding(state, action.payload);
      
      // Логирование для отладки
      if (action.payload.buildingId === 'practice') {
        const oldCount = state.buildings.practice.count;
        const newCount = newState.buildings.practice.count;
        console.log(`Purchase building 'practice': count changed from ${oldCount} to ${newCount}`);
      }
      
      return newState;
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
        console.warn(`Попытка установить разблокировку для несуществующего здания: ${buildingId}`);
        return state;
      }
      
      console.log(`Устанавливаем разблокировку для здания ${buildingId}: ${unlocked}`);
      
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
      console.log('🔄 Загружаем сохраненное состояние игры:', action.payload ? 'данные найдены' : 'данные отсутствуют');
      
      // Проверяем наличие данных для загрузки
      if (!action.payload) {
        console.warn('⚠️ Нет данных для загрузки, используем начальное состояние');
        safeDispatchGameEvent('Нет данных для загрузки, начинаем новую игру', 'warning');
        return {
          ...initialState,
          gameStarted: true,
          lastUpdate: Date.now(),
          lastSaved: Date.now()
        };
      }
      
      // Проверяем целостность загруженных данных
      if (!action.payload.resources || !action.payload.buildings) {
        console.error('❌ Загруженные данные повреждены, используем начальное состояние');
        safeDispatchGameEvent('Загруженные данные повреждены, начинаем новую игру', 'error');
        return {
          ...initialState,
          gameStarted: true,
          lastUpdate: Date.now(),
          lastSaved: Date.now()
        };
      }
      
      // Проверяем и исправляем несогласованности в загруженных данных
      const loadedState = { ...action.payload };
      
      // КРИТИЧЕСКИЙ ФИХ: синхронизация разблокировки практики
      if (loadedState.unlocks.practice) {
        console.log('Обнаружена разблокированная функция practice, проверяем здание...');
        
        if (loadedState.buildings.practice) {
          // Обязательно разблокируем здание practice если функция разблокирована
          loadedState.buildings.practice = {
            ...loadedState.buildings.practice,
            unlocked: true
          };
          console.log('✅ Синхронизировали разблокировку здания практики с функцией практики');
        } else {
          console.warn('⚠️ Здание practice не найдено в загруженном состоянии!');
        }
      }
      
      // Обновляем timestamp для правильной работы логики обновления
      loadedState.lastUpdate = Date.now();
      
      console.log('✅ Загруженное состояние применено успешно');
      safeDispatchGameEvent('Прогресс успешно восстановлен', 'success');
      
      return loadedState;
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
