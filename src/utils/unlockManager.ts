import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Функция для отладки статуса разблокировок
 */
export const debugUnlockStatus = (state: GameState) => {
  // Добавляем экспорт функции для отладки разблокировок
  const unlocks = state.unlocks || {};
  const buildings = state.buildings || {};
  const resources = state.resources || {};
  
  return {
    unlocks: Object.keys(unlocks).filter(key => unlocks[key]).sort(),
    unlockedBuildings: Object.keys(buildings).filter(key => buildings[key]?.unlocked).sort(),
    unlockedResources: Object.keys(resources).filter(key => resources[key]?.unlocked).sort(),
    applyKnowledgeCount: state.counters.applyKnowledge?.value || 0,
    blockchainBasics: state.upgrades.blockchainBasics?.purchased || false,
    cryptoCurrencyBasics: state.upgrades.cryptoCurrencyBasics?.purchased || false,
    homeComputerCount: buildings.homeComputer?.count || 0,
    cryptoWalletCount: buildings.cryptoWallet?.count || 0
  };
};

/**
 * Проверяет все разблокировки и обновляет состояние
 */
export const checkAllUnlocks = (state: GameState): GameState => {
  console.log("unlockManager: Проверка всех разблокировок");
  
  // Последовательно выполняем все проверки и обновляем состояние
  let newState = { ...state };
  
  // Проверяем специальные разблокировки зависящие от счетчиков
  newState = checkSpecialUnlocks(newState);
  
  // Проверяем ресурсы
  newState = checkResourceUnlocks(newState);
  
  // Проверяем здания
  newState = checkBuildingUnlocks(newState);
  
  // Проверяем улучшения
  newState = checkUpgradeUnlocks(newState);
  
  // Проверяем действия
  newState = checkActionUnlocks(newState);
  
  return newState;
};

/**
 * Полностью перестраивает все разблокировки с нуля
 */
export const rebuildAllUnlocks = (state: GameState): GameState => {
  console.log("unlockManager: Полная перестройка разблокировок");
  return checkAllUnlocks(state);
};

/**
 * Проверяет специальные разблокировки, зависящие от счетчиков и других условий
 */
export const checkSpecialUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  const unlocks = { ...newState.unlocks };
  
  // Проверяем счетчики и условия для специальных разблокировок
  const applyKnowledgeCount = getCounterValue(newState, 'applyKnowledge');
  
  // USDT разблокируется после 1+ применений знаний
  unlocks.usdt = applyKnowledgeCount >= 1;
  
  // Practice разблокируется после 2+ применений знаний
  unlocks.practice = applyKnowledgeCount >= 2;
  
  // Research разблокируется после покупки генератора
  unlocks.research = Boolean(newState.buildings.generator?.count) && newState.buildings.generator?.count > 0;
  
  // Bitcoin разблокируется после покупки майнера
  const hasMiner = Boolean(newState.buildings.miner?.count) && newState.buildings.miner?.count > 0;
  const hasAutoMiner = Boolean(newState.buildings.autoMiner?.count) && newState.buildings.autoMiner?.count > 0;
  unlocks.bitcoin = hasMiner || hasAutoMiner;
  
  // ИСПРАВЛЕНИЕ: Обязательно проверяем разблокировку специальных зданий
  
  // Криптобиблиотека разблокируется после покупки "Основы криптовалют"
  const hasCryptoBasics = 
    Boolean(newState.upgrades.cryptoCurrencyBasics?.purchased) || 
    Boolean(newState.upgrades.cryptoBasics?.purchased);
    
  if (hasCryptoBasics) {
    unlocks.cryptoLibrary = true;
    console.log("unlockManager: Разблокирована криптобиблиотека");
  }
  
  // Система охлаждения разблокируется после 2+ уровней домашнего компьютера
  const homeComputerLevel = newState.buildings.homeComputer?.count || 0;
  if (homeComputerLevel >= 2) {
    unlocks.coolingSystem = true;
    console.log(`unlockManager: Разблокирована система охлаждения (уровень компьютера: ${homeComputerLevel})`);
  }
  
  // Улучшенный кошелек разблокируется после 5+ уровней криптокошелька
  const walletLevel = newState.buildings.cryptoWallet?.count || 0;
  if (walletLevel >= 5) {
    unlocks.enhancedWallet = true; 
    unlocks.improvedWallet = true; // На случай разных названий
    console.log(`unlockManager: Разблокирован улучшенный кошелек (уровень кошелька: ${walletLevel})`);
  }
  
  // Обновляем состояние разблокировок
  newState.unlocks = unlocks;
  
  // Применяем разблокировки к ресурсам
  if (newState.resources.usdt) {
    newState.resources.usdt.unlocked = unlocks.usdt;
  }
  
  if (newState.resources.bitcoin) {
    newState.resources.bitcoin.unlocked = unlocks.bitcoin;
  }
  
  // ИСПРАВЛЕНИЕ: Применяем разблокировки к зданиям
  // Обязательно синхронизируем состояние unlocks с состоянием самих зданий
  
  // Обрабатываем криптобиблиотеку
  if (unlocks.cryptoLibrary) {
    // Проверяем существование здания
    if (!newState.buildings.cryptoLibrary) {
      // Если не существует, создаем здание с базовыми параметрами
      newState.buildings.cryptoLibrary = {
        id: "cryptoLibrary",
        name: "Криптобиблиотека",
        description: "Увеличивает скорость получения знаний на 50% и максимальное количество знаний на 100",
        cost: { 
          usdt: 200, 
          knowledge: 200 
        },
        costMultiplier: 1.15,
        production: {},
        consumption: {},
        count: 0,
        unlocked: true,
        productionBoost: 0,
        effects: {
          knowledgeMaxBonus: 100,
          knowledgeProductionMultiplier: 0.5
        }
      };
      console.log("unlockManager: Создана криптобиблиотека");
    } else {
      // Если существует, просто разблокируем
      newState.buildings.cryptoLibrary.unlocked = true;
    }
  }
  
  // Обрабатываем систему охлаждения
  if (unlocks.coolingSystem) {
    // Проверяем существование здания
    if (!newState.buildings.coolingSystem) {
      // Если не существует, создаем здание с базовыми параметрами
      newState.buildings.coolingSystem = {
        id: "coolingSystem",
        name: "Система охлаждения",
        description: "Уменьшает потребление вычислительной мощности всеми устройствами на 20%",
        cost: {
          usdt: 200,
          electricity: 50
        },
        costMultiplier: 1.15,
        production: {},
        consumption: {},
        count: 0,
        unlocked: true,
        productionBoost: 0,
        effects: {
          computingEfficiencyBonus: 0.2
        }
      };
      console.log("unlockManager: Создана система охлаждения");
    } else {
      // Если существует, просто разблокируем
      newState.buildings.coolingSystem.unlocked = true;
    }
  }
  
  // Обрабатываем улучшенный кошелек (проверяем оба возможных имени)
  if (unlocks.enhancedWallet) {
    // Проверяем оба варианта именования улучшенного кошелька
    if (!newState.buildings.enhancedWallet && !newState.buildings.improvedWallet) {
      // Если не существует ни одного, создаем улучшенный кошелек
      newState.buildings.enhancedWallet = {
        id: "enhancedWallet",
        name: "Улучшенный кошелек",
        description: "Увеличивает максимальное хранени�� USDT на 150, Bitcoin на 1, эффективность конвертации BTC на 8%",
        cost: {
          usdt: 300,
          knowledge: 250
        },
        costMultiplier: 1.15,
        production: {},
        consumption: {},
        count: 0,
        unlocked: true,
        productionBoost: 0,
        effects: {
          usdtMaxBonus: 150,
          bitcoinMaxBonus: 1,
          btcConversionBonus: 0.08
        }
      };
      console.log("unlockManager: Создан улучшенный кошелек");
    } else {
      // Разблокируем существующие варианты
      if (newState.buildings.enhancedWallet) {
        newState.buildings.enhancedWallet.unlocked = true;
      }
      if (newState.buildings.improvedWallet) {
        newState.buildings.improvedWallet.unlocked = true;
      }
    }
  }
  
  return newState;
};

/**
 * Проверяет разблокировки ресурсов
 */
export const checkResourceUnlocks = (state: GameState): GameState => {
  // ... keep existing code
  return state;
};

/**
 * Проверяет разблокировки зданий
 */
export const checkBuildingUnlocks = (state: GameState): GameState => {
  // ... keep existing code
  return state;
};

/**
 * Проверяет разблокировки улучшений
 */
export const checkUpgradeUnlocks = (state: GameState): GameState => {
  // ... keep existing code
  return state;
};

/**
 * Проверяет разблокировки действий
 */
export const checkActionUnlocks = (state: GameState): GameState => {
  // ... keep existing code
  return state;
};

/**
 * Получает значение счетчика с проверкой наличия
 */
function getCounterValue(state: GameState, counterId: string): number {
  const counter = state.counters[counterId];
  if (!counter) return 0;
  return typeof counter === 'object' ? counter.value : counter;
}
