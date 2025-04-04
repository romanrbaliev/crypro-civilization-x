
import { GameState } from '../types';
import { GameStateService } from '@/services/GameStateService';
import { ResourceProductionService } from '@/services/ResourceProductionService';
import { UnlockService } from '@/services/UnlockService';

// Создаем экземпляры необходимых сервисов
const gameStateService = new GameStateService();
const resourceProductionService = new ResourceProductionService();
const unlockService = new UnlockService();

/**
 * Процесс обновления ресурсов на основе прошедшего времени
 */
export const processUpdateResources = (state: GameState, payload?: { deltaTime?: number }): GameState => {
  if (!state.gameStarted) return state;
  
  console.log("processUpdateResources: Запуск обновления ресурсов");

  try {
    // Получаем время, прошедшее с последнего обновления
    const now = Date.now();
    const deltaTime = payload?.deltaTime || (now - (state.lastUpdate || now));
    
    // Если прошло слишком мало времени, пропускаем обновление
    if (deltaTime < 10) return state;
    
    // Создаем новое состояние, обновляя время последнего обновления
    let newState = {
      ...state,
      lastUpdate: now
    };
    
    // Сначала обновляем производство и потребление всех ресурсов
    newState = {
      ...newState,
      resources: resourceProductionService.calculateResourceProduction(newState)
    };
    
    // ВАЖНОЕ ИСПРАВЛЕНИЕ: Проверяем разблокировку зданий в зависимости от условий
    newState = checkBuildingUnlocks(newState);
    
    // Проверяем все здания и производство с помощью сервиса
    newState = gameStateService.processGameStateUpdate(newState);
    
    // Теперь обновляем текущие значения ресурсов на основе их производства
    const updatedResources = { ...newState.resources };
    const secondsFraction = deltaTime / 1000; // Переводим миллисекунды в секунды
    
    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Добавляем проверку каждого ресурса
    for (const resourceId in updatedResources) {
      const resource = updatedResources[resourceId];
      
      // Пропускаем нерелевантные или неразблокированные ресурсы
      if (!resource || !resource.unlocked) continue;
      
      // Получаем текущее значение для ресурса
      const currentValue = resource.value || 0;
      
      // Вычисляем изменение на основе скорости в секунду
      const perSecondValue = resource.perSecond || 0;
      const delta = perSecondValue * secondsFraction;
      
      // Проверяем, не превысит ли новое значение максимальное
      const maxValue = resource.max || Infinity;
      
      // Вычисляем новое значение с учетом ограничений
      let newValue = currentValue + delta;
      newValue = Math.max(0, Math.min(maxValue, newValue));
      
      // Обновляем значение ресурса
      updatedResources[resourceId] = {
        ...resource,
        value: newValue
      };
      
      // Логгируем только если есть изменение в ресурсе для отладки
      if (Math.abs(delta) > 0.00001) {
        console.log(`processUpdateResources: Изменение ${resourceId}: ${currentValue.toFixed(6)} + ${delta.toFixed(6)} = ${newValue.toFixed(6)} (макс: ${maxValue})`);
      }
    }
    
    return {
      ...newState,
      resources: updatedResources
    };
  } catch (error) {
    console.error("Ошибка при обновлении ресурсов:", error);
    return state;
  }
};

/**
 * Проверяет условия для разблокировки зданий и обновляет состояние
 */
function checkBuildingUnlocks(state: GameState): GameState {
  let newState = { ...state };
  
  // 1. Проверка разблокировки криптобиблиотеки (после исследования "Основы криптовалют")
  const hasCryptoBasics = 
    (newState.upgrades.cryptoCurrencyBasics?.purchased === true) || 
    (newState.upgrades.cryptoBasics?.purchased === true);
    
  if (hasCryptoBasics && (!newState.buildings.cryptoLibrary?.unlocked)) {
    console.log("processUpdateResources: Разблокировка криптобиблиотеки");
    
    // Обновляем состояние здания
    if (newState.buildings.cryptoLibrary) {
      newState.buildings.cryptoLibrary = {
        ...newState.buildings.cryptoLibrary,
        unlocked: true
      };
    } else {
      // Создаем здание, если его нет
      newState.buildings.cryptoLibrary = {
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
    }
    
    // Обновляем флаг разблокировки
    newState.unlocks = {
      ...newState.unlocks,
      cryptoLibrary: true
    };
  }
  
  // 2. Проверка разблокировки системы охлаждения (2+ уровня домашнего компьютера)
  if ((newState.buildings.homeComputer?.count >= 2) && (!newState.buildings.coolingSystem?.unlocked)) {
    console.log("processUpdateResources: Разблокировка системы охлаждения");
    
    // Обновляем состояние здания
    if (newState.buildings.coolingSystem) {
      newState.buildings.coolingSystem = {
        ...newState.buildings.coolingSystem,
        unlocked: true
      };
    } else {
      // Создаем здание, если его нет
      newState.buildings.coolingSystem = {
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
    }
    
    // Обновляем флаг разблокировки
    newState.unlocks = {
      ...newState.unlocks,
      coolingSystem: true
    };
  }
  
  // 3. Проверка разблокировки улучшенного кошелька (5+ уровней криптокошелька)
  if ((newState.buildings.cryptoWallet?.count >= 5) && (!newState.buildings.enhancedWallet?.unlocked)) {
    console.log("processUpdateResources: Разблокировка улучшенного кошелька");
    
    // Обновляем состояние здания
    if (newState.buildings.enhancedWallet) {
      newState.buildings.enhancedWallet = {
        ...newState.buildings.enhancedWallet,
        unlocked: true
      };
    } else {
      // Создаем здание, если его нет
      newState.buildings.enhancedWallet = {
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
    }
    
    // Обновляем флаг разблокировки
    newState.unlocks = {
      ...newState.unlocks,
      enhancedWallet: true
    };
  }
  
  return newState;
}
