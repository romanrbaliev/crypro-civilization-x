
import { GameState } from '../../types';
import { safeDispatchGameEvent } from '../../utils/eventBusUtils';
import { calculateBuildingCost } from '../../utils/buildingUtils';

/**
 * Обработчик покупки здания
 */
export const processPurchaseBuilding = (
  state: GameState,
  payload: { buildingId: string }
): GameState => {
  const { buildingId } = payload;
  const building = state.buildings[buildingId];
  
  // Проверяем существование здания
  if (!building) {
    console.error(`Здание с id ${buildingId} не найдено`);
    return state;
  }
  
  // ИСПРАВЛЕНИЕ: Обеспечиваем наличие поля cost
  let currentCost = building.cost || {}; // Текущая стоимость здания
  
  // Вычисляем стоимость, если есть baseCost и не указан cost
  if (Object.keys(currentCost).length === 0 && building.baseCost) {
    // Вычисляем стоимость здания на основе базовой стоимости и количества
    currentCost = calculateBuildingCost(building.baseCost, building.count, building.costMultiplier || 1.12);
  }
  
  // Проверяем, достаточно ли ресурсов для покупки
  for (const [resourceId, amount] of Object.entries(currentCost)) {
    if (!state.resources[resourceId] || (state.resources[resourceId].value || 0) < amount) {
      console.log(`Недостаточно ресурса ${resourceId} для покупки ${buildingId}`);
      safeDispatchGameEvent(`Недостаточно ${resourceId} для постройки ${building.name}`, "error");
      return state;
    }
  }
  
  // Создаем копии объектов для обновления
  const updatedBuildings = { ...state.buildings };
  const updatedResources = { ...state.resources };
  
  // Вычитаем ресурсы
  for (const [resourceId, amount] of Object.entries(currentCost)) {
    updatedResources[resourceId] = {
      ...updatedResources[resourceId],
      value: (updatedResources[resourceId].value || 0) - amount
    };
  }
  
  // Увеличиваем количество зданий на 1
  const updatedBuilding = {
    ...building,
    count: (building.count || 0) + 1
  };
  
  // Пересчитываем стоимость для следующей покупки
  if (building.baseCost) {
    updatedBuilding.cost = calculateBuildingCost(
      building.baseCost, 
      updatedBuilding.count, 
      building.costMultiplier || 1.12
    );
  }
  
  // Обновляем здание
  updatedBuildings[buildingId] = updatedBuilding;
  
  // Проверяем особые разблокировки после покупки здания
  let unlocks = { ...state.unlocks };
  
  // ИСПРАВЛЕНИЕ: Добавляем принудительные проверки разблокировок зданий
  
  // Криптобиблиотека разблокируется после покупки "Основы криптовалют"
  const hasCryptoBasics = 
    state.upgrades.cryptoCurrencyBasics?.purchased || 
    state.upgrades.cryptoBasics?.purchased;
    
  if (hasCryptoBasics) {
    if (!updatedBuildings.cryptoLibrary) {
      // Если здание не существует, создаем его
      updatedBuildings.cryptoLibrary = {
        id: "cryptoLibrary",
        name: "Криптобиблиотека",
        description: "Увеличивает скорость получения знаний на 50% и максимальное количество знаний на 100",
        cost: {
          usdt: 200,
          knowledge: 200
        },
        costMultiplier: 1.15,
        count: 0,
        unlocked: true,
        production: {},
        productionBoost: 0,
        effects: {
          knowledgeBoost: 0.5,
          knowledgeMax: 100
        }
      };
      
      console.log("purchaseBuilding: Создана и разблокирована Криптобиблиотека");
    } else {
      updatedBuildings.cryptoLibrary.unlocked = true;
    }
    
    unlocks.cryptoLibrary = true;
  }
  
  // Система охлаждения разблокируется после 2+ уровней домашнего компьютера
  if (buildingId === 'homeComputer' && updatedBuilding.count >= 2) {
    if (!updatedBuildings.coolingSystem) {
      // Если здание не существует, создаем его
      updatedBuildings.coolingSystem = {
        id: "coolingSystem",
        name: "Система охлаждения",
        description: "Уменьшает потребление вычислительной мощности всеми устройствами на 20%",
        cost: {
          usdt: 200,
          electricity: 50
        },
        costMultiplier: 1.15,
        count: 0,
        unlocked: true,
        production: {},
        productionBoost: 0,
        effects: {
          computingPowerConsumptionReduction: 0.2
        }
      };
      
      console.log("purchaseBuilding: Создана и разблокирована Система охлаждения");
    } else {
      updatedBuildings.coolingSystem.unlocked = true;
    }
    
    unlocks.coolingSystem = true;
  }
  
  // Улучшенный кошелек разблокируется после 5+ уровней криптокошелька
  if (buildingId === 'cryptoWallet' && updatedBuilding.count >= 5) {
    // Проверяем варианты названия улучшенного кошелька
    let enhancedWalletExists = updatedBuildings.enhancedWallet || updatedBuildings.improvedWallet;
    
    if (!enhancedWalletExists) {
      // Если здание не существует, создаем его
      updatedBuildings.enhancedWallet = {
        id: "enhancedWallet",
        name: "Улучшенный кошелек",
        description: "Увеличивает максимальное хранение USDT на 150, Bitcoin на 1, эффективность конвертации BTC на 8%",
        cost: {
          usdt: 300,
          knowledge: 250
        },
        costMultiplier: 1.15,
        count: 0,
        unlocked: true,
        production: {},
        productionBoost: 0,
        effects: {
          usdtMax: 150,
          bitcoinMax: 1,
          btcExchangeBonus: 0.08
        }
      };
      
      console.log("purchaseBuilding: Создан и разблокирован Улучшенный кошелек");
    } else if (updatedBuildings.enhancedWallet) {
      updatedBuildings.enhancedWallet.unlocked = true;
    } else if (updatedBuildings.improvedWallet) {
      updatedBuildings.improvedWallet.unlocked = true;
    }
    
    unlocks.enhancedWallet = true;
  }
  
  safeDispatchGameEvent(`Построено ${building.name}`, "success");
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    buildings: updatedBuildings,
    resources: updatedResources,
    unlocks
  };
};
