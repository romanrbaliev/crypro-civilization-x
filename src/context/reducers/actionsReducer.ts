import { GameState } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

/**
 * Применение знаний для получения USDT
 */
export const processApplyKnowledge = (state: GameState): GameState => {
  // Получаем текущее количество знаний
  const knowledgeValue = state.resources.knowledge?.value || 0;
  
  // Если нет знаний для применения, возвращаем текущее состояние
  if (knowledgeValue <= 0) {
    console.log('Нет знаний для применения');
    safeDispatchGameEvent('Нет знаний для применения', 'error');
    return state;
  }
  
  // Создаем новые копии для изменения
  const newResources = { ...state.resources };
  const newCounters = { ...state.counters };
  
  // Получаем текущее значение счетчика применений знаний
  const applyKnowledgeCounter = state.counters.applyKnowledge || 0;
  const newApplyKnowledgeValue = typeof applyKnowledgeCounter === 'object' 
    ? applyKnowledgeCounter.value + 1
    : applyKnowledgeCounter + 1;
  
  // Обновляем счетчик
  newCounters.applyKnowledge = { value: newApplyKnowledgeValue };
  
  console.log(`Счетчик применения знаний обновлен: ${newApplyKnowledgeValue}`);
  
  // Расчет эффективности применения знаний (по умолчанию 10:1)
  let conversionRate = 10; // Базовая ставка: 10 знаний = 1 USDT
  let efficiencyBoost = 1.0;
  
  // Проверяем наличие улучшения "Основы криптовалют" для повышения эффективности
  if (state.upgrades.cryptoCurrencyBasics?.purchased) {
    // Добавляем 10% эффективности, если есть улучшение
    const boostValue = state.upgrades.cryptoCurrencyBasics.effects?.knowledgeEfficiencyBoost || 0.1;
    efficiencyBoost += boostValue;
    console.log(`Повышение эффективности от улучшения "Основы криптовалют": +${boostValue * 100}%`);
  }
  
  // Рассчитываем количество знаний для применения (округляем до целых)
  // Минимум 1, максимум имеющееся количество
  const knowledgeToApply = Math.min(Math.floor(knowledgeValue), knowledgeValue);
  
  // Рассчитываем количество полученных USDT с учетом эффективности
  const usdtGained = Math.floor(knowledgeToApply / conversionRate) * efficiencyBoost;
  
  if (usdtGained <= 0) {
    // Если недостаточно знаний для конвертации
    console.log(`Недостаточно знаний для получения USDT (минимум ${conversionRate})`);
    safeDispatchGameEvent(`Недостаточно знаний для получения USDT (нужно минимум ${conversionRate})`, 'warning');
    return state;
  }
  
  // Вычитаем потраченные знания (ровно столько, сколько конвертировали)
  const knowledgeSpent = Math.floor(usdtGained / efficiencyBoost) * conversionRate;
  
  // Обновляем ресурсы
  if (newResources.knowledge) {
    newResources.knowledge = {
      ...newResources.knowledge,
      value: newResources.knowledge.value - knowledgeSpent
    };
  }
  
  // Проверяем и создаем USDT, если его еще нет
  if (!newResources.usdt) {
    newResources.usdt = {
      id: 'usdt',
      name: 'USDT',
      description: 'Стейблкоин, привязанный к стоимости доллара США',
      value: usdtGained,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 50,
      unlocked: true,
      type: 'currency',
      icon: 'dollar'
    };
  } else {
    // Разблокируем USDT, если он еще не разблокирован
    if (!newResources.usdt.unlocked) {
      newResources.usdt = {
        ...newResources.usdt,
        unlocked: true
      };
    }
    
    // Проверяем и обновляем максимум, если его нет
    if (newResources.usdt.max === undefined) {
      newResources.usdt = {
        ...newResources.usdt,
        max: 50 
      };
    }
    
    // Добавляем полученные USDT, но не превышаем максимум
    const currentUsdt = newResources.usdt.value || 0;
    const maxUsdt = newResources.usdt.max || 50;
    newResources.usdt = {
      ...newResources.usdt,
      value: Math.min(currentUsdt + usdtGained, maxUsdt)
    };
  }
  
  // Разблокируем USDT в списке разблокировок
  const newUnlocks = {
    ...state.unlocks,
    usdt: true
  };
  
  // Создаем обновленное состояние
  const newState = {
    ...state,
    resources: newResources,
    counters: newCounters,
    unlocks: newUnlocks
  };
  
  // Логируем результат и уведомляем пользователя
  console.log(`Применено ${knowledgeSpent} знаний, получено ${usdtGained} USDT (множитель эффективности: ${efficiencyBoost})`);
  safeDispatchGameEvent(`Применено ${knowledgeSpent} знаний, получено ${usdtGained} USDT`, 'success');
  
  return newState;
};

// Обработчик для применения всех знаний
export const processApplyAllKnowledge = (state: GameState): GameState => {
  // Получаем текущее количество знаний
  const knowledgeValue = state.resources.knowledge?.value || 0;
  
  // Если нет знаний для применения, возвращаем текущее состояние
  if (knowledgeValue <= 0) {
    console.log('Нет знаний для применения');
    safeDispatchGameEvent('Нет знаний для применения', 'error');
    return state;
  }
  
  // Получаем курс обмена (по умолчанию 10 знаний = 1 USDT)
  const exchangeRate = 10; // Знаний на 1 USDT
  
  // Проверяем бонус к эффективности применения знаний
  let efficiencyBonus = 1; // По умолчанию без бонуса
  
  // Проверяем, куплено ли улучшение "Основы криптовалют" и есть ли у него эффект knowledgeEfficiencyBoost
  if (state.upgrades.cryptoCurrencyBasics?.purchased) {
    const effects = state.upgrades.cryptoCurrencyBasics.effects || {};
    if (effects.knowledgeEfficiencyBoost) {
      efficiencyBonus += effects.knowledgeEfficiencyBoost; // +10% к эффективности
      console.log(`ProcessApplyAllKnowledge: Применяется бонус эффективности: +${effects.knowledgeEfficiencyBoost * 100}%`);
    }
  }
  
  // Количество знаний для обмена (максимум кратно курсу обмена)
  const knowledgeToExchange = Math.floor(state.resources.knowledge.value / exchangeRate) * exchangeRate;
  
  // Если недостаточно знаний для обмена, возвращаем текущее состояние
  if (knowledgeToExchange < exchangeRate) {
    console.log("ProcessApplyAllKnowledge: Недостаточно знаний для обмена");
    return state;
  }
  
  // Количество USDT, которое будет получено с учетом бонуса эффективности
  const usdtGained = (knowledgeToExchange / exchangeRate) * efficiencyBonus;
  console.log(`ProcessApplyAllKnowledge: Обмен ${knowledgeToExchange} знаний на ${usdtGained} USDT (бонус: ${efficiencyBonus})`);
  
  // Обновляем счетчик применений знаний - только один раз, независимо от количества знаний
  const newCounter = {
    ...state.counters,
    applyKnowledge: {
      id: 'applyKnowledge',
      name: 'Применение знаний',
      value: state.counters.applyKnowledge 
        ? (typeof state.counters.applyKnowledge === 'object' 
            ? state.counters.applyKnowledge.value + 1
            : (state.counters.applyKnowledge || 0) + 1)
        : 1
    }
  };
  
  // Создаем копию ресурсов для изменения
  const updatedResources = { ...state.resources };
  
  // Вычитаем знания
  updatedResources.knowledge = {
    ...updatedResources.knowledge,
    value: updatedResources.knowledge.value - knowledgeToExchange
  };
  
  // Обновляем или создаем USDT
  if (!updatedResources.usdt) {
    // Создаем ресурс USDT
    updatedResources.usdt = {
      id: 'usdt',
      name: 'USDT',
      description: 'Стейблкоин, привязанный к стоимости доллара США',
      value: usdtGained,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 50,
      unlocked: true,
      type: 'currency',
      icon: 'dollar'
    };
  } else {
    // Обновляем существующий ресурс USDT
    updatedResources.usdt = {
      ...updatedResources.usdt,
      value: updatedResources.usdt.value + usdtGained,
      unlocked: true
    };
  }
  
  // Явно разблокируем USDT
  const updatedUnlocks = {
    ...state.unlocks,
    usdt: true
  };
  
  // Создаем новое состояние
  return {
    ...state,
    resources: updatedResources,
    counters: newCounter,
    unlocks: updatedUnlocks
  };
};

// Обработчик для работы с вычислительной мощностью (майнинг)
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

// Обработчик для обмена Bitcoin на USDT
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

// Обработчик покупки практики
export const processPracticePurchase = (state: GameState): GameState => {
  // Проверка наличия достаточных средств
  if (!state.resources.usdt || state.resources.usdt.value < 10) {
    console.log("Недостаточно средств для покупки практики");
    return state;
  }
  
  const buildingId = 'practice';
  
  // Получаем текущее здание практики
  const currentBuilding = state.buildings[buildingId];
  
  // Если здания нет в списке, добавляем его
  if (!currentBuilding) {
    console.log("Здание практики не найдено, создаем новое");
    
    // Создаем обновленные здания
    const newBuildings = {
      ...state.buildings,
      [buildingId]: {
        id: buildingId,
        name: 'Практика',
        description: 'Автоматическое получение 1 знания в секунду',
        type: 'building',
        cost: { usdt: 10 },
        costMultiplier: 1.12,
        production: { knowledge: 1 },
        count: 1,
        unlocked: true,
        productionBoost: 0
      }
    };
    
    // Обновляем ресурсы
    const newResources = {
      ...state.resources,
      usdt: {
        ...state.resources.usdt,
        value: state.resources.usdt.value - 10
      }
    };
    
    // Возвращаем обновленное состояние
    return {
      ...state,
      buildings: newBuildings,
      resources: newResources
    };
  }
  
  // Если здание уже есть, увеличиваем его количество
  const nextCount = (currentBuilding.count || 0) + 1;
  
  // Рассчитываем стоимость с учетом множителя
  const basePrice = 10; // Начальная цена
  const multiplier = 1.12; // Коэффициент роста цены
  const cost = Math.floor(basePrice * Math.pow(multiplier, currentBuilding.count));
  
  // Проверяем, хватает ли ресурсов
  if (state.resources.usdt.value < cost) {
    console.log(`Недостаточно USDT для покупки: имеется ${state.resources.usdt.value}, требуется ${cost}`);
    return state;
  }
  
  // Обновляем количество и историю покупок
  const updatedBuildings = {
    ...state.buildings,
    [buildingId]: {
      ...currentBuilding,
      count: nextCount,
    }
  };
  
  // Обновляем ресурсы
  const updatedResources = {
    ...state.resources,
    usdt: {
      ...state.resources.usdt,
      value: state.resources.usdt.value - cost
    }
  };
  
  console.log(`Куплена практика (${nextCount-1} -> ${nextCount}) за ${cost} USDT`);
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    buildings: updatedBuildings,
    resources: updatedResources
  };
};
