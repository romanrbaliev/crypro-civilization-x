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
  
  console.log("processPracticePurchase: Начинаем покупку практики...");
  console.log(`Текущий уровень практики: ${currentLevel}, Стоимость нового уровня: ${cost} USDT`);
  
  // КЛОНИРУЕМ ВСЁ СОСТОЯНИЕ
  const newState = { ...state };
  
  // Обновляем ресурсы - сначала клонируем
  const newResources = { ...newState.resources };
  
  // Вычитаем стоимость из USDT
  if (newResources.usdt) {
    newResources.usdt = {
      ...newResources.usdt,
      value: newResources.usdt.value - cost
    };
  }
  
  // Увеличиваем уровень практики
  const newPracticeLevel = currentLevel + 1;
  
  // Клонируем здания
  const newBuildings = { ...newState.buildings };
  
  // Обновляем или создаем здание практики
  if (!newBuildings.practice) {
    // Создаем здание практики с необходимыми свойствами
    newBuildings.practice = {
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
      production: {
        knowledge: 1
      },
      productionBoost: 0
    };
    console.log("Создано новое здание 'Практика'");
  } else {
    // Обновляем существующее здание практики
    newBuildings.practice = {
      ...newBuildings.practice,
      count: newPracticeLevel
    };
    console.log(`Практика улучшена до уровня ${newPracticeLevel}`);
  }
  
  // Настройка производства знаний
  const knowledgePerPractice = 1; // 1 знание в секунду за каждую практику
  const totalProduction = newPracticeLevel * knowledgePerPractice;
  
  // Обновляем или создаем ресурс знаний
  if (!newResources.knowledge) {
    // Создаем ресурс знаний, если его ещё нет
    newResources.knowledge = {
      id: 'knowledge',
      name: 'Знания',
      description: 'Знания о криптовалюте и блокчейне',
      type: 'resource',
      icon: 'book',
      value: 0,
      baseProduction: totalProduction, // Устанавливаем базовое производство
      production: totalProduction, // Устанавливаем текущее производство
      perSecond: totalProduction, // Устанавливаем скорость в секунду
      max: 100,
      unlocked: true
    };
    console.log(`Создан ресурс знаний с производством ${totalProduction}/сек`);
  } else {
    // Обновляем существующий ресурс знаний
    newResources.knowledge = {
      ...newResources.knowledge,
      baseProduction: totalProduction,
      production: totalProduction,
      perSecond: totalProduction
    };
    console.log(`Обновлен ресурс знаний с производством ${totalProduction}/сек`);
  }
  
  // Собираем окончательное состояние
  const finalState = {
    ...newState,
    resources: newResources,
    buildings: newBuildings
  };
  
  console.log("processPracticePurchase: Итоговое состояние производства знаний:", {
    level: newPracticeLevel,
    baseProduction: finalState.resources.knowledge?.baseProduction,
    production: finalState.resources.knowledge?.production,
    perSecond: finalState.resources.knowledge?.perSecond
  });
  
  // Отправляем событие об успешной покупке
  safeDispatchGameEvent(`Практика улучшена до уровня ${newPracticeLevel}`, 'success');
  
  return finalState;
};
