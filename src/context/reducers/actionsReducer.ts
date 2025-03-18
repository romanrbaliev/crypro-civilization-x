import { GameState } from '../types';
import { updateResourceMaxValues } from '../utils/resourceUtils';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

/**
 * Обработчик майнинга вычислительной мощности в USDT
 * @param state Текущее состояние игры
 * @returns Новое состояние игры после майнинга
 */
export const processMiningPower = (state: GameState): GameState => {
  // Проверка наличия достаточной вычислительной мощности
  if (state.resources.computingPower.value < 50) {
    return state;
  }

  // Обновление ресурсов
  const newResources = {
    ...state.resources,
    computingPower: {
      ...state.resources.computingPower,
      value: state.resources.computingPower.value - 50
    },
    usdt: {
      ...state.resources.usdt,
      value: state.resources.usdt.value + 5
    }
  };

  // Увеличиваем счетчик майнинга
  const newCounters = {
    ...state.counters,
    mining: {
      ...state.counters.mining,
      value: state.counters.mining.value + 1
    }
  };

  // Проверка условий разблокировки автомайнера
  let newState = {
    ...state,
    resources: newResources,
    counters: newCounters
  };

  // Если счетчик достиг 3, разблокируем автомайнер
  if (newCounters.mining >= 3 && !state.buildings.autoMiner.unlocked && state.buildings.autoMiner) {
    newState.buildings = {
      ...newState.buildings,
      autoMiner: {
        ...newState.buildings.autoMiner,
        unlocked: true
      }
    };
    
    safeDispatchGameEvent("Открыт автомайнер для автоматического майнинга", "info");
  }

  return newState;
};

/**
 * Обработчик действия обмена BTC на USDT
 * @param state Текущее состояние игры
 * @returns Новое состояние игры после обмена
 */
export const processExchangeBtc = (state: GameState): GameState => {
  // Проверка наличия BTC для обмена
  if (state.resources.btc.value <= 0) {
    return state;
  }

  // Рассчитываем текущий курс обмена
  const currentExchangeRate = state.miningParams.exchangeRate * 
    (1 + state.miningParams.volatility * Math.sin(state.gameTime / state.miningParams.exchangePeriod));
  
  // Рассчитываем количество получаемых USDT с учетом комиссии
  const btcAmount = state.resources.btc.value;
  const usdtAmount = btcAmount * currentExchangeRate * (1 - state.miningParams.exchangeCommission);
  
  // Обновление ресурсов
  const newResources = {
    ...state.resources,
    btc: {
      ...state.resources.btc,
      value: 0
    },
    usdt: {
      ...state.resources.usdt,
      value: state.resources.usdt.value + usdtAmount
    }
  };

  // Отправляем сообщение об обмене
  safeDispatchGameEvent(`Обменяно ${btcAmount.toFixed(8)} BTC на ${usdtAmount.toFixed(2)} USDT (курс: ${currentExchangeRate.toLocaleString()})`, "success");

  return {
    ...state,
    resources: newResources
  };
};

// Обработка применения знаний
export const processApplyKnowledge = (state: GameState): GameState => {
  // Проверка наличия достаточного количества знаний
  if (state.resources.knowledge.value < 10) {
    console.log("Недостаточно знаний для применения");
    return state;
  }
  
  // Вычитаем знания
  const newResources = {
    ...state.resources,
    knowledge: {
      ...state.resources.knowledge,
      value: state.resources.knowledge.value - 10
    },
    usdt: {
      ...state.resources.usdt,
      value: state.resources.usdt.value + 1,
      unlocked: true
    }
  };
  
  console.log("Применены знания: -10 знаний, +1 USDT");
  
  // Увеличиваем счетчик применения знаний
  const newCounters = {
    ...state.counters,
    applyKnowledge: {
      ...state.counters.applyKnowledge,
      value: (state.counters.applyKnowledge?.value || 0) + 1
    }
  };
  
  // Проверяем, нужно ли разблокировать практику
  let newUnlocks = { ...state.unlocks };
  let newBuildings = { ...state.buildings };
  
  // Разблокируем практику после 2-го применения знаний
  if (newCounters.applyKnowledge >= 2 && !state.unlocks.practice) {
    console.log("Разблокировка практики после 2-го применения знаний");
    newUnlocks.practice = true;
    
    // Явно разблокируем здание practice
    if (newBuildings.practice) {
      console.log("Разблокировка здания practice");
      newBuildings.practice = {
        ...newBuildings.practice,
        unlocked: true
      };
    } else {
      console.warn("Здание practice не найдено в state.buildings");
    }
    
    safeDispatchGameEvent("Разблокирована возможность практиковаться", "info");
  }
  
  const newState = {
    ...state,
    resources: newResources,
    counters: newCounters,
    unlocks: newUnlocks,
    buildings: newBuildings
  };
  
  return updateResourceMaxValues(newState);
};

// Обработка покупки практики
export const processPracticePurchase = (state: GameState): GameState => {
  console.log("processPracticePurchase вызван");
  
  // Проверяем наличие здания practice
  if (!state.buildings.practice) {
    console.error("Ошибка: здание practice не найдено в state.buildings");
    return state;
  }
  
  // Расчет текущей стоимости
  const practiceBuilding = state.buildings.practice;
  const currentCost = Math.floor(practiceBuilding.cost.usdt * Math.pow(practiceBuilding.costMultiplier, practiceBuilding.count));
  
  console.log(`Покупка practice: USDT ${state.resources.usdt.value}, требуется ${currentCost}`);
  
  // Проверка достаточности ресурсов
  if (state.resources.usdt.value < currentCost) {
    console.log("Недостаточно USDT для покупки practice");
    return state;
  }
  
  // Обновляем ресурсы
  const newResources = {
    ...state.resources,
    usdt: {
      ...state.resources.usdt,
      value: state.resources.usdt.value - currentCost
    }
  };
  
  // Увеличиваем счетчик здания
  const newBuildings = {
    ...state.buildings,
    practice: {
      ...practiceBuilding,
      count: practiceBuilding.count + 1,
      // Каждый уровень практики дает фиксированные 0.63 знаний/сек
      production: {
        knowledge: 0.63
      }
    }
  };
  
  console.log(`Практика улучшена: новый уровень ${practiceBuilding.count + 1}`);
  safeDispatchGameEvent(`Вы повысили уровень практики! Скорость накопления знаний увеличена.`, "success");
  
  return {
    ...state,
    resources: newResources,
    buildings: newBuildings
  };
};
