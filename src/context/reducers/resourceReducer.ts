import { GameState, ResourceAction } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

/**
 * Обрабатывает действие применения всех знаний
 */
export const applyAllKnowledge = (state: GameState, action: ResourceAction): GameState => {
  // Получаем текущее количество знаний
  const knowledgeValue = state.resources.knowledge?.value || 0;
  
  // Если нет знаний, ничего не делаем
  if (knowledgeValue <= 0) {
    safeDispatchGameEvent('Нет знаний для применения', "warning");
    return state;
  }
  
  // Создаем копию состояния
  let newState = { ...state };
  
  // Рассчитываем, сколько USDT можно получить за знания
  const knowledgeToUsdtRate = 10; // 10 знаний = 1 USDT
  const appliedKnowledge = Math.floor(knowledgeValue / knowledgeToUsdtRate) * knowledgeToUsdtRate;
  const usdtGain = appliedKnowledge / knowledgeToUsdtRate;
  
  // Проверяем, есть ли что применять
  if (appliedKnowledge <= 0) {
    safeDispatchGameEvent('Недостаточно знаний для применения', "warning");
    return state;
  }
  
  // Проверяем, разблокирован ли USDT
  if (!state.resources.usdt) {
    // Создаем ресурс USDT, если его нет
    newState.resources = {
      ...newState.resources,
      usdt: {
        id: 'usdt',
        name: 'USDT',
        description: 'Стабильная криптовалюта, привязанная к доллару США',
        type: 'currency',
        icon: 'dollar-sign',
        value: usdtGain,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 100,
        unlocked: true
      }
    };
    
    // Устанавливаем флаг разблокировки
    newState.unlocks = {
      ...newState.unlocks,
      usdt: true
    };
    
    safeDispatchGameEvent('Разблокирован ресурс: USDT', 'success');
  } else {
    // Если USDT уже существует, просто увеличиваем его значение
    const currentUsdtValue = newState.resources.usdt.value || 0;
    newState.resources = {
      ...newState.resources,
      usdt: {
        ...newState.resources.usdt,
        value: currentUsdtValue + usdtGain
      }
    };
  }
  
  // Обновляем значение знаний
  newState.resources = {
    ...newState.resources,
    knowledge: {
      ...newState.resources.knowledge,
      value: knowledgeValue - appliedKnowledge
    }
  };
  
  // Увеличиваем счетчик применения знаний
  const applyKnowledgeCount = typeof newState.counters.applyKnowledge === 'object' 
    ? (newState.counters.applyKnowledge.value || 0) 
    : (newState.counters.applyKnowledge || 0);
  
  newState.counters = {
    ...newState.counters,
    applyKnowledge: {
      value: applyKnowledgeCount + 1,
      updatedAt: Date.now()
    }
  };
  
  // Отправляем уведомление
  safeDispatchGameEvent(`Применено ${appliedKnowledge} знаний, получено ${usdtGain} USDT`, 'success');
  
  return newState;
};

/**
 * Обрабатывает действие применения всех знаний (legacy поддержка)
 */
export const processApplyAllKnowledge = applyAllKnowledge;

/**
 * Обрабатывает увеличение ресурса
 */
export const processIncrementResource = (state: GameState, payload: ResourceAction): GameState => {
  const { resourceId, amount } = payload;
  
  if (!resourceId || amount === undefined) return state;
  
  // Получаем текущий ресурс
  const currentResource = state.resources[resourceId];
  
  // Если ресурса нет, ничего не делаем
  if (!currentResource) return state;
  
  // Обновляем значение ресурса
  return {
    ...state,
    resources: {
      ...state.resources,
      [resourceId]: {
        ...currentResource,
        value: currentResource.value + amount
      }
    }
  };
};

/**
 * Обрабатывает уменьшение ресурса
 */
export const processDecrementResource = (state: GameState, payload: ResourceAction): GameState => {
  const { resourceId, amount } = payload;
  
  if (!resourceId || amount === undefined) return state;
  
  // Получаем текущий ресурс
  const currentResource = state.resources[resourceId];
  
  // Если ресурса нет, ничего не делаем
  if (!currentResource) return state;
  
  // Обновляем значение ресурса (не меньше 0)
  return {
    ...state,
    resources: {
      ...state.resources,
      [resourceId]: {
        ...currentResource,
        value: Math.max(0, currentResource.value - amount)
      }
    }
  };
};
