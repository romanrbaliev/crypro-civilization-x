
import { GameState } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { ResourceManager } from '@/managers/ResourceManager';

// Функция для обработки изучения криптовалют
export const processLearnCrypto = (state: GameState): GameState => {
  // Инкрементируем значение knowledge
  let updatedState = ResourceManager.incrementResource(state, 'knowledge', 1);
  
  // Также увеличиваем счетчик кликов по кнопке "Изучить"
  if (!updatedState.counters.knowledgeClicks) {
    updatedState.counters.knowledgeClicks = {
      id: 'knowledgeClicks',
      value: 1
    };
  } else {
    updatedState.counters.knowledgeClicks = {
      ...updatedState.counters.knowledgeClicks,
      value: updatedState.counters.knowledgeClicks.value + 1
    };
  }
  
  return updatedState;
};

// Функция для обмена Bitcoin на USDT
export const processExchangeBitcoin = (state: GameState): GameState => {
  // Проверяем, есть ли у нас Bitcoin
  if (!state.resources.bitcoin || state.resources.bitcoin.value <= 0) {
    console.log("Нет Bitcoin для обмена");
    return state;
  }
  
  // Извлекаем значения ресурсов
  const bitcoinValue = state.resources.bitcoin.value;
  
  // Определение курса обмена и комиссии
  const exchangeRate = state.miningParams.exchangeRate || 25000; // BTC/USDT
  const commission = state.miningParams.exchangeCommission || 0.05; // 5%
  
  // Расчет суммы USDT для получения
  const usdtAmount = bitcoinValue * exchangeRate * (1 - commission);
  
  // Создаем копию состояния для изменения
  let updatedState = { ...state };
  
  // Обнуляем Bitcoin
  updatedState = ResourceManager.incrementResource(
    updatedState, 
    'bitcoin', 
    -bitcoinValue
  );
  
  // Добавляем USDT
  updatedState = ResourceManager.incrementResource(
    updatedState, 
    'usdt', 
    usdtAmount
  );
  
  // Отправляем событие
  safeDispatchGameEvent({
    messageKey: 'event.exchangeBitcoin',
    type: 'success',
    params: { btc: bitcoinValue.toFixed(6), usdt: usdtAmount.toFixed(2) }
  });
  
  console.log(`Обменяно ${bitcoinValue.toFixed(6)} BTC на ${usdtAmount.toFixed(2)} USDT (курс: ${exchangeRate}, комиссия: ${commission * 100}%)`);
  
  return updatedState;
};
