
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
  
  // Увеличиваем игровое время
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
  
  // Обновляем сообщения после расчета электричества
  newEventMessages = newMessagesState;
  
  // Рассчитываем добычу BTC и обновляем ресурсы
  const { newResourcesState, btcProduction, updatedElectricityConsumption } = 
    calculateBtcMining(state, newResources, electricityConsumption, electricityShortage);

  // Используем обновленные ресурсы и потребление электричества
  newResources = newResourcesState;
  
  // Обновляем ресурсы с учетом прошедшего времени
  newResources = updateResourceValues(
    state, 
    newResources, 
    deltaTime, 
    electricityProduction, 
    updatedElectricityConsumption, 
    knowledgeBoost, 
    electricityShortage,
    currentTime,
    btcProduction
  );
  
  // Рассчитываем текущий курс обмена BTC
  const currentExchangeRate = calculateExchangeRate(state.miningParams, newGameTime);

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
  
  // Рассчитываем базовое потребление электричества домашними компьютерами
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
 * Расчет добычи BTC и дополнительного потребления электричества автомайнером
 */
function calculateBtcMining(
  state: GameState,
  resources: { [key: string]: any },
  baseElectricityConsumption: number,
  electricityShortage: boolean
): {
  newResourcesState: { [key: string]: any },
  btcProduction: number,
  updatedElectricityConsumption: number
} {
  // Копируем ресурсы
  let newResources = { ...resources };
  let btcProduction = 0;
  let additionalElectricityConsumption = 0;
  
  // Проверяем, есть ли активные автомайнеры
  if (state.buildings.autoMiner.count > 0 && !electricityShortage) {
    // Разблокируем ресурс BTC, если это первый запуск автомайнера
    if (!state.resources.btc.unlocked) {
      newResources.btc = {
        ...newResources.btc,
        unlocked: true
      };
      safeDispatchGameEvent("Открыт новый ресурс: Bitcoin (BTC)", "success");
    }
    
    // Определяем ресурсы, необходимые для работы автомайнера
    const requiredElectricity = state.buildings.autoMiner.count * state.miningParams.baseConsumption; // 2 эл/сек на автомайнер
    const requiredComputingPower = state.buildings.autoMiner.count * 10; // 10 вычислительной мощности на автомайнер
    
    // Проверяем, достаточно ли ресурсов
    const hasEnoughElectricity = state.resources.electricity.value >= requiredElectricity;
    const hasEnoughComputingPower = state.resources.computingPower.value >= requiredComputingPower;
    
    if (hasEnoughElectricity && hasEnoughComputingPower) {
      // Применяем бонусы эффективности майнинга от улучшений
      let effectiveMiningEfficiency = state.miningParams.miningEfficiency;
      
      for (const upgradeId in state.upgrades) {
        const upgrade = state.upgrades[upgradeId];
        if (upgrade.purchased) {
          if (upgrade.effect.miningEfficiencyBoost) {
            effectiveMiningEfficiency += state.miningParams.miningEfficiency * upgrade.effect.miningEfficiencyBoost;
          }
        }
      }
      
      // Рассчитываем производство BTC (фиксированное значение на уровень)
      btcProduction = state.buildings.autoMiner.count * effectiveMiningEfficiency;
      
      // Рассчитываем потребление электричества
      additionalElectricityConsumption = requiredElectricity;
    } else {
      // Если ресурсов недостаточно, не производим BTC
      btcProduction = 0;
    }
  }
  
  return {
    newResourcesState: newResources,
    btcProduction: btcProduction,
    updatedElectricityConsumption: baseElectricityConsumption + additionalElectricityConsumption
  };
}

/**
 * Расчет текущего курса обмена BTC на USDT с учетом волатильности
 */
function calculateExchangeRate(miningParams: any, gameTime: number): number {
  const { exchangeRate, volatility, exchangePeriod } = miningParams;
  // Теперь возвращаем фиксированный курс 100000, так как волатильность не нужна
  return exchangeRate;
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
  electricityShortage: boolean,
  currentTime: number,
  btcProduction: number
): { [key: string]: any } {
  // Копируем ресурсы для обновления
  let newResources = { ...resourcesState };
  
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
      electricityShortage,
      newResources,
      currentTime,
      btcProduction
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
  electricityShortage: boolean,
  resources: { [key: string]: any },
  currentTime: number,
  btcProduction: number
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
  
  // Особый случай для BTC - учитываем производство от автомайнера
  if (resourceId === 'btc' && btcProduction > 0) {
    production += btcProduction;
  }
  
  // Особый случай для вычислительной мощности - учитываем потребление автомайнером
  if (resourceId === 'computingPower' && state.buildings.autoMiner.count > 0 && !electricityShortage) {
    // 10 вычислительной мощности на 1 автомайнер
    const computingPowerConsumption = state.buildings.autoMiner.count * 10;
    production -= computingPowerConsumption;
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
