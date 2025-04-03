
import { GameState, GameAction } from './types';
import { initialState } from './initialState';
import { GameStateService } from '@/services/GameStateService';

// Импортируем все обработчики редьюсеров
import { processIncrementResource, processUnlockResource } from './reducers/resourceReducer';
import { 
  processPurchaseBuilding, 
  processSellBuilding,
  processChooseSpecialization 
} from './reducers/building';
import { processPurchaseUpgrade } from './reducers/upgradeReducer';
import { 
  processApplyKnowledge,
  processApplyAllKnowledge,
  processMiningPower,
  processExchangeBtc,
  processPracticePurchase 
} from './reducers/actionsReducer';
import {
  processUnlockFeature,
  processSetBuildingUnlocked,
  processSetUpgradeUnlocked,
  processIncrementCounter
} from './reducers/unlockReducer';
import {
  processStartGame,
  processLoadGame,
  processPrestige,
  processResetGame,
  processRestartComputers
} from './gameStateReducer';
import { 
  checkSynergies, 
  activateSynergy, 
  initializeSynergies,
  synergyReducer 
} from './reducers/synergyReducer';

// Импортируем обработчики для реферальной системы
import {
  processSetReferralCode,
  processAddReferral,
  processActivateReferral,
  processHireReferralHelper,
  processRespondToHelperRequest,
  processUpdateReferralStatus,
  initializeReferralSystem
} from './reducers/referralReducer';

// Создаем экземпляр централизованного сервиса состояния
const gameStateService = new GameStateService();

export const gameReducer = (state: GameState = initialState, action: GameAction): GameState => {
  console.log('Received action:', action.type);
  
  let newState;
  
  switch (action.type) {
    case "INCREMENT_RESOURCE": 
      newState = processIncrementResource(state, action.payload);
      // После каждого клика на кнопку знания проверяем разблокировки
      if (action.payload.resourceId === "knowledge") {
        console.log("Обработка клика по знаниям - запуск проверки разблокировок");
      }
      return gameStateService.processGameStateUpdate(newState);
    
    case "UPDATE_RESOURCES": {
      // Обновляем ресурсы с учетом прошедшего времени (deltaTime)
      // Создаем копию состояния
      let updatedState = { ...state };
      
      // Обрабатываем deltaTime, если оно передано
      const deltaTime = action.payload?.deltaTime || 1000; // По умолчанию 1 секунда
      
      // Проверяем, какие ресурсы закончились
      const exhaustedResources = Object.keys(updatedState.resources).filter(resourceId => {
        const resource = updatedState.resources[resourceId];
        return resource.unlocked && resource.value <= 0 && resource.perSecond < 0;
      });
      
      // Обновляем ресурсы на основе их производства за deltaTime
      const resourceIds = Object.keys(updatedState.resources);
      for (const resourceId of resourceIds) {
        const resource = updatedState.resources[resourceId];
        if (resource.unlocked && resource.perSecond) {
          let increment = (resource.perSecond * deltaTime) / 1000;
          
          // Проверяем, не должен ли ресурс остановиться на нуле
          if (resource.value + increment < 0) {
            // Ресурс закончился, устанавливаем его на 0
            increment = -resource.value;
            
            // Добавляем в список исчерпанных, если еще не там
            if (!exhaustedResources.includes(resourceId)) {
              exhaustedResources.push(resourceId);
            }
          }
          
          // Обновляем значение с учетом максимума и запрета на отрицательные значения
          const newValue = Math.max(0, Math.min(resource.value + increment, resource.max));
          // Обновляем ресурс
          updatedState.resources[resourceId] = {
            ...resource,
            value: newValue
          };
        }
      }
      
      // Пересчитываем ресурсы и проверяем разблокировки через сервис
      return gameStateService.processGameStateUpdate(updatedState);
    }
    
    case "PURCHASE_BUILDING": {
      // Покупаем здание и обрабатываем изменения через сервис
      newState = processPurchaseBuilding(state, action.payload);
      // Принудительно проверяем разблокировки после покупки здания
      return gameStateService.performFullStateSync(newState);
    }
    
    case "LOAD_GAME": {
      console.log('Загрузка сохраненной игры через LOAD_GAME action');
      
      newState = processLoadGame(state, action.payload as GameState);
      
      if (!newState.specializationSynergies || Object.keys(newState.specializationSynergies).length === 0) {
        console.log('Инициализируем отсутствующие синергии в gameReducer');
        newState = initializeSynergies(newState);
      }
      
      newState = initializeReferralSystem(newState);
      
      // Полная синхронизация состояния через сервис
      return gameStateService.performFullStateSync(newState);
    }
    
    case "START_GAME": {
      newState = processStartGame(state);
      
      if (!newState.specializationSynergies || Object.keys(newState.specializationSynergies).length === 0) {
        console.log('Инициализируем отсутствующие синергии в START_GAME');
        newState = initializeSynergies(newState);
      }
      
      newState = initializeReferralSystem(newState);
      
      // Полная синхронизация состояния через сервис
      return gameStateService.performFullStateSync(newState);
    }
    
    case "FORCE_RESOURCE_UPDATE": {
      console.log("Принудительное обновление ресурсов и бонусов");
      // Полный пересчет состояния через сервис
      return gameStateService.performFullStateSync(state);
    }
    
    case "SELL_BUILDING": {
      // Продаем здание
      newState = processSellBuilding(state, action.payload);
      // Пересчитываем состояние
      return gameStateService.processGameStateUpdate(newState);
    }
    
    case "PRACTICE_PURCHASE": {
      // Покупаем практику
      console.log("Обработка PRACTICE_PURCHASE");
      newState = processPracticePurchase(state);
      // Пересчитываем состояние
      return gameStateService.processGameStateUpdate(newState);
    }
    
    case "PURCHASE_UPGRADE": {
      // Покупаем улучшение
      newState = processPurchaseUpgrade(state, action.payload);
      
      // ИСПРАВЛЕНИЕ: Убираем двойное применение эффектов "Основы блокчейна"
      // Все эффекты улучшения будут применены в processPurchaseUpgrade и затем через gameStateService
      
      // Проверяем особый случай для "Основ криптовалют" для принудительной разблокировки майнера
      if (action.payload.upgradeId === 'cryptoCurrencyBasics' || action.payload.upgradeId === 'cryptoBasics') {
        console.log("gameReducer: Дополнительная обработка для Основ криптовалют");
        // Принудительно проверяем и устанавливаем разблокировки для майнера и биткоина
        newState = gameStateService.performFullStateSync(newState);
      } else {
        // Обрабатываем изменения через сервис
        newState = gameStateService.processUpgradePurchase(newState, action.payload.upgradeId);
      }
      
      return newState;
    }
    
    case "UNLOCK_FEATURE": 
      newState = processUnlockFeature(state, action.payload);
      return gameStateService.processGameStateUpdate(newState);
    
    case "UNLOCK_RESOURCE": 
      newState = processUnlockResource(state, action.payload);
      return gameStateService.processGameStateUpdate(newState);
    
    case "SET_BUILDING_UNLOCKED": 
      newState = processSetBuildingUnlocked(state, action.payload);
      return gameStateService.processGameStateUpdate(newState);
      
    case "SET_UPGRADE_UNLOCKED": 
      newState = processSetUpgradeUnlocked(state, action.payload);
      return gameStateService.processGameStateUpdate(newState);
    
    case "INCREMENT_COUNTER": {
      // Инкрементируем счетчик
      console.log(`Инкремент счетчика: ${action.payload.counterId}, значение: ${action.payload.value}`);
      newState = processIncrementCounter(state, { counterId: action.payload.counterId, value: action.payload.value });
      // Обновляем состояние через сервис
      return gameStateService.processGameStateUpdate(newState);
    }
    
    case "CHECK_SYNERGIES":
      newState = checkSynergies(state);
      return gameStateService.processGameStateUpdate(newState);
    
    case "ACTIVATE_SYNERGY":
      newState = activateSynergy(state, action.payload);
      return gameStateService.processGameStateUpdate(newState);
    
    case "PRESTIGE": 
      return processPrestige(state);
    
    case "RESET_GAME": 
      return processResetGame(state);
    
    case "RESTART_COMPUTERS": 
      return processRestartComputers(state);
    
    case "MINE_COMPUTING_POWER": 
      newState = processMiningPower(state);
      return gameStateService.processGameStateUpdate(newState);
    
    case "CHECK_EQUIPMENT_STATUS": {
      // Проверяем статус оборудования, зависящего от ресурсов
      console.log("Проверка статуса оборудования");
      // Пока просто возвращаем текущее состояние,
      // в будущем можно добавить логику проверки и выключения оборудования
      return gameStateService.processGameStateUpdate(state);
    }
    
    case "APPLY_KNOWLEDGE": {
      // После применения знаний обновляем состояние через сервис
      console.log("gameReducer: Начало обработки APPLY_KNOWLEDGE");
      try {
        newState = processApplyKnowledge(state);
        console.log("gameReducer: Успешно обработан APPLY_KNOWLEDGE, проверка разблокировок...");
        
        // Принудительно логируем изменения ресурсов
        console.log("gameReducer: Изменения после применения знаний:", {
          knowledgeBefore: state.resources.knowledge?.value,
          knowledgeAfter: newState.resources.knowledge?.value,
          usdtBefore: state.resources.usdt?.value,
          usdtAfter: newState.resources.usdt?.value,
          usdtUnlocked: newState.resources.usdt?.unlocked,
          applyKnowledgeCounter: newState.counters.applyKnowledge
        });
        
        // Проверяем, разблокирован ли USDT
        if (!newState.resources.usdt || !newState.resources.usdt.unlocked) {
          console.log("gameReducer: USDT не разблокирован после APPLY_KNOWLEDGE, принудительно разблокируем");
          
          // Создаем или обновляем ресурс USDT
          const updatedResources = { ...newState.resources };
          if (!updatedResources.usdt) {
            updatedResources.usdt = {
              id: 'usdt',
              name: 'USDT',
              description: 'Стейблкоин, привязанный к стоимости доллара США',
              value: 1, // Даем базовую награду
              baseProduction: 0,
              production: 0,
              perSecond: 0,
              max: 50,
              unlocked: true,
              type: 'currency',
              icon: 'dollar'
            };
          } else {
            updatedResources.usdt = {
              ...updatedResources.usdt,
              unlocked: true
            };
          }
          
          newState = {
            ...newState,
            resources: updatedResources,
            unlocks: {
              ...newState.unlocks,
              usdt: true
            }
          };
        }
        
        // Принудительно выполняем полный цикл проверки разблокировок
        return gameStateService.performFullStateSync(newState);
      } catch (error) {
        console.error("gameReducer: Ошибка при обработке APPLY_KNOWLEDGE:", error);
        return state; // В случае ошибки возвращаем исходное состояние
      }
    }
    
    case "APPLY_ALL_KNOWLEDGE": {
      // После применения всех знаний обновляем состояние через сервис
      console.log("gameReducer: Начало обработки APPLY_ALL_KNOWLEDGE");
      try {
        // Исправляем ошибку TS2345, не передавая payload в processApplyAllKnowledge
        newState = processApplyAllKnowledge(state);
        console.log("gameReducer: Успешно обработан APPLY_ALL_KNOWLEDGE, проверка разблокировок...");
        
        // Принудительно логируем изменения ресурсов
        console.log("gameReducer: Изменения после применения всех знаний:", {
          knowledgeBefore: state.resources.knowledge?.value,
          knowledgeAfter: newState.resources.knowledge?.value,
          usdtBefore: state.resources.usdt?.value,
          usdtAfter: newState.resources.usdt?.value,
          usdtUnlocked: newState.resources.usdt?.unlocked,
          applyKnowledgeCounter: newState.counters.applyKnowledge
        });
        
        // Принудительно выполняем полный цикл проверки разблокировок
        return gameStateService.performFullStateSync(newState);
      } catch (error) {
        console.error("gameReducer: Ошибка при обработке APPLY_ALL_KNOWLEDGE:", error);
        return state; // В случае ошибки возвращаем исходное состояние
      }
    }
      
    case "EXCHANGE_BTC": 
      newState = processExchangeBtc(state);
      return gameStateService.processGameStateUpdate(newState);
    
    case "SET_REFERRAL_CODE":
      newState = processSetReferralCode(state, action.payload);
      return gameStateService.processGameStateUpdate(newState);
    
    case "ADD_REFERRAL":
      newState = processAddReferral(state, action.payload);
      return gameStateService.processGameStateUpdate(newState);
    
    case "ACTIVATE_REFERRAL":
      newState = processActivateReferral(state, action.payload);
      return gameStateService.processGameStateUpdate(newState);
    
    case "HIRE_REFERRAL_HELPER":
      newState = processHireReferralHelper(state, action.payload);
      return gameStateService.processGameStateUpdate(newState);
    
    case "RESPOND_TO_HELPER_REQUEST":
      newState = processRespondToHelperRequest(state, action.payload);
      return gameStateService.processGameStateUpdate(newState);
      
    case "UPDATE_REFERRAL_STATUS":
      newState = processUpdateReferralStatus(state, action.payload);
      return gameStateService.processGameStateUpdate(newState);
      
    case "UPDATE_HELPERS": {
      // Обработчик события обновления помощников
      console.log("Обновление списка помощников из базы данных");
      newState = {
        ...state,
        referralHelpers: action.payload.updatedHelpers || state.referralHelpers
      };
      
      // Обновляем состояние через сервис
      return gameStateService.processGameStateUpdate(newState);
    }
    
    case "CHOOSE_SPECIALIZATION": 
      newState = processChooseSpecialization(state, {
        specializationType: action.payload.roleId // Преобразуем roleId в specializationType
      });
      return gameStateService.processGameStateUpdate(newState);
    
    default:
      return state;
  }
};
