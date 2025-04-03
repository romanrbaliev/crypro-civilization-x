
import { GameState } from '../types';
import { hasEnoughResources } from '../utils/resourceUtils';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { checkSpecialUnlocks } from '@/utils/unlockSystem';

// Обработка применения знаний
export const processApplyKnowledge = (state: GameState): GameState => {
  // Проверка наличия знаний
  if (state.resources.knowledge.value < 10) {
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
  const newState = {
    ...state,
    resources: {
      ...state.resources,
      knowledge: {
        ...state.resources.knowledge,
        value: newKnowledgeValue
      },
      usdt: {
        ...(state.resources.usdt || {
          id: 'usdt',
          name: 'USDT',
          description: 'Стейблкоин, универсальная валюта для покупок',
          type: 'currency',
          icon: 'dollar',
          value: 0,
          baseProduction: 0,
          production: 0,
          perSecond: 0,
          max: 50,
          unlocked: false
        }),
        value: finalUsdtValue,
        unlocked: true // Принудительно разблокируем
      }
    },
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
  // Проверка возможности покупки
  const baseCost = 10; // Базовая стоимость практики
  const costMultiplier = 1.12; // Множитель увеличения стоимости
  
  // Расчет стоимости следующего уровня практики
  const currentLevel = state.buildings.practice?.count || 0;
  const cost = Math.floor(baseCost * Math.pow(costMultiplier, currentLevel));
  
  // Проверка наличия достаточного количества USDT
  if (state.resources.usdt.value < cost) {
    safeDispatchGameEvent(`Недостаточно USDT для покупки практики. Нужно ${cost}`, "error");
    return state;
  }
  
  // Обновление состояния
  const newState = {
    ...state,
    resources: {
      ...state.resources,
      usdt: {
        ...state.resources.usdt,
        value: state.resources.usdt.value - cost
      }
    },
    buildings: {
      ...state.buildings,
      practice: {
        ...(state.buildings.practice || {
          id: 'practice',
          name: 'Практика',
          description: 'Автоматическое получение знаний',
          cost: { usdt: baseCost },
          costMultiplier: costMultiplier,
          production: { knowledge: 1 },
          count: 0,
          unlocked: true,
          productionBoost: 1
        }),
        count: currentLevel + 1
      }
    }
  };
  
  // Отправка события
  safeDispatchGameEvent(`Практика улучшена до уровня ${currentLevel + 1}`, "success");
  
  return newState;
};
