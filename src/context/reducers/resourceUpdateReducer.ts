
import { GameState } from '../types';
import { checkAllUnlocks } from '@/utils/unlockSystem';
import { ResourceProductionService } from '@/services/ResourceProductionService';

// Обработчик обновления состояния ресурсов и производства
export const processResourceUpdate = (state: GameState): GameState => {
  const now = Date.now();
  const elapsedSeconds = (now - state.lastUpdate) / 1000;
  
  // Начальные данные
  let newResources = { ...state.resources };
  let eventMessages = { ...state.eventMessages };
  let miningParams = { ...state.miningParams };
  const buildings = { ...state.buildings };
  
  // Проверка необходимости запускать обработку
  if (elapsedSeconds <= 0 || !state.gameStarted) {
    console.log("⚠️ Не запускаем обновление ресурсов (слишком малый интервал или игра не запущена)");
    return state;
  }
  
  // Используем централизованный сервис для расчета производства ресурсов
  newResources = ResourceProductionService.calculateResourceProduction(state);
  
  // Обновляем значения ресурсов на основе времени
  updateResourceValues(newResources, elapsedSeconds);
  
  // Если у нас есть автомайнер и вычислительная мощность, добываем BTC
  processMining(state, newResources, elapsedSeconds);
  
  // Создаем новое состояние
  let newState = {
    ...state,
    resources: newResources,
    lastUpdate: now,
    eventMessages: eventMessages,
    gameTime: state.gameTime + elapsedSeconds,
    miningParams: miningParams
  };
  
  // Используем унифицированную систему проверки разблокировок
  newState = checkAllUnlocks(newState);
  
  return newState;
};

// Обновление значений ресурсов с учетом времени
const updateResourceValues = (
  resources: { [key: string]: any },
  deltaTime: number
) => {
  // Обновляем значения каждого ресурса
  for (const resourceKey in resources) {
    const resource = resources[resourceKey];
    if (!resource.unlocked) continue;
    
    // Рассчитываем новое значение
    let newValue = resource.value + resource.perSecond * deltaTime;
    
    // Ограничиваем максимумом
    if (resource.max !== undefined && resource.max !== Infinity) {
      newValue = Math.min(newValue, resource.max);
    }
    
    // Обновляем значение ресурса
    resource.value = Math.max(0, newValue); // Предотвращаем отрицательные значения
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
