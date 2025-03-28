import { GameState } from '../types';
import { updateResourceMaxValues } from '../utils/resourceUtils';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Обработка применения знаний
export const processApplyKnowledge = (state: GameState): GameState => {
  const { resources, unlocks, upgrades } = state;
  const knowledge = resources.knowledge;
  const usdt = resources.usdt;
  
  const knowledgeCost = 10;
  
  if (!knowledge || !usdt || knowledge.value < knowledgeCost) {
    safeDispatchGameEvent("Недостаточно знаний!", "error");
    return state;
  }
  
  let usdtGain = 1;
  let knowledgeEfficiencyBonus = 0;
  
  if (upgrades.cryptoCurrencyBasics && upgrades.cryptoCurrencyBasics.purchased) {
    knowledgeEfficiencyBonus += 0.1;
    console.log("Применен бонус от исследования 'Основы криптовалют': +10% к эффективности применения знаний");
  }
  
  usdtGain = Math.floor(usdtGain * (1 + knowledgeEfficiencyBonus)) || 1;
  
  if (knowledgeEfficiencyBonus === 0.1) {
    usdtGain = 1.1;
  }
  
  let newKnowledgeValue = knowledge.value - knowledgeCost;
  let newUsdtValue = usdt.value + usdtGain;
  
  if (newUsdtValue > usdt.max) {
    newUsdtValue = usdt.max;
    safeDispatchGameEvent("Достигнут максимум USDT!", "warning");
  }
  
  console.log(`Применение знаний: -${knowledgeCost} знаний, +${usdtGain} USDT (бонус эффективности: ${knowledgeEfficiencyBonus * 100}%)`);
  
  return {
    ...state,
    resources: {
      ...state.resources,
      knowledge: {
        ...knowledge,
        value: newKnowledgeValue
      },
      usdt: {
        ...usdt,
        value: newUsdtValue
      }
    }
  };
};

// Обработка применения всех знаний
export const processApplyAllKnowledge = (state: GameState): GameState => {
  const { resources, unlocks, upgrades } = state;
  const knowledge = resources.knowledge;
  const usdt = resources.usdt;
  
  if (!knowledge || !usdt || knowledge.value < 10) {
    safeDispatchGameEvent("Недостаточно знаний для применения!", "error");
    return state;
  }
  
  let usdtRate = 1;
  let knowledgeEfficiencyBonus = 0;
  
  if (upgrades.cryptoCurrencyBasics && upgrades.cryptoCurrencyBasics.purchased) {
    knowledgeEfficiencyBonus += 0.1;
    console.log("Применен бонус от исследования 'Основы криптовалют': +10% к эффективности применения знаний");
  }
  
  usdtRate = Math.floor(usdtRate * (1 + knowledgeEfficiencyBonus)) || 1;
  
  if (knowledgeEfficiencyBonus === 0.1) {
    usdtRate = 1.1;
  }
  
  const appliedKnowledge = knowledge.value;
  const knowledgeSets = Math.floor(appliedKnowledge / 10);
  const totalUsdtGain = knowledgeSets * usdtRate;
  
  let newKnowledgeValue = knowledge.value % 10;
  let newUsdtValue = usdt.value + totalUsdtGain;
  
  if (newUsdtValue > usdt.max) {
    newUsdtValue = usdt.max;
    safeDispatchGameEvent("Достигнут максимум USDT!", "warning");
  }
  
  console.log(`Применение всех знаний: -${appliedKnowledge - newKnowledgeValue} знаний, +${totalUsdtGain} USDT (бонус эффективности: ${knowledgeEfficiencyBonus * 100}%)`);
  
  return {
    ...state,
    resources: {
      ...state.resources,
      knowledge: {
        ...knowledge,
        value: newKnowledgeValue
      },
      usdt: {
        ...usdt,
        value: newUsdtValue
      }
    }
  };
};

// Обработка добычи вычислительной мощности
export const processMiningPower = (state: GameState): GameState => {
  const { resources } = state;
  const computingPower = resources.computingPower;
  const usdt = resources.usdt;
  
  const miningCost = 2;
  const miningReward = 1;
  
  if (!computingPower || computingPower.value < miningCost || !usdt) {
    safeDispatchGameEvent("Недостаточно вычислительной мощности!", "error");
    return state;
  }
  
  let newComputingPowerValue = computingPower.value - miningCost;
  let newUsdtValue = usdt.value + miningReward;
  
  if (newUsdtValue > usdt.max) {
    newUsdtValue = usdt.max;
    safeDispatchGameEvent("Достигнут максимум USDT!", "warning");
  }
  
  return {
    ...state,
    resources: {
      ...state.resources,
      computingPower: {
        ...computingPower,
        value: newComputingPowerValue
      },
      usdt: {
        ...usdt,
        value: newUsdtValue
      }
    }
  };
};

// Обработка обмена BTC на USDT
export const processExchangeBtc = (state: GameState): GameState => {
  const btcResource = state.resources.btc;
  
  if (!btcResource || !btcResource.unlocked || btcResource.value <= 0) {
    console.log("Не удалось обменять BTC: ресурс недоступен или равен 0");
    return state;
  }
  
  const btcPrice = state.miningParams.exchangeRate || 30000;
  const commission = state.miningParams.exchangeCommission || 0.05;
  
  const usdtAmountBeforeCommission = btcResource.value * btcPrice;
  const commissionAmount = usdtAmountBeforeCommission * commission;
  const finalUsdtAmount = usdtAmountBeforeCommission - commissionAmount;
  
  console.log(`Обмен BTC на USDT:`, {
    btcAmount: btcResource.value,
    btcPrice,
    commission,
    usdtAmountBeforeCommission,
    commissionAmount,
    finalUsdtAmount
  });
  
  const newState = {
    ...state,
    resources: {
      ...state.resources,
      btc: {
        ...btcResource,
        value: 0
      },
      usdt: {
        ...state.resources.usdt,
        value: state.resources.usdt.value + finalUsdtAmount
      }
    }
  };
  
  safeDispatchGameEvent(
    `Обменяны ${btcResource.value.toFixed(8)} BTC на ${finalUsdtAmount.toFixed(2)} USDT по курсу ${btcPrice}`,
    "success"
  );
  
  return updateResourceMaxValues(newState);
};

// Обработка покупки практики
export const processPracticePurchase = (state: GameState): GameState => {
  const practiceCount = state.buildings.practice.count;
  const practiceBaseCost = state.buildings.practice.cost.usdt;
  const practiceCostMultiplier = state.buildings.practice.costMultiplier || 1.15;
  
  const currentCost = Math.floor(practiceBaseCost * Math.pow(practiceCostMultiplier, practiceCount));
  
  if (state.resources.usdt.value < currentCost) {
    safeDispatchGameEvent(`Недостаточно USDT для покупки практики (нужно ${currentCost})`, "error");
    return state;
  }
  
  const newResources = { ...state.resources };
  newResources.usdt = {
    ...newResources.usdt,
    value: newResources.usdt.value - currentCost
  };
  
  const newBuildings = { ...state.buildings };
  newBuildings.practice = {
    ...newBuildings.practice,
    count: practiceCount + 1
  };
  
  console.log(`Куплена практика (уровень ${practiceCount + 1}) за ${currentCost} USDT`);
  
  return {
    ...state,
    resources: newResources,
    buildings: newBuildings
  };
};
