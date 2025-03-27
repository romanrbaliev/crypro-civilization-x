
import { GameState } from '../types';
import { checkAllUnlocks } from '@/utils/unlockSystem';
import { ResourceProductionService } from '@/services/ResourceProductionService';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

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
  
  // Обрабатываем майнинг Bitcoin, если есть автомайнеры
  if (state.buildings.autoMiner && state.buildings.autoMiner.count > 0) {
    processMining(state, newResources, elapsedSeconds);
  }
  
  // Проверяем, были ли проблемы с ресурсами (остановка оборудования)
  checkResourcesForAlerts(state, newResources);
  
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
    
    // Обновляем значение ресурса (не позволяем опуститься ниже нуля)
    resource.value = Math.max(0, newValue);
    
    // Если ресурс достиг максимума, и это важно для игрока - уведомляем
    if (resource.perSecond > 0 && newValue >= resource.max && resource.max !== Infinity) {
      console.log(`Ресурс ${resource.name} достиг максимума (${resource.max})!`);
    }
  }
};

// Проверка ресурсов для уведомлений и остановки оборудования
const checkResourcesForAlerts = (
  state: GameState,
  newResources: { [key: string]: any }
) => {
  // Проверяем критические ресурсы для оборудования
  const criticalResources = ['electricity', 'computingPower'];
  
  for (const resourceKey of criticalResources) {
    const resource = newResources[resourceKey];
    if (!resource || !resource.unlocked) continue;
    
    // Предупреждение о низком уровне ресурса (менее 10%)
    if (resource.perSecond < 0 && resource.value > 0 && resource.value / resource.max < 0.1) {
      safeDispatchGameEvent(`Низкий уровень ${resource.name}! Оборудование может остановиться!`, "warning");
    }
    
    // Если ресурс закончился, останавливаем оборудование
    if (resource.value <= 0 && resource.perSecond < 0) {
      safeDispatchGameEvent(`${resource.name} закончился! Оборудование остановлено!`, "error");
      // Здесь можно добавить механику остановки оборудования
    }
  }
};

// Обработка автоматического майнинга BTC
const processMining = (
  state: GameState,
  newResources: { [key: string]: any },
  deltaTime: number
) => {
  // Проверяем наличие необходимых ресурсов для майнинга
  const { autoMiner } = state.buildings;
  const { electricity, computingPower, btc } = newResources;
  
  // Если нет необходимых ресурсов или они не разблокированы, пропускаем
  if (!autoMiner || autoMiner.count <= 0 || !electricity || !computingPower || !btc) return;
  
  try {
    // Если ресурсы на нуле, майнинг не происходит
    if (electricity.value <= 0 || computingPower.value <= 0) return;
    
    // Количество автомайнеров
    const minerCount = autoMiner.count;
    
    // Потребление ресурсов майнерами
    const electricityConsumption = (autoMiner.consumption?.electricity || 2) * minerCount;
    const computingPowerConsumption = (autoMiner.consumption?.computingPower || 50) * minerCount;
    
    // Проверяем, хватает ли ресурсов для работы майнеров
    if (electricity.value < electricityConsumption || computingPower.value < computingPowerConsumption) {
      // Недостаточно ресурсов для полной работы майнеров
      return;
    }
    
    // Параметры майнинга
    const { miningEfficiency, networkDifficulty, exchangeRate } = state.miningParams;
    
    // Расчет добычи BTC за единицу времени для всех майнеров
    const btcMined = minerCount * miningEfficiency * (computingPower.value / networkDifficulty) * deltaTime;
    
    // Добавляем добытый BTC
    btc.value += btcMined;
    btc.perSecond = minerCount * miningEfficiency * (computingPower.value / networkDifficulty);
    
    // Логируем для отладки
    console.log(`Майнинг: добыто ${btcMined.toFixed(8)} BTC (${minerCount} майнеров, эффективность: ${miningEfficiency})`);
    
  } catch (error) {
    console.error("Ошибка при обработке майнинга:", error);
  }
};
