
import { GameState } from '../types';
import { checkAllUnlocks } from '@/utils/unlockManager';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Обработка клика на "Изучить крипту"
export const processLearnAction = (state: GameState): GameState => {
  // Проверяем, разблокирован ли ресурс знаний
  if (!state.resources.knowledge?.unlocked) {
    console.warn("Попытка изучения криптовалют при заблокированном ресурсе знаний");
    return state;
  }
  
  // Ресурсы до обработки действия
  const currentKnowledge = state.resources.knowledge.value;
  
  // Увеличиваем количество знаний на 1
  const newKnowledgeValue = Math.min(
    currentKnowledge + 1,
    state.resources.knowledge.max
  );
  
  // Инкрементируем счетчик кликов по кнопке изучения
  let knowledgeClicksCounter = state.counters.knowledgeClicks || {
    id: 'knowledgeClicks',
    name: 'Клики на изучение криптовалют',
    value: 0
  };
  
  knowledgeClicksCounter = {
    ...knowledgeClicksCounter,
    value: knowledgeClicksCounter.value + 1
  };
  
  console.log(`Пользователь изучил криптовалюту. Знания: ${currentKnowledge} -> ${newKnowledgeValue}. Всего кликов: ${knowledgeClicksCounter.value}`);
  
  // Создаем новое состояние с обновленными знаниями и счетчиком
  let newState = {
    ...state,
    resources: {
      ...state.resources,
      knowledge: {
        ...state.resources.knowledge,
        value: newKnowledgeValue
      }
    },
    counters: {
      ...state.counters,
      knowledgeClicks: knowledgeClicksCounter
    }
  };
  
  // Добавляем явный вызов проверки разблокировок
  console.log("Проверяем разблокировки после изучения крипты");
  newState = checkAllUnlocks(newState);
  
  return newState;
};

// Обработка клика на "Применить знания"
export const processApplyKnowledgeAction = (state: GameState): GameState => {
  // Проверяем, разблокировано ли действие
  if (!state.unlocks.applyKnowledge) {
    console.warn("Попытка применить знания при заблокированном действии");
    return state;
  }
  
  // Требование затрат знаний
  const requiredKnowledge = 10;
  
  // Проверяем достаточно ли знаний
  if (!state.resources.knowledge || state.resources.knowledge.value < requiredKnowledge) {
    console.warn(`Недостаточно знаний для применения: ${state.resources.knowledge?.value || 0}/${requiredKnowledge}`);
    safeDispatchGameEvent(`Недостаточно знаний (${state.resources.knowledge?.value || 0}/${requiredKnowledge})`, "warning");
    return state;
  }
  
  // Получаемое количество USDT
  const usdtGain = 1;
  
  // Инкрементируем счетчик применений знаний
  let applyKnowledgeCounter = state.counters.applyKnowledge || {
    id: 'applyKnowledge',
    name: 'Применения знаний',
    value: 0
  };
  
  applyKnowledgeCounter = {
    ...applyKnowledgeCounter,
    value: applyKnowledgeCounter.value + 1
  };
  
  console.log(`Применены знания. Потрачено знаний: ${requiredKnowledge}. Получено USDT: ${usdtGain}. Всего применений: ${applyKnowledgeCounter.value}`);
  safeDispatchGameEvent(`Знания успешно применены. Получено ${usdtGain} USDT`, "success");
  
  // Создаем копию ресурсов
  let newResources = { ...state.resources };
  
  // Обновляем знания
  if (newResources.knowledge) {
    newResources.knowledge = {
      ...newResources.knowledge,
      value: Math.max(0, newResources.knowledge.value - requiredKnowledge)
    };
  }
  
  // Обновляем или создаем USDT
  if (newResources.usdt) {
    newResources.usdt = {
      ...newResources.usdt,
      value: newResources.usdt.value + usdtGain
    };
  } else {
    newResources.usdt = {
      id: 'usdt',
      name: 'USDT',
      description: 'Стейблкоин, универсальная валюта для покупок',
      type: 'currency',
      icon: 'coins',
      value: usdtGain,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 50,
      unlocked: true
    };
  }
  
  let newState = {
    ...state,
    resources: newResources,
    counters: {
      ...state.counters,
      applyKnowledge: applyKnowledgeCounter
    }
  };
  
  // Важно: явно проверяем разблокировки после применения знаний
  console.log("Проверяем разблокировки после применения знаний. Текущий счетчик:", applyKnowledgeCounter.value);
  newState = checkAllUnlocks(newState);
  
  return newState;
};

// Обработка действия "Применить все знания"
export const processApplyAllKnowledgeAction = (state: GameState): GameState => {
  // Проверяем, разблокировано ли действие
  if (!state.unlocks.applyKnowledge) {
    console.warn("Попытка применить все знания при заблокированном действии");
    return state;
  }
  
  // Проверяем наличие знаний
  if (!state.resources.knowledge || state.resources.knowledge.value < 10) {
    console.warn(`Недостаточно знаний для применения: ${state.resources.knowledge?.value || 0}/10`);
    safeDispatchGameEvent(`Недостаточно знаний (${state.resources.knowledge?.value || 0}/10)`, "warning");
    return state;
  }
  
  // Количество полных порций знаний для обмена (10 знаний = 1 USDT)
  const portions = Math.floor(state.resources.knowledge.value / 10);
  const usedKnowledge = portions * 10;
  const usdtGain = portions;
  
  console.log(`Применены все знания. Потрачено знаний: ${usedKnowledge}. Получено USDT: ${usdtGain}.`);
  safeDispatchGameEvent(`Все знания успешно применены. Получено ${usdtGain} USDT`, "success");
  
  // Создаем копию ресурсов
  let newResources = { ...state.resources };
  
  // Обновляем знания
  if (newResources.knowledge) {
    newResources.knowledge = {
      ...newResources.knowledge,
      value: Math.max(0, newResources.knowledge.value - usedKnowledge)
    };
  }
  
  // Обновляем или создаем USDT
  if (newResources.usdt) {
    newResources.usdt = {
      ...newResources.usdt,
      value: newResources.usdt.value + usdtGain
    };
  } else {
    newResources.usdt = {
      id: 'usdt',
      name: 'USDT',
      description: 'Стейблкоин, универсальная валюта для покупок',
      type: 'currency',
      icon: 'coins',
      value: usdtGain,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 50,
      unlocked: true
    };
  }
  
  let newState = {
    ...state,
    resources: newResources,
    counters: {
      ...state.counters,
      // Также инкрементируем счетчик применений знаний для правильных разблокировок
      applyKnowledge: {
        ...state.counters.applyKnowledge,
        id: 'applyKnowledge',
        name: 'Применения знаний',
        value: (state.counters.applyKnowledge?.value || 0) + 1
      }
    }
  };
  
  // Проверяем разблокировки после действия
  console.log("Проверяем разблокировки после применения всех знаний");
  newState = checkAllUnlocks(newState);
  
  return newState;
};

// Обработка действия "Майнинг"
export const processMiningPowerAction = (state: GameState): GameState => {
  // Проверяем, разблокировано ли действие
  if (!state.unlocks.miningPower) {
    console.warn("Попытка использовать вычислительную мощность при заблокированном действии");
    return state;
  }
  
  // Требования к вычислительной мощности
  const requiredPower = 50;
  
  // Проверяем достаточно ли вычислительной мощности
  if (!state.resources.computingPower || state.resources.computingPower.value < requiredPower) {
    console.warn(`Недостаточно вычислительной мощности: ${state.resources.computingPower?.value || 0}/${requiredPower}`);
    safeDispatchGameEvent(`Недостаточно вычислительной мощности (${state.resources.computingPower?.value || 0}/${requiredPower})`, "warning");
    return state;
  }
  
  // Получаемое количество USDT
  const usdtGain = 5;
  
  console.log(`Использована вычислительная мощность. Потрачено: ${requiredPower}. Получено USDT: ${usdtGain}.`);
  safeDispatchGameEvent(`Майнинг успешен. Получено ${usdtGain} USDT`, "success");
  
  // Создаем копию ресурсов
  let newResources = { ...state.resources };
  
  // Обновляем вычислительную мощность
  if (newResources.computingPower) {
    newResources.computingPower = {
      ...newResources.computingPower,
      value: Math.max(0, newResources.computingPower.value - requiredPower)
    };
  }
  
  // Обновляем или создаем USDT
  if (newResources.usdt) {
    newResources.usdt = {
      ...newResources.usdt,
      value: newResources.usdt.value + usdtGain
    };
  } else {
    newResources.usdt = {
      id: 'usdt',
      name: 'USDT',
      description: 'Стейблкоин, универсальная валюта для покупок',
      type: 'currency',
      icon: 'coins',
      value: usdtGain,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 50,
      unlocked: true
    };
  }
  
  let newState = {
    ...state,
    resources: newResources
  };
  
  // Проверяем разблокировки после действия
  return checkAllUnlocks(newState);
};

// Обработка действия "Обмен Bitcoin"
export const processExchangeBitcoinAction = (state: GameState): GameState => {
  // Проверяем, разблокировано ли действие и ресурс
  if (!state.unlocks.exchangeBitcoin || !state.resources.bitcoin?.unlocked) {
    console.warn("Попытка обменять Bitcoin при заблокированном действии или ресурсе");
    return state;
  }
  
  // Количество Bitcoin для обмена (всё доступное количество)
  const bitcoinAmount = state.resources.bitcoin?.value || 0;
  
  // Проверяем наличие Bitcoin
  if (bitcoinAmount <= 0) {
    console.warn("Нет Bitcoin для обмена");
    safeDispatchGameEvent("Нет Bitcoin для обмена", "warning");
    return state;
  }
  
  // Получаемое количество USDT (обменный курс + комиссия)
  const exchangeRate = state.miningParams?.exchangeRate || 20000;
  const commission = state.miningParams?.exchangeCommission || 0.05;
  const usdtGain = Math.floor(bitcoinAmount * exchangeRate * (1 - commission));
  
  console.log(`Обмен Bitcoin. Количество: ${bitcoinAmount}. Получено USDT: ${usdtGain}.`);
  safeDispatchGameEvent(`Bitcoin успешно обменян. Получено ${usdtGain} USDT`, "success");
  
  // Создаем копию ресурсов
  let newResources = { ...state.resources };
  
  // Обновляем Bitcoin
  if (newResources.bitcoin) {
    newResources.bitcoin = {
      ...newResources.bitcoin,
      value: 0
    };
  }
  
  // Обновляем или создаем USDT
  if (newResources.usdt) {
    newResources.usdt = {
      ...newResources.usdt,
      value: newResources.usdt.value + usdtGain
    };
  } else {
    newResources.usdt = {
      id: 'usdt',
      name: 'USDT',
      description: 'Стейблкоин, универсальная валюта для покупок',
      type: 'currency',
      icon: 'coins',
      value: usdtGain,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 50,
      unlocked: true
    };
  }
  
  let newState = {
    ...state,
    resources: newResources
  };
  
  // Проверяем разблокировки после действия
  return checkAllUnlocks(newState);
};

// Обработка покупки практики
export const processPracticePurchaseAction = (state: GameState): GameState => {
  console.log("Покупка практики запрошена");

  // Проверяем, разблокирована ли практика
  if (!state.unlocks.practice) {
    console.warn("Покупка практики невозможна - функция заблокирована");
    safeDispatchGameEvent("Покупка практики невозможна - функция недоступна", "error");
    return state;
  }

  // Определяем базовую стоимость и множитель
  const baseCost = 10;
  const costMultiplier = 1.15;
  const currentLevel = state.buildings.practice?.count || 0;
  const currentCost = Math.floor(baseCost * Math.pow(costMultiplier, currentLevel));

  // Проверяем наличие USDT
  if (!state.resources.usdt || state.resources.usdt.value < currentCost) {
    console.warn(`Недостаточно USDT для покупки практики: ${state.resources.usdt?.value || 0}/${currentCost}`);
    safeDispatchGameEvent(`Недостаточно USDT для покупки практики (${state.resources.usdt?.value || 0}/${currentCost})`, "warning");
    return state;
  }

  // Здание практики в состоянии
  const practiceBuilding = state.buildings.practice || {
    id: 'practice',
    name: 'Практика',
    description: 'Автоматическое получение знаний',
    cost: { usdt: baseCost },
    costMultiplier: costMultiplier,
    production: { knowledge: 0.63 },
    count: 0,
    unlocked: true,
    productionBoost: 0,
    resourceProduction: { knowledge: 0.63 }
  };

  // Обновляем ресурсы
  let newResources = { ...state.resources };
  
  // Обновляем USDT
  if (newResources.usdt) {
    newResources.usdt = {
      ...newResources.usdt,
      value: newResources.usdt.value - currentCost
    };
  }

  // Обновление состояния
  let newState = {
    ...state,
    resources: newResources,
    buildings: {
      ...state.buildings,
      practice: {
        ...practiceBuilding,
        count: practiceBuilding.count + 1
      }
    }
  };

  console.log(`Практика куплена успешно. Новый уровень: ${newState.buildings.practice.count}`);
  safeDispatchGameEvent(`Практика куплена. Уровень: ${newState.buildings.practice.count}`, "success");

  // Проверяем разблокировки после покупки
  return checkAllUnlocks(newState);
};

// Экспортируем функции под именами, которые используются в gameReducer
export const processLearn = processLearnAction;
export const processApplyKnowledge = processApplyKnowledgeAction;
export const processApplyAllKnowledge = processApplyAllKnowledgeAction;
export const processMiningPower = processMiningPowerAction;
export const processExchangeBtc = processExchangeBitcoinAction;
export const processPracticePurchase = processPracticePurchaseAction;
