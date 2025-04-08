
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
    // Разблокируем электричество, если ещё не разблокировано
    if (!newState.unlocks.electricity) {
      newState = {
        ...newState,
        unlocks: {
          ...newState.unlocks,
          electricity: true
        }
      };
      
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
        
        safeDispatchGameEvent('Разблокировано электричество!', 'success');
      } else {
        newState.resources.electricity = {
          ...newState.resources.electricity,
          unlocked: true,
          baseProduction: 0.5,
          production: 0.5,
          perSecond: 0.5
        };
      }
    } else {
      // Если электричество уже разблокировано, увеличиваем производство
      newState.resources.electricity = {
        ...newState.resources.electricity,
        baseProduction: (newState.resources.electricity.baseProduction || 0) + 0.5,
        production: (newState.resources.electricity.production || 0) + 0.5,
        perSecond: (newState.resources.electricity.perSecond || 0) + 0.5
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
  
  if (buildingId === 'cryptoWallet' || buildingId === 'wallet') {
    // Применяем эффекты криптокошелька (+50 к макс. USDT, +25% к макс. знаниям)
    console.log('Применение эффектов криптокошелька');
    
    // Получаем правильный ID кошелька и количество
    const walletId = buildingId;
    const walletCount = newState.buildings[walletId].count;
    
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
      
      // Отмечаем USDT как разблокированный
      newState.unlocks = {
        ...newState.unlocks,
        usdt: true
      };
    }
    
    // Увеличиваем максимум USDT для каждого криптокошелька
    const baseUsdtMax = 50; // Базовый максимум для одного кошелька
    const usdtMaxBonus = baseUsdtMax * walletCount;
    
    if (newState.resources.usdt) {
      console.log(`Криптокошелек: устанавливаем максимум USDT на ${Math.max(newState.resources.usdt.max || 50, 50 + usdtMaxBonus)}`);
      
      newState.resources.usdt = {
        ...newState.resources.usdt,
        max: Math.max(newState.resources.usdt.max || 50, 50 + usdtMaxBonus)
      };
    }
    
    // Увеличиваем максимум знаний на 25% от текущего максимума за каждый кошелек
    if (newState.resources.knowledge) {
      const knowledgeBasicMax = 100; // Базовый максимум знаний
      const knowledgeMaxBoost = 0.25 * walletCount; // +25% за каждый кошелек
      const newKnowledgeMax = Math.max(
        newState.resources.knowledge.max || knowledgeBasicMax,
        knowledgeBasicMax * (1 + knowledgeMaxBoost)
      );
      
      console.log(`Криптокошелек: устанавливаем максимум знаний на ${newKnowledgeMax}`);
      
      newState.resources.knowledge = {
        ...newState.resources.knowledge,
        max: newKnowledgeMax
      };
    }
    
    if (walletCount === 1) {
      safeDispatchGameEvent('Криптокошелёк: +50 к макс. USDT, +25% к макс. знаниям', 'success');
    } else {
      safeDispatchGameEvent(`Криптокошелёк ${walletCount}: +${50 * walletCount} к макс. USDT, +${25 * walletCount}% к макс. знаниям`, 'success');
    }
  }
  
  if (buildingId === 'homeComputer' && newState.buildings.homeComputer.count === 1) {
    // Разблокируем вычислительную мощность, если ещё не разблокирована
    if (!newState.unlocks.computingPower) {
      newState = {
        ...newState,
        unlocks: {
          ...newState.unlocks,
          computingPower: true
        }
      };
      
      // Создаем ресурс вычислительной мощности, если его нет
      if (!newState.resources.computingPower) {
        newState.resources.computingPower = {
          id: 'computingPower',
          name: 'Вычислительная мощность',
          description: 'Вычислительная мощность для майнинга и расчетов',
          type: 'resource',
          icon: 'cpu',
          value: 0,
          baseProduction: 2, // Производит 2 вычисл. мощности/сек
          production: 2,
          perSecond: 2,
          max: 1000,
          consumption: {
            electricity: 1 // Потребляет 1 электричество/сек - исправляем тип
          },
          unlocked: true
        };
        
        safeDispatchGameEvent('Разблокирована вычислительная мощность!', 'success');
      } else {
        newState.resources.computingPower = {
          ...newState.resources.computingPower,
          unlocked: true,
          baseProduction: 2,
          production: 2,
          perSecond: 2,
          consumption: {
            electricity: 1 // Исправляем тип
          }
        };
      }
    } else {
      // Если вычислительная мощность уже разблокирована, увеличиваем производство
      newState.resources.computingPower = {
        ...newState.resources.computingPower,
        baseProduction: (newState.resources.computingPower.baseProduction || 0) + 2,
        production: (newState.resources.computingPower.production || 0) + 2,
        perSecond: (newState.resources.computingPower.perSecond || 0) + 2
      };
    }
  } else if (buildingId === 'homeComputer' && newState.buildings.homeComputer.count > 1) {
    // Увеличиваем производство вычислительной мощности для каждого дополнительного компьютера
    newState.resources.computingPower = {
      ...newState.resources.computingPower,
      baseProduction: (newState.resources.computingPower.baseProduction || 0) + 2,
      production: (newState.resources.computingPower.production || 0) + 2,
      perSecond: (newState.resources.computingPower.perSecond || 0) + 2
    };
  }
  
  // Принудительно обновляем максимальные значения ресурсов
  newState = updateResourceMaxValues(newState);
  
  // Возвращаем обновленное состояние
  return newState;
};
