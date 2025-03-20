
import { GameState } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Обработка применения знаний (конвертация в USDT)
export const processApplyKnowledge = (state: GameState): GameState => {
  // Проверяем достаточно ли знаний
  if (state.resources.knowledge.value < 10) {
    console.log('Недостаточно знаний для применения');
    return state;
  }
  
  // Проверяем и разблокируем USDT, если еще не разблокирован
  const updatedResources = { ...state.resources };
  
  if (!updatedResources.usdt.unlocked) {
    updatedResources.usdt = {
      ...updatedResources.usdt,
      unlocked: true
    };
    safeDispatchGameEvent("Разблокирован ресурс: USDT", "success");
  }
  
  // Применяем знания: -10 знаний, +1 USDT
  updatedResources.knowledge = {
    ...updatedResources.knowledge,
    value: updatedResources.knowledge.value - 10
  };
  
  updatedResources.usdt = {
    ...updatedResources.usdt,
    value: updatedResources.usdt.value + 1
  };
  
  // Инкрементируем счетчик применения знаний
  const counters = { ...state.counters };
  const applyKnowledgeCounter = counters.applyKnowledge ? 
    { ...counters.applyKnowledge, value: counters.applyKnowledge.value + 1 } : 
    { id: "applyKnowledge", name: "Применение знаний", value: 1 };
    
  counters.applyKnowledge = applyKnowledgeCounter;
  
  // Проверяем, если счетчик достиг 2, разблокируем Практику
  let updatedUnlocks = { ...state.unlocks };
  let updatedBuildings = { ...state.buildings };
  
  if (applyKnowledgeCounter.value === 2 && !updatedUnlocks.practice) {
    updatedUnlocks.practice = true;
    
    // Также разблокируем соответствующее здание
    if (updatedBuildings.practice) {
      updatedBuildings.practice = {
        ...updatedBuildings.practice,
        unlocked: true
      };
    }
    
    safeDispatchGameEvent(
      "Разблокирована функция 'Практика'! Теперь вы можете автоматизировать получение знаний.", 
      "success"
    );
  }
  
  // Проверяем разблокировку генератора
  if (applyKnowledgeCounter.value >= 5 && updatedResources.usdt.value >= 11) {
    // Разблокируем генератор, когда достаточно USDT
    if (updatedBuildings.generator && !updatedBuildings.generator.unlocked) {
      updatedBuildings.generator = {
        ...updatedBuildings.generator,
        unlocked: true
      };
      safeDispatchGameEvent(
        "Стал доступен для покупки Генератор! Производит электричество для ваших устройств.", 
        "success"
      );
    }
  }
  
  return {
    ...state,
    resources: updatedResources,
    counters,
    unlocks: updatedUnlocks,
    buildings: updatedBuildings
  };
};

// Обработка использования вычислительной мощности для майнинга
export const processMiningPower = (state: GameState): GameState => {
  // Проверяем достаточно ли вычислительной мощности
  if (state.resources.computingPower.value < 50) {
    console.log('Недостаточно вычислительной мощности для майнинга');
    return state;
  }
  
  // Обновляем счетчик майнинга
  const counters = { ...state.counters };
  const miningCounter = counters.mining ? 
    { ...counters.mining, value: counters.mining.value + 1 } : 
    { id: "mining", name: "Майнинг", value: 1 };
    
  counters.mining = miningCounter;
  
  // Используем вычислительную мощность для добычи BTC
  const updatedResources = { ...state.resources };
  
  // Уменьшаем вычислительную мощность
  updatedResources.computingPower = {
    ...updatedResources.computingPower,
    value: updatedResources.computingPower.value - 50
  };
  
  // Проверяем, разблокирован ли ресурс BTC
  if (!updatedResources.btc.unlocked) {
    updatedResources.btc = {
      ...updatedResources.btc,
      unlocked: true
    };
    safeDispatchGameEvent("Разблокирован ресурс: Bitcoin (BTC)", "success");
  }
  
  // Рассчитываем добытое количество BTC
  const miningEfficiency = state.miningParams?.miningEfficiency || 0.00001;
  const btcMined = 50 * miningEfficiency; // 50 единиц вычислительной мощности дают определенное количество BTC
  
  // Добавляем BTC к ресурсам
  updatedResources.btc = {
    ...updatedResources.btc,
    value: updatedResources.btc.value + btcMined
  };
  
  // Разблокируем AutoMiner если счетчик майнинга достиг определенного значения
  let updatedBuildings = { ...state.buildings };
  
  if (miningCounter.value === 3) {
    if (updatedBuildings.autoMiner && !updatedBuildings.autoMiner.unlocked) {
      updatedBuildings.autoMiner = {
        ...updatedBuildings.autoMiner,
        unlocked: true
      };
      safeDispatchGameEvent(
        "Стал доступен для покупки Автомайнер! Автоматизирует добычу BTC.", 
        "success"
      );
    }
  }
  
  return {
    ...state,
    resources: updatedResources,
    counters,
    buildings: updatedBuildings
  };
};

// Обработка обмена BTC на USDT
export const processExchangeBtc = (state: GameState): GameState => {
  // Проверяем наличие BTC
  if (state.resources.btc.value <= 0) {
    console.log('Нет BTC для обмена');
    return state;
  }
  
  // Рассчитываем стоимость BTC с учетом времени и волатильности
  const exchangeRate = state.miningParams?.exchangeRate || 100000;
  const volatility = state.miningParams?.volatility || 0.2;
  const exchangePeriod = state.miningParams?.exchangePeriod || 3600;
  
  // Кривая синуса для имитации волатильности
  const currentRate = exchangeRate * (1 + volatility * Math.sin(state.gameTime / exchangePeriod));
  
  // Обмениваем все имеющиеся BTC на USDT
  const btcAmount = state.resources.btc.value;
  const usdtReceived = btcAmount * currentRate;
  
  // Обновляем ресурсы
  const updatedResources = { ...state.resources };
  
  updatedResources.btc = {
    ...updatedResources.btc,
    value: 0
  };
  
  updatedResources.usdt = {
    ...updatedResources.usdt,
    value: updatedResources.usdt.value + usdtReceived
  };
  
  safeDispatchGameEvent(`Обменяно ${btcAmount.toFixed(8)} BTC на ${usdtReceived.toFixed(2)} USDT`, "success");
  
  return {
    ...state,
    resources: updatedResources
  };
};

// Обработка покупки здания Практика
export const processPracticePurchase = (state: GameState): GameState => {
  // Проверяем наличие здания в состоянии
  if (!state.buildings.practice) {
    console.error("Ошибка: здание practice не найдено в state.buildings");
    return state;
  }
  
  // Рассчитываем стоимость
  const practiceBuilding = state.buildings.practice;
  const currentCost = practiceBuilding.cost.usdt * Math.pow(practiceBuilding.costMultiplier, practiceBuilding.count);
  
  // Проверяем достаточность ресурсов
  if (state.resources.usdt.value < currentCost) {
    console.log('Недостаточно USDT для покупки практики');
    return state;
  }
  
  // Обновляем здания (увеличиваем уровень)
  const updatedBuildings = {
    ...state.buildings,
    practice: {
      ...practiceBuilding,
      count: practiceBuilding.count + 1
    }
  };
  
  // Обновляем ресурсы (вычитаем стоимость)
  const updatedResources = { ...state.resources };
  updatedResources.usdt = {
    ...updatedResources.usdt,
    value: updatedResources.usdt.value - currentCost
  };
  
  safeDispatchGameEvent(`Приобретена Практика (уровень ${practiceBuilding.count + 1})`, "success");
  
  return {
    ...state,
    buildings: updatedBuildings,
    resources: updatedResources
  };
};
