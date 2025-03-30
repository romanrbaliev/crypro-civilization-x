import { GameState } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { BonusCalculationService } from '@/services/BonusCalculationService';

const bonusCalculationService = new BonusCalculationService();

export const processApplyKnowledge = (state: GameState): GameState => {
  if (!state.resources.knowledge || state.resources.knowledge.value < 10) {
    console.warn('Недостаточно знаний для применения');
    return state;
  }

  const knowledgeCost = 10;
  let usdtReward = 1;

  if (state.upgrades.cryptoCurrencyBasics && state.upgrades.cryptoCurrencyBasics.purchased) {
    usdtReward = Math.floor(usdtReward * 1.1);
  }

  let newResources = { ...state.resources };
  
  newResources.knowledge = {
    ...newResources.knowledge,
    value: newResources.knowledge.value - knowledgeCost
  };

  if (!newResources.usdt) {
    newResources.usdt = {
      id: 'usdt',
      name: 'USDT',
      description: 'Стейблкоин, универсальная валюта для покупок',
      type: 'currency',
      icon: 'coins',
      value: usdtReward,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 50,
      unlocked: false
    };
  } else {
    newResources.usdt = {
      ...newResources.usdt,
      value: (newResources.usdt.value || 0) + usdtReward
    };
  }

  let newCounters = { ...state.counters };
  if (newCounters.applyKnowledge) {
    newCounters.applyKnowledge = {
      ...newCounters.applyKnowledge,
      value: newCounters.applyKnowledge.value + 1
    };
  } else {
    newCounters.applyKnowledge = {
      id: 'applyKnowledge',
      name: 'Применения знаний',
      value: 1
    };
  }
  
  console.log("processApplyKnowledge: Установили счетчик applyKnowledge =", 
    newCounters.applyKnowledge?.value);

  return {
    ...state,
    resources: newResources,
    counters: newCounters
  };
};

export const processApplyAllKnowledge = (state: GameState): GameState => {
  if (!state.resources.knowledge || state.resources.knowledge.value < 10) {
    console.warn('Недостаточно знаний для применения');
    return state;
  }

  const knowledgeAmount = state.resources.knowledge.value;
  const portions = Math.floor(knowledgeAmount / 10);
  
  let usdtReward = portions;

  if (state.upgrades.cryptoCurrencyBasics && state.upgrades.cryptoCurrencyBasics.purchased) {
    usdtReward = Math.floor(usdtReward * 1.1);
  }

  let newResources = { ...state.resources };
  
  newResources.knowledge = {
    ...newResources.knowledge,
    value: 0
  };
  
  if (!newResources.usdt) {
    newResources.usdt = {
      id: 'usdt',
      name: 'USDT',
      description: 'Стейблкоин, универсальная валюта для покупок',
      type: 'currency',
      icon: 'coins',
      value: usdtReward,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 50,
      unlocked: false
    };
  } else {
    newResources.usdt = {
      ...newResources.usdt,
      value: (newResources.usdt.value || 0) + usdtReward
    };
  }

  let newCounters = { ...state.counters };
  if (newCounters.applyKnowledge) {
    newCounters.applyKnowledge = {
      ...newCounters.applyKnowledge,
      value: newCounters.applyKnowledge.value + 1
    };
  } else {
    newCounters.applyKnowledge = {
      id: 'applyKnowledge',
      name: 'Применения знаний',
      value: 1
    };
  }
  
  console.log("processApplyAllKnowledge: Установили счетчик applyKnowledge =", 
    newCounters.applyKnowledge?.value);

  return {
    ...state,
    resources: newResources,
    counters: newCounters
  };
};

export const processPracticePurchase = (state: GameState): GameState => {
  const currentLevel = state.buildings.practice?.count || 0;
  const baseCost = 10;
  const cost = Math.floor(baseCost * Math.pow(1.15, currentLevel));

  if (state.resources.usdt.value < cost) {
    return state;
  }

  const updatedResources = { ...state.resources };
  updatedResources.usdt = {
    ...updatedResources.usdt,
    value: Math.max(0, updatedResources.usdt.value - cost)
  };

  const newBuildings = { ...state.buildings };
  if (!newBuildings.practice) {
    newBuildings.practice = {
      id: 'practice',
      name: 'Практика',
      description: 'Автоматически применяет знания для получения новых. +0.21 знаний/сек за уровень.',
      cost: { usdt: baseCost },
      costMultiplier: 1.15,
      count: 1,
      unlocked: true,
      productionBoost: 0,
      production: { knowledge: 0.21 }
    };
  } else {
    newBuildings.practice = {
      ...newBuildings.practice,
      count: newBuildings.practice.count + 1
    };
  }

  const newUnlocks = { ...state.unlocks, knowledge: true };

  const newState = {
    ...state,
    resources: updatedResources,
    buildings: newBuildings,
    unlocks: newUnlocks
  };

  console.log(`Куплена практика уровня ${newBuildings.practice.count} за ${cost} USDT`);
  return newState;
};

export const processMiningPower = (state: GameState): GameState => {
  if (!state.resources.computingPower || state.resources.computingPower.value <= 0) {
    console.warn("Недостаточно вычислительной мощности для майнинга");
    return state;
  }

  const { miningParams } = state;

  const newResources = { ...state.resources };

  newResources.computingPower = {
    ...newResources.computingPower,
    value: Math.max(0, newResources.computingPower.value - 50)
  };

  if (newResources.bitcoin) {
    newResources.bitcoin = {
      ...newResources.bitcoin,
      value: newResources.bitcoin.value + 0.00005,
      unlocked: true
    };
  } else {
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

  if (newResources.bitcoin.value > newResources.bitcoin.max) {
    newResources.bitcoin.value = newResources.bitcoin.max;
  }

  console.log("Выполнен майнинг: -50 вычислительной мощности, +0.00005 Bitcoin");

  const newUnlocks = {
    ...state.unlocks,
    bitcoin: true
  };

  return {
    ...state,
    resources: newResources,
    unlocks: newUnlocks
  };
};

export const processExchangeBtc = (state: GameState): GameState => {
  if (!state.resources.bitcoin || state.resources.bitcoin.value <= 0) {
    console.warn("Нет Bitcoin для обмена");
    return state;
  }

  const exchangeRate = state.miningParams.exchangeRate || 20000;
  const commission = state.miningParams.exchangeCommission || 0.05;

  const bitcoinAmount = state.resources.bitcoin.value;
  const usdtBeforeCommission = bitcoinAmount * exchangeRate;
  const commissionAmount = usdtBeforeCommission * commission;
  const usdtAmount = usdtBeforeCommission - commissionAmount;

  const newResources = { ...state.resources };

  newResources.bitcoin = {
    ...newResources.bitcoin,
    value: 0
  };

  newResources.usdt = {
    ...newResources.usdt,
    value: newResources.usdt.value + usdtAmount
  };

  console.log(`Обмен Bitcoin: -${bitcoinAmount.toFixed(8)} Bitcoin, +${usdtAmount.toFixed(2)} USDT (курс: ${exchangeRate}, комиссия: ${commission * 100}%)`);

  safeDispatchGameEvent(`Обменены ${bitcoinAmount.toFixed(8)} Bitcoin на ${usdtAmount.toFixed(2)} USDT`, "success");

  return {
    ...state,
    resources: newResources
  };
};
