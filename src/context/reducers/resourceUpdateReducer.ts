
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
  
  // Проверяем, были ли проблемы с ресурсами (остановка оборудования)
  checkResourcesForAlerts(state, newResources);
  
  // Обработка майнинга BTC с учетом прошедшего времени
  processMining(state, newResources, elapsedSeconds, miningParams);
  
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

// Функция обработки майнинга с учетом прошедшего времени
const processMining = (
  state: GameState, 
  newResources: { [key: string]: any }, 
  deltaTime: number,
  miningParams: any
): void => {
  const { autoMiner } = state.buildings;
  const { btc, electricity, computingPower } = newResources;
  
  // Проверка необходимых условий для майнинга
  if (!autoMiner?.count || !btc?.unlocked || !electricity || !computingPower) {
    return;
  }
  
  // Проверка наличия ресурсов для майнинга
  if (electricity.value <= 0 || computingPower.value <= 0) {
    return;
  }
  
  // Расчет объема добытых BTC за прошедшее время
  const btcPerSecond = btc.perSecond;
  if (btcPerSecond > 0) {
    // Добавляем намайненное количество BTC за период
    const minedBtc = btcPerSecond * deltaTime;
    btc.value += minedBtc;
    
    console.log(`Майнинг: добыто ${minedBtc.toFixed(8)} BTC за ${deltaTime.toFixed(2)} сек.`);
  }
};

// Обновление значений ресурсов с учетом времени
const updateResourceValues = (
  resources: { [key: string]: any },
  deltaTime: number
) => {
  // Обновляем значения каждого ресурса (кроме BTC, который обрабатывается отдельно)
  for (const resourceId in resources) {
    const resource = resources[resourceId];
    if (!resource.unlocked || resourceId === 'btc') continue;
    
    // Рассчитываем новое значение на основе производства за секунду
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
