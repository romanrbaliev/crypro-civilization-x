import { ResourceProductionService } from '@/services/ResourceProductionService';
import { GameState } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Применить знания - конвертация знаний в USDT
export const processApplyKnowledge = (state: GameState): GameState => {
  const knowledgeCost = 10;
  
  // Проверяем достаточно ли знаний
  if (state.resources.knowledge.value < knowledgeCost) {
    console.warn(`Недостаточно знаний для применения! Необходимо: ${knowledgeCost}, имеется: ${state.resources.knowledge.value}`);
    return state;
  }
  
  // Получаем эффективность применения знаний
  // Базовая эффективность - 1 USDT за 10 знаний
  let efficiency = 1.0;
  
  // Проверяем наличие исследования "Основы криптовалют"
  if (state.upgrades.cryptoCurrencyBasics && state.upgrades.cryptoCurrencyBasics.purchased) {
    efficiency += 0.1; // +10% к эффективности конвертации
  }
  
  // Рассчитываем количество USDT
  const usdtGained = Math.floor(1 * efficiency);
  
  // Обновляем ресурсы
  const newResources = { ...state.resources };
  
  // Вычитаем знания
  newResources.knowledge = {
    ...newResources.knowledge,
    value: Math.max(0, newResources.knowledge.value - knowledgeCost)
  };
  
  // Добавляем USDT
  newResources.usdt = {
    ...newResources.usdt,
    value: newResources.usdt.value + usdtGained,
    unlocked: true // Гарантируем, что USDT разблокирован при первом получении
  };
  
  // Обновляем флаг разблокировки USDT
  const newUnlocks = {
    ...state.unlocks,
    usdt: true
  };
  
  console.log(`Применены знания: -${knowledgeCost} знаний, +${usdtGained} USDT`);
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    resources: newResources,
    unlocks: newUnlocks
  };
};

// Применить все знания - конвертация всех накопленных знаний в USDT
export const processApplyAllKnowledge = (state: GameState): GameState => {
  const knowledgeCost = 10; // Минимальное количество для конвертации
  
  // Проверяем достаточно ли знаний
  if (state.resources.knowledge.value < knowledgeCost) {
    console.warn(`Недостаточно знаний для применения! Необходимо: ${knowledgeCost}, имеется: ${state.resources.knowledge.value}`);
    return state;
  }
  
  // Получаем эффективность применения знаний
  // Базовая эффективность - 1 USDT за 10 знаний
  let efficiency = 1.0;
  
  // Проверяем наличие исследования "Основы криптовалют"
  if (state.upgrades.cryptoCurrencyBasics && state.upgrades.cryptoCurrencyBasics.purchased) {
    efficiency += 0.1; // +10% к эффективности конвертации
  }
  
  // Рассчитываем сколько знаний конвертируем (все имеющиеся знания)
  const knowledgeToConvert = state.resources.knowledge.value;
  
  // Рассчитываем, сколько наборов по 10 знаний у нас есть
  const knowledgeSets = Math.floor(knowledgeToConvert / knowledgeCost);
  
  // Рассчитываем количество USDT (1 USDT за каждые 10 знаний)
  const usdtGained = Math.floor(knowledgeSets * efficiency);
  
  // Обновляем ресурсы
  const newResources = { ...state.resources };
  
  // Вычитаем знания
  newResources.knowledge = {
    ...newResources.knowledge,
    value: Math.max(0, newResources.knowledge.value - (knowledgeSets * knowledgeCost))
  };
  
  // Добавляем USDT
  newResources.usdt = {
    ...newResources.usdt,
    value: newResources.usdt.value + usdtGained,
    unlocked: true // Гарантируем, что USDT разблокирован при первом получении
  };
  
  // Обновляем флаг разблокировки USDT
  const newUnlocks = {
    ...state.unlocks,
    usdt: true
  };
  
  console.log(`Применены все знания: -${knowledgeSets * knowledgeCost} знаний, +${usdtGained} USDT`);
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    resources: newResources,
    unlocks: newUnlocks
  };
};

// Обработка майнинга вычислительной мощности
export const processMiningPower = (state: GameState): GameState => {
  // Проверяем наличие вычислительной мощности
  if (!state.resources.computingPower || state.resources.computingPower.value <= 0) {
    console.warn("Недостаточно вычислительной мощности для майнинга");
    return state;
  }
  
  // Получаем параметры майнинга
  const { miningParams } = state;
  
  // Обновляем состояние ресурсов
  const newResources = { ...state.resources };
  
  // Вычитаем потребленную вычислительную мощность
  newResources.computingPower = {
    ...newResources.computingPower,
    value: Math.max(0, newResources.computingPower.value - 50)
  };
  
  // Генерируем Bitcoin
  if (newResources.bitcoin) {
    newResources.bitcoin = {
      ...newResources.bitcoin,
      value: newResources.bitcoin.value + 0.00005,
      unlocked: true
    };
  } else {
    // Создаем ресурс Bitcoin если он не существует
    newResources.bitcoin = {
      id: 'bitcoin',
      name: 'Bitcoin',
      description: 'Bitcoin - первая и основная криптовалюта',
      type: 'currency',
      icon: 'bitcoin',
      value: 0.00005,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 0.01,
      unlocked: true
    };
  }
  
  // Проверяем, что не превышен максимум Bitcoin
  if (newResources.bitcoin.value > newResources.bitcoin.max) {
    newResources.bitcoin.value = newResources.bitcoin.max;
  }
  
  console.log("Выполнен майнинг: -50 вычислительной мощности, +0.00005 Bitcoin");
  
  // Обновляем флаг разблокировки Bitcoin
  const newUnlocks = {
    ...state.unlocks,
    bitcoin: true
  };
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    resources: newResources,
    unlocks: newUnlocks
  };
};

// Обменять Bitcoin на USDT
export const processExchangeBtc = (state: GameState): GameState => {
  // Проверяем наличие Bitcoin
  if (!state.resources.bitcoin || state.resources.bitcoin.value <= 0) {
    console.warn("Нет Bitcoin для обмена");
    return state;
  }
  
  // Получаем параметры обмена
  const exchangeRate = state.miningParams.exchangeRate || 20000;
  const commission = state.miningParams.exchangeCommission || 0.05;
  
  // Количество Bitcoin для обмена (всё имеющееся)
  const bitcoinAmount = state.resources.bitcoin.value;
  
  // Рассчитываем USDT до комиссии
  const usdtBeforeCommission = bitcoinAmount * exchangeRate;
  
  // Рассчитываем комиссию
  const commissionAmount = usdtBeforeCommission * commission;
  
  // Рассчитываем итоговое количество USDT
  const usdtAmount = usdtBeforeCommission - commissionAmount;
  
  // Обновляем состояние ресурсов
  const newResources = { ...state.resources };
  
  // Обнуляем Bitcoin
  newResources.bitcoin = {
    ...newResources.bitcoin,
    value: 0
  };
  
  // Добавляем USDT
  newResources.usdt = {
    ...newResources.usdt,
    value: newResources.usdt.value + usdtAmount
  };
  
  console.log(`Обмен Bitcoin: -${bitcoinAmount.toFixed(8)} Bitcoin, +${usdtAmount.toFixed(2)} USDT (курс: ${exchangeRate}, комиссия: ${commission * 100}%)`);
  
  safeDispatchGameEvent(`Обменены ${bitcoinAmount.toFixed(8)} Bitcoin на ${usdtAmount.toFixed(2)} USDT`, "success");
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    resources: newResources
  };
};

// Покупка практики (автоматического производства знаний)
export const processPracticePurchase = (state: GameState): GameState => {
  // Проверяем существование здания практики
  if (!state.buildings.practice) {
    console.warn("Здание 'Практика' не существует");
    return state;
  }
  
  // Получаем текущий уровень здания
  const currentLevel = state.buildings.practice.count;
  
  // Рассчитываем стоимость следующего уровня
  const baseCost = state.buildings.practice.cost.usdt;
  const multiplier = state.buildings.practice.costMultiplier || 1.15;
  const cost = Math.floor(baseCost * Math.pow(multiplier, currentLevel));
  
  // Проверяем наличие ресурсов
  if (state.resources.usdt.value < cost) {
    console.warn(`Недостаточно USDT для покупки практики. Необходимо: ${cost}, имеется: ${state.resources.usdt.value}`);
    return state;
  }
  
  // Обновляем здание
  const newBuildings = { ...state.buildings };
  newBuildings.practice = {
    ...newBuildings.practice,
    count: currentLevel + 1
  };
  
  // Обновляем ресурсы
  const newResources = { ...state.resources };
  newResources.usdt = {
    ...newResources.usdt,
    value: newResources.usdt.value - cost
  };
  
  // Обновляем производство знаний
  // Базовая скорость 0.21 знаний в секунду за один уровень практики
  const baseProduction = 0.21;
  const newProduction = baseProduction * (currentLevel + 1);
  
  // Проверяем наличие улучшений
  let productionModifier = 1.0;
  
  // Проверяем наличие исследования "Основы блокчейна"
  if (state.upgrades.blockchainBasics && state.upgrades.blockchainBasics.purchased) {
    productionModifier += 0.1; // +10% к производству знаний
  } else if (state.upgrades.basicBlockchain && state.upgrades.basicBlockchain.purchased) {
    productionModifier += 0.1; // +10% к производству знаний
  } else if (state.upgrades.blockchain_basics && state.upgrades.blockchain_basics.purchased) {
    productionModifier += 0.1; // +10% к производству знаний
  }
  
  // Обновляем производство знаний
  newResources.knowledge = {
    ...newResources.knowledge,
    perSecond: newProduction * productionModifier
  };
  
  console.log(`Практика улучшена до уровня ${currentLevel + 1}, скорость знаний: ${newProduction * productionModifier} в секунду`);
  
  safeDispatchGameEvent(`Практика улучшена до уровня ${currentLevel + 1}`, "success");
  
  // Используем ResourceProductionService для полного пересчета производства
  const resourceProductionService = new ResourceProductionService();
  const updatedResources = resourceProductionService.calculateResourceProduction({
    ...state,
    resources: newResources,
    buildings: newBuildings
  });
  
  // Возвращаем обновленное состояние с пересчитанными ресурсами
  return {
    ...state,
    resources: updatedResources,
    buildings: newBuildings
  };
};
