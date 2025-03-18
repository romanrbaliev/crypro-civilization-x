import { GameState, GameAction } from '../types';
import { canAffordCost, deductResources } from '@/utils/helpers';
import { activateReferral } from '@/api/gameDataService';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { updateResourceMaxValues } from '../utils/resourceUtils';

// Экспортируем функцию для использования в gameReducer
export const processPurchaseBuilding = (state: GameState, payload: { buildingId: string }): GameState => {
  const buildingId = payload.buildingId;
  const building = state.buildings[buildingId];

  if (!building?.unlocked) {
    return state;
  }

  const cost = calculateBuildingCost(building);

  if (!canAffordCost(cost, state.resources)) {
    return state;
  }

  const newResources = deductResources(cost, state.resources);
  const newBuildings = { ...state.buildings };
  
  newBuildings[buildingId] = {
    ...building,
    count: building.count + 1,
    cost: {
      ...building.cost,
    },
  };

  // Особые случаи для определенных зданий
  
  // Если игрок купил генератор, разблокируем исследования и активируем реферальную связь
  if (buildingId === 'generator' && building.count === 0) {
    console.log('Игрок построил свой первый генератор');
    
    // Разблокируем вкладку исследований
    const newUnlocks = { ...state.unlocks, research: true };
    
    // Проверяем наличие и разблокируем "Основы блокчейна"
    const newUpgrades = { ...state.upgrades };
    
    // Разблокировка по ID blockchain_basics
    if (newUpgrades.blockchain_basics) {
      console.log('Разблокируем исследование "Основы блокчейна" (blockchain_basics)');
      newUpgrades.blockchain_basics = {
        ...newUpgrades.blockchain_basics,
        unlocked: true
      };
    }
    
    // Разблокировка по альтернативному ID basicBlockchain
    if (newUpgrades.basicBlockchain) {
      console.log('Разблокируем исследование "Основы блокчейна" (basicBlockchain)');
      newUpgrades.basicBlockchain = {
        ...newUpgrades.basicBlockchain,
        unlocked: true
      };
    }
    
    // Если пользователь был приглашен по реферальной ссылке, активируем его как реферала
    if (state.referredBy) {
      console.log(`Игрок был приглашен по коду ${state.referredBy}. Подготавливаем реферальную связь.`);
      
      // Отправляем ID текущего пользователя для проверки активации у реферера
      const userId = window.__game_user_id || `local_${Math.random().toString(36).substring(2)}_${Date.now()}`;
      
      console.log(`Подготавливаем пользователя ${userId} как реферала пользователя с кодом ${state.referredBy}`);
      
      // Отправляем уведомление
      safeDispatchGameEvent("Реферальная связь готова к активации. После исследования \"Основы блокчейна\" вы активируете бонус для пригласившего вас!", "info");
      
      // НЕ активируем реферала автоматически, это происходит только после покупки исследования
    }
    
    // Обновляем максимальные значения ресурсов
    const stateWithNewUpgrades = {
      ...state,
      resources: newResources,
      buildings: newBuildings,
      unlocks: newUnlocks,
      upgrades: newUpgrades,
    };
    
    return updateResourceMaxValues(stateWithNewUpgrades);
  }
  
  // Обновляем состояние с новым зданием и затем обновляем максимальные значения ресурсов
  const newState = {
    ...state,
    resources: newResources,
    buildings: newBuildings,
  };
  
  // Применяем изменения к максимальным значениям ресурсов
  return updateResourceMaxValues(newState);
};

export const buildingReducer = (state: GameState, action: GameAction): GameState => {
  if (action.type === "PURCHASE_BUILDING") {
    return processPurchaseBuilding(state, action.payload);
  }
  return state;
};

const calculateBuildingCost = (building: any) => {
  const result: { [key: string]: number } = {};
  
  Object.entries(building.cost).forEach(([resourceId, amount]) => {
    result[resourceId] = Math.floor(Number(amount) * Math.pow(building.costMultiplier, building.count));
  });
  
  return result;
};

// Глобальное объявление типа для window
declare global {
  interface Window {
    __game_user_id?: string;
  }
}
