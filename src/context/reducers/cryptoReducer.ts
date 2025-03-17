
import { GameState } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

/**
 * Обработка обмена BTC на USDT
 */
export const processExchangeBtc = (
  state: GameState,
  payload?: { amount?: number }
): GameState => {
  // Если BTC не разблокирован или его нет, возвращаем текущее состояние
  if (!state.resources.btc.unlocked || state.resources.btc.value <= 0) {
    return state;
  }
  
  // Определяем сумму для обмена (весь баланс или указанная сумма)
  const exchangeAmount = payload?.amount !== undefined 
    ? Math.min(payload.amount, state.resources.btc.value) 
    : state.resources.btc.value;
  
  if (exchangeAmount <= 0) {
    return state;
  }
  
  // Рассчитываем текущий курс обмена
  const { baseExchangeRate, volatility, oscillationPeriod, exchangeCommission } = state.miningParams;
  const exchangeRate = baseExchangeRate * (1 + volatility * Math.sin(state.gameTime / oscillationPeriod));
  
  // Рассчитываем получаемое количество USDT с учетом комиссии
  const usdtAmount = exchangeAmount * exchangeRate * (1 - exchangeCommission);
  
  // Обновляем ресурсы
  const newResources = {
    ...state.resources,
    btc: {
      ...state.resources.btc,
      value: state.resources.btc.value - exchangeAmount
    },
    usdt: {
      ...state.resources.usdt,
      value: state.resources.usdt.value + usdtAmount
    }
  };
  
  // Отправляем уведомление об успешном обмене
  safeDispatchGameEvent(
    `Обменяно ${exchangeAmount.toFixed(8)} BTC на ${usdtAmount.toFixed(2)} USDT по курсу ${exchangeRate.toFixed(2)}`,
    "success"
  );
  
  return {
    ...state,
    resources: newResources
  };
};

/**
 * Рассчитывает текущий курс обмена BTC к USDT
 */
export function calculateCurrentExchangeRate(state: GameState): number {
  const { baseExchangeRate, volatility, oscillationPeriod } = state.miningParams;
  return baseExchangeRate * (1 + volatility * Math.sin(state.gameTime / oscillationPeriod));
}
