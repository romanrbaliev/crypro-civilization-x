import { GameState } from '../types';
import { calculateResourceMaxValue } from '@/utils/resourceCalculator';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Количество знаний, необходимое для обмена
const KNOWLEDGE_EXCHANGE_RATE = 10;

// Обработка применения знаний
export const processApplyKnowledge = (state: GameState): GameState => {
  const knowledge = state.resources.knowledge || { value: 0 };
  const usdt = state.resources.usdt || { value: 0, unlocked: false };
  
  // Проверяем, достаточно ли знаний для обмена
  if (knowledge.value < KNOWLEDGE_EXCHANGE_RATE) {
    console.log(`Недостаточно знаний для обмена: ${knowledge.value}/${KNOWLEDGE_EXCHANGE_RATE}`);
    return state;
  }
  
  // Рассчитываем, сколько знаний можно обменять
  const exchangeCount = Math.floor(knowledge.value / KNOWLEDGE_EXCHANGE_RATE);
  const knowledgeToExchange = exchangeCount * KNOWLEDGE_EXCHANGE_RATE;
  
  // Рассчитываем бонус к эффективности знаний (если есть)
  const knowledgeEfficiencyBonus = state.resources.knowledgeEfficiency?.value || 0;
  
  // Количество USDT, которое получим после обмена с учетом бонуса
  const usdtGain = exchangeCount * (1 + knowledgeEfficiencyBonus);
  
  // Создаем новые объекты ресурсов с обновленными зн��чениями
  const newKnowledge = {
    ...state.resources.knowledge,
    value: state.resources.knowledge.value - knowledgeToExchange
  };
  
  // Проверяем, существует ли USDT и разблокирован ли он
  const newUsdt = state.resources.usdt 
    ? {
        ...state.resources.usdt,
        value: state.resources.usdt.value + usdtGain,
        unlocked: true
      }
    : {
        id: 'usdt',
        name: 'USDT',
        description: 'Стейблкоин, привязанный к доллару США',
        icon: 'dollar',
        type: 'currency',
        value: usdtGain,
        unlocked: true,
        max: 100,
        baseProduction: 0,
        production: 0,
        perSecond: 0
      };
  
  // Создаем новый объект ресурсов с обновленными значениями
  const newResources = {
    ...state.resources,
    knowledge: newKnowledge,
    usdt: newUsdt
  };
  
  // Создаем новый объект разблокировок с разблокированным USDT
  const newUnlocks: { [key: string]: boolean } = {
    ...state.unlocks,
    usdt: true
  };
  
  // Увеличиваем счетчик применений знаний
  const newCounters = {
    ...state.counters,
    applyKnowledge: {
      ...(state.counters.applyKnowledge || { id: 'applyKnowledge', name: 'Применить знания', value: 0 }),
      value: (state.counters.applyKnowledge?.value || 0) + 1
    }
  };
  
  // Выводим информацию в консоль для отладки
  console.log(`Обмен знаний: ${knowledgeToExchange} знаний обменяно на ${usdtGain} USDT`);
  console.log(`Новый счетчик applyKnowledge: ${newCounters.applyKnowledge.value}`);
  
  // Отправляем сообщение о событии
  safeDispatchGameEvent(
    `Обменяно ${knowledgeToExchange} знаний на ${usdtGain} USDT`,
    "success"
  );
  
  // Создаем новое состояние игры с обновленными ресурсами, разблокировками и счетчиками
  return updateResourceMaxValues({
    ...state,
    resources: newResources,
    unlocks: newUnlocks,
    counters: newCounters
  });
};

// Обработка массового применения знаний
export const processApplyAllKnowledge = (state: GameState): GameState => {
  // Получаем количество доступных знаний
  const knowledgeValue = state.resources.knowledge?.value || 0;
  const knowledgeEfficiency = state.resources.knowledge?.efficiency || 1;
  
  // Если знаний меньше 10, ничего не применяем
  if (knowledgeValue < 10) {
    return state;
  }
  
  // Рассчитываем, сколько знаний можно применить (должно быть кратно 10)
  const applicableKnowledge = Math.floor(knowledgeValue / 10) * 10;
  
  // Рассчитываем, сколько USDT получим (1 USDT за каждые 10 знаний)
  const usdtToAdd = (applicableKnowledge / 10) * knowledgeEfficiency;
  
  // Проверяем, не превысим ли максимум USDT
  const usdtMax = calculateResourceMaxValue(state, 'usdt');
  const currentUsdt = state.resources.usdt?.value || 0;
  const newUsdt = Math.min(currentUsdt + usdtToAdd, usdtMax);
  const actualUsdtToAdd = newUsdt - currentUsdt;
  
  console.log(`processApplyAllKnowledge: Применяем ${applicableKnowledge} знаний и получаем ${actualUsdtToAdd} USDT`);
  
  // Исправление: убираем инкремент счетчика applyKnowledge отсюда, 
  // так как он уже инкрементируется в ActionButtons.tsx
  
  // Обновляем ресурсы
  const updatedResources = {
    ...state.resources,
    knowledge: {
      ...state.resources.knowledge,
      value: knowledgeValue - applicableKnowledge
    },
    usdt: {
      ...(state.resources.usdt || {
        id: 'usdt',
        name: 'USDT',
        unlocked: true,
        value: 0,
        max: 100
      }),
      value: newUsdt,
      unlocked: true
    }
  };
  
  // Разблокируем USDT как ресурс, если это не было сделано ранее
  const updatedUnlocks: { [key: string]: boolean } = {
    ...state.unlocks,
    usdt: true
  };
  
  safeDispatchGameEvent(`Применено ${applicableKnowledge} знаний, получено ${actualUsdtToAdd.toFixed(2)} USDT`, "success");
  
  return {
    ...state,
    resources: updatedResources,
    unlocks: updatedUnlocks
  };
};

// Обработка майнинга
export const processMiningPower = (state: GameState): GameState => {
  const computingPower = state.resources.computingPower;
  const bitcoin = state.resources.bitcoin;
  
  if (!computingPower || computingPower.value <= 0) {
    return state;
  }
  
  // Базовая эффективность майнинга
  let miningEfficiency = 0.0001; // Базовое значение
  
  // Бонусы от улучшений
  if (state.upgrades.algorithmOptimization && state.upgrades.algorithmOptimization.purchased) {
    miningEfficiency *= 1.15; // +15% к эффективности майнинга
  }
  
  if (state.upgrades.proofOfWork && state.upgrades.proofOfWork.purchased) {
    miningEfficiency *= 1.25; // +25% к эффективности майнинга
  }
  
  // Расчет добытых биткоинов
  const minedBitcoin = computingPower.value * miningEfficiency;
  
  // Создаем биткоин, если его нет
  const updatedBitcoin = bitcoin || {
    id: 'bitcoin',
    name: 'Bitcoin',
    description: 'Криптовалюта Bitcoin',
    type: 'resource',
    icon: 'bitcoin',
    value: 0,
    max: 10,
    unlocked: true
  };
  
  // Обновляем ресурсы
  return {
    ...state,
    resources: {
      ...state.resources,
      bitcoin: {
        ...updatedBitcoin,
        value: (updatedBitcoin.value || 0) + minedBitcoin,
        unlocked: true
      }
    },
    unlocks: {
      ...state.unlocks,
      bitcoin: true
    }
  };
};

// Обработка обмена BTC на USDT
export const processExchangeBtc = (state: GameState): GameState => {
  const bitcoin = state.resources.bitcoin;
  
  if (!bitcoin || bitcoin.value <= 0) {
    return state;
  }
  
  // Проверяем существование USDT или создаем, если его еще нет
  const usdt = state.resources.usdt || {
    id: 'usdt',
    name: 'USDT',
    description: 'Стейблкоин, привязанный к доллару США',
    type: 'resource',
    icon: 'dollar-sign',
    value: 0,
    max: 100,
    unlocked: true
  };
  
  // Получаем текущий курс BTC
  const btcPrice = state.btcPrice || 20000;
  
  // Рассчитываем полученные USDT
  const exchangedUsdt = bitcoin.value * btcPrice;
  
  // Обновляем ресурсы
  return {
    ...state,
    resources: {
      ...state.resources,
      bitcoin: {
        ...bitcoin,
        value: 0
      },
      usdt: {
        ...usdt,
        value: usdt.value + exchangedUsdt,
        unlocked: true
      }
    },
    unlocks: {
      ...state.unlocks,
      usdt: true
    }
  };
};

// Обработка покупки практики
export const processPracticePurchase = (state: GameState): GameState => {
  // Проверяем, разблокирована ли практика
  if (!state.unlocks.practice) {
    return state;
  }
  
  // Стоимость практики
  const practiceCost = 5; // USDT
  
  // Проверяем наличие достаточного количества USDT
  if (!state.resources.usdt || state.resources.usdt.value < practiceCost) {
    return state;
  }
  
  // Обновляем ресурсы
  return {
    ...state,
    resources: {
      ...state.resources,
      usdt: {
        ...state.resources.usdt,
        value: state.resources.usdt.value - practiceCost
      }
    },
    buildings: {
      ...state.buildings,
      practice: {
        ...state.buildings.practice,
        count: (state.buildings.practice?.count || 0) + 1
      }
    }
  };
};
