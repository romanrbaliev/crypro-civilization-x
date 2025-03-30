
import { GameState } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { BonusCalculationService } from '@/services/BonusCalculationService';

// Инициализируем сервис расчета бонусов
const bonusCalculationService = new BonusCalculationService();

// Обработчик для кнопки "Применить знания"
export const processApplyKnowledge = (state: GameState): GameState => {
  // Если знаний недостаточно, возвращаем текущее состояние
  if (state.resources.knowledge.value < 10) {
    return state;
  }
  
  // Рассчитываем бонус к конвертации знаний
  let conversionRatio = 1.0; // Базовый: 10 знаний = 1 USDT
  
  // Добавляем бонусы от исследований если они есть
  if (state.upgrades.blockchainBasics?.purchased || 
      state.upgrades.basicBlockchain?.purchased || 
      state.upgrades.blockchain_basics?.purchased) {
    conversionRatio += 0.1; // +10% от основ блокчейна
  }
  
  // Добавляем бонусы от криптокошелька
  if (state.buildings.cryptoWallet?.count > 0) {
    conversionRatio += 0.05 * state.buildings.cryptoWallet.count;
  }
  
  // Рассчитываем количество USDT
  const usdtToAdd = Math.floor((10 * conversionRatio) / 10);
  
  // Обновляем ресурсы
  const updatedResources = { ...state.resources };
  updatedResources.knowledge = {
    ...updatedResources.knowledge,
    value: Math.max(0, updatedResources.knowledge.value - 10)
  };
  
  updatedResources.usdt = {
    ...updatedResources.usdt,
    value: updatedResources.usdt.value + usdtToAdd
  };
  
  // Увеличиваем счетчик применений знаний
  const applyCount = (state.counters.applyKnowledge?.value || 0) + 1;
  
  // Готовим новое состояние
  let newState = {
    ...state,
    resources: updatedResources,
    counters: {
      ...state.counters,
      applyKnowledge: {
        id: 'applyKnowledge',
        name: 'Применение знаний',  // Добавляем обязательное свойство name
        value: applyCount
      }
    },
    unlocks: {
      ...state.unlocks
    }
  };
  
  // Если это первое или второе применение знаний, проверяем условия для разблокировки кнопки "Практика"
  if (applyCount === 2) {
    newState.unlocks.practice = true;
    console.log("Разблокирована кнопка Практика");
    safeDispatchGameEvent("Разблокирована кнопка Практика", "success");
  }
  
  console.log(`Применены знания: -10 знаний, +${usdtToAdd} USDT (коэффициент ${conversionRatio.toFixed(2)})`);
  return newState;
};

// Обработчик для кнопки "Применить все знания"
export const processApplyAllKnowledge = (state: GameState): GameState => {
  // Если знаний недостаточно, возвращаем текущее состояние
  if (state.resources.knowledge.value < 10) {
    return state;
  }
  
  // Рассчитываем, сколько раз можно применить знания
  const timesToApply = Math.floor(state.resources.knowledge.value / 10);
  
  // Рассчитываем бонус к конвертации знаний
  let conversionRatio = 1.0; // Базовый: 10 знаний = 1 USDT
  
  // Добавляем бонусы от исследований если они есть
  if (state.upgrades.blockchainBasics?.purchased || 
      state.upgrades.basicBlockchain?.purchased || 
      state.upgrades.blockchain_basics?.purchased) {
    conversionRatio += 0.1; // +10% от основ блокчейна
  }
  
  // Добавляем бонусы от криптокошелька
  if (state.buildings.cryptoWallet?.count > 0) {
    conversionRatio += 0.05 * state.buildings.cryptoWallet.count;
  }
  
  // Рассчитываем общее количество знаний для конвертации и итоговый USDT
  const knowledgeToConvert = timesToApply * 10;
  const usdtToAdd = Math.floor((knowledgeToConvert * conversionRatio) / 10);
  
  // Обновляем ресурсы
  const updatedResources = { ...state.resources };
  updatedResources.knowledge = {
    ...updatedResources.knowledge,
    value: Math.max(0, updatedResources.knowledge.value - knowledgeToConvert)
  };
  
  updatedResources.usdt = {
    ...updatedResources.usdt,
    value: updatedResources.usdt.value + usdtToAdd
  };
  
  // Увеличиваем счетчик применений знаний
  const applyCount = (state.counters.applyKnowledge?.value || 0) + timesToApply;
  
  // Готовим новое состояние
  let newState = {
    ...state,
    resources: updatedResources,
    counters: {
      ...state.counters,
      applyKnowledge: {
        id: 'applyKnowledge',
        name: 'Применение знаний',  // Добавляем обязательное свойство name
        value: applyCount
      }
    },
    unlocks: {
      ...state.unlocks
    }
  };
  
  // Если это достаточно для разблокировки кнопки "Практика", разблокируем её
  if (applyCount >= 2 && !state.unlocks.practice) {
    newState.unlocks.practice = true;
    console.log("Разблокирована кнопка Практика");
    safeDispatchGameEvent("Разблокирована кнопка Практика", "success");
  }
  
  console.log(`Применены все знания: -${knowledgeToConvert} знаний, +${usdtToAdd} USDT (коэффициент ${conversionRatio.toFixed(2)})`);
  return newState;
};

// Обработчик для кнопки "Практика"
export const processPracticePurchase = (state: GameState): GameState => {
  // Расчет стоимости следующего уровня практики
  const currentLevel = state.buildings.practice?.count || 0;
  const baseCost = 10; // Базовая стоимость
  const cost = Math.floor(baseCost * Math.pow(1.15, currentLevel));
  
  // Если USDT недостаточно, возвращаем текущее состояние
  if (state.resources.usdt.value < cost) {
    return state;
  }
  
  // Обновляем ресурсы
  const updatedResources = { ...state.resources };
  updatedResources.usdt = {
    ...updatedResources.usdt,
    value: Math.max(0, updatedResources.usdt.value - cost)
  };
  
  // Увеличиваем уровень практики
  const newBuildings = { ...state.buildings };
  if (!newBuildings.practice) {
    // Создаем объект здания, если его нет
    newBuildings.practice = {
      id: 'practice',
      name: 'Практика',
      description: 'Автоматически применяет знания для получения новых. +0.21 знаний/сек за уровень.',
      cost: { usdt: baseCost },
      costMultiplier: 1.15,
      count: 1, // Первый уровень
      unlocked: true,
      productionBoost: 0,
      production: { knowledge: 0.21 }
    };
  } else {
    // Увеличиваем количество
    newBuildings.practice = {
      ...newBuildings.practice,
      count: newBuildings.practice.count + 1
    };
  }
  
  // Установим знания в разблокированные, если вдруг они не были разблокированы
  const newUnlocks = { ...state.unlocks, knowledge: true };
  
  // Готовим новое состояние
  const newState = {
    ...state,
    resources: updatedResources,
    buildings: newBuildings,
    unlocks: newUnlocks
  };
  
  console.log(`Куплена практика уровня ${newBuildings.practice.count} за ${cost} USDT`);
  return newState;
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
