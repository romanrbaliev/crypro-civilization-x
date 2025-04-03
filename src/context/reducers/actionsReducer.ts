import { GameState } from '../types';
import { processIncrementResource } from './resourceReducer';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Обработка покупки практики
export const processPracticePurchase = (state: GameState): GameState => {
  // Проверяем, достаточно ли USDT для покупки практики
  if (state.resources.usdt && state.resources.usdt.value >= 10) {
    // Вычитаем 10 USDT
    const newState = processIncrementResource(state, { resourceId: 'usdt', amount: -10 });
    
    // Увеличиваем счетчик практики
    return {
      ...newState,
      buildings: {
        ...newState.buildings,
        practice: {
          ...newState.buildings.practice,
          count: (newState.buildings.practice?.count || 0) + 1
        }
      }
    };
  }
  
  return state;
};

// Обработка обмена BTC на USDT
export const processExchangeBtc = (state: GameState): GameState => {
  // Проверяем, есть ли BTC для обмена
  if (state.btcBalance > 0) {
    // Рассчитываем, сколько USDT получим за обмен BTC
    const usdtToAdd = state.btcBalance * state.btcPrice;
    
    // Обнуляем баланс BTC
    const newState = {
      ...state,
      btcBalance: 0,
      usdtBalance: state.usdtBalance + usdtToAdd
    };
    
    // Возвращаем новое состояние
    return newState;
  }
  
  return state;
};

// Обработка майнинга вычислительной мощности
export const processMiningPower = (state: GameState): GameState => {
  // Проверяем, есть ли электричество для майнинга
  if (state.resources.electricity && state.resources.electricity.value >= 1) {
    // Вычитаем 1 единицу электричества
    const newState = processIncrementResource(state, { resourceId: 'electricity', amount: -1 });
    
    // Увеличиваем вычислительную мощность
    return {
      ...newState,
      miningPower: state.miningPower + 1
    };
  }
  
  return state;
};

// Обработка применения всех знаний
export const processApplyAllKnowledge = (state: GameState): GameState => {
  // Имеющиеся знания
  const knowledgeValue = state.resources.knowledge?.value || 0;
  
  // Если знаний меньше 10, ничего не делаем
  if (knowledgeValue < 10) {
    return state;
  }

  // Проверяем наличие бонуса от "Основ криптовалют"
  // Экспоненциальный поиск исследования по обоим возможным ID
  const cryptoCurrencyBasicsPurchased = 
    (state.upgrades.cryptoCurrencyBasics && state.upgrades.cryptoCurrencyBasics.purchased) || 
    (state.upgrades.cryptoBasics && state.upgrades.cryptoBasics.purchased);

  // Базовая эффективность: 1 USDT за каждые 10 знаний
  let knowledgeEfficiencyRate = 1.0;
  
  // Применяем бонус +10% если есть исследование "Основы криптовалют"
  if (cryptoCurrencyBasicsPurchased) {
    knowledgeEfficiencyRate = 1.1; // Увеличиваем на 10%
    console.log("actionsReducer: Применен бонус +10% к обмену знаний от 'Основ криптовалют'");
  }
  
  // Определяем, сколько USDT получим с учетом возможного бонуса
  const knowledgeToConvert = Math.floor(knowledgeValue / 10) * 10;
  const usdtToAdd = Math.floor(knowledgeToConvert / 10 * knowledgeEfficiencyRate * 10) / 10; // Округляем до 1 знака после запятой
  
  console.log(`actionsReducer: Обмен ${knowledgeToConvert} знаний на ${usdtToAdd} USDT (коэффициент: ${knowledgeEfficiencyRate})`);
  
  // Инкрементируем счетчик применений знаний
  const currentApplyCounter = state.counters.applyKnowledge || { id: 'applyKnowledge', name: 'Применения знаний', value: 0 };
  const applyCount = typeof currentApplyCounter === 'object' ? currentApplyCounter.value : currentApplyCounter;
  
  // Создаем копию состояния, которую будем модифицировать
  let updatedState: GameState = {
    ...state,
    counters: {
      ...state.counters,
      applyKnowledge: {
        id: 'applyKnowledge',
        name: 'Применения знаний',
        value: applyCount + 1
      }
    }
  };
  
  // Проверяем, нужно ли разблокировать USDT (после первого применения знаний)
  if ((applyCount + 1) >= 1 && !updatedState.unlocks.usdt) {
    console.log('actionsReducer: Разблокирован USDT (1+ применений знаний)');
    updatedState = {
      ...updatedState,
      unlocks: {
        ...updatedState.unlocks,
        usdt: true
      }
    } as GameState;
    
    // Разблокируем ресурс USDT
    if (updatedState.resources.usdt) {
      updatedState = {
        ...updatedState,
        resources: {
          ...updatedState.resources,
          usdt: {
            ...updatedState.resources.usdt,
            unlocked: true
          }
        }
      } as GameState;
    } else {
      // Создаем ресурс USDT, если его нет
      updatedState = {
        ...updatedState,
        resources: {
          ...updatedState.resources,
          usdt: {
            id: 'usdt',
            name: 'USDT',
            description: 'Стабильная криптовалюта для покупок',
            type: 'resource',
            icon: 'dollar',
            value: 0,
            baseProduction: 0,
            production: 0,
            perSecond: 0,
            max: 100,
            unlocked: true
          }
        }
      } as GameState;
    }
    
    // Отправляем событие о разблокировке USDT
    safeDispatchGameEvent('Разблокирован ресурс: USDT', 'success');
  }
  
  // Проверяем, нужно ли разблокировать практику (после второго применения знаний)
  if ((applyCount + 1) >= 2 && !updatedState.unlocks.practice) {
    console.log('actionsReducer: Разблокирована практика (2+ применений знаний)');
    
    updatedState = {
      ...updatedState,
      unlocks: {
        ...updatedState.unlocks,
        practice: true
      }
    } as GameState;
    
    // Разблокируем здание практики
    if (updatedState.buildings.practice) {
      updatedState = {
        ...updatedState,
        buildings: {
          ...updatedState.buildings,
          practice: {
            ...updatedState.buildings.practice,
            unlocked: true
          }
        }
      } as GameState;
    }
    
    // Отправляем событие о разблокировке практики
    safeDispatchGameEvent('Разблокировано: Практика', 'success');
  }
  
  // Уменьшаем знания
  updatedState = processIncrementResource(updatedState, { 
    resourceId: 'knowledge',
    amount: -knowledgeToConvert
  });
  
  // Увеличиваем USDT с учетом бонуса эффективности
  updatedState = processIncrementResource(updatedState, { 
    resourceId: 'usdt',
    amount: usdtToAdd
  });
  
  return updatedState;
};

// Обработка клика на "Изучить крипту"
export const processLearnKnowledgeAction = (state: GameState): GameState => {
  // Увеличиваем счетчик кликов на "Изучить крипту"
  const currentClicksCounter = state.counters.knowledgeClicks || { id: 'knowledgeClicks', name: 'Клики знаний', value: 0 };
  const clicksCount = typeof currentClicksCounter === 'object' ? currentClicksCounter.value : currentClicksCounter;
  
  // Создаем копию состояния, которую будем модифицировать
  let updatedState: GameState = {
    ...state,
    counters: {
      ...state.counters,
      knowledgeClicks: {
        id: 'knowledgeClicks',
        name: 'Клики знаний',
        value: clicksCount + 1
      }
    }
  };
  
  // Если кликов стало >= 3, разблокируем кнопку "Применить знания" (если еще не разблокирована)
  if ((clicksCount + 1) >= 3 && !updatedState.unlocks.applyKnowledge) {
    console.log('actionsReducer: Разблокирована кнопка "Применить знания" (3+ кликов на "Изучить")');
    
    updatedState = {
      ...updatedState,
      unlocks: {
        ...updatedState.unlocks,
        applyKnowledge: true
      }
    } as GameState;
    
    // Отправляем событие о разблокировке кнопки "Применить знания"
    safeDispatchGameEvent('Разблокировано: Применить знания', 'success');
  }
  
  // Обрабатываем добавление ресурса знаний
  return processIncrementResource(updatedState, { 
    resourceId: 'knowledge',
    amount: 1
  });
};

// Обработка применения знаний
export const processApplyKnowledge = (state: GameState): GameState => {
  // Имеющиеся знания
  const knowledgeValue = state.resources.knowledge?.value || 0;
  
  // Если знаний меньше 10, ничего не делаем
  if (knowledgeValue < 10) {
    return state;
  }

  // Проверяем наличие бонуса от "Основ криптовалют"
  // Экспоненциальный поиск исследования по обоим возможным ID
  const cryptoCurrencyBasicsPurchased = 
    (state.upgrades.cryptoCurrencyBasics && state.upgrades.cryptoCurrencyBasics.purchased) || 
    (state.upgrades.cryptoBasics && state.upgrades.cryptoBasics.purchased);

  // Базовая эффективность: 1 USDT за каждые 10 знаний
  let knowledgeEfficiencyRate = 1.0;
  
  // Применяем бонус +10% если есть исследование "Основы криптовалют"
  if (cryptoCurrencyBasicsPurchased) {
    knowledgeEfficiencyRate = 1.1; // Увеличиваем на 10%
    console.log("actionsReducer: Применен бонус +10% к обмену знаний от 'Основ криптовалют'");
  }
  
  // Определяем, сколько USDT получим с учетом возможного бонуса
  const knowledgeToConvert = Math.floor(knowledgeValue / 10) * 10;
  const usdtToAdd = Math.floor(knowledgeToConvert / 10 * knowledgeEfficiencyRate * 10) / 10; // Округляем до 1 знака после запятой
  
  console.log(`actionsReducer: Обмен ${knowledgeToConvert} знаний на ${usdtToAdd} USDT (коэффициент: ${knowledgeEfficiencyRate})`);
  
  // Инкрементируем счетчик применений знаний
  const currentApplyCounter = state.counters.applyKnowledge || { id: 'applyKnowledge', name: 'Применения знаний', value: 0 };
  const applyCount = typeof currentApplyCounter === 'object' ? currentApplyCounter.value : currentApplyCounter;
  
  // Создаем копию состояния, которую будем модифицировать
  let updatedState: GameState = {
    ...state,
    counters: {
      ...state.counters,
      applyKnowledge: {
        id: 'applyKnowledge',
        name: 'Применения знаний',
        value: applyCount + 1
      }
    }
  };
  
  // Проверяем, нужно ли разблокировать USDT (после первого применения знаний)
  if ((applyCount + 1) >= 1 && !updatedState.unlocks.usdt) {
    console.log('actionsReducer: Разблокирован USDT (1+ применений знаний)');
    
    updatedState = {
      ...updatedState,
      unlocks: {
        ...updatedState.unlocks,
        usdt: true
      }
    } as GameState;
    
    // Разблокируем ресурс USDT
    if (updatedState.resources.usdt) {
      updatedState = {
        ...updatedState,
        resources: {
          ...updatedState.resources,
          usdt: {
            ...updatedState.resources.usdt,
            unlocked: true
          }
        }
      } as GameState;
    } else {
      // Создаем ресурс USDT, если его нет
      updatedState = {
        ...updatedState,
        resources: {
          ...updatedState.resources,
          usdt: {
            id: 'usdt',
            name: 'USDT',
            description: 'Стабильная криптовалюта для покупок',
            type: 'resource',
            icon: 'dollar',
            value: 0,
            baseProduction: 0,
            production: 0,
            perSecond: 0,
            max: 100,
            unlocked: true
          }
        }
      } as GameState;
    }
    
    // Отправляем событие о разблокировке USDT
    safeDispatchGameEvent('Разблокирован ресурс: USDT', 'success');
  }
  
  // Проверяем, нужно ли разблокировать практику (после второго применения знаний)
  if ((applyCount + 1) >= 2 && !updatedState.unlocks.practice) {
    console.log('actionsReducer: Разблокирована практика (2+ применений знаний)');
    
    updatedState = {
      ...updatedState,
      unlocks: {
        ...updatedState.unlocks,
        practice: true
      }
    } as GameState;
    
    // Разблокируем здание практики
    if (updatedState.buildings.practice) {
      updatedState = {
        ...updatedState,
        buildings: {
          ...updatedState.buildings,
          practice: {
            ...updatedState.buildings.practice,
            unlocked: true
          }
        }
      } as GameState;
    }
    
    // Отправляем событие о разблокировке практики
    safeDispatchGameEvent('Разблокировано: Практика', 'success');
  }
  
  // Уменьшаем знания
  updatedState = processIncrementResource(updatedState, { 
    resourceId: 'knowledge',
    amount: -knowledgeToConvert
  });
  
  // Увеличиваем USDT с учетом бонуса эффективности
  updatedState = processIncrementResource(updatedState, { 
    resourceId: 'usdt',
    amount: usdtToAdd
  });
  
  return updatedState;
};
