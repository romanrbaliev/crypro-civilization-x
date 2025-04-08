
import { GameState } from '../types';

/**
 * Увеличивает значение ресурса
 */
export const incrementResource = (
  state: GameState, 
  payload: { resourceId: string; amount: number }
): GameState => {
  const { resourceId, amount } = payload;
  const resource = state.resources[resourceId];
  
  if (!resource || !resource.unlocked) {
    return state;
  }
  
  // Ограничиваем прирост максимальным значением ресурса
  const newValue = Math.min(resource.value + amount, resource.max);
  
  return {
    ...state,
    resources: {
      ...state.resources,
      [resourceId]: {
        ...resource,
        value: newValue
      }
    }
  };
};

/**
 * Разблокирует ресурс
 */
export const unlockResource = (
  state: GameState, 
  payload: { resourceId: string }
): GameState => {
  const { resourceId } = payload;
  const resource = state.resources[resourceId];
  
  if (!resource) {
    return state;
  }
  
  return {
    ...state,
    resources: {
      ...state.resources,
      [resourceId]: {
        ...resource,
        unlocked: true
      }
    }
  };
};

/**
 * Применяет знания (обменивает на USDT)
 */
export const applyKnowledge = (state: GameState): GameState => {
  const knowledge = state.resources.knowledge;
  const usdt = state.resources.usdt;
  
  if (!knowledge || !knowledge.unlocked || !usdt) {
    return state;
  }
  
  // Рассчитываем, сколько знаний можно обменять (должно быть кратно 10)
  const knowledgeToApply = Math.floor(knowledge.value / 10) * 10;
  
  if (knowledgeToApply < 10) {
    return state;
  }
  
  // Получаем USDT по курсу 10 знаний = 1 USDT
  const usdtGained = knowledgeToApply / 10;
  
  // Проверяем, разблокирован ли USDT
  const isUsdtUnlocked = usdt.unlocked;
  
  // Обновляем счетчик применения знаний
  const newCounters = { ...state.counters };
  const applyCounter = newCounters.applyKnowledge || { id: 'applyKnowledge', value: 0 };
  newCounters.applyKnowledge = {
    ...applyCounter,
    value: applyCounter.value + 1
  };
  
  return {
    ...state,
    resources: {
      ...state.resources,
      knowledge: {
        ...knowledge,
        value: knowledge.value - knowledgeToApply
      },
      usdt: {
        ...usdt,
        unlocked: true,
        value: usdt.value + usdtGained
      }
    },
    counters: newCounters
  };
};

/**
 * Применяет все доступные знания
 */
export const applyAllKnowledge = (state: GameState): GameState => {
  // Просто вызываем обычное применение знаний, т.к. оно уже обрабатывает все доступные знания
  return applyKnowledge(state);
};

/**
 * Обменивает биткоин на USDT
 */
export const exchangeBitcoin = (state: GameState): GameState => {
  const bitcoin = state.resources.bitcoin;
  const usdt = state.resources.usdt;
  
  if (!bitcoin || !bitcoin.unlocked || bitcoin.value <= 0 || !usdt || !usdt.unlocked) {
    return state;
  }
  
  // Текущий курс биткоина (в USDT)
  const bitcoinRate = 10000;
  
  // Вся сумма биткоинов
  const btcAmount = bitcoin.value;
  
  // Полученные USDT
  const usdtAmount = btcAmount * bitcoinRate;
  
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
        value: Math.min(usdt.value + usdtAmount, usdt.max)
      }
    }
  };
};
