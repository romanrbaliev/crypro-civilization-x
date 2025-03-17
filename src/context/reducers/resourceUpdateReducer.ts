
import { GameState } from '../types';
import { calculateProductionBoost } from '../utils/resourceUtils';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

/**
 * Обработка обновления ресурсов, вызывается на каждый тик игры
 * Рассчитывает производство и потребление всех ресурсов
 */
export const processResourceUpdate = (state: GameState): GameState => {
  // Получаем текущее время для расчета прошедшего времени
  const currentTime = Date.now();
  const deltaTime = (currentTime - state.lastUpdate) / 1000; // в секундах
  
  // Обновляем игровое время
  const newGameTime = state.gameTime + deltaTime;
  
  // Копируем текущие ресурсы и сообщения
  let newResources = { ...state.resources };
  let newEventMessages = { ...state.eventMessages };
  
  // Рассчитываем электричество и знания
  const { 
    electricityProduction, 
    electricityConsumption, 
    knowledgeBoost,
    electricityShortage,
    newMessagesState 
  } = calculateElectricityAndKnowledge(state, newEventMessages);
  
  // Рассчитываем майнинг BTC
  const { 
    btcProduction, 
    additionalElectricityConsumption,
    additionalMessages
  } = calculateBtcMining(state, electricityShortage);
  
  // Обновляем сообщения после расчетов
  newEventMessages = { ...newMessagesState, ...additionalMessages };
  
  // Обновляем общее потребление электричества с учетом майнинга
  const totalElectricityConsumption = electricityConsumption + additionalElectricityConsumption;
  
  // Обновляем ресурсы с учетом прошедшего времени
  newResources = updateResourceValues(
    state, 
    newResources, 
    deltaTime, 
    electricityProduction, 
    totalElectricityConsumption, 
    knowledgeBoost,
    btcProduction,
    electricityShortage,
    currentTime
  );
  
  return {
    ...state,
    resources: newResources,
    lastUpdate: currentTime,
    eventMessages: newEventMessages,
    gameTime: newGameTime
  };
};

/**
 * Расчет производства и потребления электричества, а также бонусов к знаниям
 */
function calculateElectricityAndKnowledge(
  state: GameState, 
  eventMessages: { [key: string]: any }
): { 
  electricityProduction: number, 
  electricityConsumption: number, 
  knowledgeBoost: number,
  electricityShortage: boolean,
  newMessagesState: { [key: string]: any }
} {
  let electricityProduction = 0;
  let electricityConsumption = 0;
  let knowledgeBoost = 1;
  let electricityShortage = false;
  let newMessagesState = { ...eventMessages };
  
  // Рассчитываем производство электричества от генераторов
  for (const buildingId in state.buildings) {
    const building = state.buildings[buildingId];
    
    // Производство электричества
    if (building.count > 0 && building.production.electricity) {
      electricityProduction += building.production.electricity * building.count;
    }
    
    // Бонусы к знаниям от зданий
    if (building.count > 0 && building.production.knowledgeBoost) {
      knowledgeBoost += building.production.knowledgeBoost * building.count;
    }
  }
  
  // Рассчитываем потребление электричества домашними компьютерами
  if (state.buildings.homeComputer.count > 0) {
    electricityConsumption = state.buildings.homeComputer.count * 0.5; // 0.5 эл/сек на компьютер
  }
  
  // Проверяем, достаточно ли электричества для работы компьютеров
  const currentElectricity = state.resources.electricity.value;
  const requiredElectricity = electricityConsumption * ((Date.now() - state.lastUpdate) / 1000);
  
  if (requiredElectricity > 0 && requiredElectricity > currentElectricity) {
    // Недостаточно электричества для работы компьютеров
    electricityShortage = true;
    
    // Отправляем уведомление о нехватке электричества только если состояние изменилось
    if (!state.eventMessages.electricityShortage) {
      newMessagesState.electricityShortage = true;
      safeDispatchGameEvent("Нехватка электричества! Компьютеры остановлены. Включите генераторы или купите новые.", "error");
    }
  } else {
    // Достаточно электричества, проверяем изменение состояния
    if (state.eventMessages.electricityShortage) {
      newMessagesState.electricityShortage = false;
      safeDispatchGameEvent("Подача электричества восстановлена, компьютеры снова работают.", "success");
    } else {
      newMessagesState.electricityShortage = false;
    }
  }
  
  return { 
    electricityProduction, 
    electricityConsumption, 
    knowledgeBoost,
    electricityShortage,
    newMessagesState
  };
}

/**
 * Расчет майнинга BTC и дополнительного потребления электричества
 */
function calculateBtcMining(
  state: GameState,
  electricityShortage: boolean
): {
  btcProduction: number,
  additionalElectricityConsumption: number,
  additionalMessages: { [key: string]: any }
} {
  let btcProduction = 0;
  let additionalElectricityConsumption = 0;
  let additionalMessages = {};
  
  // Проверяем, есть ли активные автомайнеры
  if (state.buildings.autoMiner.count > 0 && !electricityShortage) {
    // Рассчитываем доступную вычислительную мощность
    const availableComputingPower = state.resources.computingPower.value;
    
    // Если есть вычислительная мощность для майнинга
    if (availableComputingPower > 0) {
      // Получаем параметры майнинга
      const { 
        miningEfficiency, 
        networkDifficulty, 
        basePowerConsumption,
        energyEfficiency 
      } = state.miningParams;
      
      // Рассчитываем производство BTC
      // BTCperTick = (вычислительнаяМощность * эффективностьМайнинга * сложностьСети) / 3600
      btcProduction = (availableComputingPower * miningEfficiency * networkDifficulty) / 3600;
      
      // Рассчитываем потребление электричества
      // потреблениеЭлектричества = базовоеПотребление * вычислительнаяМощность * (1 - энергоЭффективность)
      additionalElectricityConsumption = basePowerConsumption * availableComputingPower * (1 - energyEfficiency);
      
      // Проверяем, разблокирован ли уже ресурс BTC
      if (!state.resources.btc.unlocked && state.buildings.autoMiner.count > 0) {
        // Разблокируем ресурс BTC при первом запуске автомайнера
        additionalMessages = {
          ...additionalMessages,
          btcUnlocked: true
        };
        
        // Отправляем уведомление о разблокировке BTC
        safeDispatchGameEvent("Разблокирован новый ресурс: Bitcoin (BTC)", "info");
      }
    }
  }
  
  return {
    btcProduction,
    additionalElectricityConsumption,
    additionalMessages
  };
}

/**
 * Обновление значений всех ресурсов с учетом прошедшего времени
 */
function updateResourceValues(
  state: GameState,
  resourcesState: { [key: string]: any },
  deltaTime: number,
  electricityProduction: number,
  electricityConsumption: number,
  knowledgeBoost: number,
  btcProduction: number,
  electricityShortage: boolean,
  currentTime: number
): { [key: string]: any } {
  // Копируем ресурсы для обновления
  let newResources = { ...resourcesState };
  
  // Если у нас есть автомайнер, разблокируем BTC
  if (state.buildings.autoMiner.count > 0 && !newResources.btc.unlocked) {
    newResources.btc = {
      ...newResources.btc,
      unlocked: true
    };
  }
  
  // Обновляем каждый ресурс
  for (const resourceId in newResources) {
    // Рассчитываем базовое производство для текущего ресурса
    let production = calculateResourceProduction(
      state, 
      resourceId, 
      electricityShortage, 
      knowledgeBoost
    );
    
    // Обрабатываем специальные случаи ресурсов
    production = handleSpecialResources(
      resourceId, 
      state, 
      production, 
      electricityProduction, 
      electricityConsumption, 
      btcProduction,
      electricityShortage,
      newResources,
      currentTime
    );
    
    // Обновляем значение ресурса с учетом прошедшего времени
    newResources = updateResourceValue(
      newResources, 
      resourceId, 
      production, 
      deltaTime
    );
  }
  
  return newResources;
}

/**
 * Расчет базового производства ресурса от всех зданий
 */
function calculateResourceProduction(
  state: GameState, 
  resourceId: string, 
  electricityShortage: boolean,
  knowledgeBoost: number
): number {
  let production = 0;
  
  // Суммируем производство от всех зданий
  for (const buildingId in state.buildings) {
    const building = state.buildings[buildingId];
    
    // Если это домашний компьютер и не хватает электричества, не производим вычислительную мощность
    if (buildingId === 'homeComputer' && resourceId === 'computingPower' && electricityShortage) {
      continue;
    }
    
    // Добавляем производство от здания, если оно есть
    if (building.count > 0 && building.production[resourceId]) {
      production += building.production[resourceId] * building.count;
    }
  }
  
  // Применяем бонусы для знаний
  if (resourceId === 'knowledge') {
    // Применяем бонус от зданий
    production *= knowledgeBoost;
    
    // Применяем бонусы от улучшений
    const upgradeBoost = calculateProductionBoost(state, resourceId);
    production *= upgradeBoost;
  }
  
  return production;
}

/**
 * Обработка особых случаев для некоторых ресурсов (электричество, USDT, BTC)
 */
function handleSpecialResources(
  resourceId: string,
  state: GameState,
  baseProduction: number,
  electricityProduction: number,
  electricityConsumption: number,
  btcProduction: number,
  electricityShortage: boolean,
  resources: { [key: string]: any },
  currentTime: number
): number {
  let production = baseProduction;
  
  // Особый случай для электричества - учитываем производство и потребление
  if (resourceId === 'electricity') {
    if (!electricityShortage) {
      // Если электричества достаточно, учитываем производство и потребление
      production = electricityProduction - electricityConsumption;
    } else {
      // Если не хватает электричества, учитываем только производство
      production = electricityProduction;
    }
  }
  
  // Особый случай для BTC - добавляем производство от майнинга
  if (resourceId === 'btc' && state.buildings.autoMiner.count > 0) {
    production += btcProduction;
  }
  
  return production;
}

/**
 * Обновление значения отдельного ресурса с учетом производства и ограничений
 */
function updateResourceValue(
  resources: { [key: string]: any },
  resourceId: string,
  production: number,
  deltaTime: number
): { [key: string]: any } {
  const resource = resources[resourceId];
  
  // Рассчитываем новое значение ресурса
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
  resources[resourceId] = {
    ...resource,
    value: newValue,
    perSecond: production
  };
  
  return resources;
}
