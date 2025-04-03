
import { GameState } from '../../types';
import { updateResourceMaxValues } from '../../utils/resourceUtils';
import { safeDispatchGameEvent } from '../../utils/eventBusUtils';
import { UnlockManagerService } from '@/services/UnlockManagerService';

// Функция для проверки, достаточно ли ресурсов для покупки
function hasEnoughResources(state: GameState, cost: Record<string, number>): boolean {
  for (const [resourceId, amount] of Object.entries(cost)) {
    const resource = state.resources[resourceId];
    if (!resource || resource.value < Number(amount)) {
      return false;
    }
  }
  return true;
}

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
  
  // Добавим проверку на наличие свойства cost
  if (!building.cost) {
    console.error(`Здание ${buildingId} не имеет свойства cost`);
    return state;
  }
  
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
  console.log(`Эффекты здания ${building.name}:`, building.effects || {});
  
  safeDispatchGameEvent(`Приобретено здание "${building.name}"`, "success");
  
  // Создаем новое состояние с обновленными ресурсами и зданиями
  let newState = {
    ...state,
    resources: newResources,
    buildings: newBuildings
  };
  
  // Применяем специальные эффекты от зданий
  if (buildingId === 'practice' && newState.buildings.practice.count === 1) {
    // Автоматическое получение 1 знаний/сек
    if (!newState.resources.knowledge?.baseProduction) {
      newState.resources.knowledge = {
        ...newState.resources.knowledge,
        baseProduction: 1,
        production: 1
      };
    }
  }
  
  if (buildingId === 'generator' && newState.buildings.generator.count === 1) {
    // Создаем ресурс электричества, если его нет
    if (!newState.resources.electricity) {
      newState.resources.electricity = {
        id: 'electricity',
        name: 'Электричество',
        description: 'Электроэнергия для питания устройств',
        type: 'resource',
        icon: 'zap',
        value: 0,
        baseProduction: 0.5, // Производит 0.5 электричества/сек
        production: 0.5,
        perSecond: 0.5,
        max: 100,
        unlocked: true
      };
    } else {
      newState.resources.electricity = {
        ...newState.resources.electricity,
        unlocked: true,
        baseProduction: 0.5,
        production: 0.5,
        perSecond: 0.5
      };
    }
  } else if (buildingId === 'generator' && newState.buildings.generator.count > 1) {
    // Увеличиваем производство электричества для каждого дополнительного генератора
    newState.resources.electricity = {
      ...newState.resources.electricity,
      baseProduction: (newState.resources.electricity.baseProduction || 0) + 0.5,
      production: (newState.resources.electricity.production || 0) + 0.5,
      perSecond: (newState.resources.electricity.perSecond || 0) + 0.5
    };
  }
  
  if (buildingId === 'cryptoWallet' && newState.buildings.cryptoWallet.count > 0) {
    // Применяем эффекты криптокошелька (+50 к макс. USDT, +25% к макс. знаниям)
    console.log('Применение эффектов криптокошелька');
    
    // Создаем или обновляем ресурс USDT, если его еще нет
    if (!newState.resources.usdt) {
      newState.resources.usdt = {
        id: 'usdt',
        name: 'USDT',
        description: 'Стейблкоин, привязанный к доллару США',
        type: 'currency',
        icon: 'dollar',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 50, // Базовый максимум для USDT
        unlocked: true
      };
    }
    
    // Увеличиваем максимум USDT для каждого криптокошелька
    const walletCount = newState.buildings.cryptoWallet.count;
    const baseUsdtMax = 50; // Базовый максимум для одного кошелька
    const usdtMaxBonus = baseUsdtMax * walletCount;
    
    if (newState.resources.usdt) {
      newState.resources.usdt = {
        ...newState.resources.usdt,
        max: Math.max(newState.resources.usdt.max || 50, 50 + usdtMaxBonus)
      };
    }
    
    // Увеличиваем максимум знаний на 25% от текущего максимума за каждый кошелек
    if (newState.resources.knowledge) {
      const knowledgeBasicMax = 100; // Базовый максимум знаний
      const knowledgeMaxBoost = 0.25 * walletCount; // +25% за каждый кошелек
      
      newState.resources.knowledge = {
        ...newState.resources.knowledge,
        max: Math.max(
          newState.resources.knowledge.max || knowledgeBasicMax,
          knowledgeBasicMax * (1 + knowledgeMaxBoost)
        )
      };
    }
    
    if (newState.buildings.cryptoWallet.count === 1) {
      safeDispatchGameEvent('Криптокошелёк: +50 к макс. USDT, +25% к макс. знаниям', 'info');
    }
  }
  
  if (buildingId === 'homeComputer' && newState.buildings.homeComputer.count > 0) {
    // Создаем ресурс computingPower, если его нет
    if (!newState.resources.computingPower) {
      newState.resources.computingPower = {
        id: 'computingPower',
        name: 'Вычислительная мощность',
        description: 'Вычислительная мощность для майнинга',
        type: 'resource',
        icon: 'cpu',
        value: 0,
        baseProduction: 2, // +2 вычисл. мощности/сек
        production: 2,
        perSecond: 2,
        max: 1000,
        unlocked: true
      };
    } else {
      newState.resources.computingPower = {
        ...newState.resources.computingPower,
        unlocked: true,
        baseProduction: (newState.resources.computingPower.baseProduction || 0) + 2,
        production: (newState.resources.computingPower.production || 0) + 2,
        perSecond: (newState.resources.computingPower.perSecond || 0) + 2
      };
    }
    
    // Каждый домашний компьютер потребляет 1 электр./сек
    if (newState.resources.electricity) {
      newState.resources.electricity = {
        ...newState.resources.electricity,
        perSecond: (newState.resources.electricity.perSecond || 0) - 1
      };
    }
  }
  
  // При покупке майнера разблокируем Bitcoin
  if (buildingId === 'miner' && newState.buildings.miner.count === 1) {
    console.log("Применяем эффекты от первой покупки майнера");
    
    // Инициализируем или обновляем Bitcoin
    if (!newState.resources.bitcoin) {
      newState.resources.bitcoin = {
        id: 'bitcoin',
        name: 'Bitcoin',
        description: 'Bitcoin - первая и основная криптовалюта',
        type: 'currency',
        icon: 'bitcoin',
        value: 0,
        baseProduction: 0.00005, // Базовая добыча за секунду
        production: 0.00005,
        perSecond: 0.00005,
        max: 100,
        unlocked: true
      };
    } else {
      newState.resources.bitcoin = {
        ...newState.resources.bitcoin,
        unlocked: true,
        baseProduction: 0.00005,
        production: 0.00005,
        perSecond: 0.00005
      };
    }
    
    // Майнинг потребляет ресурсы
    if (newState.resources.electricity) {
      newState.resources.electricity = {
        ...newState.resources.electricity,
        perSecond: (newState.resources.electricity.perSecond || 0) - 1 // -1 электричество/сек
      };
    }
    
    if (newState.resources.computingPower) {
      newState.resources.computingPower = {
        ...newState.resources.computingPower,
        perSecond: (newState.resources.computingPower.perSecond || 0) - 5 // -5 вычисл.мощность/сек
      };
    }
  } else if (buildingId === 'miner' && newState.buildings.miner.count > 1) {
    // Для каждого дополнительного майнера увеличиваем добычу и потребление ресурсов
    if (newState.resources.bitcoin) {
      newState.resources.bitcoin = {
        ...newState.resources.bitcoin,
        baseProduction: (newState.resources.bitcoin.baseProduction || 0) + 0.00005,
        production: (newState.resources.bitcoin.production || 0) + 0.00005,
        perSecond: (newState.resources.bitcoin.perSecond || 0) + 0.00005
      };
    }
    
    if (newState.resources.electricity) {
      newState.resources.electricity = {
        ...newState.resources.electricity,
        perSecond: (newState.resources.electricity.perSecond || 0) - 1
      };
    }
    
    if (newState.resources.computingPower) {
      newState.resources.computingPower = {
        ...newState.resources.computingPower,
        perSecond: (newState.resources.computingPower.perSecond || 0) - 5
      };
    }
  }

  // Обновляем максимальные значения ресурсов после всех изменений
  newState = updateResourceMaxValues(newState);
  
  // Проверяем все разблокировки через централизованный сервис
  newState = UnlockManagerService.checkAllUnlocks(newState);
  
  return newState;
};
