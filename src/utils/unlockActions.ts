
import { GameState } from '@/context/types';
import { UnlockManagerService } from '@/services/UnlockManagerService';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Принудительно проверяет и применяет все разблокировки
 */
export function forceCheckAllUnlocks(state: GameState): GameState {
  console.log("UnlockActions: Принудительная проверка всех разблокировок");
  
  // Начинаем с проверки специальных разблокировок
  let updatedState = UnlockManagerService.checkSpecialUnlocks(state);
  
  // Затем проверяем все остальные разблокировки
  updatedState = UnlockManagerService.checkAllUnlocks(updatedState);
  
  // Исправляем ситуации, когда разблокировки не синхронизированы
  if (updatedState.buildings.generator?.count > 0 && !updatedState.unlocks.research) {
    console.log("UnlockActions: Корректировка разблокировки исследований");
    
    updatedState = {
      ...updatedState,
      unlocks: {
        ...updatedState.unlocks,
        research: true
      }
    };
    
    safeDispatchGameEvent("Разблокирована вкладка исследований!", "success");
  }
  
  // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Проверяем и добавляем свойство cost для новых зданий
  updatedState = ensureBuildingsCostProperty(updatedState);
  
  return updatedState;
}

/**
 * Проверяет наличие продвинутых разблокировок
 */
export function forceCheckAdvancedUnlocks(state: GameState): GameState {
  console.log("UnlockActions: Проверка продвинутых разблокировок");
  
  // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Проверяем и добавляем свойство cost для новых зданий
  let updatedState = ensureBuildingsCostProperty(state);
  
  // Проверяем условия для разблокировки криптобиблиотеки
  const hasCryptoBasics = 
    (updatedState.upgrades.cryptoCurrencyBasics?.purchased === true) || 
    (updatedState.upgrades.cryptoBasics?.purchased === true);
    
  if (hasCryptoBasics && !updatedState.buildings.cryptoLibrary?.unlocked) {
    console.log("forceCheckAdvancedUnlocks: Разблокировка криптобиблиотеки");
    
    // Обновляем или создаем здание
    if (!updatedState.buildings.cryptoLibrary) {
      updatedState.buildings.cryptoLibrary = {
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
        productionBoost: 0
      };
    } else {
      updatedState.buildings.cryptoLibrary.unlocked = true;
      
      // Проверяем и добавляем свойство cost, если его нет
      if (!updatedState.buildings.cryptoLibrary.cost) {
        updatedState.buildings.cryptoLibrary.cost = { usdt: 200, knowledge: 200 };
      }
    }
    
    updatedState.unlocks.cryptoLibrary = true;
  }
  
  // Проверяем условия для разблокировки системы охлаждения
  if (updatedState.buildings.homeComputer?.count >= 2 && !updatedState.buildings.coolingSystem?.unlocked) {
    console.log("forceCheckAdvancedUnlocks: Разблокировка системы охлаждения");
    
    // Обновляем или создаем здание
    if (!updatedState.buildings.coolingSystem) {
      updatedState.buildings.coolingSystem = {
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
        productionBoost: 0
      };
    } else {
      updatedState.buildings.coolingSystem.unlocked = true;
      
      // Проверяем и добавляем свойство cost, если его нет
      if (!updatedState.buildings.coolingSystem.cost) {
        updatedState.buildings.coolingSystem.cost = { usdt: 200, electricity: 50 };
      }
    }
    
    updatedState.unlocks.coolingSystem = true;
  }
  
  // Проверяем условия для разблокировки улучшенного кошелька
  if (updatedState.buildings.cryptoWallet?.count >= 5 && 
     (!updatedState.buildings.enhancedWallet?.unlocked && !updatedState.buildings.improvedWallet?.unlocked)) {
    console.log("forceCheckAdvancedUnlocks: Разблокировка улучшенного кошелька");
    
    // Обновляем или создаем здание enhancedWallet (или improvedWallet, если первый не существует)
    if (updatedState.buildings.enhancedWallet) {
      updatedState.buildings.enhancedWallet.unlocked = true;
      
      // Проверяем и добавляем свойство cost, если его нет
      if (!updatedState.buildings.enhancedWallet.cost) {
        updatedState.buildings.enhancedWallet.cost = { usdt: 300, knowledge: 250 };
      }
      
      updatedState.unlocks.enhancedWallet = true;
    } else if (updatedState.buildings.improvedWallet) {
      updatedState.buildings.improvedWallet.unlocked = true;
      
      // Проверяем и добавляем свойство cost, если его нет
      if (!updatedState.buildings.improvedWallet.cost) {
        updatedState.buildings.improvedWallet.cost = { usdt: 300, knowledge: 250 };
      }
      
      updatedState.unlocks.improvedWallet = true;
    } else {
      // Если ни один из вариантов не существует, создаем enhancedWallet
      updatedState.buildings.enhancedWallet = {
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
        productionBoost: 0
      };
      
      updatedState.unlocks.enhancedWallet = true;
    }
  }
  
  return updatedState;
}

/**
 * Проверяет и добавляет свойство cost для всех зданий, у которых его нет
 */
function ensureBuildingsCostProperty(state: GameState): GameState {
  const newState = { ...state };
  
  // Проверяем все здания и добавляем свойство cost там, где его нет
  for (const buildingKey in newState.buildings) {
    const building = newState.buildings[buildingKey];
    
    if (building && !building.cost) {
      console.log(`ensureBuildingsCostProperty: Добавляем свойство cost для здания ${buildingKey}`);
      
      // Если у здания есть baseCost, используем его значение
      if (building.baseCost) {
        newState.buildings[buildingKey] = {
          ...building,
          cost: { ...building.baseCost }
        };
      } else {
        // Если baseCost отсутствует, создаем пустой объект cost для предотвращения ошибок
        newState.buildings[buildingKey] = {
          ...building,
          cost: {}
        };
      }
    }
  }
  
  return newState;
}
