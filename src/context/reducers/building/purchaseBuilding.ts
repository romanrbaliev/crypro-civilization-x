import { GameState } from '../../types';
import { safeDispatchGameEvent } from '../../utils/eventBusUtils';
import { hasEnoughResources, updateResourceMaxValues } from '../../utils/resourceUtils';

// Обработка покупки здания
export const processPurchaseBuilding = (
  state: GameState,
  payload: { buildingId: string, count?: number }
): GameState => {
  const { buildingId, count = 1 } = payload;
  const building = state.buildings[buildingId];
  
  // Если здание не существует или не разблокировано, возвращаем текущее состояние
  if (!building || !building.unlocked) {
    console.warn(`Попытка купить неразблокированное здание: ${buildingId}`);
    return state;
  }
  
  // Проверяем, есть ли у здания стоимость
  if (!building.cost) {
    console.warn(`У здания ${buildingId} нет стоимости`);
    return state;
  }
  
  // Рассчитываем стоимость с учетом количества уже купленных зданий
  const currentCost = calculateBuildingCost(building, count);
  
  // Проверяем, достаточно ли ресурсов для покупки
  if (!hasEnoughResources(state.resources, currentCost)) {
    console.log(`Недостаточно ресурсов для покупки ${building.name}`);
    return state;
  }
  
  // Создаем копии для изменения
  let updatedResources = { ...state.resources };
  
  // Вычитаем стоимость здания
  for (const resourceId in currentCost) {
    updatedResources[resourceId] = {
      ...updatedResources[resourceId],
      value: updatedResources[resourceId].value - Number(currentCost[resourceId])
    };
  }
  
  // Создаем новое состояние с обновленным количеством здания
  const newBuildings = {
    ...state.buildings,
    [buildingId]: {
      ...building,
      count: building.count + count
    }
  };
  
  console.log(`Куплено здание ${building.name}`);
  safeDispatchGameEvent(`Здание ${building.name} куплено`, "success");
  
  // Создаем новое состояние
  let newState = {
    ...state,
    resources: updatedResources,
    buildings: newBuildings
  };
  
  // Обрабатываем особые случаи для разных зданий
  switch (buildingId) {
    case 'practice':
      newState = handlePracticePurchase(newState);
      break;
    case 'generator':
      newState = handleGeneratorPurchase(newState);
      break;
    case 'cryptoWallet':
      newState = handleCryptoWalletPurchase(newState);
      break;
    case 'homeComputer':
      newState = handleHomeComputerPurchase(newState);
      break;
    case 'internetChannel':
      newState = handleInternetChannelPurchase(newState);
      break;
    case 'miner':
      newState = handleMinerPurchase(newState);
      break;
    case 'autoMiner':
      newState = handleAutoMinerPurchase(newState);
      break;
    case 'cryptoLibrary':
      newState = handleCryptoLibraryPurchase(newState);
      break;
    case 'enhancedWallet':
      newState = handleEnhancedWalletPurchase(newState);
      break;
    case 'coolingSystem':
      newState = handleCoolingSystemPurchase(newState);
      break;
  }
  
  // Обновляем максимальные значения ресурсов
  newState = updateResourceMaxValues(newState);
  
  return newState;
};

// Функция для расчета стоимости здания с учетом количества уже купленных
const calculateBuildingCost = (building: any, count: number = 1): { [key: string]: number } => {
  const baseCost = building.cost;
  const currentCount = building.count;
  
  // Если нет базовой стоимости, возвращаем пустой объект
  if (!baseCost) return {};
  
  // Создаем копию базовой стоимости
  const totalCost: { [key: string]: number } = {};
  
  // Рассчитываем стоимость для каждого ресурса
  for (const resourceId in baseCost) {
    const baseResourceCost = baseCost[resourceId];
    
    // Применяем формулу: базовая_стоимость * (1.15 ^ текущее_количество)
    // Для нескольких зданий суммируем стоимость каждого
    let costSum = 0;
    for (let i = 0; i < count; i++) {
      costSum += baseResourceCost * Math.pow(1.15, currentCount + i);
    }
    
    totalCost[resourceId] = Math.floor(costSum);
  }
  
  return totalCost;
};

// Обработка покупки практики
const handlePracticePurchase = (state: GameState): GameState => {
  // Если это первая покупка практики, разблокируем USDT
  if (state.buildings.practice.count === 1) {
    console.log('Первая покупка практики, проверяем разблокировку USDT');
    
    // Проверяем, разблокирован ли уже USDT
    if (!state.unlocks.usdt) {
      console.log('USDT еще не разблокирован, разблокируем');
      
      // Создаем или разблокируем ресурс USDT
      if (!state.resources.usdt) {
        state.resources.usdt = {
          id: 'usdt',
          name: 'USDT',
          description: 'Стабильная криптовалюта, привязанная к доллару США',
          type: 'currency',
          icon: 'dollar-sign',
          value: 0,
          baseProduction: 0,
          production: 0,
          perSecond: 0,
          max: 50,
          unlocked: true
        };
      } else {
        state.resources.usdt.unlocked = true;
      }
      
      // Устанавливаем флаг разблокировки
      state.unlocks.usdt = true;
      
      safeDispatchGameEvent('Разблокирован ресурс: USDT', 'success');
    }
  }
  
  return state;
};

// Обработка покупки генератора
const handleGeneratorPurchase = (state: GameState): GameState => {
  // Если это первая покупка генератора, разблокируем электричество
  if (state.buildings.generator.count === 1) {
    console.log('Первая покупка генератора, разблокируем электричество');
    
    // Создаем или разблокируем ресурс электричества
    if (!state.resources.electricity) {
      state.resources.electricity = {
        id: 'electricity',
        name: 'Электричество',
        description: 'Электроэнергия для питания устройств',
        type: 'resource',
        icon: 'zap',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 100,
        unlocked: true
      };
    } else {
      state.resources.electricity.unlocked = true;
    }
    
    // Устанавливаем флаг разблокировки
    state.unlocks.electricity = true;
    
    safeDispatchGameEvent('Разблокирован ресурс: Электричество', 'success');
    
    // Разблокируем исследования
    state.unlocks.research = true;
    
    // Разблокируем основы блокчейна
    if (state.upgrades.blockchainBasics) {
      state.upgrades.blockchainBasics.unlocked = true;
      state.unlocks.blockchainBasics = true;
    }
    
    safeDispatchGameEvent('Разблокированы исследования', 'success');
  }
  
  return state;
};

// Обработка покупки криптокошелька
const handleCryptoWalletPurchase = (state: GameState): GameState => {
  // Если это первая покупка криптокошелька, разблокируем основы криптовалют
  if (state.buildings.cryptoWallet.count === 1) {
    console.log('Первая покупка криптокошелька, разблокируем основы криптовалют');
    
    // Разблокируем исследование основы криптовалют
    if (state.upgrades.cryptoCurrencyBasics) {
      state.upgrades.cryptoCurrencyBasics.unlocked = true;
      state.unlocks.cryptoCurrencyBasics = true;
      
      safeDispatchGameEvent('Разблокировано исследование: Основы криптовалют', 'success');
    } else if (state.upgrades.cryptoBasics) {
      state.upgrades.cryptoBasics.unlocked = true;
      state.unlocks.cryptoBasics = true;
      
      safeDispatchGameEvent('Разблокировано исследование: Основы криптовалют', 'success');
    }
  }
  
  return state;
};

// Обработка покупки домашнего компьютера
const handleHomeComputerPurchase = (state: GameState): GameState => {
  // Если это первая покупка компьютера, разблокируем вычислительную мощность
  if (state.buildings.homeComputer.count === 1) {
    console.log('Первая покупка компьютера, разблокируем вычислительную мощность');
    
    // Создаем или разблокируем ресурс вычислительной мощности
    if (!state.resources.computingPower) {
      state.resources.computingPower = {
        id: 'computingPower',
        name: 'Вычислительная мощность',
        description: 'Вычислительная мощность для майнинга',
        type: 'resource',
        icon: 'cpu',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 1000,
        unlocked: true
      };
    } else {
      state.resources.computingPower.unlocked = true;
    }
    
    // Устанавливаем флаг разблокировки
    state.unlocks.computingPower = true;
    
    safeDispatchGameEvent('Разблокирован ресурс: Вычислительная мощность', 'success');
  }
  
  return state;
};

// Обработка покупки интернет-канала
const handleInternetChannelPurchase = (state: GameState): GameState => {
  // Если это первая покупка интернет-канала, разблокируем алгоритмическую оптимизацию
  if (state.buildings.internetChannel.count === 1) {
    console.log('Первая покупка интернет-канала, разблокируем алгоритмическую оптимизацию');
    
    // Разблокируем исследование алгоритмической оптимизации
    if (state.upgrades.algorithmOptimization) {
      state.upgrades.algorithmOptimization.unlocked = true;
      state.unlocks.algorithmOptimization = true;
      
      safeDispatchGameEvent('Разблокировано исследование: Алгоритмическая оптимизация', 'success');
    }
  }
  
  return state;
};

// Обработка покупки майнера
const handleMinerPurchase = (state: GameState): GameState => {
  // Если это первая покупка майнера, разблокируем Proof of Work
  if (state.buildings.miner.count === 1) {
    console.log('Первая покупка майнера, разблокируем Proof of Work');
    
    // Разблокируем исследование Proof of Work
    if (state.upgrades.proofOfWork) {
      state.upgrades.proofOfWork.unlocked = true;
      state.unlocks.proofOfWork = true;
      
      safeDispatchGameEvent('Разблокировано исследование: Proof of Work', 'success');
    }
  }
  
  return state;
};

// Обработка покупки автомайнера
const handleAutoMinerPurchase = (state: GameState): GameState => {
  // Если это первая покупка автомайнера, разблокируем энергоэффективные компоненты
  if (state.buildings.autoMiner.count === 1) {
    console.log('Первая покупка автомайнера, разблокируем энергоэффективные компоненты');
    
    // Разблокируем исследование энергоэффективных компонентов
    if (state.upgrades.energyEfficientComponents) {
      state.upgrades.energyEfficientComponents.unlocked = true;
      state.unlocks.energyEfficientComponents = true;
      
      safeDispatchGameEvent('Разблокировано исследование: Энергоэффективные компоненты', 'success');
    }
    
    // Инициализация параметров майнинга, если они отсутствуют
    if (!state.miningParams) {
      state.miningParams = {
        exchangeRate: 20000,
        exchangeCommission: 0.05,
        miningEfficiency: 1.0,
        energyEfficiency: 1.0
      };
    }
  }
  
  return state;
};

// Обработка покупки криптобиблиотеки
const handleCryptoLibraryPurchase = (state: GameState): GameState => {
  // Если это первая покупка библиотеки, разблокируем безопасность кошелька
  if (state.buildings.cryptoLibrary.count === 1) {
    console.log('Первая покупка библиотеки, разблокируем безопасность кошелька');
    
    // Разблокируем исследование безопасности кошелька
    if (state.upgrades.walletSecurity) {
      state.upgrades.walletSecurity.unlocked = true;
      state.unlocks.walletSecurity = true;
      
      safeDispatchGameEvent('Разблокировано исследование: Безопасность кошелька', 'success');
    } else if (state.upgrades.cryptoWalletSecurity) {
      state.upgrades.cryptoWalletSecurity.unlocked = true;
      state.unlocks.cryptoWalletSecurity = true;
      
      safeDispatchGameEvent('Разблокировано исследование: Безопасность кошелька', 'success');
    }
  }
  
  return state;
};

// Обработка покупки улучшенного кошелька
const handleEnhancedWalletPurchase = (state: GameState): GameState => {
  // Если это первая покупка улучшенного кошелька, разблокируем автоматический обмен BTC
  if (state.buildings.enhancedWallet.count === 1) {
    console.log('Первая покупка улучшенного кошелька, разблокируем автоматический обмен BTC');
    
    // Разблокируем исследование автоматического обмена BTC
    if (state.upgrades.autoBtcExchange) {
      state.upgrades.autoBtcExchange.unlocked = true;
      state.unlocks.autoBtcExchange = true;
      
      safeDispatchGameEvent('Разблокировано исследование: Автоматический обмен BTC', 'success');
    }
  }
  
  return state;
};

// Обработка покупки системы охлаждения
const handleCoolingSystemPurchase = (state: GameState): GameState => {
  // Если это первая покупка системы охлаждения, разблокируем специализацию майнера
  if (state.buildings.coolingSystem.count === 1) {
    console.log('Первая покупка системы охлаждения, разблокируем специализацию майнера');
    
    // Разблокируем специализацию майнера
    state.unlocks.minerSpecialization = true;
    
    safeDispatchGameEvent('Разблокирована специализация: Майнер', 'success');
  }
  
  return state;
};
