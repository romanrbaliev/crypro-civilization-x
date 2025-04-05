
import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { unlockSystemService } from '@/services/UnlockSystemService';

/**
 * Обработчик для применения знаний (конвертация в USDT)
 */
export const processApplyKnowledge = (state: GameState): GameState => {
  // Создаем копию состояния
  const newState = { ...state };
  const resources = { ...state.resources };
  
  // Проверяем, достаточно ли знаний
  if (!resources.knowledge || resources.knowledge.value < 10) {
    safeDispatchGameEvent('Недостаточно знаний для применения', 'error');
    return state;
  }
  
  // Проверяем, разблокирован ли USDT
  if (!resources.usdt) {
    resources.usdt = {
      id: 'usdt',
      name: 'USDT',
      description: 'Стабильная криптовалюта, привязанная к доллару',
      type: 'currency',
      icon: 'dollar',
      value: 0,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 100,
      unlocked: true,
      consumption: 0
    };
    
    newState.unlocks.usdt = true;
  }
  
  // Базовая ставка конвертации: 10 знаний = 1 USDT
  let conversionRate = 0.1; // 1/10
  
  // Проверяем, есть ли исследование для повышения эффективности
  const hasCryptoBasics = 
    (state.upgrades.cryptoCurrencyBasics?.purchased === true) ||
    (state.upgrades.cryptoBasics?.purchased === true);
  
  // Если есть исследование, увеличиваем эффективность на 10%
  if (hasCryptoBasics) {
    conversionRate = 0.11; // +10% = 0.1 * 1.1
  }
  
  // Сколько знаний можно конвертировать (кратно 10)
  const knowledgeToConvert = 10;
  
  // Конвертируем знания в USDT
  resources.knowledge.value -= knowledgeToConvert;
  resources.usdt.value += knowledgeToConvert * conversionRate;
  
  // Ограничиваем значение USDT максимумом
  if (resources.usdt.max > 0 && resources.usdt.value > resources.usdt.max) {
    resources.usdt.value = resources.usdt.max;
  }
  
  // Увеличиваем счетчик применения знаний
  if (!newState.counters.applyKnowledge) {
    newState.counters.applyKnowledge = { id: 'applyKnowledge', value: 1 };
  } else if (typeof newState.counters.applyKnowledge === 'object') {
    newState.counters.applyKnowledge.value += 1;
  } else {
    newState.counters.applyKnowledge = { 
      id: 'applyKnowledge', 
      value: newState.counters.applyKnowledge + 1 
    };
  }
  
  newState.resources = resources;
  
  // Проверяем разблокировки после применения знаний
  return unlockSystemService.checkAllUnlocks(newState);
};

/**
 * Обработчик для применения всех доступных знаний (максимально возможное количество)
 */
export const processApplyAllKnowledge = (state: GameState): GameState => {
  // Создаем копию состояния
  const newState = { ...state };
  const resources = { ...state.resources };
  
  // Проверяем, есть ли знания и достаточно ли их
  if (!resources.knowledge || resources.knowledge.value < 10) {
    safeDispatchGameEvent('Недостаточно знаний для применения', 'error');
    return state;
  }
  
  // Проверяем, разблокирован ли USDT
  if (!resources.usdt) {
    resources.usdt = {
      id: 'usdt',
      name: 'USDT',
      description: 'Стабильная криптовалюта, привязанная к доллару',
      type: 'currency',
      icon: 'dollar',
      value: 0,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 100,
      unlocked: true,
      consumption: 0
    };
    
    newState.unlocks.usdt = true;
  }
  
  // Базовая ставка конвертации: 10 знаний = 1 USDT
  let conversionRate = 0.1; // 1/10
  
  // Проверяем, есть ли исследование для повышения эффективности
  const hasCryptoBasics = 
    (state.upgrades.cryptoCurrencyBasics?.purchased === true) ||
    (state.upgrades.cryptoBasics?.purchased === true);
  
  // Если есть исследование, увеличиваем эффективность на 10%
  if (hasCryptoBasics) {
    conversionRate = 0.11; // +10% = 0.1 * 1.1
  }
  
  // Сколько знаний можно конвертировать (кратно 10)
  const knowledgeAmount = resources.knowledge.value;
  const conversions = Math.floor(knowledgeAmount / 10);
  const knowledgeToConvert = conversions * 10;
  
  if (knowledgeToConvert <= 0) {
    safeDispatchGameEvent('Недостаточно знаний для применения (нужно минимум 10)', 'error');
    return state;
  }
  
  // Конвертируем знания в USDT
  resources.knowledge.value -= knowledgeToConvert;
  const usdtGained = knowledgeToConvert * conversionRate;
  resources.usdt.value += usdtGained;
  
  // Ограничиваем значение USDT максимумом
  if (resources.usdt.max > 0 && resources.usdt.value > resources.usdt.max) {
    resources.usdt.value = resources.usdt.max;
  }
  
  // Увеличиваем счетчик применения знаний
  if (!newState.counters.applyKnowledge) {
    newState.counters.applyKnowledge = { id: 'applyKnowledge', value: 1 };
  } else if (typeof newState.counters.applyKnowledge === 'object') {
    newState.counters.applyKnowledge.value += 1;
  } else {
    newState.counters.applyKnowledge = { 
      id: 'applyKnowledge', 
      value: newState.counters.applyKnowledge + 1 
    };
  }
  
  // Отправляем уведомление
  safeDispatchGameEvent(`Применено ${knowledgeToConvert} знаний, получено ${usdtGained.toFixed(2)} USDT`, 'success');
  
  newState.resources = resources;
  
  // Проверяем разблокировки после применения знаний
  return unlockSystemService.checkAllUnlocks(newState);
};

/**
 * Обработчик для обмена Bitcoin на USDT
 */
export const processExchangeBitcoin = (state: GameState): GameState => {
  // Создаем копию состояния
  const newState = { ...state };
  const resources = { ...state.resources };
  
  // Проверяем, есть ли Bitcoin и достаточно ли его
  if (!resources.bitcoin || resources.bitcoin.value <= 0) {
    safeDispatchGameEvent('Недостаточно Bitcoin для обмена', 'error');
    return state;
  }
  
  // Получаем параметры обмена
  const bitcoinAmount = resources.bitcoin.value;
  const exchangeRate = state.miningParams?.exchangeRate || 20000;
  const commission = state.miningParams?.exchangeCommission || 0.05;
  
  // Рассчитываем USDT к получению
  const usdtBeforeCommission = bitcoinAmount * exchangeRate;
  const commissionAmount = usdtBeforeCommission * commission;
  const finalUsdtAmount = usdtBeforeCommission - commissionAmount;
  
  // Обновляем ресурсы
  resources.bitcoin.value = 0;
  resources.usdt.value += finalUsdtAmount;
  
  // Ограничиваем значение USDT максимумом
  if (resources.usdt.max > 0 && resources.usdt.value > resources.usdt.max) {
    resources.usdt.value = resources.usdt.max;
  }
  
  // Отправляем уведомление
  safeDispatchGameEvent(
    `Обменено ${bitcoinAmount.toFixed(8)} BTC на ${finalUsdtAmount.toFixed(2)} USDT (курс: ${exchangeRate})`, 
    'success'
  );
  
  newState.resources = resources;
  
  // Проверяем разблокировки после обмена
  return unlockSystemService.checkAllUnlocks(newState);
};
