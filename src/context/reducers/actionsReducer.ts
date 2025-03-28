
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
  usdtGain = Math.floor(usdtGain * (1 + knowledgeEfficiencyBonus)) || 1;
  
  // Уточним результат до 1.1 USDT при бонусе 10%
  if (knowledgeEfficiencyBonus === 0.1) {
    usdtGain = 1.1;
  }
  
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

// Новая функция для обработки применения всех знаний
export const processApplyAllKnowledge = (state: GameState): GameState => {
  const { resources, unlocks, upgrades } = state;
  const knowledge = resources.knowledge;
  const usdt = resources.usdt;
  
  // Для применения всех знаний нужно хотя бы 10 знаний
  if (!knowledge || !usdt || knowledge.value < 10) {
    safeDispatchGameEvent("Недостаточно знаний для применения!", "error");
    return state;
  }
  
  // Базовая отдача от применения знаний (1 USDT за 10 знаний)
  let usdtRate = 1;
  
  // Проверяем наличие бонусов к эффективности применения знаний
  let knowledgeEfficiencyBonus = 0;
  
  // Бонус от исследования "Основы криптовалют"
  if (upgrades.cryptoCurrencyBasics && upgrades.cryptoCurrencyBasics.purchased) {
    knowledgeEfficiencyBonus += 0.1; // +10% к эффективности применения знаний
    console.log("Применен бонус от исследования 'Основы криптовалют': +10% к эффективности применения знаний");
  }
  
  // Применяем бонус к базовой отдаче
  usdtRate = Math.floor(usdtRate * (1 + knowledgeEfficiencyBonus)) || 1;
  
  // Уточним результат при бонусе 10%
  if (knowledgeEfficiencyBonus === 0.1) {
    usdtRate = 1.1;
  }
  
  // Расчет количества доступных USDT
  const appliedKnowledge = knowledge.value;
  const knowledgeSets = Math.floor(appliedKnowledge / 10);
  const totalUsdtGain = knowledgeSets * usdtRate;
  
  // Новые значения ресурсов
  let newKnowledgeValue = knowledge.value % 10; // Остаток знаний, которые не были обменяны
  let newUsdtValue = usdt.value + totalUsdtGain;
  
  // Ограничиваем значение USDT максимумом
  if (newUsdtValue > usdt.max) {
    newUsdtValue = usdt.max;
    safeDispatchGameEvent("Достигнут максимум USDT!", "warning");
  }
  
  console.log(`Применение всех знаний: -${appliedKnowledge - newKnowledgeValue} знаний, +${totalUsdtGain} USDT (бонус эффективности: ${knowledgeEfficiencyBonus * 100}%)`);
  
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
  const { resources, miningParams } = state;
  const btcResource = resources.btc;
  const usdtResource = resources.usdt;
  
  // Если BTC не разблокирован, или его количество равно 0, возвращаем исходное состояние
  if (!btcResource || !btcResource.unlocked || btcResource.value <= 0) {
    console.log('Невозможно обменять BTC - ресурс недоступен или его количество равно 0');
    return state;
  }
  
  // Получаем текущий курс BTC к USDT и комиссию за обмен
  const exchangeRate = miningParams.exchangeRate || 30000; // Курс по умолчанию 30,000 USDT за 1 BTC
  const exchangeCommission = miningParams.exchangeCommission || 0.05; // Комиссия по умолчанию 5%
  
  // Рассчитываем сумму USDT до вычета комиссии
  const btcAmount = btcResource.value;
  const usdtBeforeCommission = btcAmount * exchangeRate;
  
  // Рассчитываем комиссию и финальную сумму USDT
  const commissionAmount = usdtBeforeCommission * exchangeCommission;
  const finalUsdtAmount = usdtBeforeCommission - commissionAmount;
  
  console.log(`Обмен ${btcAmount.toFixed(8)} BTC по курсу ${exchangeRate} USDT за 1 BTC`);
  console.log(`До вычета комиссии: ${usdtBeforeCommission.toFixed(2)} USDT`);
  console.log(`Комиссия (${(exchangeCommission * 100).toFixed(1)}%): ${commissionAmount.toFixed(2)} USDT`);
  console.log(`Итоговая сумма: ${finalUsdtAmount.toFixed(2)} USDT`);
  
  // Проверяем, что обмен возможен (финальная сумма должна быть больше 0)
  if (finalUsdtAmount <= 0) {
    console.log('Невозможно обменять BTC - итоговая сумма USDT после комиссии меньше или равна 0');
    return state;
  }
  
  // Проверяем, что после добавления USDT не будет превышен максимум
  const newUsdtValue = usdtResource.value + finalUsdtAmount;
  if (newUsdtValue > usdtResource.max) {
    console.log(`Невозможно обменять BTC - будет превышен максимум USDT (${usdtResource.max})`);
    return state;
  }
  
  // Обновляем значения ресурсов
  const newResources = {
    ...resources,
    btc: {
      ...btcResource,
      value: 0 // Обнуляем количество BTC после обмена
    },
    usdt: {
      ...usdtResource,
      value: newUsdtValue
    }
  };
  
  safeDispatchGameEvent(`Обменяно ${btcAmount.toFixed(6)} BTC на ${finalUsdtAmount.toFixed(2)} USDT`, "success");
  
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
