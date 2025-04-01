
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
      
      // Отмечаем USDT как разблокированный
      newState.unlocks = {
        ...newState.unlocks,
        usdt: true
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
  
  // Специальный случай для интернет-канала
  if (buildingId === 'internetChannel' && newState.buildings.internetChannel.count > 0) {
    console.log('Применение эффектов интернет-канала');
    
    // +20% к скорости получения знаний, +5% к эффективности производства вычисл. мощности
    const channelCount = newState.buildings.internetChannel.count;
    const knowledgeBoost = 0.2 * channelCount; // +20% за каждый канал
    const cpuBoost = 0.05 * channelCount; // +5% за каждый канал
    
    // Обновляем бонусы, если они еще не определены
    newState.buildings.internetChannel = {
      ...newState.buildings.internetChannel,
      effects: {
        knowledgeBoost: 0.2,
        computingPowerBoost: 0.05
      }
    };
    
    if (newState.buildings.internetChannel.count === 1) {
      safeDispatchGameEvent('Интернет-канал: +20% к скорости получения знаний, +5% к эффективности производства вычислительной мощности', 'info');
    }
  }
  
  // Специальный случай для улучшенного кошелька
  if (buildingId === 'enhancedWallet' && newState.buildings.enhancedWallet.count > 0) {
    console.log('Применение эффектов улучшенного кошелька');
    
    // +150 к макс. хранению USDT, +1 к макс. BTC
    const walletCount = newState.buildings.enhancedWallet.count;
    const usdtMaxBonus = 150 * walletCount;
    const btcMaxBonus = 1 * walletCount;
    
    // Обновляем максимум USDT
    if (newState.resources.usdt) {
      newState.resources.usdt = {
        ...newState.resources.usdt,
        max: (newState.resources.usdt.max || 50) + usdtMaxBonus
      };
    }
    
    // Обновляем максимум BTC
    if (newState.resources.bitcoin) {
      newState.resources.bitcoin = {
        ...newState.resources.bitcoin,
        max: (newState.resources.bitcoin.max || 0.01) + btcMaxBonus
      };
    }
    
    if (newState.buildings.enhancedWallet.count === 1) {
      safeDispatchGameEvent('Улучшенный кошелёк: +150 к макс. USDT, +1 к макс. BTC, +8% к эффективности конвертации BTC', 'info');
    }
  }
  
  // Специальный случай для криптобиблиотеки
  if (buildingId === 'cryptoLibrary' && newState.buildings.cryptoLibrary.count > 0) {
    console.log('Применение эффектов криптобиблиотеки');
    
    // +50% к скорости получения знаний, +100 к макс. Знаниям
    const libraryCount = newState.buildings.cryptoLibrary.count;
    const knowledgeBoost = 0.5 * libraryCount;
    const knowledgeMaxBonus = 100 * libraryCount;
    
    // Обновляем максимум знаний
    if (newState.resources.knowledge) {
      newState.resources.knowledge = {
        ...newState.resources.knowledge,
        max: (newState.resources.knowledge.max || 100) + knowledgeMaxBonus
      };
    }
    
    if (newState.buildings.cryptoLibrary.count === 1) {
      safeDispatchGameEvent('Криптобиблиотека: +50% к скорости получения знаний, +100 к макс. знаниям', 'info');
    }
  }
  
  // Специальный случай для системы охлаждения
  if (buildingId === 'coolingSystem' && newState.buildings.coolingSystem.count > 0) {
    console.log('Применение эффектов системы охлаждения');
    
    // -20% к потреблению вычислительной мощности всеми устройствами
    if (newState.buildings.coolingSystem.count === 1) {
      safeDispatchGameEvent('Система охлаждения: -20% к потреблению вычислительной мощности всеми устройствами', 'info');
    }
  }
  
  // Специальный случай для автомайнера - сразу инициализируем ресурс Bitcoin
  if ((buildingId === 'autoMiner' || buildingId === 'miner') && 
      (newState.buildings.autoMiner?.count === 1 || newState.buildings.miner?.count === 1)) {
    // Проверяем, есть ли Bitcoin и разблокирован ли он
    if (!newState.resources.bitcoin?.unlocked) {
      console.log("Инициализация Bitcoin после покупки первого автомайнера/майнера");
      newState = {
        ...newState,
        resources: {
          ...newState.resources,
          bitcoin: {
            id: 'bitcoin',
            name: 'Bitcoin',
            description: 'Bitcoin - первая и основная криптовалюта',
            type: 'currency',
            icon: 'bitcoin',
            value: 0,
            baseProduction: 0,
            production: 0,
            perSecond: 0.00005, // Базовая скорость от одного майнера
            max: 0.01,
            unlocked: true
          }
        },
        unlocks: {
          ...newState.unlocks,
          bitcoin: true
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
  
  // После покупки здания проверяем все возможные разблокировки 
  // через централизованную систему разблокировок
  newState = checkAllUnlocks(newState);
  
  // Обновляем максимальные значения ресурсов
  newState = updateResourceMaxValues(newState);
  
  // Обязательно обновляем максимальные значения ресурсов после всех изменений
  return updateResourceMaxValues(newState);
};
