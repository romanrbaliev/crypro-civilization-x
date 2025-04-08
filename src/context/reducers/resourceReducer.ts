
import { GameState, Resource } from '../types';
import { calculateResourceProduction } from '@/utils/resourceCalculator';

/**
 * Функция для обновления ресурсов на основе прошедшего времени
 */
export const updateResources = (state: GameState, payload: { deltaTime: number }): GameState => {
  const { deltaTime } = payload;
  
  if (deltaTime <= 0 || !state.gameStarted) {
    return state;
  }
  
  const updatedResources = { ...state.resources };
  
  // Обновляем каждый ресурс на основе его скорости производства
  for (const resourceId in updatedResources) {
    const resource = updatedResources[resourceId];
    
    if (resource && resource.unlocked) {
      const perSecond = resource.perSecond || 0;
      
      if (Math.abs(perSecond) > 0.000001) {
        const currentValue = resource.value || 0;
        const maxValue = resource.max || Infinity;
        
        // Вычисляем прирост за текущий временной промежуток
        const increment = perSecond * (deltaTime / 1000);
        
        // Ограничиваем новое значение максимумом
        const newValue = Math.min(currentValue + increment, maxValue);
        
        // Обновляем значение ресурса
        updatedResources[resourceId] = {
          ...resource,
          value: newValue
        };
      }
    }
  }
  
  return {
    ...state,
    resources: updatedResources
  };
};

/**
 * Функция для пересчета производства ресурсов
 */
export const recalculateProduction = (state: GameState): GameState => {
  const updatedResources = { ...state.resources };
  
  // Пересчитываем производство для каждого ресурса
  for (const resourceId in updatedResources) {
    const resource = updatedResources[resourceId];
    
    if (resource && resource.unlocked) {
      // Рассчитываем производство, потребление и чистую скорость
      const { production, consumption, netPerSecond } = calculateResourceProduction(
        resourceId, 
        state.buildings, 
        state.upgrades
      );
      
      // Обновляем ресурс с новыми значениями
      updatedResources[resourceId] = {
        ...resource,
        production,
        consumption,
        perSecond: netPerSecond
      };
    }
  }
  
  return {
    ...state,
    resources: updatedResources
  };
};

/**
 * Функция для увеличения количества ресурса
 */
export const incrementResource = (
  state: GameState, 
  payload: { resourceId: string; amount: number }
): GameState => {
  const { resourceId, amount } = payload;
  
  if (!state.resources[resourceId] || !state.resources[resourceId].unlocked) {
    return state;
  }
  
  const resource = state.resources[resourceId];
  const currentValue = resource.value || 0;
  const maxValue = resource.max || Infinity;
  
  // Вычисляем новое значение, не превышающее максимум
  const newValue = Math.min(currentValue + amount, maxValue);
  
  // Если изменений нет, возвращаем текущее состояние
  if (Math.abs(newValue - currentValue) < 0.000001) {
    return state;
  }
  
  return {
    ...state,
    resources: {
      ...state.resources,
      [resourceId]: {
        ...resource,
        value: newValue
      }
    }
  };
};

/**
 * Функция для разблокировки ресурса
 */
export const unlockResource = (
  state: GameState, 
  payload: { resourceId: string }
): GameState => {
  const { resourceId } = payload;
  
  if (!state.resources[resourceId]) {
    return state;
  }
  
  // Если ресурс уже разблокирован, ничего не делаем
  if (state.resources[resourceId].unlocked) {
    return state;
  }
  
  // Разблокируем ресурс
  return {
    ...state,
    resources: {
      ...state.resources,
      [resourceId]: {
        ...state.resources[resourceId],
        unlocked: true
      }
    }
  };
};

/**
 * Функция для обмена знаний на USDT
 */
export const applyKnowledge = (state: GameState): GameState => {
  const knowledge = state.resources.knowledge;
  const usdt = state.resources.usdt;
  
  if (!knowledge || !knowledge.unlocked || knowledge.value < 10) {
    return state;
  }
  
  if (!usdt || !usdt.unlocked) {
    return state;
  }
  
  // Определяем множитель эффективности конвертации знаний
  const conversionRate = 0.1; // 10 знаний = 1 USDT
  
  // Эффекты от исследований могут увеличить этот коэффициент
  let efficiencyMultiplier = 1.0;
  
  // Проверяем, есть ли улучшение эффективности в исследованиях
  if (state.upgrades.cryptoBasics && state.upgrades.cryptoBasics.purchased) {
    efficiencyMultiplier += 0.1; // +10% к эффективности
  }
  
  const amountToConvert = Math.floor(knowledge.value / 10) * 10;
  const usdtToGain = amountToConvert * conversionRate * efficiencyMultiplier;
  
  // Результирующее значение знаний
  const newKnowledgeValue = knowledge.value - amountToConvert;
  
  // Результирующее значение USDT
  const newUsdtValue = Math.min(usdt.value + usdtToGain, usdt.max || Infinity);
  
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

/**
 * Функция для обмена всех знаний на USDT
 */
export const applyAllKnowledge = (state: GameState): GameState => {
  return applyKnowledge(state);
};

/**
 * Функция для обмена Bitcoin на USDT
 */
export const exchangeBitcoin = (state: GameState): GameState => {
  const bitcoin = state.resources.bitcoin;
  const usdt = state.resources.usdt;
  
  if (!bitcoin || !bitcoin.unlocked || bitcoin.value <= 0) {
    return state;
  }
  
  if (!usdt || !usdt.unlocked) {
    return state;
  }
  
  // Получаем текущий курс обмена из параметров майнинга
  const exchangeRate = state.miningParams.exchangeRate || 20000; // Примерный курс по умолчанию
  // Комиссия биржи
  const commission = state.miningParams.exchangeCommission || 0.01; // 1% по умолчанию
  
  // Рассчитываем сумму USDT к получению
  const usdtToGain = bitcoin.value * exchangeRate * (1 - commission);
  
  // Обновляем ресурсы
  return {
    ...state,
    resources: {
      ...state.resources,
      bitcoin: {
        ...bitcoin,
        value: 0 // Обмениваем все Bitcoin
      },
      usdt: {
        ...usdt,
        value: Math.min(usdt.value + usdtToGain, usdt.max || Infinity)
      }
    }
  };
};
