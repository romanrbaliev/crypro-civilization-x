
import { GameState } from '../types';
import { processIncrementResource } from './resourceReducer';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

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

// Обработка применения знаний
export const processApplyAllKnowledge = (state: GameState): GameState => {
  // Имеющиеся знания
  const knowledgeValue = state.resources.knowledge?.value || 0;
  
  // Если знаний меньше 10, ничего не делаем
  if (knowledgeValue < 10) {
    return state;
  }
  
  // Определяем, сколько USDT получим (1 USDT за каждые 10 знаний)
  const knowledgeToConvert = Math.floor(knowledgeValue / 10) * 10;
  const usdtToAdd = Math.floor(knowledgeToConvert / 10);
  
  // Инкрементируем счетчик применений знаний
  const currentApplyCounter = state.counters.applyKnowledge || { id: 'applyKnowledge', name: 'Применения знаний', value: 0 };
  const applyCount = typeof currentApplyCounter === 'object' ? currentApplyCounter.value : currentApplyCounter;
  
  // Создаем новое состояние с обновленным счетчиком
  let newState = {
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
  if ((applyCount + 1) >= 1 && !newState.unlocks.usdt) {
    console.log('actionsReducer: Разблокирован USDT (1+ применений знаний)');
    newState.unlocks.usdt = true;
    
    // Разблокируем ресурс USDT
    if (newState.resources.usdt) {
      newState.resources.usdt = {
        ...newState.resources.usdt,
        unlocked: true
      };
    } else {
      // Создаем ресурс USDT, если его нет
      newState.resources.usdt = {
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
      };
    }
    
    // Отправляем событие о разблокировке USDT
    safeDispatchGameEvent('Разблокирован ресурс: USDT', 'success');
  }
  
  // Проверяем, нужно ли разблокировать практику (после второго применения знаний)
  if ((applyCount + 1) >= 2 && !newState.unlocks.practice) {
    console.log('actionsReducer: Разблокирована практика (2+ применений знаний)');
    newState.unlocks.practice = true;
    
    // Разблокируем здание практики
    if (newState.buildings.practice) {
      newState.buildings.practice = {
        ...newState.buildings.practice,
        unlocked: true
      };
    }
    
    // Отправляем событие о разблокировке практики
    safeDispatchGameEvent('Разблокировано: Практика', 'success');
  }
  
  // Уменьшаем знания
  newState = processIncrementResource(newState, { 
    resourceId: 'knowledge',
    amount: -knowledgeToConvert
  });
  
  // Увеличиваем USDT
  newState = processIncrementResource(newState, { 
    resourceId: 'usdt',
    amount: usdtToAdd
  });
  
  return newState;
};

// Обработка клика на "Изучить крипту"
export const processLearnKnowledgeAction = (state: GameState): GameState => {
  // Увеличиваем счетчик кликов на "Изучить крипту"
  const currentClicksCounter = state.counters.knowledgeClicks || { id: 'knowledgeClicks', name: 'Клики знаний', value: 0 };
  const clicksCount = typeof currentClicksCounter === 'object' ? currentClicksCounter.value : currentClicksCounter;
  
  // Создаем новое состояние с обновленным счетчиком
  const newState = {
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
  if ((clicksCount + 1) >= 3 && !newState.unlocks.applyKnowledge) {
    console.log('actionsReducer: Разблокирована кнопка "Применить знания" (3+ кликов на "Изучить")');
    newState.unlocks.applyKnowledge = true;
    
    // Отправляем событие о разблокировке кнопки "Применить знания"
    safeDispatchGameEvent('Разблокировано: Применить знания', 'success');
  }
  
  // Обрабатываем добавление ресурса знаний
  return processIncrementResource(newState, { 
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
  
  // Определяем, сколько USDT получим (1 USDT за каждые 10 знаний)
  const knowledgeToConvert = Math.floor(knowledgeValue / 10) * 10;
  const usdtToAdd = Math.floor(knowledgeToConvert / 10);
  
  // Инкрементируем счетчик применений знаний
  const currentApplyCounter = state.counters.applyKnowledge || { id: 'applyKnowledge', name: 'Применения знаний', value: 0 };
  const applyCount = typeof currentApplyCounter === 'object' ? currentApplyCounter.value : currentApplyCounter;
  
  // Создаем новое состояние с обновленным счетчиком
  let newState = {
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
  if ((applyCount + 1) >= 1 && !newState.unlocks.usdt) {
    console.log('actionsReducer: Разблокирован USDT (1+ применений знаний)');
    newState.unlocks.usdt = true;
    
    // Разблокируем ресурс USDT
    if (newState.resources.usdt) {
      newState.resources.usdt = {
        ...newState.resources.usdt,
        unlocked: true
      };
    } else {
      // Создаем ресурс USDT, если его нет
      newState.resources.usdt = {
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
      };
    }
    
    // Отправляем событие о разблокировке USDT
    safeDispatchGameEvent('Разблокирован ресурс: USDT', 'success');
  }
  
  // Проверяем, нужно ли разблокировать практику (после второго применения знаний)
  if ((applyCount + 1) >= 2 && !newState.unlocks.practice) {
    console.log('actionsReducer: Разблокирована практика (2+ применений знаний)');
    newState.unlocks.practice = true;
    
    // Разблокируем здание практики
    if (newState.buildings.practice) {
      newState.buildings.practice = {
        ...newState.buildings.practice,
        unlocked: true
      };
    }
    
    // Отправляем событие о разблокировке практики
    safeDispatchGameEvent('Разблокировано: Практика', 'success');
  }
  
  // Уменьшаем знания
  newState = processIncrementResource(newState, { 
    resourceId: 'knowledge',
    amount: -knowledgeToConvert
  });
  
  // Увеличиваем USDT
  newState = processIncrementResource(newState, { 
    resourceId: 'usdt',
    amount: usdtToAdd
  });
  
  return newState;
};
