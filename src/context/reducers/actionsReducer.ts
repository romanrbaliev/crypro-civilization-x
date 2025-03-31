
import { GameState } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Обработка применения знаний для получения USDT
export const processApplyKnowledge = (state: GameState): GameState => {
  console.log("processApplyKnowledge: Начало обработки применения знаний");
  
  // Проверяем наличие достаточных знаний
  if (!state.resources.knowledge || state.resources.knowledge.value < 10) {
    console.warn("Недостаточно знаний для применения");
    return state;
  }
  
  // Базовая конверсия: 10 знаний -> 1 USDT
  const knowledgeCost = 10;
  const baseUsdtGain = 1;
  
  // Применяем бонусы эффективности (если есть улучшение "Основы криптовалют")
  const cryptoCurrencyBasics = state.upgrades.cryptoCurrencyBasics;
  const efficiencyBonus = cryptoCurrencyBasics && cryptoCurrencyBasics.purchased ? 0.1 : 0; // +10% если исследование куплено
  const usdtGain = Math.floor(baseUsdtGain * (1 + efficiencyBonus));
  
  // Обновляем ресурсы
  const updatedResources = { ...state.resources };
  
  // Уменьшаем знания
  updatedResources.knowledge = {
    ...updatedResources.knowledge,
    value: Math.max(0, updatedResources.knowledge.value - knowledgeCost)
  };
  
  // Увеличиваем счетчик применения знаний
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
  
  console.log(`processApplyKnowledge: Обновлен счетчик применения знаний: ${newCounters.applyKnowledge.value}`);
  
  // Инициализируем или обновляем USDT
  if (!updatedResources.usdt || !updatedResources.usdt.unlocked) {
    // Если USDT еще не существует или не разблокирован - создаем его
    updatedResources.usdt = {
      id: 'usdt',
      name: 'USDT',
      description: 'Стейблкоин, привязанный к стоимости доллара США',
      value: usdtGain,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 50,
      unlocked: true,
      type: 'currency',
      icon: 'dollar'
    };
    
    console.log("processApplyKnowledge: USDT создан и разблокирован");
  } else {
    // Если USDT уже существует - добавляем к нему значение
    updatedResources.usdt = {
      ...updatedResources.usdt,
      value: Math.min(updatedResources.usdt.value + usdtGain, updatedResources.usdt.max),
      unlocked: true
    };
    
    console.log(`processApplyKnowledge: USDT обновлен, текущее значение: ${updatedResources.usdt.value}`);
  }
  
  return {
    ...state,
    resources: updatedResources,
    counters: newCounters,
    unlocks: {
      ...state.unlocks,
      usdt: true,  // Всегда устанавливаем флаг разблокировки USDT
      applyKnowledge: true // Устанавливаем флаг разблокировки применения знаний
    }
  };
};

// Обработка применения всех знаний
export const processApplyAllKnowledge = (state: GameState): GameState => {
  console.log("processApplyAllKnowledge: Начало обработки применения всех знаний");
  
  // Проверяем наличие достаточных знаний
  if (!state.resources.knowledge || state.resources.knowledge.value < 10) {
    console.warn("Недостаточно знаний для применения");
    return state;
  }
  
  // Базовая конверсия: 10 знаний -> 1 USDT
  const knowledgeCost = 10;
  const baseUsdtGain = 1;
  
  // Применяем бонусы эффективности (если есть улучшение "Основы криптовалют")
  const cryptoCurrencyBasics = state.upgrades.cryptoCurrencyBasics;
  const efficiencyBonus = cryptoCurrencyBasics && cryptoCurrencyBasics.purchased ? 0.1 : 0; // +10% если исследование куплено
  const actualEfficiencyBonus = 1 + efficiencyBonus;
  
  const availableKnowledge = state.resources.knowledge.value;
  const conversions = Math.floor(availableKnowledge / knowledgeCost);
  const totalKnowledgeSpent = conversions * knowledgeCost;
  const totalUsdtGain = Math.floor(conversions * baseUsdtGain * actualEfficiencyBonus);
  
  // Обновляем ресурсы
  const updatedResources = { ...state.resources };
  
  // Уменьшаем знания
  updatedResources.knowledge = {
    ...updatedResources.knowledge,
    value: Math.max(0, updatedResources.knowledge.value - totalKnowledgeSpent)
  };
  
  // Увеличиваем счетчик применения знаний (за каждую конверсию)
  let newCounters = { ...state.counters };
  if (!newCounters.applyKnowledge) {
    newCounters.applyKnowledge = {
      id: 'applyKnowledge',
      name: 'Применение знаний',
      value: conversions
    };
  } else {
    newCounters.applyKnowledge = {
      ...newCounters.applyKnowledge,
      value: newCounters.applyKnowledge.value + conversions
    };
  }
  
  console.log(`processApplyAllKnowledge: Обновлен счетчик применения знаний: +${conversions}, всего: ${newCounters.applyKnowledge.value}`);
  
  // Инициализируем или обновляем USDT
  if (!updatedResources.usdt || !updatedResources.usdt.unlocked) {
    // Если USDT еще не существует или не разблокирован - создаем его
    updatedResources.usdt = {
      id: 'usdt',
      name: 'USDT',
      description: 'Стейблкоин, привязанный к стоимости доллара США',
      value: totalUsdtGain,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 50,
      unlocked: true,
      type: 'currency',
      icon: 'dollar'
    };
    
    console.log(`processApplyAllKnowledge: USDT создан и разблокирован, значение: ${totalUsdtGain}`);
  } else {
    // Если USDT уже существует - добавляем к нему значение
    const newValue = Math.min(updatedResources.usdt.value + totalUsdtGain, updatedResources.usdt.max);
    updatedResources.usdt = {
      ...updatedResources.usdt,
      value: newValue,
      unlocked: true
    };
    
    console.log(`processApplyAllKnowledge: USDT обновлен, текущее значение: ${newValue}`);
  }
  
  return {
    ...state,
    resources: updatedResources,
    counters: newCounters,
    unlocks: {
      ...state.unlocks,
      usdt: true,  // Всегда устанавливаем флаг разблокировки USDT
      applyKnowledge: true // Устанавливаем флаг разблокировки применения знаний
    }
  };
};

// Обработка использования вычислительной мощности для майнинга
export const processMiningPower = (state: GameState): GameState => {
  // Проверяем наличие достаточной вычислительной мощности
  if (!state.resources.computingPower || state.resources.computingPower.value < 10) {
    safeDispatchGameEvent('Недостаточно вычислительной мощности для майнинга', 'error');
    return state;
  }
  
  // Базовое количество вычислительной мощности для майнинга
  const computingPowerCost = 10;
  // Базовое количество получаемого Bitcoin
  const baseBitcoinGain = 0.00001;
  
  // Применяем бонусы эффективности майнинга (если есть соответствующие улучшения)
  const miningEfficiencyBonus = 0; // Здесь можно добавить бонусы от улучшений
  const bitcoinGain = baseBitcoinGain * (1 + miningEfficiencyBonus);
  
  // Обновляем ресурсы
  const updatedResources = { ...state.resources };
  
  // Уменьшаем вычислительную мощность
  updatedResources.computingPower = {
    ...updatedResources.computingPower,
    value: Math.max(0, updatedResources.computingPower.value - computingPowerCost)
  };
  
  // Инициализируем или обновляем Bitcoin
  if (!updatedResources.bitcoin) {
    // Если Bitcoin еще не существует - создаем его
    updatedResources.bitcoin = {
      id: 'bitcoin',
      name: 'Bitcoin',
      description: 'Криптовалюта, добываемая майнингом',
      value: bitcoinGain,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 1,
      unlocked: true,
      type: 'currency',
      icon: 'bitcoin'
    };
  } else {
    // Если Bitcoin уже существует - добавляем к нему значение
    updatedResources.bitcoin = {
      ...updatedResources.bitcoin,
      value: updatedResources.bitcoin.value + bitcoinGain,
      unlocked: true
    };
  }
  
  // Обновляем флаги разблокировки
  const updatedUnlocks = { ...state.unlocks, bitcoin: true };
  
  return {
    ...state,
    resources: updatedResources,
    unlocks: updatedUnlocks
  };
};

// Обработка обмена Bitcoin на USDT
export const processExchangeBtc = (state: GameState): GameState => {
  // Проверяем наличие Bitcoin для обмена
  if (!state.resources.bitcoin || state.resources.bitcoin.value <= 0) {
    safeDispatchGameEvent('Нет Bitcoin для обмена', 'error');
    return state;
  }
  
  const bitcoinAmount = state.resources.bitcoin.value;
  
  // Получаем текущий курс обмена и комиссию
  const exchangeRate = state.miningParams?.exchangeRate || 20000; // По умолчанию 20000 USDT за 1 BTC
  const exchangeCommission = state.miningParams?.exchangeCommission || 0.05; // 5% комиссия по умолчанию
  
  // Рассчитываем полученный USDT
  const usdtBeforeCommission = bitcoinAmount * exchangeRate;
  const commissionAmount = usdtBeforeCommission * exchangeCommission;
  const usdtAmount = usdtBeforeCommission - commissionAmount;
  
  // Обновляем ресурсы
  const updatedResources = { ...state.resources };
  
  // Обнуляем Bitcoin
  updatedResources.bitcoin = {
    ...updatedResources.bitcoin,
    value: 0
  };
  
  // Увеличиваем USDT
  if (updatedResources.usdt) {
    updatedResources.usdt = {
      ...updatedResources.usdt,
      value: Math.min(updatedResources.usdt.value + usdtAmount, updatedResources.usdt.max)
    };
  } else {
    // Если USDT не существует, создаем его
    updatedResources.usdt = {
      id: 'usdt',
      name: 'USDT',
      description: 'Стейблкоин, привязанный к стоимости доллара США',
      value: usdtAmount,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 50,
      unlocked: true,
      type: 'currency',
      icon: 'dollar'
    };
  }
  
  return {
    ...state,
    resources: updatedResources
  };
};

// Обработка покупки практики
export const processPracticePurchase = (state: GameState): GameState => {
  console.log("processPracticePurchase: Начало покупки практики");
  
  // Получаем текущий уровень практики
  const currentLevel = state.buildings.practice ? state.buildings.practice.count : 0;
  const baseCost = 10; // Базовая стоимость практики (согласно таблице)
  const costMultiplier = 1.12; // Множитель стоимости (обновленный согласно таблице)
  
  // Рассчитываем стоимость следующего уровня
  const cost = Math.floor(baseCost * Math.pow(costMultiplier, currentLevel));
  
  // Проверяем достаточно ли ресурсов
  if (!state.resources.usdt || state.resources.usdt.value < cost) {
    console.warn(`Недостаточно USDT для покупки практики. Требуется: ${cost}, имеется: ${state.resources.usdt?.value}`);
    return state;
  }
  
  // Создаем или обновляем здание практики
  const updatedBuildings = { ...state.buildings };
  if (!updatedBuildings.practice) {
    updatedBuildings.practice = {
      id: 'practice',
      name: 'Практика',
      description: 'Автоматическое накопление знаний',
      cost: { usdt: 10 },
      count: 1,
      unlocked: true,
      costMultiplier: 1.12, // Согласно таблице
      production: { knowledge: 0.63 }, // Согласно таблице
      consumption: {},
      productionBoost: 0
    };
  } else {
    updatedBuildings.practice = {
      ...updatedBuildings.practice,
      count: updatedBuildings.practice.count + 1
    };
  }
  
  // Обновляем ресурсы (уменьшаем USDT)
  const updatedResources = { ...state.resources };
  updatedResources.usdt = {
    ...updatedResources.usdt,
    value: updatedResources.usdt.value - cost
  };
  
  console.log(`processPracticePurchase: Практика куплена, новый уровень: ${updatedBuildings.practice.count}`);
  
  return {
    ...state,
    buildings: updatedBuildings,
    resources: updatedResources
  };
};
