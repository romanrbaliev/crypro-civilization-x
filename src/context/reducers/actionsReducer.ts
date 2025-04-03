
import { GameState, Resource } from '../types';
import { hasEnoughResources } from '../utils/resourceUtils';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { checkSpecialUnlocks } from '@/utils/unlockSystem';

// Обработка применения знаний
export const processApplyKnowledge = (state: GameState): GameState => {
  // Проверка наличия знаний
  if (state.resources.knowledge?.value < 10) {
    safeDispatchGameEvent("Недостаточно знаний для применения", "error");
    return state;
  }
  
  // Расчет количества USDT, которое будет получено
  const knowledgeToApply = Math.floor(state.resources.knowledge.value / 10) * 10;
  const usdtToReceive = Math.floor(knowledgeToApply / 10);
  
  // Обмен знаний на USDT
  const newKnowledgeValue = state.resources.knowledge.value - knowledgeToApply;
  
  // Определение нового значения USDT
  const currentUsdt = state.resources.usdt?.value || 0;
  const newUsdtValue = currentUsdt + usdtToReceive;
  
  // Проверка максимального значения USDT
  const usdtMax = state.resources.usdt?.max || Infinity;
  const finalUsdtValue = Math.min(newUsdtValue, usdtMax);
  
  // Увеличиваем счетчик применения знаний
  let counters = { ...state.counters };
  if (!counters.applyKnowledge) {
    counters.applyKnowledge = { id: 'applyKnowledge', name: 'Применение знаний', value: 1 };
  } else {
    counters.applyKnowledge = { 
      ...counters.applyKnowledge,
      value: counters.applyKnowledge.value + 1
    };
  }

  console.log('processApplyKnowledge: Применение знаний, разблокировка USDT', { 
    knowledgeToApply, 
    usdtToReceive,
    currentUSDT: currentUsdt,
    newUSDT: finalUsdtValue
  });
  
  // Создаем новое состояние с явной разблокировкой USDT
  let newResources = { ...state.resources };
  
  // Обновляем значение knowledge
  if (newResources.knowledge) {
    newResources.knowledge = {
      ...newResources.knowledge,
      value: newKnowledgeValue
    };
  }
  
  // Обновляем или создаем USDT
  if (newResources.usdt) {
    newResources.usdt = {
      ...newResources.usdt,
      value: finalUsdtValue,
      unlocked: true
    };
  } else {
    newResources.usdt = {
      id: 'usdt',
      name: 'USDT',
      description: 'Стейблкоин, универсальная валюта для покупок',
      type: 'currency',
      icon: 'dollar',
      value: finalUsdtValue,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 50,
      unlocked: true
    };
  }
  
  const newState = {
    ...state,
    resources: newResources,
    unlocks: {
      ...state.unlocks,
      usdt: true // Явно устанавливаем флаг разблокировки
    },
    counters
  };
  
  // Отправляем событие об обмене
  safeDispatchGameEvent(`Обменяно ${knowledgeToApply} знаний на ${usdtToReceive} USDT`, "success");
  
  // Применяем любые другие разблокировки, которые могут быть основаны на USDT
  const finalState = checkSpecialUnlocks(newState);
  
  // Дополнительная проверка
  console.log('USDT после применения знаний:', { 
    unlocked: finalState.resources.usdt?.unlocked,
    value: finalState.resources.usdt?.value,
    flag: finalState.unlocks.usdt
  });
  
  return finalState;
};

// Обработка применения всех знаний
export const processApplyAllKnowledge = (state: GameState): GameState => {
  return processApplyKnowledge(state);
};

// Обработка майнинга
export const processMiningPower = (state: GameState): GameState => {
  // Реализация майнинга
  return state;
};

// Обработка обмена BTC на USDT
export const processExchangeBtc = (state: GameState): GameState => {
  // Проверка наличия BTC
  if (!state.resources.bitcoin || state.resources.bitcoin.value <= 0) {
    safeDispatchGameEvent("Нет Bitcoin для обмена", "error");
    return state;
  }
  
  // Расчет курса обмена
  const btcAmount = state.resources.bitcoin.value;
  const btcPrice = state.btcPrice || 20000; // Цена BTC в USDT
  
  // Расчет комиссии
  const commission = state.miningParams?.exchangeCommission || 0.02; // 2% комиссия по умолчанию
  
  // Расчет получаемой суммы
  const usdtAmount = btcAmount * btcPrice * (1 - commission);
  
  // Обновление состояния
  const newState = {
    ...state,
    resources: {
      ...state.resources,
      bitcoin: {
        ...state.resources.bitcoin,
        value: 0 // Обмениваем всё количество
      },
      usdt: {
        ...state.resources.usdt,
        value: state.resources.usdt.value + usdtAmount,
        unlocked: true // Гарантируем, что USDT разблокирован
      }
    },
    unlocks: {
      ...state.unlocks,
      usdt: true // Также устанавливаем флаг разблокировки
    }
  };
  
  // Отправка события
  safeDispatchGameEvent(`Обменено ${btcAmount} BTC на ${usdtAmount.toFixed(2)} USDT по курсу ${btcPrice} USDT/BTC`, "success");
  
  return newState;
};

// Обработка покупки практики
export const processPracticePurchase = (state: GameState): GameState => {
  // Проверяем достаточно ли USDT для покупки
  const currentLevel = state.buildings.practice?.count || 0;
  const baseCost = 10; // Базовая стоимость 10 USDT
  const costMultiplier = 1.12; // Множитель 1.12
  
  // Рассчитываем стоимость следующего уровня
  const cost = Math.floor(baseCost * Math.pow(costMultiplier, currentLevel));
  
  // Проверяем, достаточно ли USDT
  if (!state.resources.usdt || state.resources.usdt.value < cost) {
    console.log(`Недостаточно USDT для покупки практики: ${state.resources.usdt?.value} < ${cost}`);
    return state;
  }
  
  // Вычитаем стоимость
  const newUsdtValue = state.resources.usdt.value - cost;
  
  // Создаем новое состояние
  let newResources = { ...state.resources };
  
  // Обновляем USDT
  if (newResources.usdt) {
    newResources.usdt = {
      ...newResources.usdt,
      value: newUsdtValue
    };
  }
  
  // Проверяем наличие ресурса knowledge и создаем его, если отсутствует
  if (!newResources.knowledge) {
    newResources.knowledge = {
      id: 'knowledge',
      name: 'Знания',
      description: 'Знания о криптовалюте и блокчейне',
      type: 'resource',
      icon: 'book',
      value: 0,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 100,
      unlocked: true
    };
  }
  
  // Увеличиваем уровень практики
  const newPracticeLevel = currentLevel + 1;
  
  // Проверяем существует ли здание практики
  let updatedBuildings = { ...state.buildings };
  
  if (!updatedBuildings.practice) {
    // Создаем здание практики с необходимыми свойствами
    updatedBuildings.practice = {
      id: 'practice',
      name: 'Практика',
      description: 'Автоматически генерирует знания',
      type: 'production',
      cost: {
        usdt: baseCost
      },
      costMultiplier: costMultiplier,
      count: newPracticeLevel,
      unlocked: true,
      production: {  // Производство знаний
        knowledge: 1
      },
      productionBoost: 0
    };
  } else {
    // Обновляем существующее здание практики
    updatedBuildings.practice = {
      ...updatedBuildings.practice,
      count: newPracticeLevel
    };
  }
  
  // Обновляем производство знаний
  // Важно: обновляем baseProduction, production и perSecond последовательно и согласованно
  const knowledgePerPractice = 1; // 1 знание в секунду за каждую практику
  const extraProduction = knowledgePerPractice; // Добавляем +1 за новую практику
  
  let updatedKnowledge = { ...newResources.knowledge };
  // Устанавливаем базовое производство как уровень практики
  updatedKnowledge.baseProduction = newPracticeLevel * knowledgePerPractice;
  updatedKnowledge.production = updatedKnowledge.baseProduction;
  updatedKnowledge.perSecond = updatedKnowledge.production;
  
  // Обновляем ресурс знаний
  newResources.knowledge = updatedKnowledge;
  
  // Создаем окончательное состояние со всеми обновлениями
  let newState = {
    ...state,
    resources: newResources,
    buildings: updatedBuildings
  };
  
  console.log(`Практика улучшена до уровня ${newPracticeLevel}, стоимость: ${cost} USDT`);
  console.log("Обновлено производство знаний после покупки практики:", {
    level: newPracticeLevel,
    baseProduction: updatedKnowledge.baseProduction,
    production: updatedKnowledge.production,
    perSecond: updatedKnowledge.perSecond
  });
  
  // Отправляем событие об успешной покупке
  safeDispatchGameEvent(`Практика улучшена до уровня ${newPracticeLevel}`, 'success');
  
  return newState;
};
