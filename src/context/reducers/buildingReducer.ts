
import { GameState, GameAction } from '../types';
import { canAffordCost, deductResources } from '@/utils/helpers';

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
  
  // Если игрок купил генератор, разблокируем исследования
  if (buildingId === 'generator' && building.count === 0) {
    console.log('Игрок построил свой первый генератор, разблокируем исследования');
    
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
    
    return {
      ...state,
      resources: newResources,
      buildings: newBuildings,
      unlocks: newUnlocks,
      upgrades: newUpgrades,
    };
  }
  
  // Активация реферала, если построен генератор
  if (buildingId === 'generator' && state.referredBy) {
    console.log(`Игрок построил генератор, и был приглашен по коду ${state.referredBy}. Активируем реферальную связь.`);
    
    // Отправка данных в supabase могла бы быть здесь, но из-за синхронности reducer'а, 
    // этой функциональности лучше быть в useEffect или в action creator
    
    // По хорошему, здесь стоит отметить что пользователь активирован для реферера,
    // но это требует асинхронных запросов к бд
  }
  
  return {
    ...state,
    resources: newResources,
    buildings: newBuildings,
  };
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
