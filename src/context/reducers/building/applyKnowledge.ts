
import { GameState } from '@/types/game';
import { safeDispatchGameEvent } from '../../utils/eventBusUtils';

/**
 * Обрабатывает применение знаний для получения USDT
 * @param state Текущее состояние игры
 * @returns Обновленное состояние игры
 */
export function processApplyKnowledge(state: GameState): GameState {
  // Проверка наличия ресурса знаний
  if (!state.resources.knowledge) {
    console.error("Ресурс 'knowledge' не найден");
    return state;
  }
  
  const knowledgeValue = state.resources.knowledge.value;
  
  // Минимум 10 знаний для обмена
  if (knowledgeValue < 10) {
    console.log("Недостаточно знаний для обмена");
    return state;
  }
  
  // Определяем кол-во знаний для обмена (кратно 10)
  const exchangeKnowledge = 10;
  
  // Базовый курс обмена: 10 знаний = 1 USDT
  let exchangeRate = 10;
  
  // Проверяем усиления обмена из исследований
  let exchangeEfficiency = 1.0;
  
  // +10% к обмену знаний при исследовании "Основы криптовалют"
  if (state.upgrades.cryptoBasics?.purchased || 
      state.upgrades.cryptoCurrencyBasics?.purchased) {
    exchangeEfficiency += 0.1;
  }
  
  // Количество USDT, которое получит игрок
  const usdtToAdd = (exchangeKnowledge / exchangeRate) * exchangeEfficiency;
  
  // Обновляем счетчик использования функции "Применить знания"
  const newCounters = {
    ...state.counters,
    applyKnowledge: {
      ...(state.counters.applyKnowledge || { id: 'applyKnowledge', name: 'Применить знания', value: 0 }),
      value: (state.counters.applyKnowledge?.value || 0) + 1
    }
  };
  
  // Обновляем состояние ресурсов
  const newResources = {
    ...state.resources,
    knowledge: {
      ...state.resources.knowledge,
      value: state.resources.knowledge.value - exchangeKnowledge
    }
  };
  
  // Если ресурс USDT уже разблокирован, увеличиваем его значение
  if (newResources.usdt && newResources.usdt.unlocked) {
    newResources.usdt = {
      ...newResources.usdt,
      value: newResources.usdt.value + usdtToAdd
    };
  } 
  // Иначе создаем новый ресурс USDT
  else {
    newResources.usdt = {
      id: 'usdt',
      name: 'USDT',
      description: 'Стейблкоин, привязанный к доллару США',
      type: 'currency',
      icon: 'dollar-sign',
      value: usdtToAdd,
      max: 100,
      unlocked: true,
      baseProduction: 0,
      production: 0,
      perSecond: 0
    };
  }
  
  // Обеспечиваем разблокировку USDT в состоянии unlocks
  const newUnlocks = {
    ...state.unlocks,
    usdt: true
  };
  
  // Отправляем уведомление
  safeDispatchGameEvent(
    `Обменяно ${exchangeKnowledge} знаний на ${usdtToAdd.toFixed(2)} USDT`,
    "success"
  );
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    resources: newResources,
    counters: newCounters,
    unlocks: newUnlocks
  };
}

/**
 * Обрабатывает применение всех знаний для получения USDT
 * @param state Текущее состояние игры
 * @returns Обновленное состояние игры
 */
export function processApplyAllKnowledge(state: GameState): GameState {
  // Проверка наличия ресурса знаний
  if (!state.resources.knowledge) {
    console.error("Ресурс 'knowledge' не найден");
    return state;
  }
  
  const knowledgeValue = state.resources.knowledge.value;
  
  // Минимум 10 знаний для обмена
  if (knowledgeValue < 10) {
    console.log("Недостаточно знаний для обмена");
    return state;
  }
  
  // Определяем кол-во знаний для обмена (кратно 10)
  const exchangeKnowledge = Math.floor(knowledgeValue / 10) * 10;
  
  // Базовый курс обмена: 10 знаний = 1 USDT
  let exchangeRate = 10;
  
  // Проверяем усиления обмена из исследований
  let exchangeEfficiency = 1.0;
  
  // +10% к обмену знаний при исследовании "Основы криптовалют"
  if (state.upgrades.cryptoBasics?.purchased || 
      state.upgrades.cryptoCurrencyBasics?.purchased) {
    exchangeEfficiency += 0.1;
  }
  
  // Количество USDT, которое получит игрок
  const usdtToAdd = (exchangeKnowledge / exchangeRate) * exchangeEfficiency;
  
  // Обновляем счетчик использования функции "Применить знания"
  const newCounters = {
    ...state.counters,
    applyKnowledge: {
      ...(state.counters.applyKnowledge || { id: 'applyKnowledge', name: 'Применить знания', value: 0 }),
      value: (state.counters.applyKnowledge?.value || 0) + 1
    }
  };
  
  // Обновляем состояние ресурсов
  const newResources = {
    ...state.resources,
    knowledge: {
      ...state.resources.knowledge,
      value: state.resources.knowledge.value - exchangeKnowledge
    }
  };
  
  // Если ресурс USDT уже разблокирован, увеличиваем его значение
  if (newResources.usdt && newResources.usdt.unlocked) {
    newResources.usdt = {
      ...newResources.usdt,
      value: newResources.usdt.value + usdtToAdd
    };
  } 
  // Иначе создаем новый ресурс USDT
  else {
    newResources.usdt = {
      id: 'usdt',
      name: 'USDT',
      description: 'Стейблкоин, привязанный к доллару США',
      type: 'currency',
      icon: 'dollar-sign',
      value: usdtToAdd,
      max: 100,
      unlocked: true,
      baseProduction: 0,
      production: 0,
      perSecond: 0
    };
  }
  
  // Обеспечиваем разблокировку USDT в состоянии unlocks
  const newUnlocks = {
    ...state.unlocks,
    usdt: true,
    applyAllKnowledge: true
  };
  
  // Отправляем уведомление
  safeDispatchGameEvent(
    `Обменяно ${exchangeKnowledge} знаний на ${usdtToAdd.toFixed(2)} USDT`,
    "success"
  );
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    resources: newResources,
    counters: newCounters,
    unlocks: newUnlocks
  };
}
