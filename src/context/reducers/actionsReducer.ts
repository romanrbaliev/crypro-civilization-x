// Обработчики для различных игровых действий
import { GameState } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Применение знаний
export const processApplyKnowledge = (state: GameState): GameState => {
  // Проверяем, есть ли 10 знаний
  if (state.resources.knowledge.value < 10) {
    console.log("Недостаточно знаний для применения");
    safeDispatchGameEvent("Недостаточно знаний (нужно 10)", "error");
    return state;
  }
  
  // Вычитаем знания и добавляем USDT
  const newResources = { ...state.resources };
  
  // Вычитаем знания
  newResources.knowledge = {
    ...newResources.knowledge,
    value: newResources.knowledge.value - 10
  };
  
  // Проверяем, разблокирован ли ресурс USDT
  if (!newResources.usdt.unlocked) {
    newResources.usdt = {
      ...newResources.usdt,
      unlocked: true
    };
    safeDispatchGameEvent("Разблокирован ресурс: USDT", "info");
  }
  
  // Добавляем USDT
  newResources.usdt = {
    ...newResources.usdt,
    value: newResources.usdt.value + 1
  };
  
  // Если кнопка "Применить знания" еще не разблокирована, разблокируем ее
  const newUnlocks = { ...state.unlocks };
  if (!newUnlocks.applyKnowledge) {
    newUnlocks.applyKnowledge = true;
  }
  
  // Проверяем количество применений знаний для разблокировки Практики
  const applyKnowledgeCount = state.counters.applyKnowledge?.value || 0;
  
  // Если применили знания 2 или более раз, разблокируем Практику (здание)
  if (applyKnowledgeCount >= 2 && !state.buildings.practice.unlocked) {
    const newBuildings = { ...state.buildings };
    newBuildings.practice = {
      ...newBuildings.practice,
      unlocked: true
    };
    
    // Разблокируем возможность практики
    newUnlocks.practice = true;
    
    safeDispatchGameEvent("Разблокирована практика", "success");
    console.log("Разблокировано здание: Практика");
    
    return {
      ...state,
      resources: newResources,
      buildings: newBuildings,
      unlocks: newUnlocks
    };
  }
  
  return {
    ...state,
    resources: newResources,
    unlocks: newUnlocks
  };
};

// Процесс покупки практики
export const processPracticePurchase = (state: GameState): GameState => {
  // Получаем текущее количество практики
  const practiceCount = state.buildings.practice.count;
  const practiceBaseCost = state.buildings.practice.cost.usdt;
  const practiceCostMultiplier = state.buildings.practice.costMultiplier || 1.15;
  
  // Рассчитываем стоимость следующего уровня практики
  const currentCost = Math.floor(practiceBaseCost * Math.pow(practiceCostMultiplier, practiceCount));
  
  // Проверяем, хватает ли USDT
  if (state.resources.usdt.value < currentCost) {
    safeDispatchGameEvent(`Недостаточно USDT для покупки практики (нужно ${currentCost})`, "error");
    return state;
  }
  
  // Вычитаем USDT и увеличиваем количество практики
  const newResources = { ...state.resources };
  newResources.usdt = {
    ...newResources.usdt,
    value: newResources.usdt.value - currentCost
  };
  
  // Увеличиваем количество практики
  const newBuildings = { ...state.buildings };
  newBuildings.practice = {
    ...newBuildings.practice,
    count: practiceCount + 1
  };
  
  console.log(`Куплена практика (уровень ${practiceCount + 1}) за ${currentCost} USDT`);
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    resources: newResources,
    buildings: newBuildings
  };
};

// Функция для расчета добычи вычислительной мощности
export const processMiningPower = (state: GameState): GameState => {
  // Получаем параметры майнинга и ресурсы
  const { miningEfficiency, networkDifficulty } = state.miningParams;
  const { computingPower } = state.resources;
  
  // Проверяем, достаточно ли вычислительной мощности
  if (computingPower.value <= 0) {
    console.log("Недостаточно вычислительной мощности для майнинга");
    return state;
  }
  
  // Рассчитываем количество добытого BTC
  const minedBtc = (miningEfficiency * computingPower.value) / networkDifficulty;
  
  // Обновляем состояние ресурсов
  const newResources = { ...state.resources };
  
  // Проверяем, разблокирован ли ресурс BTC
  if (!newResources.btc.unlocked) {
    newResources.btc = {
      ...newResources.btc,
      unlocked: true
    };
    safeDispatchGameEvent("Разблокирован ресурс: Bitcoin (BTC)", "info");
  }
  
  // Добавляем добытый BTC
  newResources.btc = {
    ...newResources.btc,
    value: newResources.btc.value + minedBtc
  };
  
  // Увеличиваем счетчик майнинга
  const newCounters = { ...state.counters };
  newCounters.mining = {
    ...newCounters.mining,
    value: (newCounters.mining?.value || 0) + 1
  };
  
  console.log(`Добыто ${minedBtc} BTC`);
  
  return {
    ...state,
    resources: newResources,
    counters: newCounters
  };
};

// Функция для обмена BTC на USDT
export const processExchangeBtc = (state: GameState): GameState => {
  // Получаем параметры майнинга и ресурсы
  const { exchangeRate, exchangeCommission } = state.miningParams;
  const { btc } = state.resources;
  
  // Проверяем, есть ли BTC для обмена
  if (btc.value <= 0) {
    console.log("Нет BTC для обмена");
    safeDispatchGameEvent("Нет BTC для обмена", "error");
    return state;
  }
  
  // Рассчитываем сумму USDT к получению
  const usdtAmount = btc.value * exchangeRate * (1 - exchangeCommission);
  
  // Обновляем состояние ресурсов
  const newResources = { ...state.resources };
  
  // Вычитаем BTC
  newResources.btc = {
    ...newResources.btc,
    value: 0
  };
  
  // Добавляем USDT
  newResources.usdt = {
    ...newResources.usdt,
    value: newResources.usdt.value + usdtAmount
  };
  
  console.log(`Обменено ${btc.value} BTC на ${usdtAmount} USDT`);
  
  return {
    ...state,
    resources: newResources
  };
};
