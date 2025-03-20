
// Если этого файла еще нет, создаем его

import { GameState } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { updateResourceMaxValues } from '../utils/resourceUtils';

// Обработка применения знаний
export const processApplyKnowledge = (state: GameState): GameState => {
  const knowledge = state.resources.knowledge;
  const usdt = state.resources.usdt;
  
  if (!knowledge || !usdt) {
    console.error("Ресурсы knowledge или usdt не найдены в состоянии");
    return state;
  }
  
  // Проверяем, достаточно ли знаний для конвертации
  if (knowledge.value < 10) {
    console.warn("Недостаточно знаний для конвертации в USDT");
    return state;
  }
  
  // Рассчитываем базовую конвертацию
  const baseConversion = 1; // 10 знаний = 1 USDT
  
  // Рассчитываем бонусы к конвертации от улучшений
  let conversionBonus = 0;
  for (const upgradeId in state.upgrades) {
    const upgrade = state.upgrades[upgradeId];
    if (upgrade.purchased && upgrade.effects?.conversionRate) {
      conversionBonus += Number(upgrade.effects.conversionRate);
    }
  }
  
  // Рассчитываем итоговую конвертацию
  const convertedAmount = baseConversion * (1 + conversionBonus);
  
  // Обновляем счетчик применения знаний
  let counters = { ...state.counters };
  if (counters.applyKnowledge) {
    counters.applyKnowledge = {
      ...counters.applyKnowledge,
      value: counters.applyKnowledge.value + 1
    };
  } else {
    counters.applyKnowledge = {
      id: "applyKnowledge",
      name: "Применение знаний",
      value: 1
    };
  }
  
  // Применяем изменения к ресурсам
  const newKnowledge = {
    ...knowledge,
    value: knowledge.value - 10
  };
  
  const newUsdt = {
    ...usdt,
    value: usdt.value + convertedAmount,
    unlocked: true
  };
  
  // Разблокируем вкладку практики, если это первая или вторая конвертация
  let unlocks = { ...state.unlocks };
  if (counters.applyKnowledge.value <= 2 && !unlocks.practice) {
    unlocks.practice = true;
    safeDispatchGameEvent("Разблокировано здание: Практика", "success");
  }
  
  // Обновляем состояние
  const newState = {
    ...state,
    resources: {
      ...state.resources,
      knowledge: newKnowledge,
      usdt: newUsdt
    },
    counters,
    unlocks
  };

  // После второго применения знаний разблокируем Генератор
  if (counters.applyKnowledge.value === 2 && !state.buildings.generator.unlocked) {
    const updatedBuildings = {
      ...newState.buildings,
      generator: {
        ...newState.buildings.generator,
        unlocked: true
      }
    };
    
    safeDispatchGameEvent("Разблокировано здание: Генератор", "info");
    
    return {
      ...newState,
      buildings: updatedBuildings
    };
  }
  
  return newState;
};

// Обработка добычи вычислительной мощности
export const processMiningPower = (state: GameState): GameState => {
  // Если вычислительная мощность не разблокирована, ничего не делаем
  if (!state.resources.computingPower.unlocked) {
    return state;
  }
  
  const miningBoost = Object.values(state.upgrades)
    .filter(upgrade => upgrade.purchased && upgrade.effects?.miningEfficiencyBoost)
    .reduce((total, upgrade) => total + Number(upgrade.effects.miningEfficiencyBoost), 0);
  
  // Рассчитываем добытую вычислительную мощность с учетом бустов
  const minedPower = 1 * (1 + miningBoost);
  
  // Обновляем счетчик майнинга
  let counters = { ...state.counters };
  if (counters.mining) {
    counters.mining = {
      ...counters.mining,
      value: counters.mining.value + 1
    };
  } else {
    counters.mining = {
      id: "mining",
      name: "Майнинг",
      value: 1
    };
  }
  
  // Увеличиваем количество вычислительной мощности
  const newComputingPower = {
    ...state.resources.computingPower,
    value: state.resources.computingPower.value + minedPower
  };
  
  // Обновляем состояние
  return {
    ...state,
    resources: {
      ...state.resources,
      computingPower: newComputingPower
    },
    counters
  };
};

// Обработка покупки "Практика"
export const processPracticePurchase = (state: GameState): GameState => {
  const practice = state.buildings.practice;
  
  // Проверяем, существует ли здание "практика"
  if (!practice) {
    console.error("Здание 'practice' не найдено в состоянии");
    return state;
  }
  
  // Проверяем стоимость
  if (state.resources.usdt.value < practice.cost.usdt) {
    console.warn("Недостаточно USDT для покупки здания 'practice'");
    return state;
  }
  
  // Обновляем ресурсы
  const newUsdt = {
    ...state.resources.usdt,
    value: state.resources.usdt.value - practice.cost.usdt
  };
  
  // Увеличиваем количество практик
  const newPractice = {
    ...practice,
    count: practice.count + 1
  };
  
  // Обновляем состояние
  return {
    ...state,
    resources: {
      ...state.resources,
      usdt: newUsdt
    },
    buildings: {
      ...state.buildings,
      practice: newPractice
    }
  };
};

// Обработка обмена BTC на USDT
export const processExchangeBtc = (state: GameState): GameState => {
  const btc = state.resources.btc;
  const usdt = state.resources.usdt;
  
  // Проверяем, существуют ли ресурсы
  if (!btc || !usdt) {
    console.error("Ресурсы btc или usdt не найдены в состоянии");
    return state;
  }
  
  // Проверяем, есть ли BTC для обмена
  if (btc.value <= 0) {
    console.warn("Нет BTC для обмена");
    return state;
  }
  
  // Рассчитываем курс обмена (может быть динамическим в будущем)
  const exchangeRate = state.miningParams.exchangeRate; // например, 1 BTC = 100000 USDT
  const commission = state.miningParams.exchangeCommission; // комиссия биржи, например 5%
  
  // Рассчитываем полученные USDT
  const exchangedUSDT = btc.value * exchangeRate * (1 - commission);
  
  // Обновляем ресурсы
  const newBtc = {
    ...btc,
    value: 0 // Обмениваем всё, что есть
  };
  
  const newUsdt = {
    ...usdt,
    value: usdt.value + exchangedUSDT
  };
  
  // Отправляем сообщение об обмене
  safeDispatchGameEvent(`Обменяно ${btc.value.toFixed(8)} BTC на ${exchangedUSDT.toFixed(2)} USDT`, "success");
  
  // Обновляем состояние
  return {
    ...state,
    resources: {
      ...state.resources,
      btc: newBtc,
      usdt: newUsdt
    }
  };
};
