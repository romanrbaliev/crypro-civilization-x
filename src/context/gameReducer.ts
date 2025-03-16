import { GameState, GameAction, Building } from './types';
import { initialState, initialResources } from './initialState';
import { toast } from 'sonner';

// Функция для добавления события в журнал
const addGameEvent = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
  const eventBus = window.gameEventBus;
  if (eventBus) {
    const customEvent = new CustomEvent('game-event', { 
      detail: { message, type }
    });
    eventBus.dispatchEvent(customEvent);
  }
};

// Функция для проверки, может ли игрок позволить себе здание
export const canAffordBuilding = (state: GameState, building: Building): boolean => {
  for (const [resourceId, cost] of Object.entries(building.cost)) {
    const resource = state.resources[resourceId];
    const actualCost = cost * Math.pow(building.costMultiplier, building.count);
    
    if (resource.value < actualCost) {
      return false;
    }
  }
  return true;
};

// Время для автомайнера (в миллисекундах)
const AUTO_MINER_INTERVAL = 5000; // 5 секунд

// Редуктор для обработки действий
export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "INCREMENT_RESOURCE": {
      const { resourceId, amount } = action.payload;
      
      // Проверяем, что ресурс существует
      if (!state.resources[resourceId]) {
        console.error(`Ресурс ${resourceId} не существует!`);
        return state;
      }
      
      const resource = state.resources[resourceId];
      
      if (!resource.unlocked && amount > 0) {
        console.log(`Ресурс ${resourceId} не разблокирован!`);
        return state;
      }
      
      console.log(`Изменение ресурса ${resourceId}: ${resource.value} -> ${resource.value + amount}`);
      
      // Новое значение ресурса, ограниченное максимумом
      const newValue = Math.min(resource.value + amount, resource.max);
      
      // Копируем все ресурсы для изменения
      const newResources = {
        ...state.resources,
        [resourceId]: {
          ...resource,
          value: newValue
        }
      };
      
      // Копируем состояние разблокировок для изменения
      let newUnlocks = { ...state.unlocks };
      let newBuildings = { ...state.buildings };
      let newUpgrades = { ...state.upgrades };
      let newCounters = { ...state.counters };
      
      // Проверка для отображения сообщения после 3 кликов
      if (resourceId === "knowledge" && amount > 0) {
        const studyClicksCount = (state.counters.studyClicks || 0) + 1;
        newCounters.studyClicks = studyClicksCount;
        
        // После 3 кликов показываем сообщение
        if (studyClicksCount === 3) {
          addGameEvent("Вы начинаете понимать основы криптовалют! Скоро вы сможете применить свои знания.", "info");
          newUnlocks.applyKnowledge = true;
          toast.success("Открыта новая функция: Применить знания");
          addGameEvent("Открыта новая функция: Применить знания", "success");
        }
      }
      
      // Если USDT достиг 11, открываем Генератор
      if (resourceId === "usdt" && newValue >= 11 && !state.buildings.generator.unlocked) {
        newBuildings.generator.unlocked = true;
        toast.success("Открыто новое оборудование: Генератор");
        addGameEvent("Открыто новое оборудование: Генератор", "success");
        addGameEvent("Генератор позволяет вырабатывать электричество, необходимое для других устройств", "info");
      }
      
      // Если накоплено 10 электричества, открываем Домашний компьютер
      if (resourceId === "electricity" && newValue >= 10 && !state.buildings.homeComputer.unlocked) {
        newBuildings.homeComputer.unlocked = true;
        toast.success("Открыто новое оборудование: Домашний компьютер");
        addGameEvent("Открыто новое оборудование: Домашний компьютер", "success");
        addGameEvent("Домашний компьютер потребляет 1 электричество/сек и производит вычислительную мощность", "info");
      }
      
      return {
        ...state,
        resources: newResources,
        unlocks: newUnlocks,
        buildings: newBuildings,
        upgrades: newUpgrades,
        counters: newCounters
      };
    }
    
    case "UNLOCK_RESOURCE": {
      const { resourceId } = action.payload;
      
      if (!state.resources[resourceId]) {
        console.error(`Ресурс ${resourceId} не существует!`);
        return state;
      }
      
      const newResources = {
        ...state.resources,
        [resourceId]: {
          ...state.resources[resourceId],
          unlocked: true
        }
      };

      // Добавляем уведомление в журнал
      addGameEvent(`Открыт новый ресурс: ${newResources[resourceId].name}`, "success");
      
      return {
        ...state,
        resources: newResources
      };
    }
    
    case "INCREMENT_COUNTER": {
      const { counterId } = action.payload;
      
      if (!state.counters) {
        console.error("Счетчики не инициализированы!");
        return state;
      }
      
      const newCounters = {
        ...state.counters,
        [counterId]: (state.counters[counterId] || 0) + 1
      };
      
      // Проверяем, нужно ли разблокировать кнопку "Практика" после 2-го применения знаний
      let newUnlocks = { ...state.unlocks };
      if (counterId === "applyKnowledge" && newCounters.applyKnowledge === 2 && !state.unlocks.practice) {
        newUnlocks.practice = true;
        toast.success("Открыта новая функция: Практика");
        addGameEvent("Открыта новая функция: Практика", "success");
        addGameEvent("Накопите 10 USDT, чтобы начать практиковаться и включить фоновое накопление знаний", "info");
      }
      
      return {
        ...state,
        counters: newCounters,
        unlocks: newUnlocks
      };
    }
    
    case "UPDATE_RESOURCES": {
      const now = Date.now();
      const deltaTime = (now - state.lastUpdate) / 1000; // в секундах
      
      // Если прошло менее 0.1 секунды, не обновляем
      if (deltaTime < 0.1) return state;
      
      const newResources = { ...state.resources };
      
      // Сбрасываем значение perSecond для всех ресурсов, чтобы корректно посчитать заново
      for (const resourceId in newResources) {
        newResources[resourceId].perSecond = 0;
      }
      
      // Объект для отслеживания, какие здания не работают из-за нехватки ресурсов
      const inactiveBuildings = {};
      let resourceShortageMessage = null;
      
      // Проверяем, хватает ли электричества для Домашнего компьютера
      const homeComputerCount = state.buildings.homeComputer.count;
      if (homeComputerCount > 0) {
        const electricityPerComputer = 1; // Потребление электричества на один компьютер
        const totalElectricityNeeded = electricityPerComputer * homeComputerCount;
        
        // Если электричества недостаточно, компьютеры не будут работать
        if (newResources.electricity.value < electricityPerComputer) {
          inactiveBuildings['homeComputer'] = true;
          
          // Если нехватка электричества и ещё не было уведомления
          if (!state.eventMessages.electricityShortage) {
            resourceShortageMessage = "Нехватка электричества! Компьютеры остановлены. Включите генераторы или купите новые.";
          }
        } else {
          // Вычитаем потребляемое электричество, но не больше чем есть
          const actualElectricityToUse = Math.min(totalElectricityNeeded * deltaTime, newResources.electricity.value);
          newResources.electricity.value -= actualElectricityToUse;
          newResources.electricity.perSecond -= totalElectricityNeeded;
          
          // Если раньше был недостаток, но теперь электричества хватает
          if (state.eventMessages.electricityShortage) {
            resourceShortageMessage = "Подача электричества восстановлена, компьютеры снова работают.";
          }
        }
      }
      
      // Особая логика для Автомайнера
      const autoMinerCount = state.buildings.autoMiner.count;
      if (autoMinerCount > 0) {
        const timeSinceLastUpdate = now - state.lastUpdate;
        const miningCycles = Math.floor(timeSinceLastUpdate / AUTO_MINER_INTERVAL);
        
        if (miningCycles > 0) {
          // Для каждого цикла каждый автомайнер пытается использовать 50 вычислительной мощности
          for (let i = 0; i < miningCycles; i++) {
            const requiredPower = 50 * autoMinerCount;
            if (newResources.computingPower.value >= requiredPower) {
              newResources.computingPower.value -= requiredPower;
              // Изменено с 1 на 5 USDT за 50 единиц вычислительной мощности
              newResources.usdt.value = Math.min(
                newResources.usdt.value + (5 * autoMinerCount),
                newResources.usdt.max
              );
            } else {
              // Не хватает вычислительной мощности
              break;
            }
          }
        }
        
        // Обновляем perSecond для отображения (приблизительно)
        const miningRatePerSecond = autoMinerCount / (AUTO_MINER_INTERVAL / 1000);
        newResources.computingPower.perSecond -= 50 * miningRatePerSecond;
        // Изменено с 1 на 5 USDT
        newResources.usdt.perSecond += 5 * miningRatePerSecond;
      }
      
      // Применяем производство от зданий
      for (const building of Object.values(state.buildings)) {
        if (building.count === 0) continue;
        
        // Пропускаем здания, которые не работают из-за нехватки ресурсов
        if (inactiveBuildings[building.id]) continue;
        
        // Специальная обработка для автомайнера - уже обработано выше
        if (building.id === "autoMiner") continue;
        
        for (const [resourceId, amount] of Object.entries(building.production)) {
          // Проверяем, содержит ли производство изменение максимального значения
          if (resourceId.includes('Max')) {
            const actualResourceId = resourceId.replace('Max', '');
            if (newResources[actualResourceId]) {
              // Не обновляем ресурсы здесь, только расчитываем новый максимум
              continue;
            }
          } else if (resourceId.includes('Boost')) {
            // Обрабатываем бонусы производства
            continue;
          } else if (newResources[resourceId]) {
            // Обычные ресурсы: производство в секунду * количество зданий * дельта времени
            const resourceAmount = amount * building.count * deltaTime;
            newResources[resourceId].value = Math.min(
              newResources[resourceId].value + resourceAmount,
              newResources[resourceId].max
            );
            newResources[resourceId].perSecond += amount * building.count;
          }
        }
      }
      
      // Обновляем максимальные значения ресурсов на основе зданий
      for (const building of Object.values(state.buildings)) {
        if (building.count === 0) continue;
        
        for (const [resourceId, amount] of Object.entries(building.production)) {
          if (resourceId.includes('Max')) {
            const actualResourceId = resourceId.replace('Max', '');
            if (newResources[actualResourceId]) {
              // Обновляем максимальное значение ресурса на основе базового значения и количества зданий
              const baseMax = initialResources[actualResourceId].max;
              newResources[actualResourceId].max = baseMax + amount * building.count;
            }
          }
        }
      }
      
      // Обновляем бонусы к производству
      let knowledgeBoost = 1;
      let usdtMaxBoost = 1;
      let knowledgeMaxBoost = 1;
      
      // Проверяем здания, дающие бонусы
      for (const building of Object.values(state.buildings)) {
        if (building.count === 0) continue;
        
        for (const [resourceId, amount] of Object.entries(building.production)) {
          if (resourceId === 'knowledgeBoost') {
            knowledgeBoost += amount * building.count;
          }
        }
      }
      
      // Проверяем апгрейды, дающие бонусы
      for (const upgrade of Object.values(state.upgrades)) {
        if (!upgrade.purchased) continue;
        
        for (const [effectId, amount] of Object.entries(upgrade.effect)) {
          if (effectId === 'knowledgeBoost') {
            knowledgeBoost += Number(amount);  // Используем точное значение: 0.1 = 10%
          } else if (effectId === 'usdtMaxBoost') {
            usdtMaxBoost += Number(amount);  // Используем точное значение: 0.25 = 25%
          } else if (effectId === 'knowledgeMaxBoost') {
            knowledgeMaxBoost += Number(amount);  // Используем точное значение: 0.5 = 50%
          }
        }
      }
      
      // Применяем бонусы
      if (knowledgeBoost !== 1) {
        for (const building of Object.values(state.buildings)) {
          if (building.count === 0) continue;
          
          if (building.production.knowledge) {
            const boostedProduction = building.production.knowledge * knowledgeBoost;
            newResources.knowledge.perSecond += boostedProduction * building.count;
            
            // Корректируем уже накопленное значение с учетом бонуса
            const resourceAmount = building.production.knowledge * building.count * deltaTime * knowledgeBoost;
            newResources.knowledge.value = Math.min(
              newResources.knowledge.value + resourceAmount - (building.production.knowledge * building.count * deltaTime),
              newResources.knowledge.max
            );
          }
        }
      }
      
      // Применяем бонус к максимальному хранению знаний
      if (knowledgeMaxBoost !== 1) {
        const baseMax = initialResources.knowledge.max;
        newResources.knowledge.max = baseMax * knowledgeMaxBoost;
      }
      
      if (usdtMaxBoost !== 1) {
        // Применяем бонус только к базовому значению + бонусы от зданий
        const baseMax = initialResources.usdt.max;
        let buildingBonus = 0;
        
        // Считаем бонусы от зданий
        for (const building of Object.values(state.buildings)) {
          if (building.count === 0) continue;
          
          for (const [resourceId, amount] of Object.entries(building.production)) {
            if (resourceId === 'usdtMax') {
              buildingBonus += amount * building.count;
            }
          }
        }
        
        newResources.usdt.max = (baseMax + buildingBonus) * usdtMaxBoost;
      }
      
      // Проверяем условия открытия новых апгрейдов
      const newUpgrades = { ...state.upgrades };
      const newBuildings = { ...state.buildings };
      
      // "Основы блокчейна" доступно после покупки домашнего компьютера
      if (state.buildings.homeComputer.count > 0 && !newUpgrades.basicBlockchain.unlocked) {
        newUpgrades.basicBlockchain.unlocked = true;
        toast.success(`Новое исследование доступно: ${newUpgrades.basicBlockchain.name}`);
        addGameEvent(`Новое исследование доступно: ${newUpgrades.basicBlockchain.name}`, "success");
      }
      
      // Исследование Безопасность криптокошельков доступно только после покупки Криптокошелька
      if (state.buildings.cryptoWallet.count > 0 && !newUpgrades.walletSecurity.unlocked) {
        newUpgrades.walletSecurity.unlocked = true;
        toast.success(`Новое исследование доступно: ${newUpgrades.walletSecurity.name}`);
        addGameEvent(`Новое исследование доступно: ${newUpgrades.walletSecurity.name}`, "success");
      }
      
      // Открываем вычислительную мощность если есть домашний компьютер
      if (state.buildings.homeComputer.count > 0 && !newResources.computingPower.unlocked) {
        newResources.computingPower.unlocked = true;
        toast.success("Открыт новый ресурс: Вычислительная мощность");
        addGameEvent("Открыт новый ресурс: Вычислительная мощность", "success");
      }
      
      // Открываем электричество если есть генератор
      if (state.buildings.generator.count > 0 && !newResources.electricity.unlocked) {
        newResources.electricity.unlocked = true;
        toast.success("Открыт новый ресурс: Электричество");
        addGameEvent("Открыт новый ресурс: Электричество", "success");
      }
      
      // Криптокошелек доступен только после покупки Автомайнера
      if (state.buildings.autoMiner.count > 0 && !newBuildings.cryptoWallet.unlocked) {
        newBuildings.cryptoWallet.unlocked = true;
        toast.success(`Новое оборудование доступно: ${newBuildings.cryptoWallet.name}`);
        addGameEvent(`Новое оборудование доступно: ${newBuildings.cryptoWallet.name}`, "success");
      }
      
      // Подготавливаем сообщения о состоянии ресурсов
      const eventMessages = { ...state.eventMessages };
      
      if (resourceShortageMessage) {
        // Обновляем статус нехватки электричества
        eventMessages.electricityShortage = !state.eventMessages.electricityShortage;
        addGameEvent(resourceShortageMessage, eventMessages.electricityShortage ? "error" : "success");
        
        return {
          ...state,
          resources: newResources,
          lastUpdate: now,
          upgrades: newUpgrades,
          buildings: newBuildings,
          eventMessages
        };
      }
      
      return {
        ...state,
        resources: newResources,
        lastUpdate: now,
        upgrades: newUpgrades,
        buildings: newBuildings
      };
    }
    
    case "SET_BUILDING_UNLOCKED": {
      const { buildingId, unlocked } = action.payload;
      
      if (!state.buildings[buildingId]) {
        console.error(`Здание ${buildingId} не найдено!`);
        return state;
      }
      
      const newBuildings = {
        ...state.buildings,
        [buildingId]: {
          ...state.buildings[buildingId],
          unlocked
        }
      };
      
      console.log(`Здание ${buildingId} теперь ${unlocked ? 'разблокировано' : 'заблокировано'}`);
      
      return {
        ...state,
        buildings: newBuildings
      };
    }
    
    case "RESTART_COMPUTERS": {
      // Если компьютеры были остановлены из-за нехватки электричества,
      // пробуем их перезапустить
      if (state.eventMessages.electricityShortage) {
        addGameEvent("Попытка перезапуска компьютеров...", "info");
        
        // Проверяем, есть ли сейчас электричество
        const electricity = state.resources.electricity.value;
        if (electricity <= 0) {
          addGameEvent("Недостаточно электричества для запуска компьютеров", "error");
          return state;
        }
        
        // Если есть электричество, сбрасываем флаг нехватки
        return {
          ...state,
          eventMessages: {
            ...state.eventMessages,
            electricityShortage: false
          }
        };
      }
      
      return state;
    }
    
    case "PURCHASE_BUILDING": {
      const { buildingId } = action.payload;
      const building = state.buildings[buildingId];
      
      if (!building) {
        console.error(`Building ${buildingId} not found!`);
        return state;
      }
      
      console.log(`Попытка покупки здания ${buildingId}, разблокировано: ${building.unlocked}, достаточно ресурсов: ${canAffordBuilding(state, building)}`);
      
      // Проверяем, разблокировано ли здание
      if (!building.unlocked) {
        console.log(`Building ${buildingId} is not unlocked yet!`);
        return state;
      }
      
      // Проверяем, есть ли достаточно ресурсов для покупки
      if (!canAffordBuilding(state, building)) {
        toast.error(`Недостаточно ресурсов для покупки ${building.name}`);
        addGameEvent(`Недостаточно ресурсов для покупки ${building.name}`, "error");
        return state;
      }
      
      // Вычитаем стоимость здания из ресурсов
      const newResources = { ...state.resources };
      for (const [resourceId, cost] of Object.entries(building.cost)) {
        const actualCost = cost * Math.pow(building.costMultiplier, building.count);
        newResources[resourceId].value -= actualCost;
        console.log(`Вычитаем ${actualCost} ${resourceId} за покупку здания ${buildingId}`);
      }
      
      // Увеличиваем количество здания
      const newBuildings = { ...state.buildings };
      newBuildings[buildingId].count += 1;
      
      // Обновляем состояние
      let newState = {
        ...state,
        resources: newResources,
        buildings: newBuildings
      };
      
      // Добавляем событие в журнал
      addGameEvent(`Здание ${building.name} построено`, "success");
      
      // Обновляем флаги и отключаем кнопку Майнинг при покупке автомайнера
      let newUnlocks = { ...state.unlocks };
      if (buildingId === "autoMiner") {
        newUnlocks.mining = false;
        newState = {
          ...newState,
          unlocks: newUnlocks
        };
      }
      
      // Если это первая Практика, показываем сообщение
      if (buildingId === "practice" && building.count === 0) {
        addGameEvent("Чтобы увеличить скорость накопления знаний, используйте Практику, а также изучайте различные исследования.", "info");
      }
      
      console.log(`Здание ${buildingId} построено, новое количество: ${newBuildings[buildingId].count}`);
      return newState;
    }
    
    case "PURCHASE_UPGRADE": {
      const { upgradeId } = action.payload;
      const upgrade = state.upgrades[upgradeId];
      
      if (!upgrade.unlocked || upgrade.purchased) return state;
      
      // Проверяем, есть ли достаточно ресурсов для покупки
      for (const [resourceId, cost] of Object.entries(upgrade.cost)) {
        const resource = state.resources[resourceId];
        
        if (resource.value < cost) {
          toast.error(`Недостаточно ${resource.name} для исследования ${upgrade.name}`);
          addGameEvent(`Недостаточно ${resource.name} для исследования ${upgrade.name}`, "error");
          return state;
        }
      }
      
      // Вычитаем стоимость апгрейда из ресурсов
      const newResources = { ...state.resources };
      for (const [resourceId, cost] of Object.entries(upgrade.cost)) {
        newResources[resourceId].value -= cost;
      }
      
      // Отмечаем апгрейд как купленный
      const newUpgrades = { ...state.upgrades };
      newUpgrades[upgradeId].purchased = true;
      
      // Добавляем событие о покупке апгрейда
      addGameEvent(`Исследование "${upgrade.name}" успешно завершено`, "success");
      
      return {
        ...state,
        resources: newResources,
        upgrades: newUpgrades
      };
    }
    
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
    
    case "START_GAME": {
      return {
        ...state,
        gameStarted: true,
        lastUpdate: Date.now()
      };
    }
    
    case "LOAD_GAME": {
      return {
        ...action.payload,
        lastUpdate: Date.now()
      };
    }
    
    case "MINE_COMPUTING_POWER": {
      // Проверяем, достаточно ли вычислительной мощности
      if (state.resources.computingPower.value < 50) {
        toast.error("Недостаточно вычислительной мощности для майнинга");
        addGameEvent("Недостаточно вычислительной мощности для майнинга", "error");
        return state;
      }
      
      // Вычитаем вычислительную мощность, добавляем USDT
      const newResources = {
        ...state.resources,
        computingPower: {
          ...state.resources.computingPower,
          value: state.resources.computingPower.value - 50
        },
        usdt: {
          ...state.resources.usdt,
          value: Math.min(state.resources.usdt.value + 5, state.resources.usdt.max)
        }
      };
      
      // Увеличиваем счетчик майнинга
      const newCounters = {
        ...state.counters,
        mining: (state.counters.mining || 0) + 1
      };
      
      // Разблокируем Автомайнер после первого майнинга
      let newBuildings = { ...state.buildings };
      if (newCounters.mining === 1 && !state.buildings.autoMiner.unlocked) {
        newBuildings.autoMiner.unlocked = true;
        toast.success("Открыто новое оборудование: Автомайнер");
        addGameEvent("Открыто новое оборудование: Автомайнер", "success");
        addGameEvent("Автомайнер автоматически обменивает 50 единиц вычислительной мощности на 5 USDT каждые 5 секунд", "info");
      }
      
      // Добавляем сообщение о майнинге
      addGameEvent("Майнинг: -50 вычислительной мощности, +5 USDT", "success");
      
      return {
        ...state,
        resources: newResources,
        buildings: newBuildings,
        counters: newCounters
      };
    }
    
    case "APPLY_KNOWLEDGE": {
      // Проверяем, достаточно ли знаний
      if (state.resources.knowledge.value < 10) {
        toast.error("Недостаточно знаний для применения");
        addGameEvent("Недостаточно знаний для применения", "error");
        return state;
      }
      
      // Увеличиваем счетчик применения знаний
      const newCounters = {
        ...state.counters,
        applyKnowledge: (state.counters.applyKnowledge || 0) + 1
      };
      
      // Создаем копию ресурсов
      let newResources = { ...state.resources };
      
      // Вычитаем знания
      newResources.knowledge = {
        ...state.resources.knowledge,
        value: state.resources.knowledge.value - 10
      };
      
      // Разблокируем USDT при первом применении знаний
      if (!state.resources.usdt.unlocked) {
        newResources.usdt = {
          ...state.resources.usdt,
          unlocked: true,
          value: 1 // Устанавливаем значение 1 при первом применении
        };
        toast.success("Открыт новый ресурс: USDT");
        addGameEvent("Открыт новый ресурс: USDT", "success");
      } else {
        newResources.usdt = {
          ...state.resources.usdt,
          value: Math.min(state.resources.usdt.value + 1, state.resources.usdt.max)
        };
      }
      
      return {
        ...state,
        resources: newResources,
        counters: newCounters
      };
    }
    
    case "PRESTIGE": {
      // Рассчитываем очки престижа на основе текущего прогресса
      const totalWorth = Object.values(state.resources).reduce((sum, resource) => {
        return sum + resource.value;
      }, 0);
      
      const newPrestigePoints = state.prestigePoints + Math.floor(Math.log(totalWorth / 1000 + 1) * 10);
      
      toast.success(`Криптозима! Вы получили ${newPrestigePoints - state.prestigePoints} очков криптомудрости`);
      addGameEvent(`Криптозима! Вы получили ${newPrestigePoints - state.prestigePoints} очков криптомудрости`, "success");
      
      // Возвращаемся к начальному состоянию, но сохраняем очки престижа
      return {
        ...initialState,
        prestigePoints: newPrestigePoints,
        lastUpdate: Date.now()
      };
    }
    
    default:
      return state;
  }
};
