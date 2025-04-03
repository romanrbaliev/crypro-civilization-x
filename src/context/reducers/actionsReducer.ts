
import { GameState } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

/**
 * Обработка действия "Применить знания" (обмен знаний на USDT)
 */
export const processApplyKnowledge = (state: GameState): GameState => {
  // Проверяем наличие ресурсов
  if (!state.resources.knowledge || state.resources.knowledge.value < 10) {
    return state;
  }
  
  // Вычисляем эффективность обмена (с учетом бонусов от исследований)
  const hasEfficiencyBonus = state.upgrades.cryptoCurrencyBasics?.purchased || state.upgrades.cryptoBasics?.purchased;
  const exchangeRate = hasEfficiencyBonus ? 0.11 : 0.1; // 1.1 USDT за 10 знаний с бонусом
  
  if (hasEfficiencyBonus) {
    console.log("actionsReducer: Применяется бонус +10% к обмену знаний");
  }
  
  // Обменять 10 знаний на USDT
  const newKnowledgeValue = state.resources.knowledge.value - 10;
  const usdtGain = 10 * exchangeRate; // 1 или 1.1 USDT
  
  // Проверяем, существует ли ресурс USDT
  if (!state.resources.usdt) {
    // Создаем ресурс USDT, если его нет
    const newResources = {
      ...state.resources,
      knowledge: {
        ...state.resources.knowledge,
        value: newKnowledgeValue
      },
      usdt: {
        id: 'usdt',
        name: 'USDT',
        description: 'Стейблкоин, привязанный к доллару США',
        value: usdtGain,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 50,
        unlocked: true,
        type: 'currency',
        icon: 'dollar'
      }
    };
    
    // Увеличиваем счетчик использований "Применить знания"
    const newApplyKnowledgeCount = (state.counters.applyKnowledge?.value || 0) + 1;
    
    // Отмечаем разблокировку USDT
    return {
      ...state,
      resources: newResources,
      unlocks: {
        ...state.unlocks,
        usdt: true
      },
      counters: {
        ...state.counters,
        applyKnowledge: {
          value: newApplyKnowledgeCount,
          id: 'applyKnowledge',
          name: 'Apply Knowledge Count'
        }
      }
    };
  } else {
    // Обновляем существующие ресурсы
    const newUsdtValue = state.resources.usdt.value + usdtGain;
    const newResources = {
      ...state.resources,
      knowledge: {
        ...state.resources.knowledge,
        value: newKnowledgeValue
      },
      usdt: {
        ...state.resources.usdt,
        value: Math.min(newUsdtValue, state.resources.usdt.max)
      }
    };
    
    // Увеличиваем счетчик использований "Применить знания"
    const newApplyKnowledgeCount = (state.counters.applyKnowledge?.value || 0) + 1;
    
    return {
      ...state,
      resources: newResources,
      counters: {
        ...state.counters,
        applyKnowledge: {
          value: newApplyKnowledgeCount,
          id: 'applyKnowledge',
          name: 'Apply Knowledge Count'
        }
      }
    };
  }
};

/**
 * Обработчик действия "Применить все знания"
 */
export const processApplyAllKnowledge = (state: GameState): GameState => {
  if (!state.resources.knowledge || state.resources.knowledge.value < 10) {
    return state;
  }
  
  // Вычисляем эффективность обмена (с учетом бонусов от исследований)
  const hasEfficiencyBonus = state.upgrades.cryptoCurrencyBasics?.purchased || state.upgrades.cryptoBasics?.purchased;
  const exchangeRate = hasEfficiencyBonus ? 0.11 : 0.1; // 1.1 USDT за 10 знаний с бонусом
  
  if (hasEfficiencyBonus) {
    console.log("actionsReducer: Применяется бонус +10% к обмену всех знаний");
  }
  
  // Рассчитываем, сколько знаний можно обменять (кратно 10)
  const knowledgeToExchange = Math.floor(state.resources.knowledge.value / 10) * 10;
  const usdtGain = knowledgeToExchange * exchangeRate;
  
  // Если нечего обменивать, возвращаем исходное состояние
  if (knowledgeToExchange === 0) {
    return state;
  }
  
  // Вычитаем обмененные знания
  const newKnowledgeValue = state.resources.knowledge.value - knowledgeToExchange;
  
  // Проверяем, существует ли ресурс USDT
  if (!state.resources.usdt) {
    // Создаем ресурс USDT, если его нет
    const newResources = {
      ...state.resources,
      knowledge: {
        ...state.resources.knowledge,
        value: newKnowledgeValue
      },
      usdt: {
        id: 'usdt',
        name: 'USDT',
        description: 'Стейблкоин, привязанный к доллару США',
        value: usdtGain,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 50,
        unlocked: true,
        type: 'currency',
        icon: 'dollar'
      }
    };
    
    // Увеличиваем счетчик использований "Применить знания"
    const newApplyKnowledgeCount = (state.counters.applyKnowledge?.value || 0) + Math.ceil(knowledgeToExchange / 10);
    
    // Отмечаем разблокировку USDT
    return {
      ...state,
      resources: newResources,
      unlocks: {
        ...state.unlocks,
        usdt: true
      },
      counters: {
        ...state.counters,
        applyKnowledge: {
          value: newApplyKnowledgeCount,
          id: 'applyKnowledge',
          name: 'Apply Knowledge Count'
        }
      }
    };
  } else {
    // Обновляем существующие ресурсы
    const newUsdtValue = Math.min(state.resources.usdt.value + usdtGain, state.resources.usdt.max);
    const newResources = {
      ...state.resources,
      knowledge: {
        ...state.resources.knowledge,
        value: newKnowledgeValue
      },
      usdt: {
        ...state.resources.usdt,
        value: newUsdtValue
      }
    };
    
    // Увеличиваем счетчик использований "Применить знания"
    const newApplyKnowledgeCount = (state.counters.applyKnowledge?.value || 0) + Math.ceil(knowledgeToExchange / 10);
    
    return {
      ...state,
      resources: newResources,
      counters: {
        ...state.counters,
        applyKnowledge: {
          value: newApplyKnowledgeCount,
          id: 'applyKnowledge',
          name: 'Apply Knowledge Count'
        }
      }
    };
  }
};

/**
 * Обработчик действия "Обменять Bitcoin"
 */
export const processExchangeBtc = (state: GameState): GameState => {
  // Проверяем, есть ли биткоин для обмена
  if (!state.resources.bitcoin || state.resources.bitcoin.value <= 0) {
    // Нет биткоина для обмена
    safeDispatchGameEvent('Нет Bitcoin для обмена', 'error');
    return state;
  }
  
  // Получаем курс обмена и комиссию
  const exchangeRate = state.miningParams?.exchangeRate || 20000; // USDT за 1 BTC
  const commission = state.miningParams?.exchangeCommission || 0.01; // 1% комиссия
  
  // Рассчитываем, сколько биткоина можно обменять (весь имеющийся)
  const btcToExchange = state.resources.bitcoin.value;
  
  // Рассчитываем, сколько USDT получим
  const usdtGain = btcToExchange * exchangeRate * (1 - commission);
  
  // Создаем копию ресурсов с правильной типизацией
  const newResources: typeof state.resources = {
    ...state.resources,
    bitcoin: {
      ...state.resources.bitcoin,
      value: 0 // Обмениваем весь биткоин
    }
  };
  
  // Проверяем наличие USDT в ресурсах и добавляем его с правильным типом
  if ('usdt' in newResources) {
    // Если USDT уже существует, обновляем его
    newResources.usdt = {
      ...newResources.usdt,
      value: Math.min(newResources.usdt.value + usdtGain, newResources.usdt.max || Infinity)
    };
  } else {
    // Если USDT не существует, создаем его
    newResources.usdt = {
      id: 'usdt',
      name: 'USDT',
      description: 'Стейблкоин, привязанный к доллару США',
      value: usdtGain,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 50,
      unlocked: true,
      type: 'currency',
      icon: 'dollar'
    };
  }
  
  // Обновляем состояние
  const newState = {
    ...state,
    resources: newResources,
    unlocks: {
      ...state.unlocks,
      usdt: true
    }
  };
  
  safeDispatchGameEvent(`Обменяно ${btcToExchange.toFixed(8)} BTC на ${usdtGain.toFixed(2)} USDT`, 'success');
  
  return newState;
};

/**
 * Обработчик действия "Майнинг вычислительной мощности"
 */
export const processMiningPower = (state: GameState): GameState => {
  // Проверка, достаточно ли вычислительной мощности для майнинга
  const requiredComputingPower = 2; // Требуется 2 единицы вычислительной мощности
  
  if (!state.resources.computingPower || state.resources.computingPower.value < requiredComputingPower) {
    // Недостаточно вычислительной мощности
    safeDispatchGameEvent('Недостаточно вычислительной мощности для майнинга', 'error');
    return state;
  }
  
  // Майнинг потребляет вычислительную мощность и дает USDT
  const usdtGain = 1; // Базовое количество USDT за одно нажатие
  
  // Создаем копию ресурсов
  const newResources = { ...state.resources };
  
  // Обновляем вычислительную мощность
  newResources.computingPower = {
    ...newResources.computingPower,
    value: newResources.computingPower.value - requiredComputingPower
  };
  
  // Обновляем или создаем USDT
  if ('usdt' in newResources && newResources.usdt) {
    // Если USDT уже есть, добавляем к текущему значению
    newResources.usdt = {
      ...newResources.usdt,
      value: Math.min(newResources.usdt.value + usdtGain, newResources.usdt.max || Infinity)
    };
  } else {
    // Если USDT еще нет, создаем его
    newResources.usdt = {
      id: 'usdt',
      name: 'USDT',
      description: 'Стейблкоин, привязанный к доллару США',
      value: usdtGain,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 50,
      unlocked: true,
      type: 'currency',
      icon: 'dollar'
    };
  }
  
  // Обновляем состояние
  const newState = {
    ...state,
    resources: newResources,
    unlocks: {
      ...state.unlocks,
      usdt: true // Разблокируем USDT
    }
  };
  
  safeDispatchGameEvent(`Майнинг успешен! Получено ${usdtGain} USDT`, 'success');
  
  return newState;
};

/**
 * Обработчик покупки здания "Практика"
 */
export const processPracticePurchase = (state: GameState): GameState => {
  // Здесь может быть дополнительная логика при покупке Практики
  return state;
};
