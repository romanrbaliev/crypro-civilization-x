
import { GameState, MiningSettings } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

/**
 * Обрабатывает обмен BTC на USDT
 */
export const processExchangeBtc = (state: GameState): GameState => {
  const btcResource = state.resources.btc;
  const usdtResource = state.resources.usdt;
  
  // Проверяем, есть ли BTC для обмена
  if (btcResource.value <= 0) {
    safeDispatchGameEvent("У вас нет BTC для обмена", "error");
    return state;
  }
  
  // Рассчитываем количество получаемых USDT
  const btcAmount = btcResource.value;
  const exchangeRate = state.btcExchangeRate;
  const exchangeFee = state.exchangeFee;
  
  const usdtAmount = btcAmount * exchangeRate * (1 - exchangeFee);
  
  // Обновляем ресурсы
  const newResources = {
    ...state.resources,
    btc: {
      ...btcResource,
      value: 0
    },
    usdt: {
      ...usdtResource,
      value: Math.min(usdtResource.value + usdtAmount, usdtResource.max)
    }
  };
  
  // Отправляем уведомление об успешном обмене
  safeDispatchGameEvent(
    `Обменяно ${btcAmount.toFixed(5)} BTC на ${Math.floor(usdtAmount * 100) / 100} USDT (курс: ${Math.floor(exchangeRate)} USDT/BTC)`,
    "success"
  );
  
  return {
    ...state,
    resources: newResources
  };
};

/**
 * Обрабатывает включение/выключение автомайнера
 */
export const processToggleAutoMiner = (
  state: GameState,
  payload: { minerId: string; active: boolean }
): GameState => {
  const { minerId, active } = payload;
  
  // Проверяем, существует ли указанный автомайнер
  if (!state.buildings[minerId]) {
    return state;
  }
  
  // Обновляем состояние автомайнера
  const newBuildings = {
    ...state.buildings,
    [minerId]: {
      ...state.buildings[minerId],
      active
    }
  };
  
  // Отправляем уведомление о смене состояния
  const statusMessage = active ? "включен" : "выключен";
  safeDispatchGameEvent(`Автомайнер ${statusMessage}`, "info");
  
  return {
    ...state,
    buildings: newBuildings
  };
};

/**
 * Обновляет настройки майнинга
 */
export const processUpdateMiningSettings = (
  state: GameState,
  payload: Partial<MiningSettings>
): GameState => {
  // Обновляем настройки майнинга
  const newMiningSettings = {
    ...state.miningSettings,
    ...payload
  };
  
  return {
    ...state,
    miningSettings: newMiningSettings
  };
};

