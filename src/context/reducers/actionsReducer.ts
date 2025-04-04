import { GameState } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { calculateResourceMaxValue } from '@/utils/resourceCalculator';

// Обработка применения знаний
export const processApplyKnowledge = (state: GameState): GameState => {
  const knowledge = state.resources.knowledge;
  
  if (!knowledge || knowledge.value < 10) {
    console.log('Недостаточно знаний для применения');
    return state;
  }
  
  // Расчет эффективности обмена
  let knowledgeEfficiency = 1.0;
  
  // Бонус от улучшения "Основы криптовалют"
  if (state.upgrades.cryptoBasics && state.upgrades.cryptoBasics.purchased) {
    knowledgeEfficiency += 0.1; // +10%
  }
  
  // Обмен знаний на USDT
  const knowledgeToConvert = 10;
  const usdtGained = 1 * knowledgeEfficiency;
  
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
  
  // Обновляем ресурсы
  const newResources = {
    ...state.resources,
    knowledge: {
      ...knowledge,
      value: knowledge.value - knowledgeToConvert
    },
    usdt: {
      ...usdt,
      value: usdt.value + usdtGained,
      unlocked: true
    }
  };
  
  // Копируем все существующие разблокировки
  let newUnlocks: { [key: string]: boolean } = {
    ...state.unlocks,
    usdt: true
  };
  
  // Увеличиваем счетчик применений знаний
  let newCounters = { ...state.counters };
  
  if (!newCounters.applyKnowledge) {
    newCounters.applyKnowledge = {
      id: 'applyKnowledge',
      name: 'Применение знаний',
      value: 1
    };
  } else {
    newCounters.applyKnowledge = {
      ...newCounters.applyKnowledge,
      value: newCounters.applyKnowledge.value + 1
    };
  }
  
  // Проверяем разблокировку практики
  let newBuildings = { ...state.buildings };
  if (newCounters.applyKnowledge.value >= 2 && newBuildings.practice) {
    console.log("Разблокировка практики после второго применения знаний");
    newBuildings.practice = {
      ...newBuildings.practice,
      unlocked: true
    };
    
    // Добавляем практику в разблокировки
    newUnlocks.practice = true;
    
    // Уведомляем о разблокировке
    safeDispatchGameEvent("Разблокировано новое здание: Практика", "success");
  }
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    resources: newResources,
    unlocks: newUnlocks,
    counters: newCounters,
    buildings: newBuildings
  };
};

// Обработка применения всех знаний
export const processApplyAllKnowledge = (state: GameState): GameState => {
  const knowledge = state.resources.knowledge;
  
  // Проверка на существование ресурса знаний
  if (!knowledge || knowledge.value < 10) {
    console.log('Недостаточно знаний для применения');
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
  
  // Расчет эффективности обмена
  let knowledgeEfficiency = 1.0;
  
  // Бонус от улучшения "Основы криптовалют"
  if (state.upgrades.cryptoBasics && state.upgrades.cryptoBasics.purchased) {
    knowledgeEfficiency += 0.1; // +10%
  }
  
  // Обмен всех доступных знаний на USDT (кратно 10)
  const knowledgeToConvert = Math.floor(knowledge.value / 10) * 10;
  const usdtGained = (knowledgeToConvert / 10) * knowledgeEfficiency;
  
  // Обновляем ресурсы
  const newResources = {
    ...state.resources,
    knowledge: {
      ...knowledge,
      value: knowledge.value - knowledgeToConvert
    },
    usdt: {
      ...usdt,
      value: usdt.value + usdtGained,
      unlocked: true
    }
  };
  
  // Копируем все существующие разблокировки
  let newUnlocks: { [key: string]: boolean } = {
    ...state.unlocks,
    usdt: true
  };
  
  // Увеличиваем счетчик применений знаний
  let newCounters = { ...state.counters };
  
  if (!newCounters.applyKnowledge) {
    newCounters.applyKnowledge = {
      id: 'applyKnowledge',
      name: 'Применение знаний',
      value: 1
    };
  } else {
    newCounters.applyKnowledge = {
      ...newCounters.applyKnowledge,
      value: newCounters.applyKnowledge.value + 1
    };
  }
  
  // Проверяем разблокировку практики
  let newBuildings = { ...state.buildings };
  if (newCounters.applyKnowledge.value >= 2 && newBuildings.practice) {
    console.log("Разблокировка практики после второго применения знаний");
    newBuildings.practice = {
      ...newBuildings.practice,
      unlocked: true
    };
    
    // Добавляем практику в разблокировки
    newUnlocks.practice = true;
    
    // Уведомляем о разблокировке
    safeDispatchGameEvent("Разблокировано новое здание: Практика", "success");
  }
  
  // Выводим уведомление об обмене знаний
  safeDispatchGameEvent(`Обменяно ${knowledgeToConvert} знаний на ${usdtGained.toFixed(2)} USDT`, "success");
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    resources: newResources,
    unlocks: newUnlocks,
    counters: newCounters,
    buildings: newBuildings
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
