
import { GameState, Resource } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { checkAllUnlocks } from '@/utils/unlockManager';

/**
 * Обработчик действия "Применить знания" - конвертирует знания в USDT
 */
export const processApplyKnowledge = (state: GameState): GameState => {
  // Проверяем наличие ресурсов
  if (!state.resources.knowledge || !state.resources.usdt) {
    console.error("Ошибка: Ресурсы knowledge или usdt отсутствуют в состоянии");
    return state;
  }

  // Получаем текущие значения
  const knowledgeValue = state.resources.knowledge.value;
  const usdtValue = state.resources.usdt.value;

  // Минимальное количество знаний для конвертации
  const requiredKnowledge = 10;
  
  // Проверяем, достаточно ли знаний для конвертации
  if (knowledgeValue < requiredKnowledge) {
    console.log(`Недостаточно знаний для конвертации (${knowledgeValue}/${requiredKnowledge})`);
    return state;
  }

  // Базовая награда за применение знаний (1 USDT за 10 знаний)
  let usdtReward = 1;
  
  // Применяем бонус если есть исследование "Основы криптовалют"
  if (state.upgrades.cryptoCurrencyBasics && state.upgrades.cryptoCurrencyBasics.purchased) {
    usdtReward = Math.floor(usdtReward * 1.1); // +10% от исследования
  }

  // Создаем копию состояния для обновления
  const newState: GameState = {
    ...state,
    resources: {
      ...state.resources,
      knowledge: {
        ...state.resources.knowledge,
        value: knowledgeValue - requiredKnowledge
      },
      usdt: {
        ...state.resources.usdt,
        value: usdtValue + usdtReward
      }
    }
  };

  // Увеличиваем счетчик применений знаний, если он еще не существует
  if (!newState.counters.applyKnowledge) {
    newState.counters = {
      ...newState.counters,
      applyKnowledge: { id: "applyKnowledge", name: "Применения знаний", value: 1 }
    };
  } else if (typeof newState.counters.applyKnowledge === 'object') {
    newState.counters = {
      ...newState.counters,
      applyKnowledge: {
        ...newState.counters.applyKnowledge,
        value: newState.counters.applyKnowledge.value + 1
      }
    };
  }

  console.log(`Применены знания: -${requiredKnowledge} знаний, +${usdtReward} USDT, счетчик: ${newState.counters.applyKnowledge?.value || 1}`);
  
  // Проверяем все разблокировки после применения знаний
  return checkAllUnlocks(newState);
};

/**
 * Обработчик действия "Применить все знания" - конвертирует все доступные знания в USDT
 */
export const processApplyAllKnowledge = (state: GameState): GameState => {
  // Проверяем наличие ресурсов
  if (!state.resources.knowledge || !state.resources.usdt) {
    console.error("Ошибка: Ресурсы knowledge или usdt отсутствуют в состоянии");
    return state;
  }

  // Получаем текущие значения
  const knowledgeValue = state.resources.knowledge.value;
  const usdtValue = state.resources.usdt.value;

  // Минимальное количество знаний для конвертации
  const requiredKnowledge = 10;
  
  // Проверяем, достаточно ли знаний для конвертации
  if (knowledgeValue < requiredKnowledge) {
    console.log(`Недостаточно знаний для конвертации (${knowledgeValue}/${requiredKnowledge})`);
    return state;
  }

  // Определяем, сколько полных конвертаций можно сделать
  const conversions = Math.floor(knowledgeValue / requiredKnowledge);
  const knowledgeUsed = conversions * requiredKnowledge;
  
  // Базовая награда за применение знаний (1 USDT за 10 знаний)
  let usdtReward = conversions;
  
  // Применяем бонус если есть исследование "Основы криптовалют"
  if (state.upgrades.cryptoCurrencyBasics && state.upgrades.cryptoCurrencyBasics.purchased) {
    usdtReward = Math.floor(usdtReward * 1.1); // +10% от исследования
  }

  // Создаем копию состояния для обновления
  let newState: GameState = {
    ...state,
    resources: {
      ...state.resources,
      knowledge: {
        ...state.resources.knowledge,
        value: knowledgeValue - knowledgeUsed
      },
      usdt: {
        ...state.resources.usdt,
        value: usdtValue + usdtReward
      }
    }
  };
  
  // Убедимся что счетчик applyKnowledge инициализирован
  if (!newState.counters.applyKnowledge) {
    newState.counters = {
      ...newState.counters,
      applyKnowledge: { id: "applyKnowledge", name: "Применения знаний", value: 1 }
    };
  } else if (typeof newState.counters.applyKnowledge === 'object') {
    newState.counters = {
      ...newState.counters,
      applyKnowledge: {
        ...newState.counters.applyKnowledge,
        value: newState.counters.applyKnowledge.value + 1
      }
    };
  }
  
  console.log(`Применены все знания: -${knowledgeUsed} знаний, +${usdtReward} USDT, счетчик: ${newState.counters.applyKnowledge?.value || 1}`);
  
  // Проверяем все разблокировки после применения знаний
  return checkAllUnlocks(newState);
};

/**
 * Обработчик действия "Майнинг" - использование вычислительной мощности для добычи ресурсов
 */
export const processMiningPower = (state: GameState): GameState => {
  // Проверяем наличие ресурсов
  if (!state.resources.computingPower) {
    console.error("Ошибка: Ресурс computingPower отсутствует в состоянии");
    return state;
  }

  // Получаем текущие значения
  const computingPowerValue = state.resources.computingPower.value;
  
  // Минимальное количество вычислительной мощности для майнинга
  const requiredPower = 50;
  
  // Проверяем, достаточно ли вычислительной мощности
  if (computingPowerValue < requiredPower) {
    console.log(`Недостаточно вычислительной мощности (${computingPowerValue}/${requiredPower})`);
    return state;
  }

  // Базовая награда BTC за майнинг
  const btcReward = 0.00001;
  let updatedResources = { ...state.resources };
  
  // Обновляем вычислительную мощность
  updatedResources.computingPower = {
    ...updatedResources.computingPower,
    value: computingPowerValue - requiredPower
  };
  
  // Проверяем существование ресурса bitcoin
  if (!updatedResources.bitcoin) {
    // Если bitcoin не существует, создаем его
    updatedResources.bitcoin = {
      id: "bitcoin",
      name: "Bitcoin",
      description: "Первая и самая известная криптовалюта",
      value: btcReward,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 0.01,
      unlocked: true,
      type: "currency",
      icon: "bitcoin"
    };
  } else {
    // Если bitcoin существует, увеличиваем его значение
    updatedResources.bitcoin = {
      ...updatedResources.bitcoin,
      value: updatedResources.bitcoin.value + btcReward
    };
  }
  
  // Создаем новое состояние с обновленными ресурсами
  const newState: GameState = {
    ...state,
    resources: updatedResources
  };
  
  console.log(`Майнинг: -${requiredPower} вычислительной мощности, +${btcReward} BTC`);
  
  // Проверяем все разблокировки после майнинга
  return checkAllUnlocks(newState);
};

/**
 * Обработчик действия "Обмен Bitcoin" - конвертирует BTC в USDT
 */
export const processExchangeBtc = (state: GameState): GameState => {
  // Проверяем наличие ресурсов
  if (!state.resources.bitcoin || !state.resources.usdt) {
    console.error("Ошибка: Ресурсы bitcoin или usdt отсутствуют в состоянии");
    return state;
  }

  // Получаем текущие значения
  const btcValue = state.resources.bitcoin.value;
  const usdtValue = state.resources.usdt.value;
  
  // Проверяем, есть ли биткоины для обмена
  if (btcValue <= 0) {
    console.log("Нет Bitcoin для обмена");
    return state;
  }

  // Получаем курс и комиссию из состояния
  const exchangeRate = state.miningParams?.exchangeRate || 20000; // Стандартная цена BTC
  const commission = state.miningParams?.exchangeCommission || 0.05; // Стандартная комиссия 5%
  
  // Расчет получаемых USDT
  const usdtAmount = btcValue * exchangeRate;
  const commissionAmount = usdtAmount * commission;
  const finalUsdtAmount = usdtAmount - commissionAmount;
  
  // Создаем копию состояния для обновления
  const newState: GameState = {
    ...state,
    resources: {
      ...state.resources,
      bitcoin: {
        ...state.resources.bitcoin,
        value: 0 // Обмениваем все биткоины
      },
      usdt: {
        ...state.resources.usdt,
        value: usdtValue + finalUsdtAmount
      }
    }
  };
  
  console.log(`Обмен Bitcoin: -${btcValue} BTC, +${finalUsdtAmount} USDT (курс: ${exchangeRate}, комиссия: ${commission * 100}%)`);
  
  // Проверяем все разблокировки после обмена
  return checkAllUnlocks(newState);
};

/**
 * Обработчик покупки здания "Практика"
 */
export const processPracticePurchase = (state: GameState): GameState => {
  // Проверяем существование здания
  if (!state.buildings.practice) {
    console.error("Ошибка: Здание practice отсутствует в состоянии");
    return state;
  }

  // Получаем текущий уровень и стоимость
  const practiceLevel = state.buildings.practice.count;
  const baseCost = state.buildings.practice.cost.usdt;
  const costMultiplier = state.buildings.practice.costMultiplier || 1.15;
  
  // Вычисляем стоимость на текущем уровне
  const currentCost = Math.floor(baseCost * Math.pow(costMultiplier, practiceLevel));
  
  // Проверяем наличие достаточного количества USDT
  if (!state.resources.usdt || state.resources.usdt.value < currentCost) {
    console.log(`Недостаточно USDT для покупки практики (${state.resources.usdt?.value || 0}/${currentCost})`);
    return state;
  }
  
  // Создаем обновленное состояние
  const newState: GameState = {
    ...state,
    resources: {
      ...state.resources,
      usdt: {
        ...state.resources.usdt,
        value: state.resources.usdt.value - currentCost
      }
    },
    buildings: {
      ...state.buildings,
      practice: {
        ...state.buildings.practice,
        count: practiceLevel + 1
      }
    }
  };
  
  console.log(`Куплена практика уровня ${practiceLevel + 1} за ${currentCost} USDT`);
  
  // После покупки проверяем разблокировки
  return checkAllUnlocks(newState);
};

// Создаем алиасы для совместимости с существующим кодом
export const processApplyKnowledgeAction = processApplyKnowledge;
export const processApplyAllKnowledgeAction = processApplyAllKnowledge;
