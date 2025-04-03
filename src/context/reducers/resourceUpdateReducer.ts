
import { GameState } from '../types';
import { checkAllUnlocks } from '@/utils/unlockSystem';
import { ResourceProductionService } from '@/services/ResourceProductionService';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Создаем экземпляр сервиса для использования
const resourceProductionService = new ResourceProductionService();

// Обработчик обновления состояния ресурсов и производства
export const processResourceUpdate = (state: GameState): GameState => {
  const now = Date.now();
  const elapsedSeconds = (now - state.lastUpdate) / 1000;
  
  // Проверка необходимости запускать обработку
  if (elapsedSeconds <= 0 || !state.gameStarted) {
    return state;
  }
  
  // Ограничиваем максимальное время обновления, чтобы избежать больших скачков
  // Этот шаг важен для предотвращения огромных приростов при возвращении на страницу
  const cappedElapsedSeconds = Math.min(elapsedSeconds, 5);
  
  console.log(`Обновление ресурсов, прошло ${elapsedSeconds.toFixed(2)} сек., используем ${cappedElapsedSeconds.toFixed(2)} сек.`);
  
  // Создаем копию состояния
  let newState = { ...state };
  
  // Начальные данные
  let newResources = { ...state.resources };
  let eventMessages = { ...state.eventMessages };
  let miningParams = { ...state.miningParams };
  
  // Используем экземпляр сервиса для расчета производства ресурсов
  newResources = resourceProductionService.calculateResourceProduction(state);
  
  // Проверяем наличие только тех критических ресурсов, которые уже разблокированы
  const criticalResources = ['knowledge', 'usdt'];
  for (const resourceId of criticalResources) {
    if (!newResources[resourceId] && state.unlocks[resourceId]) {
      console.log(`⚠️ Критический ресурс ${resourceId} не найден, но должен быть доступен, восстанавливаем...`);
      
      // Берем значение из state.resources если оно есть, или создаем новый объект
      const baseValue = state.resources[resourceId]?.value || 0;
      const baseDescription = {
        'knowledge': 'Знания о криптовалюте и блокчейне',
        'usdt': 'Стейблкоин, универсальная валюта для покупок',
        'electricity': 'Электроэнергия для питания устройств',
        'computingPower': 'Вычислительная мощность для майнинга',
        'bitcoin': 'Bitcoin - первая и основная криптовалюта'
      }[resourceId] || 'Ресурс игры';
      
      const baseName = {
        'knowledge': 'Знания',
        'usdt': 'USDT',
        'electricity': 'Электричество',
        'computingPower': 'Вычислительная мощность',
        'bitcoin': 'Bitcoin'
      }[resourceId] || resourceId.charAt(0).toUpperCase() + resourceId.slice(1);
      
      const baseIcon = {
        'knowledge': 'book',
        'usdt': 'coins',
        'electricity': 'zap',
        'computingPower': 'cpu',
        'bitcoin': 'bitcoin'
      }[resourceId] || 'circle';
      
      const baseMax = {
        'knowledge': 100,
        'usdt': 50,
        'electricity': 100,
        'computingPower': 1000,
        'bitcoin': 0.01
      }[resourceId] || 100;
      
      const resourceType = {
        'usdt': 'currency',
        'bitcoin': 'currency',
        'knowledge': 'resource',
        'electricity': 'resource',
        'computingPower': 'resource'
      }[resourceId] || 'resource';
      
      newResources[resourceId] = {
        ...state.resources[resourceId],
        id: resourceId,
        name: baseName,
        description: baseDescription,
        type: resourceType,
        icon: baseIcon,
        value: baseValue,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: baseMax,
        unlocked: state.unlocks[resourceId] === true
      };
    }
  }
  
  // Добавляем по запросу только те ресурсы, которые должны быть разблокированы
  // но не были автоматически добавлены
  if (state.unlocks.electricity && !newResources.electricity) {
    newResources.electricity = {
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
  }
  
  if (state.unlocks.computingPower && !newResources.computingPower) {
    newResources.computingPower = {
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
  }
  
  // Исправлена проблема с Bitcoin - теперь он правильно инициализируется
  if (state.unlocks.bitcoin && !newResources.bitcoin) {
    newResources.bitcoin = {
      id: 'bitcoin',
      name: 'Bitcoin',
      description: 'Bitcoin - первая и основная криптовалюта',
      type: 'currency',
      icon: 'bitcoin',
      value: 0,
      baseProduction: 0,
      production: 0,
      perSecond: state.buildings.miner?.count > 0 ? 
        0.00005 * state.buildings.miner.count * (state.miningParams?.miningEfficiency || 1) : 0,
      max: 0.01,
      unlocked: true
    };
  }
  
  // Проверка принудительных разблокировок зданий
  newState = checkBuildingUnlocks(newState);
  
  // Обновляем значения ресурсов на основе времени с ограничением максимального времени
  newResources = updateResourceValues(newResources, cappedElapsedSeconds);
  
  // Проверяем ресурсы для уведомлений
  checkResourcesForAlerts(state, newResources);
  
  // Создаем новое состояние
  newState = {
    ...state,
    resources: newResources,
    lastUpdate: now,
    eventMessages: eventMessages,
    gameTime: state.gameTime + cappedElapsedSeconds, // Используем ограниченное время для обновления игрового времени
    miningParams: miningParams
  };
  
  // Используем унифицированную систему проверки разблокировок
  newState = checkAllUnlocks(newState);
  
  return newState;
};

// Функция для принудительной проверки разблокировок зданий
const checkBuildingUnlocks = (state: GameState): GameState => {
  let newState = {...state};
  
  // Проверка условий разблокировки криптобиблиотеки
  const hasCryptoBasics = 
    newState.upgrades.cryptoCurrencyBasics?.purchased || 
    newState.upgrades.cryptoBasics?.purchased;
    
  if (hasCryptoBasics && newState.buildings.cryptoLibrary && !newState.buildings.cryptoLibrary.unlocked) {
    console.log("✅ Принудительная разблокировка криптобиблиотеки (основы криптовалют изучены)");
    newState.buildings.cryptoLibrary = {
      ...newState.buildings.cryptoLibrary,
      unlocked: true
    };
    newState.unlocks = {
      ...newState.unlocks,
      cryptoLibrary: true
    };
  }
  
  // Проверка условий разблокировки системы охлаждения
  if (newState.buildings.homeComputer?.count >= 2 && newState.buildings.coolingSystem && !newState.buildings.coolingSystem.unlocked) {
    console.log("✅ Принудительная разблокировка системы охлаждения (есть 2+ компьютера)");
    newState.buildings.coolingSystem = {
      ...newState.buildings.coolingSystem,
      unlocked: true
    };
    newState.unlocks = {
      ...newState.unlocks,
      coolingSystem: true
    };
  }
  
  // Проверка условий разблокировки улучшенного кошелька
  if (newState.buildings.cryptoWallet?.count >= 5) {
    if (newState.buildings.enhancedWallet && !newState.buildings.enhancedWallet.unlocked) {
      console.log("✅ Принудительная разблокировка улучшенного кошелька (enhancedWallet)");
      newState.buildings.enhancedWallet = {
        ...newState.buildings.enhancedWallet,
        unlocked: true
      };
      newState.unlocks = {
        ...newState.unlocks,
        enhancedWallet: true
      };
    }
    
    if (newState.buildings.improvedWallet && !newState.buildings.improvedWallet.unlocked) {
      console.log("✅ Принудительная разблокировка улучшенного кошелька (improvedWallet)");
      newState.buildings.improvedWallet = {
        ...newState.buildings.improvedWallet,
        unlocked: true
      };
      newState.unlocks = {
        ...newState.unlocks,
        improvedWallet: true
      };
    }
  }
  
  return newState;
};

// Обновление значений ресурсов с учетом времени
const updateResourceValues = (
  resources: { [key: string]: any },
  elapsedSeconds: number
) => {
  if (elapsedSeconds <= 0) return resources;
  
  // Создаем копию ресурсов
  const updatedResources = { ...resources };
  
  // Обновляем значения каждого ресурса
  for (const resourceId in updatedResources) {
    const resource = updatedResources[resourceId];
    if (!resource || !resource.unlocked) continue;
    
    // Получаем текущее производство в секунду
    const productionPerSecond = resource.perSecond || 0;
    
    // Рассчитываем производство за прошедшее время
    const deltaProduction = productionPerSecond * elapsedSeconds;
    
    // Логируем изменение значения
    if (deltaProduction !== 0) {
      console.log(`${resource.name}: ${resource.value.toFixed(2)} + ${deltaProduction.toFixed(2)} = ${(resource.value + deltaProduction).toFixed(2)}, perSecond: ${productionPerSecond.toFixed(3)}`);
    }
    
    // Рассчитываем новое значение на основе производства за секунду
    let newValue = resource.value + deltaProduction;
    
    // Ограничиваем максимумом
    if (resource.max !== undefined && resource.max !== Infinity) {
      newValue = Math.min(newValue, resource.max);
    }
    
    // Обновляем значение ресурса (не позволяем опуститься ниже нуля)
    resource.value = Math.max(0, newValue);
  }
  
  return updatedResources;
};

// Проверка ресурсов для уведомлений и остановки оборудования
const checkResourcesForAlerts = (
  state: GameState,
  newResources: { [key: string]: any }
) => {
  // Проверяем критические ресурсы для оборудования
  const criticalResources = ['electricity', 'computingPower'];
  
  for (const resourceKey of criticalResources) {
    const resource = newResources[resourceKey];
    if (!resource || !resource.unlocked) continue;
    
    // Предупреждение о низком уровне ресурса (менее 10%)
    if (resource.perSecond < 0 && resource.value > 0 && resource.value / resource.max < 0.1) {
      safeDispatchGameEvent(`Низкий уровень ${resource.name}! Оборудование может остановиться!`, "warning");
    }
    
    // Если ресурс закончился, останавливаем оборудование
    if (resource.value <= 0 && resource.perSecond < 0) {
      safeDispatchGameEvent(`${resource.name} закончился! Оборудование остановлено!`, "error");
      // Здесь можно добавить механику остановки оборудования
    }
  }
};
