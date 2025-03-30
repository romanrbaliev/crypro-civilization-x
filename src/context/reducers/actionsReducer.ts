
import { GameState } from '../types';
import { checkAllUnlocks } from '@/utils/unlockManager';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Обработка клика на "Изучить крипту"
export const processLearnAction = (state: GameState): GameState => {
  // Проверяем, разблокирован ли ресурс знаний
  if (!state.resources.knowledge.unlocked) {
    console.warn("Попытка изучения криптовалют при заблокированном ресурсе знаний");
    return state;
  }
  
  // Ресурсы до обработки действия
  const currentKnowledge = state.resources.knowledge.value;
  
  // Увеличиваем количество знаний на 1
  const newKnowledgeValue = Math.min(
    currentKnowledge + 1,
    state.resources.knowledge.max
  );
  
  // Инкрементируем счетчик кликов по кнопке изучения
  let knowledgeClicksCounter = state.counters.knowledgeClicks || {
    id: 'knowledgeClicks',
    name: 'Клики на изучение криптовалют',
    value: 0
  };
  
  knowledgeClicksCounter = {
    ...knowledgeClicksCounter,
    value: knowledgeClicksCounter.value + 1
  };
  
  console.log(`Пользователь изучил криптовалюту. Знания: ${currentKnowledge} -> ${newKnowledgeValue}. Всего кликов: ${knowledgeClicksCounter.value}`);
  
  // Создаем новое состояние
  let newState = {
    ...state,
    resources: {
      ...state.resources,
      knowledge: {
        ...state.resources.knowledge,
        value: newKnowledgeValue
      }
    },
    counters: {
      ...state.counters,
      knowledgeClicks: knowledgeClicksCounter
    }
  };
  
  // Проверяем разблокировки после клика
  newState = checkAllUnlocks(newState);
  
  return newState;
};

// Обработка клика на "Применить знания"
export const processApplyKnowledgeAction = (state: GameState): GameState => {
  // Проверяем, разблокировано ли действие
  if (!state.unlocks.applyKnowledge) {
    console.warn("Попытка применить знания при заблокированном действии");
    return state;
  }
  
  // Требование затрат знаний
  const requiredKnowledge = 10;
  
  // Проверяем достаточно ли знаний
  if (state.resources.knowledge.value < requiredKnowledge) {
    console.warn(`Недостаточно знаний для применения: ${state.resources.knowledge.value}/${requiredKnowledge}`);
    safeDispatchGameEvent(`Недостаточно знаний (${state.resources.knowledge.value}/${requiredKnowledge})`, "warning");
    return state;
  }
  
  // Получаемое количество USDT
  const usdtGain = 1;
  
  // Инкрементируем счетчик применений знаний
  let applyKnowledgeCounter = state.counters.applyKnowledge || {
    id: 'applyKnowledge',
    name: 'Применения знаний',
    value: 0
  };
  
  applyKnowledgeCounter = {
    ...applyKnowledgeCounter,
    value: applyKnowledgeCounter.value + 1
  };
  
  console.log(`Применены знания. Потрачено знаний: ${requiredKnowledge}. Получено USDT: ${usdtGain}. Всего применений: ${applyKnowledgeCounter.value}`);
  safeDispatchGameEvent(`Знания успешно применены. Получено ${usdtGain} USDT`, "success");
  
  // Создаем новое состояние
  let newState = {
    ...state,
    resources: {
      ...state.resources,
      knowledge: {
        ...state.resources.knowledge,
        value: Math.max(0, state.resources.knowledge.value - requiredKnowledge)
      },
      usdt: {
        ...state.resources.usdt,
        value: state.resources.usdt.value + usdtGain
      }
    },
    counters: {
      ...state.counters,
      applyKnowledge: applyKnowledgeCounter
    }
  };
  
  // Важно: проверяем разблокировки после применения знаний
  console.log("Проверяем разблокировки после применения знаний. Текущий счетчик:", applyKnowledgeCounter.value);
  newState = checkAllUnlocks(newState);
  
  return newState;
};

// Обработка действия "Майнинг"
export const processUseComputingPowerAction = (state: GameState): GameState => {
  // Проверяем, разблокировано ли действие
  if (!state.unlocks.miningPower) {
    console.warn("Попытка использовать вычислительную мощность при заблокированном действии");
    return state;
  }
  
  // Требования к вычислительной мощности
  const requiredPower = 50;
  
  // Проверяем достаточно ли вычислительной мощности
  if (state.resources.computingPower.value < requiredPower) {
    console.warn(`Недостаточно вычислительной мощности: ${state.resources.computingPower.value}/${requiredPower}`);
    safeDispatchGameEvent(`Недостаточно вычислительной мощности (${state.resources.computingPower.value}/${requiredPower})`, "warning");
    return state;
  }
  
  // Получаемое количество USDT
  const usdtGain = 5;
  
  console.log(`Использована вычислительная мощность. Потрачено: ${requiredPower}. Получено USDT: ${usdtGain}.`);
  safeDispatchGameEvent(`Майнинг успешен. Получено ${usdtGain} USDT`, "success");
  
  // Создаем новое состояние
  let newState = {
    ...state,
    resources: {
      ...state.resources,
      computingPower: {
        ...state.resources.computingPower,
        value: Math.max(0, state.resources.computingPower.value - requiredPower)
      },
      usdt: {
        ...state.resources.usdt,
        value: state.resources.usdt.value + usdtGain
      }
    }
  };
  
  // Проверяем разблокировки после действия
  newState = checkAllUnlocks(newState);
  
  return newState;
};

// Обработка действия "Обмен Bitcoin"
export const processExchangeBitcoinAction = (state: GameState): GameState => {
  // Проверяем, разблокировано ли действие и ресурс
  if (!state.unlocks.exchangeBitcoin || !state.resources.bitcoin?.unlocked) {
    console.warn("Попытка обменять Bitcoin при заблокированном действии или ресурсе");
    return state;
  }
  
  // Количество Bitcoin для обмена (всё доступное количество)
  const bitcoinAmount = state.resources.bitcoin.value;
  
  // Проверяем наличие Bitcoin
  if (bitcoinAmount <= 0) {
    console.warn("Нет Bitcoin для обмена");
    safeDispatchGameEvent("Нет Bitcoin для обмена", "warning");
    return state;
  }
  
  // Получаемое количество USDT (обменный курс + комиссия)
  const exchangeRate = state.miningParams?.exchangeRate || 20000;
  const commission = state.miningParams?.exchangeCommission || 0.05;
  const usdtGain = Math.floor(bitcoinAmount * exchangeRate * (1 - commission));
  
  console.log(`Обмен Bitcoin. Количество: ${bitcoinAmount}. Получено USDT: ${usdtGain}.`);
  safeDispatchGameEvent(`Bitcoin успешно обменян. Получено ${usdtGain} USDT`, "success");
  
  // Создаем новое состояние
  let newState = {
    ...state,
    resources: {
      ...state.resources,
      bitcoin: {
        ...state.resources.bitcoin,
        value: 0
      },
      usdt: {
        ...state.resources.usdt,
        value: state.resources.usdt.value + usdtGain
      }
    }
  };
  
  // Проверяем разблокировки после действия
  newState = checkAllUnlocks(newState);
  
  return newState;
};
