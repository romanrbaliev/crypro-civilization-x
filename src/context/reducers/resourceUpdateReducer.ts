
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
  
  // Обновляем ресурсы с учетом прошедшего времени
  newResources = updateResourceValues(
    state, 
    newResources, 
    deltaTime, 
    electricityProduction, 
    electricityConsumption, 
    knowledgeBoost, 
    electricityShortage,
    currentTime
  );
  
  // Рассчитываем новый курс обмена BTC на основе времени (волатильность)
  const newBtcExchangeRate = calculateBtcExchangeRate(state, currentTime);
  
  // Проверяем условия для автоматического обмена BTC на USDT
  const { newBtcValue, newUsdtValue, exchangeOccurred } = processAutoExchange(
    state,
    newResources,
    newBtcExchangeRate
  );
  
  // Если произошел автоматический обмен, обновляем значения ресурсов
  if (exchangeOccurred) {
    newResources.btc.value = newBtcValue;
    newResources.usdt.value = newUsdtValue;
    
    // Отправляем уведомление об автоматическом обмене
    safeDispatchGameEvent(
      `Автоматический обмен: ${state.miningSettings.exchangeThreshold} BTC на ${
        Math.floor(state.miningSettings.exchangeThreshold * newBtcExchangeRate * (1 - state.exchangeFee) * 100) / 100
      } USDT (курс: ${Math.floor(newBtcExchangeRate)} USDT/BTC)`,
      "success"
    );
  }
  
  // Проверяем условия для уведомления о выгодном курсе
  checkForGoodExchangeRate(state, newBtcExchangeRate);
  
  return {
    ...state,
    resources: newResources,
    lastUpdate: currentTime,
    eventMessages: newEventMessages,
    btcExchangeRate: newBtcExchangeRate
  };
};

/**
 * Рассчитывает курс обмена BTC на USDT с учетом волатильности
 */
function calculateBtcExchangeRate(state: GameState, currentTime: number): number {
  const baseRate = 20000; // Базовый курс BTC/USDT
  const volatility = 0.2; // Амплитуда колебаний (20%)
  const period = 3600000; // Период колебаний (1 час в миллисекундах)
  
  // Рассчитываем синусоидальное колебание курса
  const oscillation = Math.sin((currentTime % period) / period * 2 * Math.PI);
  const newRate = baseRate * (1 + volatility * oscillation);
  
  return Math.floor(newRate);
}

/**
 * Проверяет условия для автоматического обмена BTC на USDT
 */
function processAutoExchange(
  state: GameState,
  resources: { [key: string]: any },
  currentRate: number
): { newBtcValue: number, newUsdtValue: number, exchangeOccurred: boolean } {
  // Проверяем, включен ли автоматический обмен
  if (!state.miningSettings.autoExchange) {
    return {
      newBtcValue: resources.btc.value,
      newUsdtValue: resources.usdt.value,
      exchangeOccurred: false
    };
  }
  
  // Проверяем, достаточно ли BTC для обмена
  const btcThreshold = state.miningSettings.exchangeThreshold;
  if (resources.btc.value < btcThreshold) {
    return {
      newBtcValue: resources.btc.value,
      newUsdtValue: resources.usdt.value,
      exchangeOccurred: false
    };
  }
  
  // Если торговый бот активен (через улучшение), использовать более оптимальный обмен
  const autoTradingEnabled = state.upgrades.tradingBot?.purchased || false;
  
  // Рассчитываем количество USDT, которое получит игрок
  const exchangeAmount = btcThreshold;
  const fee = state.exchangeFee;
  const usdtReceived = exchangeAmount * currentRate * (1 - fee);
  
  // Обмениваем BTC на USDT
  const newBtcValue = resources.btc.value - exchangeAmount;
  const newUsdtValue = Math.min(
    resources.usdt.max,
    resources.usdt.value + usdtReceived
  );
  
  return {
    newBtcValue,
    newUsdtValue,
    exchangeOccurred: true
  };
}

/**
 * Проверяет, является ли текущий курс обмена выгодным и отправляет уведомление
 */
function checkForGoodExchangeRate(state: GameState, currentRate: number): void {
  // Проверяем, включены ли уведомления о выгодном курсе
  if (!state.miningSettings.notifyOnGoodRate) {
    return;
  }
  
  // Базовый курс и порог для определения "выгодного" курса
  const baseRate = 20000;
  const goodRateThreshold = state.miningSettings.goodRateThreshold;
  
  // Проверяем, превышает ли текущий курс пороговое значение
  if (currentRate >= baseRate * goodRateThreshold && !state.eventMessages.goodRateNotified) {
    safeDispatchGameEvent(
      `Выгодный курс обмена: ${Math.floor(currentRate)} USDT за 1 BTC!`,
      "info"
    );
    
    // Устанавливаем флаг, чтобы не отправлять уведомление слишком часто
    state.eventMessages.goodRateNotified = true;
    
    // Сбрасываем флаг через некоторое время
    setTimeout(() => {
      if (state.eventMessages) {
        state.eventMessages.goodRateNotified = false;
      }
    }, 300000); // 5 минут
  }
}

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
    
    // Потребление электричества автомайнерами
    if (buildingId === 'autoMiner' && building.count > 0 && building.active && building.consumptionRate) {
      // Учитываем энергоэффективность
      const energyEfficiencyFactor = 1 - state.energyEfficiency;
      electricityConsumption += building.consumptionRate.electricity * building.count * energyEfficiencyFactor;
    }
  }
  
  // Рассчитываем потребление электричества домашними компьютерами
  if (state.buildings.homeComputer.count > 0) {
    electricityConsumption += state.buildings.homeComputer.count * 0.5; // 0.5 эл/сек на компьютер
  }
  
  // Проверяем, достаточно ли электричества для работы компьютеров и майнеров
  const currentElectricity = state.resources.electricity.value;
  const requiredElectricity = electricityConsumption * ((Date.now() - state.lastUpdate) / 1000);
  
  if (requiredElectricity > 0 && requiredElectricity > currentElectricity) {
    // Недостаточно электричества для работы компьютеров
    electricityShortage = true;
    
    // Отправляем уведомление о нехватке электричества только если состояние изменилось
    if (!state.eventMessages.electricityShortage) {
      newMessagesState.electricityShortage = true;
      safeDispatchGameEvent("Нехватка электричества! Устройства остановлены. Включите генераторы или купите новые.", "error");
    }
  } else {
    // Достаточно электричества, проверяем изменение состояния
    if (state.eventMessages.electricityShortage) {
      newMessagesState.electricityShortage = false;
      safeDispatchGameEvent("Подача электричества восстановлена, устройства снова работают.", "success");
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
  currentTime: number
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
    
    // Если это автомайнер и не хватает электричества или вычислительной мощности, не производим BTC
    if (buildingId === 'autoMiner' && resourceId === 'btc') {
      if (electricityShortage || !building.active) {
        continue;
      }
      
      // Проверяем, есть ли достаточно вычислительной мощности
      if (state.resources.computingPower.value < building.consumptionRate?.computingPower * building.count) {
        continue;
      }
      
      // Применяем бонусы от исследований к производству BTC
      const baseBtcProduction = building.production.btc * building.count;
      const miningPowerBoost = state.upgrades.coolingSystem?.purchased ? 
        state.upgrades.coolingSystem.effect.miningPowerBoost : 0;
      
      // Учитываем эффективность майнинга и сложность сети
      production += baseBtcProduction * (1 + miningPowerBoost) * 
        state.miningEfficiency / state.networkDifficulty;
      
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
  
  // Особый случай для вычислительной мощности - потребление автомайнерами
  if (resourceId === 'computingPower') {
    // Рассчитываем потребление вычислительной мощности активными автомайнерами
    let computingConsumption = 0;
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      if (buildingId === 'autoMiner' && building.count > 0 && building.active && !electricityShortage) {
        computingConsumption += building.consumptionRate?.computingPower * building.count || 0;
      }
    }
    
    // Учитываем потребление в производстве
    production -= computingConsumption;
  }
  
  // Особый случай для BTC - рассчитываем производство с учетом эффективности и сложности
  if (resourceId === 'btc') {
    // Производство BTC рассчитывается в calculateResourceProduction
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

