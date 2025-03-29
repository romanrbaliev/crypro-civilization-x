
import { GameState } from '../types';
import { updateResourceMaxValues } from '../utils/resourceUtils';
import { checkAllUnlocks, checkSpecialUnlocks } from '@/utils/unlockSystem';

// Обработка действия применения знаний (10 знаний -> 1 USDT)
export const processApplyKnowledge = (state: GameState): GameState => {
  const knowledgeCost = 10;
  
  // Проверка на достаточное количество знаний
  if (state.resources.knowledge.value < knowledgeCost) {
    return state;
  }
  
  // Базовое вознаграждение за применение знаний
  let usdtReward = 1;
  
  // Бонус от основ криптовалют (+10% к эффективности)
  if (state.upgrades.cryptoCurrencyBasics && state.upgrades.cryptoCurrencyBasics.purchased) {
    usdtReward *= 1.1;
  }
  
  // Запоминаем старое значение счетчика applyKnowledge перед применением знаний
  const oldCount = state.counters.applyKnowledge?.value || 0;
  
  // Обновляем ресурсы
  const newState = {
    ...state,
    resources: {
      ...state.resources,
      knowledge: {
        ...state.resources.knowledge,
        value: Math.max(0, state.resources.knowledge.value - knowledgeCost)
      },
      usdt: {
        ...state.resources.usdt,
        value: state.resources.usdt.value + usdtReward
      }
    }
  };

  // Проверяем разблокировку USDT - ТОЛЬКО после применения знаний
  const stateWithUnlocks = checkAllUnlocks(newState);
  
  // Пересчитываем максимальные значения ресурсов
  return updateResourceMaxValues(stateWithUnlocks);
};

// Обработка действия применения всех знаний (обмен всех знаний на USDT)
export const processApplyAllKnowledge = (state: GameState): GameState => {
  const knowledgeCost = 10;
  
  // Проверка на минимально необходимое количество знаний
  if (state.resources.knowledge.value < knowledgeCost) {
    return state;
  }
  
  // Расчет количества полных наборов знаний
  const fullSets = Math.floor(state.resources.knowledge.value / knowledgeCost);
  
  // Базовое вознаграждение за применение знаний
  let usdtReward = fullSets;
  
  // Бонус от основ криптовалют (+10% к эффективности)
  if (state.upgrades.cryptoCurrencyBasics && state.upgrades.cryptoCurrencyBasics.purchased) {
    usdtReward *= 1.1;
  }
  
  // Обновляем ресурсы
  const newState = {
    ...state,
    resources: {
      ...state.resources,
      knowledge: {
        ...state.resources.knowledge,
        value: state.resources.knowledge.value - (fullSets * knowledgeCost)
      },
      usdt: {
        ...state.resources.usdt,
        value: state.resources.usdt.value + usdtReward
      }
    }
  };
  
  // Проверяем разблокировку USDT
  const stateWithUnlocks = checkAllUnlocks(newState);
  
  // Пересчитываем максимальные значения ресурсов
  return updateResourceMaxValues(stateWithUnlocks);
};

// Обработчик майнинга вычислительной мощности -> BTC
export const processMiningPower = (state: GameState): GameState => {
  const computingPower = state.resources.computingPower;
  const btc = state.resources.btc;
  
  if (!computingPower || !btc || computingPower.value < 50) {
    return state;
  }
  
  // Конвертируем вычислительную мощность в BTC
  const computingPowerUsed = 50;
  const btcGained = 0.00005; // Базовое значение BTC за майнинг
  
  return {
    ...state,
    resources: {
      ...state.resources,
      computingPower: {
        ...computingPower,
        value: computingPower.value - computingPowerUsed
      },
      btc: {
        ...btc,
        value: btc.value + btcGained
      }
    }
  };
};

// Обработчик обмена BTC на USDT
export const processExchangeBtc = (state: GameState): GameState => {
  const btc = state.resources.btc;
  const usdt = state.resources.usdt;
  
  if (!btc || !usdt || btc.value <= 0) {
    return state;
  }
  
  // Получаем текущий курс BTC
  const btcPrice = state.miningParams?.exchangeRate || 20000;
  const commission = state.miningParams?.exchangeCommission || 0.05;
  
  // Рассчитываем сумму в USDT (с вычетом комиссии)
  const usdtAmount = btc.value * btcPrice * (1 - commission);
  
  return {
    ...state,
    resources: {
      ...state.resources,
      btc: {
        ...btc,
        value: 0 // Обмениваем все BTC
      },
      usdt: {
        ...usdt,
        value: usdt.value + usdtAmount
      }
    }
  };
};

// Обработчик покупки практики
export const processPracticePurchase = (state: GameState): GameState => {
  // Проверка, что практика доступна для покупки
  if (!state.buildings.practice || !state.buildings.practice.unlocked) {
    return state;
  }
  
  // Получаем текущую стоимость и уровень практики
  const currentLevel = state.buildings.practice.count;
  const baseCost = state.buildings.practice.cost.usdt;
  const costMultiplier = state.buildings.practice.costMultiplier || 1.15;
  
  // Расчет стоимости следующего уровня практики
  const currentCost = Math.floor(baseCost * Math.pow(costMultiplier, currentLevel));
  
  // Проверка достаточности ресурсов
  if (state.resources.usdt.value < currentCost) {
    return state;
  }
  
  // Обновляем состояние - покупаем практику
  const newState = {
    ...state,
    resources: {
      ...state.resources,
      usdt: {
        ...state.resources.usdt,
        value: state.resources.usdt.value - currentCost
      }
    },
    buildings: {
      ...state.buildings,
      practice: {
        ...state.buildings.practice,
        count: currentLevel + 1
      }
    }
  };
  
  // Пересчитываем скорость производства знаний
  return updateResourceMaxValues(newState);
};
