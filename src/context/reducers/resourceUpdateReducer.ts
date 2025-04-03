
import { GameState } from '../types';
import { calculateResourceIncrement } from '../utils/resourceUtils';
import { getBuildingEffects } from '../utils/buildingUtils';

/**
 * Обновление ресурсов в соответствии с их производством
 */
export const processResourceUpdate = (
  state: GameState,
  payload: { deltaTime: number }
): GameState => {
  const { deltaTime } = payload;

  // Обновляем ресурсы на основе их производства
  const updatedResources = { ...state.resources };

  // Рассчитываем производство для каждого ресурса
  for (const resourceId in updatedResources) {
    const resource = updatedResources[resourceId];
    if (resource.unlocked && resource.perSecond !== undefined) {
      // Вычисляем инкремент с учетом временного интервала
      const increment = calculateResourceIncrement(resource.perSecond, deltaTime);

      // Обновляем значение ресурса
      let newValue = (resource.value || 0) + increment;

      // Ограничиваем ресурс верхней границей, если она задана
      if (resource.max !== undefined && resource.max !== Infinity && newValue > resource.max) {
        newValue = resource.max;
      }

      // Не позволяем ресурсу уйти в минус
      if (newValue < 0) {
        newValue = 0;
      }

      // Обновляем ресурс
      updatedResources[resourceId] = {
        ...resource,
        value: newValue
      };
    }
  }

  // ИСПРАВЛЕНИЕ: Убедимся, что все здания имеют свойство cost
  const updatedBuildings = { ...state.buildings };
  for (const buildingId in updatedBuildings) {
    const building = updatedBuildings[buildingId];
    
    // Если у здания нет свойства cost, но есть baseCost, создаем cost
    if (building && building.baseCost && !building.cost) {
      const costMultiplier = building.costMultiplier || 1.12;
      const count = building.count || 0;
      
      // Создаем объект cost на основе baseCost и множителя
      const cost: Record<string, number> = {};
      Object.entries(building.baseCost).forEach(([resourceId, baseAmount]) => {
        const scaledAmount = baseAmount * Math.pow(costMultiplier, count);
        cost[resourceId] = Math.round(scaledAmount);
      });
      
      // Обновляем здание с корректным свойством cost
      updatedBuildings[buildingId] = {
        ...building,
        cost
      };
    }
  }
  
  // ИСПРАВЛЕНИЕ: Принудительная проверка разблокировок зданий
  let unlocks = { ...state.unlocks };
  
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
        baseCost: {
          usdt: 200,
          knowledge: 200
        },
        cost: {
          usdt: 200,
          knowledge: 200
        },
        costMultiplier: 1.15,
        count: 0,
        unlocked: true
      };
    } else {
      updatedBuildings.cryptoLibrary.unlocked = true;
    }
    
    unlocks.cryptoLibrary = true;
  }
  
  // Система охлаждения разблокируется после 2+ уровней домашнего компьютера
  if (updatedBuildings.homeComputer?.count >= 2) {
    if (!updatedBuildings.coolingSystem) {
      // Если здание не существует, создаем его
      updatedBuildings.coolingSystem = {
        id: "coolingSystem",
        name: "Система охлаждения",
        description: "Уменьшает потребление вычислительной мощности всеми устройствами на 20%",
        baseCost: {
          usdt: 200,
          electricity: 50
        },
        cost: {
          usdt: 200,
          electricity: 50
        },
        costMultiplier: 1.15,
        count: 0,
        unlocked: true
      };
    } else {
      updatedBuildings.coolingSystem.unlocked = true;
    }
    
    unlocks.coolingSystem = true;
  }
  
  // Улучшенный кошелек разблокируется после 5+ уровней криптокошелька
  if (updatedBuildings.cryptoWallet?.count >= 5) {
    // Проверяем варианты названия улучшенного кошелька
    let enhancedWalletExists = updatedBuildings.enhancedWallet || updatedBuildings.improvedWallet;
    
    if (!enhancedWalletExists) {
      // Если здание не существует, создаем его
      updatedBuildings.enhancedWallet = {
        id: "enhancedWallet",
        name: "Улучшенный кошелек",
        description: "Увеличивает максимальное хранение USDT на 150, Bitcoin на 1, эффективность конвертации BTC на 8%",
        baseCost: {
          usdt: 300,
          knowledge: 250
        },
        cost: {
          usdt: 300,
          knowledge: 250
        },
        costMultiplier: 1.15,
        count: 0,
        unlocked: true
      };
    } else if (updatedBuildings.enhancedWallet) {
      updatedBuildings.enhancedWallet.unlocked = true;
    } else if (updatedBuildings.improvedWallet) {
      updatedBuildings.improvedWallet.unlocked = true;
    }
    
    unlocks.enhancedWallet = true;
  }
  
  return {
    ...state,
    resources: updatedResources,
    buildings: updatedBuildings,
    unlocks: unlocks
  };
};
