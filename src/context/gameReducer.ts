
import { GameState, GameAction, Resource } from './types';
import { initialState } from './initialState';

// Функция для проверки, достаточно ли ресурсов для покупки
const hasEnoughResources = (
  state: GameState,
  costs: { [key: string]: number }
): boolean => {
  for (const [resourceId, amount] of Object.entries(costs)) {
    if (!state.resources[resourceId] || state.resources[resourceId].value < amount) {
      return false;
    }
  }
  return true;
};

// Функция для вычисления максимальных значений ресурсов с учётом бонусов
const calculateResourceMax = (
  state: GameState,
  resourceId: string,
  baseMax: number
): number => {
  let maxBoost = 1;
  
  // Проверяем бонусы от улучшений
  for (const upgradeId in state.upgrades) {
    const upgrade = state.upgrades[upgradeId];
    if (upgrade.purchased) {
      const boostKey = `${resourceId}MaxBoost`;
      if (upgrade.effect[boostKey]) {
        maxBoost += upgrade.effect[boostKey];
      }
    }
  }
  
  // Проверяем бонусы от зданий
  for (const buildingId in state.buildings) {
    const building = state.buildings[buildingId];
    const maxKey = `${resourceId}Max`;
    if (building.count > 0 && building.production[maxKey]) {
      baseMax += building.production[maxKey] * building.count;
    }
  }
  
  return baseMax * maxBoost;
};

// Проверка выполнения требований для разблокировки
const meetsRequirements = (
  state: GameState,
  requirements: { [key: string]: number }
): boolean => {
  for (const [resourceId, amount] of Object.entries(requirements)) {
    if (!state.resources[resourceId] || state.resources[resourceId].value < amount) {
      return false;
    }
  }
  return true;
};

// Функция проверки требований для зданий и улучшений
const checkUnlocks = (state: GameState): GameState => {
  const newState = { ...state };
  
  // Проверка зданий
  for (const buildingId in newState.buildings) {
    const building = newState.buildings[buildingId];
    if (!building.unlocked && building.requirements) {
      const requirementsMet = meetsRequirements(newState, building.requirements);
      if (requirementsMet) {
        // Разблокируем здание
        newState.buildings[buildingId] = {
          ...building,
          unlocked: true
        };
        console.log(`Здание ${buildingId} разблокировано из-за выполнения требований`);
      }
    }
  }
  
  // Проверка улучшений
  for (const upgradeId in newState.upgrades) {
    const upgrade = newState.upgrades[upgradeId];
    if (!upgrade.unlocked && upgrade.requirements) {
      const requirementsMet = meetsRequirements(newState, upgrade.requirements);
      if (requirementsMet) {
        // Разблокируем улучшение
        newState.upgrades[upgradeId] = {
          ...upgrade,
          unlocked: true
        };
        console.log(`Улучшение ${upgradeId} разблокировано из-за выполнения требований`);
      }
    }
  }
  
  return newState;
};

// Главный редьюсер игры
export const gameReducer = (state: GameState = initialState, action: GameAction): GameState => {
  console.log('Received action:', action.type);
  
  switch (action.type) {
    // Инкремент ресурса
    case "INCREMENT_RESOURCE": {
      const { resourceId, amount } = action.payload;
      
      // Если ресурс не существует, возвращаем текущее состояние
      if (!state.resources[resourceId]) {
        return state;
      }
      
      const currentValue = state.resources[resourceId].value;
      const maxValue = state.resources[resourceId].max;
      
      // Вычисляем новое значение, но не выше максимального
      let newValue = currentValue + amount;
      if (maxValue !== Infinity && newValue > maxValue) {
        newValue = maxValue;
      }
      
      // Не позволяем опуститься ниже нуля
      if (newValue < 0) {
        newValue = 0;
      }
      
      // Выводим сообщение в консоль для отладки
      console.log(`Изменение ресурса ${resourceId}: ${currentValue} -> ${newValue}`);
      
      const newState = {
        ...state,
        resources: {
          ...state.resources,
          [resourceId]: {
            ...state.resources[resourceId],
            value: newValue
          }
        }
      };
      
      // Проверяем условия для разблокировки зданий и улучшений
      return checkUnlocks(newState);
    }
    
    // Обновление ресурсов (выполняется каждый тик)
    case "UPDATE_RESOURCES": {
      // Получаем текущее время для расчета прошедшего времени
      const currentTime = Date.now();
      const deltaTime = (currentTime - state.lastUpdate) / 1000; // в секундах
      
      // Копируем текущие ресурсы
      let newResources = { ...state.resources };
      let newEventMessages = { ...state.eventMessages };
      
      // Расчет производства/потребления ресурсов
      let electricityProduction = 0;
      let electricityConsumption = 0;
      let knowledgeBoost = 1;
      let electricityShortage = false;
      
      // Рассчитываем производство электричества
      for (const buildingId in state.buildings) {
        const building = state.buildings[buildingId];
        if (building.count > 0 && building.production.electricity) {
          electricityProduction += building.production.electricity * building.count;
        }
      }
      
      // Проверяем бонусы к производству знаний от улучшений
      for (const upgradeId in state.upgrades) {
        const upgrade = state.upgrades[upgradeId];
        if (upgrade.purchased && upgrade.effect.knowledgeBoost) {
          knowledgeBoost += upgrade.effect.knowledgeBoost;
        }
      }
      
      // Рассчитываем потребление электричества домашними компьютерами
      if (state.buildings.homeComputer.count > 0) {
        electricityConsumption = state.buildings.homeComputer.count; // 1 эл/сек на компьютер
      }
      
      // Проверяем, достаточно ли электричества
      const currentElectricity = newResources.electricity.value;
      const requiredElectricity = electricityConsumption * deltaTime;
      
      if (requiredElectricity > 0 && requiredElectricity > currentElectricity) {
        // Недостаточно электричества
        electricityShortage = true;
        newEventMessages.electricityShortage = true;
      } else {
        newEventMessages.electricityShortage = false;
      }
      
      // Обновляем ресурсы
      for (const resourceId in newResources) {
        let production = 0;
        
        // Рассчитываем базовое производство от зданий
        for (const buildingId in state.buildings) {
          const building = state.buildings[buildingId];
          
          // Если это домашний компьютер и не хватает электричества, не производим вычислительную мощность
          if (buildingId === 'homeComputer' && resourceId === 'computingPower' && electricityShortage) {
            continue;
          }
          
          if (building.count > 0 && building.production[resourceId]) {
            production += building.production[resourceId] * building.count;
          }
        }
        
        // Применяем бонусы для знаний
        if (resourceId === 'knowledge') {
          production *= knowledgeBoost;
        }
        
        // Обрабатываем специальные случаи
        if (resourceId === 'electricity') {
          // Добавляем производство и вычитаем потребление
          if (!electricityShortage) {
            production = electricityProduction - electricityConsumption;
          } else {
            production = electricityProduction;
          }
        }
        
        // Обработка автомайнера
        if (resourceId === 'usdt' && state.buildings.autoMiner.count > 0) {
          // Автоматическая конвертация вычислительной мощности в USDT каждые 5 секунд
          const lastFiveSeconds = Math.floor(state.lastUpdate / 5000);
          const currentFiveSeconds = Math.floor(currentTime / 5000);
          
          if (lastFiveSeconds !== currentFiveSeconds && newResources.computingPower.value >= 50) {
            newResources.computingPower.value -= 50;
            newResources.usdt.value += 5;
          }
        }
        
        // Рассчитываем новое значение ресурса
        const resource = newResources[resourceId];
        let newValue = resource.value + production * deltaTime;
        
        // Ограничиваем максимальным значением
        if (resource.max !== Infinity && newValue > resource.max) {
          newValue = resource.max;
        }
        
        // Не позволяем опуститься ниже нуля
        if (newValue < 0) {
          newValue = 0;
        }
        
        // Обновляем значение и скорость производства
        newResources[resourceId] = {
          ...resource,
          value: newValue,
          perSecond: production
        };
      }
      
      return {
        ...state,
        resources: newResources,
        lastUpdate: currentTime,
        eventMessages: newEventMessages
      };
    }
    
    // Покупка здания
    case "PURCHASE_BUILDING": {
      const { buildingId } = action.payload;
      const building = state.buildings[buildingId];
      
      // Если здание не существует или не разблокировано, возвращаем текущее состояние
      if (!building || !building.unlocked) {
        console.log(`Попытка покупки здания ${buildingId}, но оно не существует или не разблокировано`);
        return state;
      }
      
      // Рассчитываем стоимость здания с учетом уже построенных
      const currentCost: { [key: string]: number } = {};
      for (const [resourceId, baseCost] of Object.entries(building.cost)) {
        currentCost[resourceId] = baseCost * Math.pow(building.costMultiplier, building.count);
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
      
      // Если построен первый генератор, разблокируем электричество
      if (buildingId === 'generator' && building.count === 0) {
        newResources.electricity = {
          ...newResources.electricity,
          unlocked: true
        };

        // Также разблокируем исследование "Основы блокчейна"
        const newUpgrades = {
          ...state.upgrades,
          basicBlockchain: {
            ...state.upgrades.basicBlockchain,
            unlocked: true
          }
        };

        console.log("Разблокировано электричество из-за постройки генератора");
        console.log("Разблокировано исследование 'Основы блокчейна' из-за постройки генератора");

        return {
          ...state,
          resources: newResources,
          buildings: newBuildings,
          upgrades: newUpgrades
        };
      }
      
      return {
        ...state,
        resources: newResources,
        buildings: newBuildings
      };
    }
    
    // Покупка улучшения
    case "PURCHASE_UPGRADE": {
      const { upgradeId } = action.payload;
      const upgrade = state.upgrades[upgradeId];
      
      // Если улучшение не существует, не разблокировано или уже куплено, возвращаем текущее состояние
      if (!upgrade || !upgrade.unlocked || upgrade.purchased) {
        return state;
      }
      
      // Проверяем, хватает ли ресурсов
      const canAfford = hasEnoughResources(state, upgrade.cost);
      if (!canAfford) {
        return state;
      }
      
      // Вычитаем ресурсы
      const newResources = { ...state.resources };
      for (const [resourceId, cost] of Object.entries(upgrade.cost)) {
        newResources[resourceId] = {
          ...newResources[resourceId],
          value: newResources[resourceId].value - cost
        };
      }
      
      // Помечаем улучшение как купленное
      const newUpgrades = {
        ...state.upgrades,
        [upgradeId]: {
          ...upgrade,
          purchased: true
        }
      };
      
      // Пересчитываем максимальные значения ресурсов с учетом улучшений
      const updatedResources = { ...newResources };
      for (const resourceId in updatedResources) {
        const resource = updatedResources[resourceId];
        const baseMax = initialState.resources[resourceId].max;
        updatedResources[resourceId] = {
          ...resource,
          max: calculateResourceMax(
            { ...state, upgrades: newUpgrades },
            resourceId,
            baseMax
          )
        };
      }

      // Если приобретены "Основы блокчейна", разблокируем криптокошелек
      if (upgradeId === 'basicBlockchain') {
        const newBuildings = {
          ...state.buildings,
          cryptoWallet: {
            ...state.buildings.cryptoWallet,
            unlocked: true
          }
        };

        console.log("Разблокирован криптокошелек из-за исследования 'Основы блокчейна'");

        return {
          ...state,
          resources: updatedResources,
          upgrades: newUpgrades,
          buildings: newBuildings
        };
      }
      
      return {
        ...state,
        resources: updatedResources,
        upgrades: newUpgrades
      };
    }
    
    // Разблокировка фичи
    case "UNLOCK_FEATURE": {
      const { featureId } = action.payload;
      
      return {
        ...state,
        unlocks: {
          ...state.unlocks,
          [featureId]: true
        }
      };
    }
    
    // Разблокировка ресурса
    case "UNLOCK_RESOURCE": {
      const { resourceId } = action.payload;
      
      if (!state.resources[resourceId]) {
        return state;
      }
      
      return {
        ...state,
        resources: {
          ...state.resources,
          [resourceId]: {
            ...state.resources[resourceId],
            unlocked: true
          }
        }
      };
    }
    
    // Установка разблокировки здания
    case "SET_BUILDING_UNLOCKED": {
      const { buildingId, unlocked } = action.payload;
      
      if (!state.buildings[buildingId]) {
        return state;
      }
      
      return {
        ...state,
        buildings: {
          ...state.buildings,
          [buildingId]: {
            ...state.buildings[buildingId],
            unlocked
          }
        }
      };
    }
    
    // Инкремент счетчика
    case "INCREMENT_COUNTER": {
      const { counterId } = action.payload;
      
      return {
        ...state,
        counters: {
          ...state.counters,
          [counterId]: (state.counters[counterId] || 0) + 1
        }
      };
    }
    
    // Запуск игры
    case "START_GAME": {
      return {
        ...state,
        gameStarted: true,
        lastUpdate: Date.now()
      };
    }
    
    // Загрузка сохраненной игры
    case "LOAD_GAME": {
      return {
        ...action.payload,
        lastUpdate: Date.now()
      };
    }
    
    // Престиж (перезапуск с бонусами)
    case "PRESTIGE": {
      // Рассчитываем очки престижа
      const prestigePoints = Math.floor(
        Math.log(state.resources.usdt.value / 1000) * 10
      );
      
      return {
        ...initialState,
        prestigePoints: state.prestigePoints + Math.max(0, prestigePoints),
        gameStarted: true,
        lastUpdate: Date.now()
      };
    }
    
    // Перезапуск компьютеров
    case "RESTART_COMPUTERS": {
      // Перезапускаем компьютеры после нехватки электричества
      return {
        ...state,
        eventMessages: {
          ...state.eventMessages,
          electricityShortage: false
        }
      };
    }
    
    // Майнинг вычислительной мощности
    case "MINE_COMPUTING_POWER": {
      // Проверяем, достаточно ли вычислительной мощности
      if (state.resources.computingPower.value < 50) {
        return state;
      }
      
      // Вычитаем вычислительную мощность и добавляем USDT
      const newResources = {
        ...state.resources,
        computingPower: {
          ...state.resources.computingPower,
          value: state.resources.computingPower.value - 50
        },
        usdt: {
          ...state.resources.usdt,
          value: state.resources.usdt.value + 5, // Увеличено до 5 USDT
          unlocked: true // Важно: убедимся, что usdt разблокирован
        }
      };
      
      // Если это первый майнинг, разблокируем автомайнер
      let newBuildings = { ...state.buildings };
      if (state.counters.mining === 0) {
        newBuildings.autoMiner = {
          ...newBuildings.autoMiner,
          unlocked: true
        };
      }
      
      // Увеличиваем счетчик майнинга
      const newCounters = {
        ...state.counters,
        mining: state.counters.mining + 1
      };
      
      return {
        ...state,
        resources: newResources,
        buildings: newBuildings,
        counters: newCounters
      };
    }
    
    // Применение знаний
    case "APPLY_KNOWLEDGE": {
      // Проверяем, достаточно ли знаний
      if (state.resources.knowledge.value < 10) {
        return state;
      }
      
      // Вычитаем знания и добавляем USDT
      const newResources = {
        ...state.resources,
        knowledge: {
          ...state.resources.knowledge,
          value: state.resources.knowledge.value - 10
        },
        usdt: {
          ...state.resources.usdt,
          value: state.resources.usdt.value + 1,
          unlocked: true  // Важно: убедимся, что usdt разблокирован
        }
      };
      
      return {
        ...state,
        resources: newResources,
        counters: {
          ...state.counters,
          applyKnowledge: state.counters.applyKnowledge + 1
        }
      };
    }
    
    default:
      return state;
  }
};
