import { GameState } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Обработка применения знаний (обмен знаний на USDT)
export const processApplyKnowledge = (state: GameState): GameState => {
  const { resources, unlocks, upgrades } = state;
  const knowledge = resources.knowledge;
  const usdt = resources.usdt;
  
  // Стоимость применения знаний в единицах знаний
  const knowledgeCost = 10;
  
  // Если недостаточно знаний или ресурс не разблокирован
  if (!knowledge || !usdt || knowledge.value < knowledgeCost) {
    safeDispatchGameEvent("Недостаточно знаний!", "error");
    return state;
  }
  
  // Базовая отдача от применения знаний (1 USDT)
  let usdtGain = 1;
  
  // Проверяем наличие бонусов к эффективности применения знаний
  let knowledgeEfficiencyBonus = 0;
  
  // Бонус от исследования "Основы криптовалют"
  if (upgrades.cryptoCurrencyBasics && upgrades.cryptoCurrencyBasics.purchased) {
    knowledgeEfficiencyBonus += 0.1; // +10% к эффективности применения знаний
    console.log("Применен бонус от исследования 'Основы криптовалют': +10% к эффективности применения знаний");
  }
  
  // Применяем бонус к базовой отдаче
  usdtGain = Math.floor(usdtGain * (1 + knowledgeEfficiencyBonus));
  
  // Уменьшаем количество знаний и увеличиваем количество USDT
  let newKnowledgeValue = knowledge.value - knowledgeCost;
  let newUsdtValue = usdt.value + usdtGain;
  
  // Ограничиваем значение USDT максимумом
  if (newUsdtValue > usdt.max) {
    newUsdtValue = usdt.max;
    safeDispatchGameEvent("Достигнут максимум USDT!", "warning");
  }
  
  console.log(`Применение знаний: -${knowledgeCost} знаний, +${usdtGain} USDT (бонус эффективности: ${knowledgeEfficiencyBonus * 100}%)`);
  
  // Обновляем ресурсы
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

// Обработка использования вычислительной мощности для майнинга
export const processMiningPower = (state: GameState): GameState => {
  const { resources } = state;
  const computingPower = resources.computingPower;
  const usdt = resources.usdt;
  
  // Стоимость майнинга в единицах вычислительной мощности
  const miningCost = 2;
  const miningReward = 1; // Награда за майнинг в USDT
  
  // Если недостаточно вычислительной мощности
  if (!computingPower || computingPower.value < miningCost || !usdt) {
    safeDispatchGameEvent("Недостаточно вычислительной мощности!", "error");
    return state;
  }
  
  // Уменьшаем количество вычислительной мощности и увеличиваем количество USDT
  let newComputingPowerValue = computingPower.value - miningCost;
  let newUsdtValue = usdt.value + miningReward;
  
  // Ограничиваем значение USDT максимумом
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
  // Получаем параметры майнинга и ресурсы
  const { exchangeRate, exchangeCommission } = state.miningParams;
  const { btc, usdt } = state.resources;
  
  // Проверяем, есть ли BTC для обмена
  if (btc.value <= 0) {
    console.log("Нет BTC для обмена");
    safeDispatchGameEvent("Нет BTC для обмена", "error");
    return state;
  }
  
  // Рассчитываем сумму USDT к получению
  const usdtAmount = btc.value * exchangeRate * (1 - exchangeCommission);
  
  // Обновляем состояние ресурсов
  const newResources = { ...state.resources };
  
  // Вычитаем BTC
  newResources.btc = {
    ...newResources.btc,
    value: 0
  };
  
  // Добавляем USDT, проверяя, чтобы не превысить максимум
  const maxUsdt = newResources.usdt.max;
  const newUsdtValue = Math.min(newResources.usdt.value + usdtAmount, maxUsdt);
  
  newResources.usdt = {
    ...newResources.usdt,
    value: newUsdtValue
  };
  
  // Логируем обмен
  console.log(`Обменено ${btc.value.toFixed(8)} BTC на ${usdtAmount.toFixed(2)} USDT (курс: ${exchangeRate}, комиссия: ${(exchangeCommission * 100).toFixed(1)}%)`);
  
  // Если достигнут максимум USDT, сообщаем об этом
  if (newUsdtValue >= maxUsdt) {
    safeDispatchGameEvent(`Достигнут максимум хранения USDT (${maxUsdt})`, "warning");
  }
  
  return {
    ...state,
    resources: newResources
  };
};

// Обработка покупки практики
export const processPracticePurchase = (state: GameState): GameState => {
  // Получаем текущее количество практики
  const practiceCount = state.buildings.practice.count;
  const practiceBaseCost = state.buildings.practice.cost.usdt;
  const practiceCostMultiplier = state.buildings.practice.costMultiplier || 1.15;
  
  // Рассчитываем стоимость следующего уровня практики
  const currentCost = Math.floor(practiceBaseCost * Math.pow(practiceCostMultiplier, practiceCount));
  
  // Проверяем, хватает ли USDT
  if (state.resources.usdt.value < currentCost) {
    safeDispatchGameEvent(`Недостаточно USDT для покупки практики (нужно ${currentCost})`, "error");
    return state;
  }
  
  // Вычитаем USDT и увеличиваем количество практики
  const newResources = { ...state.resources };
  newResources.usdt = {
    ...newResources.usdt,
    value: newResources.usdt.value - currentCost
  };
  
  // Увеличиваем количество практики
  const newBuildings = { ...state.buildings };
  newBuildings.practice = {
    ...newBuildings.practice,
    count: practiceCount + 1
  };
  
  console.log(`Куплена практика (уровень ${practiceCount + 1}) за ${currentCost} USDT`);
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    resources: newResources,
    buildings: newBuildings
  };
};
