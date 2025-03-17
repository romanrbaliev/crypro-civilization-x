import { GameState } from '../types';
import { hasEnoughResources, updateResourceMaxValues } from '../utils/resourceUtils';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Обработка покупки зданий
export const processPurchaseBuilding = (
  state: GameState,
  payload: { buildingId: string }
): GameState => {
  const { buildingId } = payload;
  const building = state.buildings[buildingId];
  
  // Если здание не существует или не разблокировано, возвращаем текущее состояние
  if (!building || !building.unlocked) {
    console.log(`Попытка покупки здания ${buildingId}, но оно не существует или не разблокировано`);
    return state;
  }
  
  // Проверяем, не достигнут ли максимум зданий (если он задан)
  if (building.maxCount !== undefined && building.count >= building.maxCount) {
    console.log(`Достигнут максимум зданий ${buildingId}: ${building.count}/${building.maxCount}`);
    return state;
  }
  
  // Рассчитываем стоимость здания с учетом уже построенных
  const currentCost: { [key: string]: number } = {};
  for (const [resourceId, baseCost] of Object.entries(building.cost)) {
    currentCost[resourceId] = Math.floor(baseCost * Math.pow(building.costMultiplier, building.count));
  }
  
  // Проверяем, хватает ли ресурсов
  const canAfford = hasEnoughResources(state, currentCost);
  console.log(`Попытка покупки здания ${buildingId}, разблокировано: ${building.unlocked}, достаточно ресурсов: ${canAfford}`);
  
  if (!canAfford) {
    return state;
  }
  
  // Вычитаем ресурсы
  const newResources = { ...state.resources };
  for (const [resourceId, cost] of Object.entries(currentCost)) {
    console.log(`Вычитаем ${cost} ${resourceId} за покупку здания ${buildingId}`);
    newResources[resourceId] = {
      ...newResources[resourceId],
      value: newResources[resourceId].value - cost
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
  
  console.log(`Здание ${buildingId} построено, новое количество: ${building.count + 1}`);
  
  // Специальная логика для практики: увеличиваем производство знаний с каждым уровнем
  if (buildingId === 'practice') {
    // Каждый уровень практики дает фиксированные 0.63 знаний/сек
    // Общее производство не умножается на уровень, а всегда равно 0.63
    newBuildings.practice.production = { 
      knowledge: 0.63
    };
    console.log(`Уровень практики увеличен. Новая скорость накопления знаний: ${newBuildings.practice.production.knowledge}`);
  }
  
  // Если построен генератор, разблокируем электричество
  if (buildingId === 'generator' && building.count === 0) {
    newResources.electricity = {
      ...newResources.electricity,
      unlocked: true
    };

    console.log("Разблокировано электричество из-за постройки генератора");

    // Отправляем сообщение о разблокировке электричества
    safeDispatchGameEvent("Разблокирован новый ресурс: Электричество", "info");
    
    // Сообщаем об открытии исследования "Основы блокчейна"
    setTimeout(() => {
      safeDispatchGameEvent("Разблокировано исследование 'Основы блокчейна'", "info");
      
      // Добавляем описательное сообщение об исследовании
      setTimeout(() => {
        safeDispatchGameEvent("Изучите основы блокчейна, чтобы получить +50% к максимальному хранению знаний", "info");
      }, 200);
    }, 200);

    // Разблокируем исследование "Основы блокчейна"
    const newUpgrades = {
      ...state.upgrades,
      basicBlockchain: {
        ...state.upgrades.basicBlockchain,
        unlocked: true
      }
    };

    console.log("Разблокировано исследование 'Основы блокчейна' из-за постройки генератора");

    const stateWithUpgrades = {
      ...state,
      resources: newResources,
      buildings: newBuildings,
      upgrades: newUpgrades
    };
    
    // Обновляем максимальные значения ресурсов после применения изменений
    return updateResourceMaxValues(stateWithUpgrades);
  }
  
  // Если построен домашний компьютер, разблокируем вычислительную мощность
  if (buildingId === 'homeComputer' && building.count === 0) {
    newResources.computingPower = {
      ...newResources.computingPower,
      unlocked: true
    };

    console.log("Разблокирована вычислительная мощность из-за постройки домашнего компьютера");

    // Отправляем сообщение о разблокировке вычислительной мощности
    safeDispatchGameEvent("Разблокирован новый ресурс: Вычислительная мощность", "info");
    
    // Добавляем пояснение о новом ресурсе
    setTimeout(() => {
      safeDispatchGameEvent("Вычислительная мощность может использоваться для майнинга USDT", "info");
    }, 200);
  }
  
  // Если построен криптокошелек, разблокируем исследование "Безопасность криптокошельков"
  if (buildingId === 'cryptoWallet' && building.count === 0) {
    // Разблокируем исследование "Безопасность криптокошельков"
    const newUpgrades = {
      ...state.upgrades,
      walletSecurity: {
        ...state.upgrades.walletSecurity,
        unlocked: true
      }
    };

    console.log("Разблокировано исследование 'Безопасность криптокошельков' из-за постройки криптокошелька");

    // Отправляем сообщение о разблокировке исследования
    safeDispatchGameEvent("Разблокировано исследование 'Безопасность криптокошельков'", "info");
    
    // Добавляем описательное сообщение об исследовании
    setTimeout(() => {
      safeDispatchGameEvent("Изучите безопасность криптокошельков, чтобы увеличить максимальное хранение USDT на 25%", "info");
    }, 200);

    const stateWithUpgrades = {
      ...state,
      resources: newResources,
      buildings: newBuildings,
      upgrades: newUpgrades
    };
    
    // Обновляем максимальные значения ресурсов после применения изменений
    return updateResourceMaxValues(stateWithUpgrades);
  }
  
  // Для всех зданий обновляем максимальные значения ресурсов
  const stateWithBuilding = {
    ...state,
    resources: newResources,
    buildings: newBuildings
  };
  
  return updateResourceMaxValues(stateWithBuilding);
};
