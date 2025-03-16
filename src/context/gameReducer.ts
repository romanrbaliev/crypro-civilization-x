
import { GameState, GameAction, Building } from './types';
import { initialState } from './initialState';
import { toast } from 'sonner';

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
      
      if (!resource.unlocked) {
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
      
      // Проверяем условия разблокировки новых функций на основе изменения ресурсов
      
      // Если знания достигли 10, открываем кнопку "Применить знания"
      if (resourceId === "knowledge" && newValue >= 10 && !state.unlocks.applyKnowledge) {
        newUnlocks.applyKnowledge = true;
        toast.success("Открыта новая функция: Применить знания");
      }
      
      // Если получен первый USDT, разблокируем здание "Практика"
      if (resourceId === "usdt" && newValue >= 1 && !state.buildings.practice.unlocked) {
        newBuildings.practice.unlocked = true;
        toast.success("Открыта новая функция: Практика");
      }
      
      // Если USDT достиг 20, открываем Генератор
      if (resourceId === "usdt" && newValue >= 20 && !state.buildings.generator.unlocked) {
        newBuildings.generator.unlocked = true;
        toast.success("Открыто новое оборудование: Генератор");
      }
      
      // Если USDT и электричество достигли нужных значений, открываем Домашний компьютер
      if ((resourceId === "usdt" && newValue >= 25 && state.resources.electricity.value >= 10) ||
          (resourceId === "electricity" && newValue >= 10 && state.resources.usdt.value >= 25)) {
        if (!state.buildings.homeComputer.unlocked) {
          newBuildings.homeComputer.unlocked = true;
          toast.success("Открыто новое оборудование: Домашний компьютер");
        }
      }
      
      // Открываем USDT если ещё не открыт и уже есть знания
      if (resourceId === "knowledge" && newValue >= 5 && !newResources.usdt.unlocked) {
        newResources.usdt.unlocked = true;
        toast.success("Открыт новый ресурс: USDT");
      }
      
      return {
        ...state,
        resources: newResources,
        unlocks: newUnlocks,
        buildings: newBuildings
      };
    }
    
    case "UPDATE_RESOURCES": {
      const now = Date.now();
      const deltaTime = (now - state.lastUpdate) / 1000; // в секундах
      
      // Если прошло менее 0.1 секунды, не обновляем
      if (deltaTime < 0.1) return state;
      
      const newResources = { ...state.resources };
      
      // Применяем производство от зданий
      for (const building of Object.values(state.buildings)) {
        if (building.count === 0) continue;
        
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
            newResources[resourceId].perSecond = amount * building.count;
          }
        }
      }
      
      // Обрабатываем потребление электричества домашним компьютером
      if (state.buildings.homeComputer.count > 0) {
        const electricityConsumption = 1 * state.buildings.homeComputer.count * deltaTime;
        
        // Потребляем электричество
        if (newResources.electricity.value >= electricityConsumption) {
          newResources.electricity.value -= electricityConsumption;
        } else {
          // Если электричества недостаточно, компьютер не работает и не производит вычислительную мощность
          newResources.computingPower.perSecond = 0;
          // Сообщение о нехватке электричества будет добавлено позже
        }
      }
      
      // Обновляем максимальные значения ресурсов на основе зданий
      for (const building of Object.values(state.buildings)) {
        if (building.count === 0) continue;
        
        for (const [resourceId, amount] of Object.entries(building.production)) {
          if (resourceId.includes('Max')) {
            const actualResourceId = resourceId.replace('Max', '');
            if (newResources[actualResourceId]) {
              newResources[actualResourceId].max = initialState.resources[actualResourceId].max + 
                amount * building.count;
            }
          }
        }
      }
      
      // Обновляем бонусы к производству
      let knowledgeBoost = 1;
      let usdtMaxBoost = 1;
      
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
            knowledgeBoost += amount;
          } else if (effectId === 'usdtMaxBoost') {
            usdtMaxBoost += amount;
          }
        }
      }
      
      // Применяем бонусы
      if (knowledgeBoost !== 1) {
        for (const building of Object.values(state.buildings)) {
          if (building.count === 0) continue;
          
          if (building.production.knowledge) {
            const boostedProduction = building.production.knowledge * knowledgeBoost;
            newResources.knowledge.perSecond = boostedProduction * building.count;
          }
        }
      }
      
      if (usdtMaxBoost !== 1) {
        newResources.usdt.max = newResources.usdt.max * usdtMaxBoost;
      }
      
      // Проверяем условия открытия новых апгрейдов
      const newUpgrades = { ...state.upgrades };
      for (const upgrade of Object.values(newUpgrades)) {
        if (upgrade.unlocked || upgrade.purchased) continue;
        
        let canUnlock = true;
        for (const [resourceId, requiredAmount] of Object.entries(upgrade.requirements || {})) {
          if (!newResources[resourceId] || newResources[resourceId].value < requiredAmount) {
            canUnlock = false;
            break;
          }
        }
        
        if (canUnlock) {
          upgrade.unlocked = true;
          toast.success(`Новое исследование доступно: ${upgrade.name}`);
        }
      }
      
      // Проверяем условия открытия новых зданий
      const newBuildings = { ...state.buildings };
      for (const building of Object.values(newBuildings)) {
        if (building.unlocked) continue;
        
        let canUnlock = true;
        for (const [resourceId, requiredAmount] of Object.entries(building.requirements || {})) {
          if (!newResources[resourceId] || newResources[resourceId].value < requiredAmount) {
            canUnlock = false;
            break;
          }
        }
        
        if (canUnlock) {
          building.unlocked = true;
          toast.success(`Новое оборудование доступно: ${building.name}`);
        }
      }
      
      // Открываем электричество если есть генератор
      if (state.buildings.generator.count > 0 && !newResources.electricity.unlocked) {
        newResources.electricity.unlocked = true;
        toast.success("Открыт новый ресурс: Электричество");
      }
      
      // Открываем вычислительную мощность если есть домашний компьютер
      if (state.buildings.homeComputer.count > 0 && !newResources.computingPower.unlocked) {
        newResources.computingPower.unlocked = true;
        toast.success("Открыт новый ресурс: Вычислительная мощность");
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
      console.log(`Здание ${buildingId} построено, новое количество: ${newBuildings[buildingId].count}`);
      
      // Обновляем производство ресурсов сразу после покупки здания
      if (buildingId === "practice") {
        // Обновляем perSecond для ресурса знаний
        const productionAmount = building.production.knowledge || 0;
        newResources.knowledge.perSecond += productionAmount;
        
        // Убедимся, что здание остается разблокированным для следующих покупок
        console.log("Практика успешно приобретена, обновляем состояние");
      }
      
      // Убрано уведомление о покупке здания
      
      return {
        ...state,
        resources: newResources,
        buildings: newBuildings
      };
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
      
      // Убрано уведомление о покупке апгрейда
      
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
    
    case "PRESTIGE": {
      // Рассчитываем очки престижа на основе текущего прогресса
      const totalWorth = Object.values(state.resources).reduce((sum, resource) => {
        return sum + resource.value;
      }, 0);
      
      const newPrestigePoints = state.prestigePoints + Math.floor(Math.log(totalWorth / 1000 + 1) * 10);
      
      toast.success(`Криптозима! Вы получили ${newPrestigePoints - state.prestigePoints} очков криптомудрости`);
      
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
