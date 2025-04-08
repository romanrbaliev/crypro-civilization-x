import { GameState } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Функция для применения знаний
export const processApplyKnowledge = (state: GameState): GameState => {
  console.log("actionsReducer: processApplyKnowledge запущен");
  
  // Проверяем, достаточно ли знаний для применения
  if (!state.resources.knowledge || state.resources.knowledge.value < 10) {
    console.warn("actionsReducer: Недостаточно знаний для применения");
    safeDispatchGameEvent("Недостаточно знаний для применения", "warning");
    return state;
  }
  
  // Вычисляем бонус
  let knowledgeBonus = 10;
  
  // Проверяем и применяем эффекты от улучшений
  if (state.upgrades.blockchainBasics?.purchased || state.upgrades.basicBlockchain?.purchased || state.upgrades.blockchain_basics?.purchased) {
    console.log("actionsReducer: Применяем бонус от 'Основ блокчейна'");
    knowledgeBonus *= 1.1; // Увеличиваем бонус на 10%
  }
  
  // Проверяем и применяем эффекты от улучшения "Основы криптовалют"
  if (state.upgrades.cryptoCurrencyBasics?.purchased || state.upgrades.cryptoBasics?.purchased) {
    console.log("actionsReducer: Применяем бонус от 'Основ криптовалют'");
    knowledgeBonus *= 1.1; // Увеличиваем бонус на 10%
  }
  
  // Применяем бафф от специализации
  if (state.specialization === 'blockchainDeveloper') {
    console.log("actionsReducer: Применяем бафф от специализации 'Разработчик блокчейна'");
    knowledgeBonus *= 1.2; // Увеличиваем бонус на 20%
  }
  
  // Округляем бонус до целого числа
  knowledgeBonus = Math.floor(knowledgeBonus);
  
  // Создаем новое состояние
  let newState: GameState = {
    ...state,
    resources: {
      ...state.resources,
      knowledge: {
        ...state.resources.knowledge,
        value: Math.max(0, state.resources.knowledge.value - 10) // Вычитаем 10 знаний
      }
    },
    counters: {
      ...state.counters,
      applyKnowledge: {
        ...state.counters.applyKnowledge,
        value: (state.counters.applyKnowledge?.value || 0) + 1
      }
    }
  };
  
  // Проверяем, существует ли ресурс USDT
  if (newState.resources.usdt) {
    // Если USDT существует, добавляем бонус
    newState.resources = {
      ...newState.resources,
      usdt: {
        ...newState.resources.usdt,
        value: newState.resources.usdt.value + knowledgeBonus
      }
    };
  } else {
    // Если USDT не существует, создаем его и добавляем бонус
    newState.resources = {
      ...newState.resources,
      usdt: {
        id: 'usdt',
        name: 'USDT',
        description: 'Стейблкоин, привязанный к стоимости доллара США',
        value: knowledgeBonus,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 50,
        unlocked: true,
        type: 'currency',
        icon: 'dollar'
      }
    };
    
    // Также необходимо обновить unlocks, если USDT только что разблокирован
    newState.unlocks = {
      ...newState.unlocks,
      usdt: true
    };
  }
  
  console.log(`actionsReducer: Применено знаний, получено ${knowledgeBonus} USDT`);
  safeDispatchGameEvent(`Применено знаний, получено ${knowledgeBonus} USDT`, "success");
  
  return newState;
};

// Функция для применения всех знаний
export const processApplyAllKnowledge = (state: GameState): GameState => {
  console.log("actionsReducer: processApplyAllKnowledge запущен");
  
  // Проверяем, есть ли знания для применения
  if (!state.resources.knowledge || state.resources.knowledge.value <= 0) {
    console.warn("actionsReducer: Нет знаний для применения");
    safeDispatchGameEvent("Нет знаний для применения", "warning");
    return state;
  }
  
  // Получаем количество знаний для применения
  const availableKnowledge = state.resources.knowledge.value;
  
  // Вычисляем бонус
  let knowledgeBonus = availableKnowledge;
  
  // Проверяем и применяем эффекты от улучшений
  if (state.upgrades.blockchainBasics?.purchased || state.upgrades.basicBlockchain?.purchased || state.upgrades.blockchain_basics?.purchased) {
    console.log("actionsReducer: Применяем бонус от 'Основ блокчейна'");
    knowledgeBonus *= 1.1; // Увеличиваем бонус на 10%
  }
  
  // Проверяем и применяем эффекты от улучшения "Основы криптовалют"
  if (state.upgrades.cryptoCurrencyBasics?.purchased || state.upgrades.cryptoBasics?.purchased) {
    console.log("actionsReducer: Применяем бонус от 'Основ криптовалют'");
    knowledgeBonus *= 1.1; // Увеличиваем бонус на 10%
  }
  
  // Применяем бафф от специализации
  if (state.specialization === 'blockchainDeveloper') {
    console.log("actionsReducer: Применяем бафф от специализации 'Разработчик блокчейна'");
    knowledgeBonus *= 1.2; // Увеличиваем бонус на 20%
  }
  
  // Округляем бонус до целого числа
  knowledgeBonus = Math.floor(knowledgeBonus);
  
  // Создаем новое состояние
  let newState: GameState = {
    ...state,
    resources: {
      ...state.resources,
      knowledge: {
        ...state.resources.knowledge,
        value: 0 // Применяем все знания
      }
    },
    counters: {
      ...state.counters,
      applyKnowledge: {
        ...state.counters.applyKnowledge,
        value: (state.counters.applyKnowledge?.value || 0) + 1
      }
    }
  };
  
  // Проверяем, существует ли ресурс USDT
  if (newState.resources.usdt) {
    // Если USDT существует, добавляем бонус
    newState.resources = {
      ...newState.resources,
      usdt: {
        ...newState.resources.usdt,
        value: newState.resources.usdt.value + knowledgeBonus
      }
    };
  } else {
    // Если USDT не существует, создаем его и добавляем бонус
    newState.resources = {
      ...newState.resources,
      usdt: {
        id: 'usdt',
        name: 'USDT',
        description: 'Стейблкоин, привязанный к стоимости доллара США',
        value: knowledgeBonus,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 50,
        unlocked: true,
        type: 'currency',
        icon: 'dollar'
      }
    };
    
    // Также необходимо обновить unlocks, если USDT только что разблокирован
    newState.unlocks = {
      ...newState.unlocks,
      usdt: true
    };
  }
  
  console.log(`actionsReducer: Применены все знания, получено ${knowledgeBonus} USDT`);
  safeDispatchGameEvent(`Применены все знания, получено ${knowledgeBonus} USDT`, "success");
  
  return newState;
};

// Функция для майнинга вычислительной мощности
export const processMiningPower = (state: GameState): GameState => {
  // Проверяем, разблокирован ли майнер
  if (!state.buildings.miner?.unlocked) {
    console.warn("Майнер не разблокирован");
    safeDispatchGameEvent("Майнер не разблокирован", "warning");
    return state;
  }
  
  // Проверяем, достаточно ли вычислительной мощности для майнинга
  if (!state.resources.computingPower || state.resources.computingPower.value < 100) {
    console.warn("Недостаточно вычислительной мощности для майнинга");
    safeDispatchGameEvent("Недостаточно вычислительной мощности для майнинга", "warning");
    return state;
  }
  
  // Проверяем, достаточно ли электроэнергии для майнинга
  if (!state.resources.electricity || state.resources.electricity.value < 50) {
    console.warn("Недостаточно электроэнергии для майнинга");
    safeDispatchGameEvent("Недостаточно электроэнергии для майнинга", "warning");
    return state;
  }
  
  // Вычисляем количество добываемого BTC
  let btcMined = 0.00001;
  
  // Применяем бафф от специализации
  if (state.specialization === 'cryptoEnthusiast') {
    console.log("Применяем бафф от специализации 'Криптоэнтузиаст'");
    btcMined *= 1.15; // Увеличиваем на 15%
  }
  
  // Применяем бафф от улучшений
  if (state.upgrades.algorithmOptimization?.purchased) {
    console.log("Применяем бафф от улучшения 'Оптимизация алгоритмов'");
    btcMined *= 1.2; // Увеличиваем на 20%
  }
  
  // Применяем бафф от улучшения "Proof of Work"
  if (state.upgrades.proofOfWork?.purchased) {
    console.log("Применяем бафф от улучшения 'Proof of Work'");
    btcMined *= 1.25; // Увеличиваем на 25%
  }
  
  // Округляем добытое количество BTC до 8 знаков после запятой
  btcMined = parseFloat(btcMined.toFixed(8));
  
  // Создаем новое состояние
  const newState: GameState = {
    ...state,
    resources: {
      ...state.resources,
      computingPower: {
        ...state.resources.computingPower,
        value: state.resources.computingPower.value - 100 // Вычитаем вычислительную мощность
      },
      electricity: {
        ...state.resources.electricity,
        value: state.resources.electricity.value - 50 // Вычитаем электроэнергию
      },
      btc: {
        ...state.resources.btc,
        value: state.resources.btc.value + btcMined // Добавляем добытый BTC
      }
    }
  };
  
  console.log(`Добыто ${btcMined} BTC`);
  safeDispatchGameEvent(`Добыто ${btcMined} BTC`, "success");
  
  return newState;
};

// Функция для обмена BTC на USDT
export const processExchangeBtc = (state: GameState): GameState => {
  // Проверяем, разблокирована ли возможность обмена
  if (!state.unlocks.trading) {
    console.warn("Обмен не разблокирован");
    safeDispatchGameEvent("Обмен не разблокирован", "warning");
    return state;
  }
  
  // Проверяем, есть ли BTC для обмена
  if (!state.resources.btc || state.resources.btc.value <= 0) {
    console.warn("Нет BTC для обмена");
    safeDispatchGameEvent("Нет BTC для обмена", "warning");
    return state;
  }
  
  // Получаем текущий курс BTC/USDT (заглушка)
  const exchangeRate = 20000;
  
  // Вычисляем количество USDT, которое получим за обмен
  let usdtGained = state.resources.btc.value * exchangeRate;
  
  // Применяем комиссию (1%)
  const commission = usdtGained * 0.01;
  usdtGained -= commission;
  
  // Округляем полученное количество USDT до двух знаков после запятой
  usdtGained = parseFloat(usdtGained.toFixed(2));
  
  // Создаем новое состояние
  const newState: GameState = {
    ...state,
    resources: {
      ...state.resources,
      btc: {
        ...state.resources.btc,
        value: 0 // Обнуляем BTC
      },
      usdt: {
        ...state.resources.usdt,
        value: state.resources.usdt.value + usdtGained // Добавляем USDT
      }
    }
  };
  
  console.log(`Обменено BTC на ${usdtGained} USDT`);
  safeDispatchGameEvent(`Обменено BTC на ${usdtGained} USDT`, "success");
  
  return newState;
};

// Функция для покупки практики
export const processPracticePurchase = (state: GameState): GameState => {
  // Проверяем, разблокирована ли практика
  if (!state.buildings.practice?.unlocked) {
    console.warn("Практика не разблокирована");
    safeDispatchGameEvent("Практика не разблокирована", "warning");
    return state;
  }
  
  // Проверяем, достаточно ли USDT для покупки
  if (!state.resources.usdt || state.resources.usdt.value < 25) {
    console.warn("Недостаточно USDT для покупки практики");
    safeDispatchGameEvent("Недостаточно USDT для покупки практики", "warning");
    return state;
  }
  
  // Вычисляем количество знаний, которое получим за практику
  let knowledgeGained = 5;
  
  // Применяем бафф от специализации
  if (state.specialization === 'researcher') {
    console.log("Применяем бафф от специализации 'Исследователь'");
    knowledgeGained *= 1.1; // Увеличиваем на 10%
  }
  
  // Округляем полученное количество знаний до целого числа
  knowledgeGained = Math.floor(knowledgeGained);
  
  // Создаем новое состояние
  const newState: GameState = {
    ...state,
    resources: {
      ...state.resources,
      usdt: {
        ...state.resources.usdt,
        value: state.resources.usdt.value - 25 // Вычитаем USDT
      },
      knowledge: {
        ...state.resources.knowledge,
        value: state.resources.knowledge.value + knowledgeGained // Добавляем знания
      }
    }
  };
  
  console.log(`Получено ${knowledgeGained} знаний за практику`);
  safeDispatchGameEvent(`Получено ${knowledgeGained} знаний за практику`, "success");
  
  return newState;
};
