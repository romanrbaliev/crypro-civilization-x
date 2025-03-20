import { GameState } from '../types';
import { checkAllUnlocks } from '@/utils/unlockSystem';

// Обработчик обновления состояния ресурсов и производства
export const processResourceUpdate = (state: GameState): GameState => {
  const now = Date.now();
  const elapsedSeconds = (now - state.lastUpdate) / 1000;
  
  // Начальные данные
  const initialResources = { ...state.resources };
  let eventMessages = { ...state.eventMessages };
  let miningParams = { ...state.miningParams };
  const buildings = { ...state.buildings };
  
  // Проверка необходимости запускать обработку
  if (elapsedSeconds <= 0 || !state.gameStarted) {
    console.log("⚠️ Не запускаем обновление ресурсов (слишком малый интервал или игра не запущена)");
    return state;
  }
  
  // Рассчитываем базовое производство ресурсов от зданий
  // и применяем буст от улучшений
  calculateBuildingProduction(state, initialResources, buildings);
  
  // Обновляем значения ресурсов на основе времени
  updateResourceValues(state, initialResources, elapsedSeconds);
  
  // Если у нас есть автомайнер и вычислительная мощность, добываем BTC
  processMining(state, initialResources, elapsedSeconds);
  
  // Создаем новое состояние
  let newState = {
    ...state,
    resources: initialResources,
    lastUpdate: now,
    eventMessages: eventMessages,
    gameTime: state.gameTime + elapsedSeconds,
    miningParams: miningParams
  };
  
  // Используем новую унифицированную систему проверки разблокировок
  newState = checkAllUnlocks(newState);
  
  return newState;
};

// Расчет производства ресурсов от зданий
const calculateBuildingProduction = (
  state: GameState,
  newResources: { [key: string]: any },
  newBuildings: { [key: string]: any }
) => {
  // Сбрасываем текущее производство ресурсов
  for (const resourceKey in newResources) {
    newResources[resourceKey] = {
      ...newResources[resourceKey],
      production: 0,
      perSecond: 0,
      boosts: {} // Важно: сбрасываем бусты при каждом обновлении
    };
  }
  
  // Расчет базового производства от зданий
  for (const buildingKey in state.buildings) {
    const building = state.buildings[buildingKey];
    if (building.count <= 0) continue;
    
    // Применяем производство для каждого типа ресурса этого здания
    for (const [resourceKey, baseProduction] of Object.entries(building.production)) {
      // Только для ресурсов, не для максимумов и бустов
      if (!resourceKey.includes('Max') && !resourceKey.includes('Boost')) {
        const resource = newResources[resourceKey];
        if (resource) {
          const production = Number(baseProduction) * building.count * (1 + building.productionBoost);
          resource.production += production;
          resource.perSecond += production;
          
          // Добавляем или обновляем кэш производства для здания
          if (!newBuildings[buildingKey].resourceProduction) {
            newBuildings[buildingKey].resourceProduction = {};
          }
          newBuildings[buildingKey].resourceProduction[resourceKey] = production;
        }
      }
      
      // Для бустов к производству других ресурсов
      else if (resourceKey.includes('Boost')) {
        const targetResourceKey = resourceKey.replace('Boost', '');
        const targetResource = newResources[targetResourceKey];
        if (targetResource) {
          const boostValue = Number(baseProduction) * building.count;
          // Бусты накапливаются, но добавляются к ресурсу отдельно
          if (!targetResource.boosts) targetResource.boosts = {};
          if (!targetResource.boosts[buildingKey]) targetResource.boosts[buildingKey] = 0;
          targetResource.boosts[buildingKey] = boostValue; // Важно: присваиваем, а не добавляем
        }
      }
    }
    
    // Применяем потребление ресурсов
    if (building.consumption) {
      for (const [resourceKey, consumption] of Object.entries(building.consumption)) {
        const resource = newResources[resourceKey];
        if (resource) {
          const consumptionRate = Number(consumption) * building.count;
          resource.perSecond -= consumptionRate; // Вычитаем потребление из perSecond
        }
      }
    }
  }
  
  // Применяем бусты к производству ресурсов
  for (const resourceKey in newResources) {
    const resource = newResources[resourceKey];
    if (resource.boosts) {
      let totalBoost = 0;
      for (const boost of Object.values(resource.boosts)) {
        totalBoost += Number(boost);
      }
      // Применяем буст к базовой скорости
      resource.perSecond = resource.production * (1 + totalBoost);
    }
  }
};

// Обновление значений ресурсов с учетом времени
const updateResourceValues = (
  state: GameState,
  newResources: { [key: string]: any },
  deltaTime: number
) => {
  // Обновляем значения каждого ресурса
  for (const resourceKey in newResources) {
    const resource = newResources[resourceKey];
    if (!resource.unlocked) continue;
    
    // Рассчитываем новое значение
    let newValue = resource.value + resource.perSecond * deltaTime;
    
    // Ограничиваем максимумом
    if (resource.max !== undefined && resource.max !== Infinity) {
      newValue = Math.min(newValue, resource.max);
    }
    
    // Обновляем значение ресурса
    resource.value = newValue;
  }
};

// Обработка автоматического майнинга BTC
const processMining = (
  state: GameState,
  newResources: { [key: string]: any },
  deltaTime: number
) => {
  // Проверяем, есть ли у нас автомайнер и доступны ли необходимые ресурсы
  const autoMiner = state.buildings.autoMiner;
  if (!autoMiner || autoMiner.count <= 0 || !state.resources.btc.unlocked) return;
  
  const computingPower = newResources.computingPower;
  const electricity = newResources.electricity;
  const btc = newResources.btc;
  
  // Проверяем наличие всех необходимых ресурсов
  if (!computingPower || !electricity || !btc) return;
  
  // Расчет потребления ресурсов для майнинга
  const computingPowerConsumption = 10 * autoMiner.count;
  const electricityConsumption = 2 * autoMiner.count;
  
  // Проверяем, хватает ли ресурсов для майнинга
  if (computingPower.value < computingPowerConsumption || 
      electricity.value < electricityConsumption) {
    return; // Недостаточно ресурсов
  }
  
  // Рассчитываем базовую эффективность майнинга
  let miningEfficiency = state.miningParams.miningEfficiency;
  
  // Применяем бусты к эффективности майнинга
  const miningEfficiencyBoosts = 
    Object.values(state.upgrades)
      .filter(upgrade => upgrade.purchased && upgrade.effects?.miningEfficiencyBoost)
      .reduce((sum, upgrade) => sum + Number(upgrade.effects.miningEfficiencyBoost), 0);
  
  miningEfficiency *= (1 + miningEfficiencyBoosts);
  
  // Рассчитываем количество добытых BTC
  const minedBtc = computingPowerConsumption * miningEfficiency * deltaTime;
  
  // Расходуем ресурсы
  computingPower.value -= computingPowerConsumption * deltaTime;
  electricity.value -= electricityConsumption * deltaTime;
  
  // Добавляем добытые BTC
  btc.value += minedBtc;
  
  // Обновляем перСекунд для BTC
  btc.perSecond = computingPowerConsumption * miningEfficiency;
};
