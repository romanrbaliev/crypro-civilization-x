
import { GameState } from '../types';
import { ResourceSystem } from '@/systems/ResourceSystem';

// Создаем статический экземпляр для использования вне компонентов
const resourceSystem = new ResourceSystem();

export const processIncrementResource = (
  state: GameState, 
  payload: { resourceId: string; amount?: number }
): GameState => {
  const { resourceId, amount = 1 } = payload;
  console.log(`resourceReducer: Увеличение ресурса ${resourceId} на ${amount}`);
  
  // Проверяем существование и разблокировку ресурса
  if (!state.resources[resourceId] || !state.resources[resourceId].unlocked) {
    console.warn(`Ресурс ${resourceId} не существует или не разблокирован`);
    return state;
  }
  
  // КРИТИЧЕСКОЕ ИЗМЕНЕНИЕ: Напрямую обновляем значение ресурса
  // вместо вызова метода ResourceSystem
  const currentValue = state.resources[resourceId].value || 0;
  const maxValue = state.resources[resourceId].max || Infinity;
  
  // Вычисляем новое значение, не превышающее максимум
  const newValue = Math.min(currentValue + amount, maxValue);
  
  console.log(`resourceReducer: ${resourceId} ${currentValue} + ${amount} = ${newValue} (макс. ${maxValue})`);
  
  // Создаем новый объект ресурсов с обновленным значением
  const updatedResources = {
    ...state.resources,
    [resourceId]: {
      ...state.resources[resourceId],
      value: newValue
    }
  };
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    resources: updatedResources
  };
};

export const processUnlockResource = (
  state: GameState, 
  payload: { resourceId: string }
): GameState => {
  return resourceSystem.unlockResource(state, payload);
};

export const processApplyKnowledge = (
  state: GameState
): GameState => {
  // Применяем знания и обновляем разблокировки
  const updatedState = resourceSystem.applyKnowledge(state);
  return updatedState;
};

export const processApplyAllKnowledge = (
  state: GameState
): GameState => {
  // Применяем все знания и обновляем разблокировки
  const updatedState = resourceSystem.applyAllKnowledge(state);
  return updatedState;
};

export const processExchangeBitcoin = (
  state: GameState
): GameState => {
  return resourceSystem.exchangeBitcoin(state);
};
