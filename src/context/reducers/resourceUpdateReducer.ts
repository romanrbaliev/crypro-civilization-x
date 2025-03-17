
import { GameState } from '../types';
import { calculateProductionBoost } from '../utils/resourceUtils';

// Обработка обновления ресурсов
export const processResourceUpdate = (state: GameState): GameState => {
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
    
    // Проверяем бонусы к знаниям от зданий
    if (building.count > 0 && building.production.knowledgeBoost) {
      knowledgeBoost += building.production.knowledgeBoost * building.count;
    }
  }
  
  // Рассчитываем потребление электричества домашними компьютерами (0.5 за компьютер)
  if (state.buildings.homeComputer.count > 0) {
    electricityConsumption = state.buildings.homeComputer.count * 0.5; // 0.5 эл/сек на компьютер
  }
  
  // Проверяем, достаточно ли электричества
  const currentElectricity = newResources.electricity.value;
  const requiredElectricity = electricityConsumption * deltaTime;
  
  if (requiredElectricity > 0 && requiredElectricity > currentElectricity) {
    // Недостаточно электричества
    electricityShortage = true;
    
    // Отправляем уведомление о нехватке электричества только если состояние изменилось
    if (!state.eventMessages.electricityShortage) {
      newEventMessages.electricityShortage = true;
      const eventBus = window.gameEventBus;
      if (eventBus) {
        const customEvent = new CustomEvent('game-event', { 
          detail: { 
            message: "Нехватка электричества! Компьютеры остановлены. Включите генераторы или купите новые.", 
            type: "error" 
          } 
        });
        eventBus.dispatchEvent(customEvent);
      }
    }
  } else {
    // Достаточно электричества, проверяем изменение состояния
    if (state.eventMessages.electricityShortage) {
      newEventMessages.electricityShortage = false;
      const eventBus = window.gameEventBus;
      if (eventBus) {
        const customEvent = new CustomEvent('game-event', { 
          detail: { 
            message: "Подача электричества восстановлена, компьютеры снова работают.", 
            type: "success" 
          } 
        });
        eventBus.dispatchEvent(customEvent);
      }
    } else {
      newEventMessages.electricityShortage = false;
    }
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
    
    // Применяем бонусы для знаний от зданий
    if (resourceId === 'knowledge') {
      production *= knowledgeBoost;
      
      // Применяем бонусы от улучшений
      const upgradeBoost = calculateProductionBoost(state, resourceId);
      production *= upgradeBoost;
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
};
