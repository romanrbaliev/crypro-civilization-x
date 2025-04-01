
import { GameState, ResourceAction } from '../types';

/**
 * Обрабатывает действие применения всех знаний
 */
export const applyAllKnowledge = (state: GameState, action: any): GameState => {
  // Получаем текущее количество знаний
  const currentKnowledge = state.resources.knowledge?.value || 0;
  
  // Если знаний недостаточно, ничего не делаем
  if (currentKnowledge < 10) {
    return state;
  }
  
  // Определяем, сколько знаний можно конвертировать
  // (округляем вниз до ближайшего кратного 10)
  const knowledgeToConvert = Math.floor(currentKnowledge / 10) * 10;
  
  // Определяем базовое количество USDT, которое получим
  const baseUsdtAmount = knowledgeToConvert / 10;
  
  // Проверяем наличие бонусов эффективности
  const efficiencyBonus = 
    state.upgrades.cryptoCurrencyBasics?.purchased ? 0.1 : 0 +
    (state.upgrades.cryptoBasics?.purchased ? 0.1 : 0);
  
  // Рассчитываем финальное количество USDT с учетом бонуса
  const finalUsdtAmount = baseUsdtAmount * (1 + efficiencyBonus);
  
  // Обновляем состояние ресурсов
  const newState = {
    ...state,
    resources: {
      ...state.resources,
      knowledge: {
        ...state.resources.knowledge,
        value: currentKnowledge - knowledgeToConvert
      }
    },
    counters: {
      ...state.counters,
      applyKnowledge: {
        value: typeof state.counters.applyKnowledge === 'object' 
          ? (state.counters.applyKnowledge.value || 0) + 1 
          : (state.counters.applyKnowledge || 0) + 1,
        updatedAt: Date.now()
      }
    }
  };
  
  // Если ресурс USDT существует, обновляем его значение
  if (newState.resources.usdt) {
    newState.resources.usdt = {
      ...newState.resources.usdt,
      value: (newState.resources.usdt.value || 0) + finalUsdtAmount,
      unlocked: true
    };
  } else {
    // Если ресурса USDT еще нет, создаем его
    newState.resources.usdt = {
      id: 'usdt',
      name: 'USDT',
      description: 'Стабильная криптовалюта, привязанная к доллару США',
      type: 'currency',
      icon: 'dollar-sign',
      value: finalUsdtAmount,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 100,
      unlocked: true
    };
  }
  
  // Обновляем флаг разблокировки USDT
  newState.unlocks = {
    ...newState.unlocks,
    usdt: true
  };
  
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
