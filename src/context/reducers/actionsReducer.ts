import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { processIncrementCounter } from './unlockReducer';

/**
 * Обработка действия "Применить знания" (обмен знаний на USDT)
 */
export const processApplyKnowledge = (state: GameState): GameState => {
  console.log("actionsReducer: Начало обработки Apply Knowledge");
  
  // Проверяем наличие знаний
  if (!state.resources.knowledge || state.resources.knowledge.value < 10) {
    console.log(`Недостаточно знаний: ${state.resources.knowledge?.value || 0}`);
    return state;
  }
  
  // Увеличиваем счетчик применений знаний
  let newState = processIncrementCounter(state, { counterId: 'applyKnowledge' });
  
  // Количество USDT для обмена (основано на количестве знаний)
  const knowledgeValue = state.resources.knowledge.value;
  const exchangeRate = 10; // 10 знаний на 1 USDT
  
  // ИСПРАВЛЕНИЕ: Увеличиваем эффективность обмена с учётом бонусов
  let efficiencyBonus = 1.0; // Базовая эффективность
  
  // Проверяем наличие улучшения "Основы криптовалют"
  const hasCryptoBasics = 
    newState.upgrades.cryptoCurrencyBasics?.purchased || 
    newState.upgrades.cryptoBasics?.purchased;
    
  if (hasCryptoBasics) {
    // +10% к эффективности применения знаний
    efficiencyBonus += 0.1;
    console.log("actionsReducer: Применен бонус Основы криптовалют (+10%)");
  }
  
  // Количество знаний для обмена: максимальное кратное 10
  const knowledgeToExchange = Math.floor(knowledgeValue / exchangeRate) * exchangeRate;
  
  // Вычисляем количество USDT (с учётом бонусов)
  const usdtToReceive = Math.floor(knowledgeToExchange / exchangeRate) * efficiencyBonus;
  
  // Если нет знаний для обмена или не найден ресурс USDT
  if (knowledgeToExchange === 0) {
    console.log("actionsReducer: Недостаточно знаний для обмена");
    return state;
  }
  
  // ИСПРАВЛЕНИЕ: Проверяем наличие USDT и создаем или разблокируем при необходимости
  if (!newState.resources.usdt) {
    console.log("actionsReducer: Ресурс USDT отсутствует, создаем его");
    
    // Создаем ресурс USDT
    newState = {
      ...newState,
      resources: {
        ...newState.resources,
        usdt: {
          id: 'usdt',
          name: 'USDT',
          description: 'Стейблкоин, привязанный к стоимости доллара США',
          value: 0,
          baseProduction: 0,
          production: 0,
          perSecond: 0,
          max: 50,
          unlocked: true,
          type: 'currency',
          icon: 'dollar'
        }
      },
      unlocks: {
        ...newState.unlocks,
        usdt: true
      }
    };
  } else if (!newState.resources.usdt.unlocked) {
    console.log("actionsReducer: Ресурс USDT заблокирован, разблокируем его");
    
    // Разблокируем USDT
    newState = {
      ...newState,
      resources: {
        ...newState.resources,
        usdt: {
          ...newState.resources.usdt,
          unlocked: true
        }
      },
      unlocks: {
        ...newState.unlocks,
        usdt: true
      }
    };
  }
  
  // Применяем обмен: вычитаем знания и добавляем USDT
  console.log(`actionsReducer: Обмен ${knowledgeToExchange} знаний на ${usdtToReceive} USDT (бонус: ${efficiencyBonus}x)`);
  
  newState = {
    ...newState,
    resources: {
      ...newState.resources,
      knowledge: {
        ...newState.resources.knowledge,
        value: knowledgeValue - knowledgeToExchange
      },
      usdt: {
        ...newState.resources.usdt,
        value: newState.resources.usdt.value + usdtToReceive
      }
    }
  };
  
  // Отправляем событие
  safeDispatchGameEvent(`${knowledgeToExchange} знаний обменяно на ${usdtToReceive} USDT`, "success");
  
  console.log(`actionsReducer: После обмена: Знания=${newState.resources.knowledge.value}, USDT=${newState.resources.usdt.value}`);
  
  return newState;
};

/**
 * Обработчик действия "Применить все знания"
 */
export const processApplyAllKnowledge = (state: GameState): GameState => {
  console.log("actionsReducer: Начало обработки Apply All Knowledge");
  
  // Если недостаточно знаний для обмена
  if (!state.resources.knowledge || state.resources.knowledge.value < 10) {
    console.log(`Недостаточно знаний: ${state.resources.knowledge?.value || 0}`);
    return state;
  }
  
  // Один раз инкрементируем счетчик применений знаний
  let newState = processIncrementCounter(state, { counterId: 'applyKnowledge' });
  
  // Количество USDT для обмена (основано на количестве знаний)
  const knowledgeValue = newState.resources.knowledge.value;
  const exchangeRate = 10; // 10 знаний на 1 USDT
  
  // ИСПРАВЛЕНИЕ: Увеличиваем эффективность обмена с учётом бонусов
  let efficiencyBonus = 1.0; // Базовая эффективность
  
  // Проверяем наличие улучшения "Основы криптовалют"
  const hasCryptoBasics = 
    newState.upgrades.cryptoCurrencyBasics?.purchased || 
    newState.upgrades.cryptoBasics?.purchased;
    
  if (hasCryptoBasics) {
    // +10% к эффективности применения знаний
    efficiencyBonus += 0.1;
    console.log("actionsReducer: Применен бонус Основы криптовалют (+10%)");
  }
  
  // Количество знаний для обмена: максимальное кратное 10
  const knowledgeToExchange = Math.floor(knowledgeValue / exchangeRate) * exchangeRate;
  
  // Вычисляем количество USDT (с учётом бонусов)
  const usdtToReceive = Math.floor(knowledgeToExchange / exchangeRate) * efficiencyBonus;
  
  // Если нет знаний для обмена или не найден ресурс USDT
  if (knowledgeToExchange === 0) {
    console.log("actionsReducer: Недостаточно знаний для обмена");
    return state;
  }
  
  // ИСПРАВЛЕНИЕ: Проверяем наличие USDT и создаем или разблокируем при необходимости
  if (!newState.resources.usdt) {
    console.log("actionsReducer: Ресурс USDT отсутствует, создаем его");
    
    // Создаем ресурс USDT
    newState = {
      ...newState,
      resources: {
        ...newState.resources,
        usdt: {
          id: 'usdt',
          name: 'USDT',
          description: 'Стейблкоин, привязанный к стоимости доллара США',
          value: 0,
          baseProduction: 0,
          production: 0,
          perSecond: 0,
          max: 50,
          unlocked: true,
          type: 'currency',
          icon: 'dollar'
        }
      },
      unlocks: {
        ...newState.unlocks,
        usdt: true
      }
    };
  } else if (!newState.resources.usdt.unlocked) {
    console.log("actionsReducer: Ресурс USDT заблокирован, разблокируем его");
    
    // Разблокируем USDT
    newState = {
      ...newState,
      resources: {
        ...newState.resources,
        usdt: {
          ...newState.resources.usdt,
          unlocked: true
        }
      },
      unlocks: {
        ...newState.unlocks,
        usdt: true
      }
    };
  }
  
  // Применяем обмен: вычитаем знания и добавляем USDT
  console.log(`actionsReducer: Обмен всех ${knowledgeToExchange} знаний на ${usdtToReceive} USDT (бонус: ${efficiencyBonus}x)`);
  
  newState = {
    ...newState,
    resources: {
      ...newState.resources,
      knowledge: {
        ...newState.resources.knowledge,
        value: knowledgeValue - knowledgeToExchange
      },
      usdt: {
        ...newState.resources.usdt,
        value: newState.resources.usdt.value + usdtToReceive
      }
    }
  };
  
  // Отправляем событие
  safeDispatchGameEvent(`${knowledgeToExchange} знаний обменяно на ${usdtToReceive} USDT`, "success");
  
  console.log(`actionsReducer: После обмена: Знания=${newState.resources.knowledge.value}, USDT=${newState.resources.usdt.value}`);
  
  return newState;
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
