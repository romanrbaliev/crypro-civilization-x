import { GameState } from '../types';
import { calculateResourceMaxValue } from '@/utils/resourceCalculator';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

const KNOWLEDGE_EXCHANGE_RATE = 10;

export const processApplyKnowledge = (state: GameState): GameState => {
  const knowledge = state.resources.knowledge || { value: 0 };
  const usdt = state.resources.usdt || { value: 0, unlocked: false };

  if (knowledge.value < KNOWLEDGE_EXCHANGE_RATE) {
    console.log(`Недостаточно знаний для обмена: ${knowledge.value}/${KNOWLEDGE_EXCHANGE_RATE}`);
    return state;
  }

  const exchangeCount = Math.floor(knowledge.value / KNOWLEDGE_EXCHANGE_RATE);
  const knowledgeToExchange = exchangeCount * KNOWLEDGE_EXCHANGE_RATE;

  const knowledgeEfficiencyBonus = state.resources.knowledgeEfficiency?.value || 0;

  const usdtGain = exchangeCount * (1 + knowledgeEfficiencyBonus);

  const newKnowledge = {
    ...state.resources.knowledge,
    value: state.resources.knowledge.value - knowledgeToExchange
  };

  const newUsdt = state.resources.usdt 
    ? {
        ...state.resources.usdt,
        value: state.resources.usdt.value + usdtGain,
        unlocked: true
      }
    : {
        id: 'usdt',
        name: 'USDT',
        description: 'Стейблкоин, привязанный к доллару США',
        icon: 'dollar',
        type: 'currency',
        value: usdtGain,
        unlocked: true,
        max: 100,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        consumption: 0
      };

  const newResources = {
    ...state.resources,
    knowledge: newKnowledge,
    usdt: newUsdt
  };

  const newUnlocks: { [key: string]: boolean } = {
    ...state.unlocks,
    usdt: true
  };

  const newCounters = {
    ...state.counters,
    applyKnowledge: {
      ...(state.counters.applyKnowledge || { id: 'applyKnowledge', name: 'Применить знания', value: 0 }),
      value: (state.counters.applyKnowledge?.value || 0) + 1
    }
  };

  console.log(`Обмен знаний: ${knowledgeToExchange} знаний обменяно на ${usdtGain} USDT`);
  console.log(`Новый счетчик applyKnowledge: ${newCounters.applyKnowledge.value}`);

  safeDispatchGameEvent(
    `Обменяно ${knowledgeToExchange} знаний на ${usdtGain} USDT`,
    "success"
  );

  return {
    ...state,
    resources: newResources,
    unlocks: newUnlocks,
    counters: newCounters
  };
};

export const processApplyAllKnowledge = (state: GameState): GameState => {
  const knowledgeValue = state.resources.knowledge?.value || 0;

  let knowledgeEfficiency = 1;

  if (state.upgrades.cryptoBasics && state.upgrades.cryptoBasics.purchased) {
    knowledgeEfficiency += 0.1;
  }

  if (knowledgeValue < 10) {
    return state;
  }

  const applicableKnowledge = Math.floor(knowledgeValue / 10) * 10;

  const usdtToAdd = (applicableKnowledge / 10) * knowledgeEfficiency;

  const usdtMax = calculateResourceMaxValue(state, 'usdt');
  const currentUsdt = state.resources.usdt?.value || 0;
  const newUsdt = Math.min(currentUsdt + usdtToAdd, usdtMax);
  const actualUsdtToAdd = newUsdt - currentUsdt;

  console.log(`processApplyAllKnowledge: Применяем ${applicableKnowledge} знаний и получаем ${actualUsdtToAdd} USDT`);

  const updatedResources = {
    ...state.resources,
    knowledge: {
      ...state.resources.knowledge,
      value: knowledgeValue - applicableKnowledge
    },
    usdt: state.resources.usdt 
      ? {
          ...state.resources.usdt,
          value: newUsdt,
          unlocked: true
        }
      : {
          id: 'usdt',
          name: 'USDT',
          description: 'Стейблкоин, привязанный к доллару США',
          icon: 'dollar',
          type: 'currency',
          value: newUsdt,
          unlocked: true,
          max: 100,
          baseProduction: 0,
          production: 0,
          perSecond: 0,
          consumption: 0
        }
  };

  const updatedUnlocks: { [key: string]: boolean } = {
    ...state.unlocks,
    usdt: true
  };

  safeDispatchGameEvent(`Применено ${applicableKnowledge} знаний, получено ${actualUsdtToAdd.toFixed(2)} USDT`, "success");

  return {
    ...state,
    resources: updatedResources,
    unlocks: updatedUnlocks
  };
};

export const processMiningPower = (state: GameState): GameState => {
  const computingPower = state.resources.computingPower;
  const bitcoin = state.resources.bitcoin;

  if (!computingPower || computingPower.value <= 0) {
    return state;
  }

  let miningEfficiency = 0.0001;

  if (state.upgrades.algorithmOptimization && state.upgrades.algorithmOptimization.purchased) {
    miningEfficiency *= 1.15;
  }

  if (state.upgrades.proofOfWork && state.upgrades.proofOfWork.purchased) {
    miningEfficiency *= 1.25;
  }

  const minedBitcoin = computingPower.value * miningEfficiency;

  const updatedBitcoin = bitcoin || {
    id: 'bitcoin',
    name: 'Bitcoin',
    description: 'Криптовалюта Bitcoin',
    type: 'resource',
    icon: 'bitcoin',
    value: 0,
    max: 10,
    unlocked: true,
    baseProduction: 0,
    production: 0,
    perSecond: 0,
    consumption: 0
  };

  return {
    ...state,
    resources: {
      ...state.resources,
      bitcoin: {
        ...updatedBitcoin,
        value: (updatedBitcoin.value || 0) + minedBitcoin,
        unlocked: true
      }
    },
    unlocks: {
      ...state.unlocks,
      bitcoin: true
    }
  };
};

export const processExchangeBtc = (state: GameState): GameState => {
  const bitcoin = state.resources.bitcoin;

  if (!bitcoin || bitcoin.value <= 0) {
    return state;
  }

  const usdt = state.resources.usdt || {
    id: 'usdt',
    name: 'USDT',
    description: 'Стейблкоин, привязанный к доллару США',
    type: 'resource',
    icon: 'dollar-sign',
    value: 0,
    max: 100,
    unlocked: true,
    baseProduction: 0,
    production: 0,
    perSecond: 0,
    consumption: 0
  };

  const btcPrice = state.btcPrice || 20000;
  
  const exchangedUsdt = bitcoin.value * btcPrice;

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
        value: usdt.value + exchangedUsdt,
        unlocked: true
      }
    },
    unlocks: {
      ...state.unlocks,
      usdt: true
    }
  };
};

export const processPracticePurchase = (state: GameState): GameState => {
  if (!state.unlocks.practice) {
    return state;
  }

  const practiceCost = 5;

  if (!state.resources.usdt || state.resources.usdt.value < practiceCost) {
    return state;
  }

  return {
    ...state,
    resources: {
      ...state.resources,
      usdt: {
        ...state.resources.usdt,
        value: state.resources.usdt.value - practiceCost
      }
    },
    buildings: {
      ...state.buildings,
      practice: {
        ...state.buildings.practice,
        count: (state.buildings.practice?.count || 0) + 1
      }
    }
  };
};
