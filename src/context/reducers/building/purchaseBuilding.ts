
import { GameState } from '../../types';
import { hasEnoughResources, updateResourceMaxValues } from '../../utils/resourceUtils';
import { safeDispatchGameEvent } from '../../utils/eventBusUtils';
import { checkAllUnlocks } from '@/utils/unlockManager';

// Обработка покупки зданий
export const processPurchaseBuilding = (
  state: GameState,
  payload: { buildingId: string }
): GameState => {
  const { buildingId } = payload;
  const building = state.buildings[buildingId];
  
  // Если здание не существует или не разблокировано, возвращаем текущее состояние
  if (!building || !building.unlocked) {
    console.warn(`Попытка купить недоступное здание: ${buildingId}`);
    return state;
  }
  
  // Проверяем, достаточно ли ресурсов для покупки
  const calculatedCost: { [key: string]: number } = {};
  for (const [resourceId, baseCost] of Object.entries(building.cost)) {
    // Рассчитываем текущую стоимость с учетом множителя и текущего количества
    const currentCost = Math.floor(Number(baseCost) * Math.pow(Number(building.costMultiplier || 1.15), building.count));
    calculatedCost[resourceId] = currentCost;
  }
  
  // Проверка достаточности ресурсов
  if (!hasEnoughResources(state, calculatedCost)) {
    console.warn(`Недостаточно ресурсов для покупки ${building.name}`);
    return state;
  }
  
  // Вычитаем ресурсы
  const newResources = { ...state.resources };
  for (const [resourceId, cost] of Object.entries(calculatedCost)) {
    newResources[resourceId] = {
      ...newResources[resourceId],
      value: Math.max(0, newResources[resourceId].value - cost) // Предотвращаем отрицательные значения
    };
  }
  
  // Увеличиваем количество зданий
  const newBuildings = {
    ...state.buildings,
    [buildingId]: {
      ...building,
      count: building.count + 1
    }
  };
  
  console.log(`Куплено здание ${building.name} за:`, calculatedCost);
  safeDispatchGameEvent(`Приобретено здание "${building.name}"`, "success");
  
  // Создаем новое состояние с обновленными ресурсами и зданиями
  let newState = {
    ...state,
    resources: newResources,
    buildings: newBuildings
  };
  
  // После покупки здания проверяем все возможные разблокировки 
  // через централизованную систему разблокировок
  newState = checkAllUnlocks(newState);
  
  // Обновляем максимальные значения ресурсов
  newState = updateResourceMaxValues(newState);
  
  // Специальный случай для автомайнера - сразу инициализируем ресурс BTC
  if (buildingId === 'autoMiner' && newState.buildings.autoMiner.count === 1) {
    // Проверяем, есть ли BTC и разблокирован ли он
    if (!newState.resources.btc?.unlocked) {
      console.log("Инициализация BTC после покупки первого автомайнера");
      newState = {
        ...newState,
        resources: {
          ...newState.resources,
          btc: {
            id: 'btc',
            name: 'BTC',
            description: 'Биткоин - первая и основная криптовалюта',
            type: 'currency',
            icon: 'bitcoin',
            value: 0,
            baseProduction: 0,
            production: 0,
            perSecond: 0.00005, // Базовая скорость от одного майнера
            max: 1,
            unlocked: true
          }
        },
        unlocks: {
          ...state.unlocks,
          btc: true
        }
      };
      
      // Убедимся, что параметры майнинга инициализированы
      if (!newState.miningParams) {
        newState.miningParams = {
          miningEfficiency: 1,
          networkDifficulty: 1.0,
          energyEfficiency: 0,
          exchangeRate: 20000,
          exchangeCommission: 0.05,
          volatility: 0.2,
          exchangePeriod: 3600,
          baseConsumption: 1
        };
      }
    }
  }
  
  return newState;
};
