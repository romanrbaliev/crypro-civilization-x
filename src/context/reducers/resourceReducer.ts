
import { GameState } from '../types';
import { checkUnlocks } from '../utils/resourceUtils';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { checkSpecialUnlocks } from '@/utils/unlockSystem';

// Обработка инкремента ресурсов
export const processIncrementResource = (
  state: GameState,
  payload: { resourceId: string; amount?: number }
): GameState => {
  const { resourceId, amount = 1 } = payload;
  
  // Если ресурс не существует, возвращаем текущее состояние
  if (!state.resources[resourceId]) {
    return state;
  }
  
  const currentValue = state.resources[resourceId].value;
  const maxValue = state.resources[resourceId].max;
  
  // Вычисляем новое значение, но не выше максимального
  let newValue = currentValue + amount;
  if (maxValue !== Infinity && newValue > maxValue) {
    newValue = maxValue;
  }
  
  // Не позволяем опуститься ниже нуля
  if (newValue < 0) {
    newValue = 0;
  }
  
  // Выводим сообщение в консоль для отладки
  console.log(`Изменение ресурса ${resourceId}: ${currentValue} -> ${newValue}`);
  
  // Отправляем событие для возможного отображения в интерфейсе
  if (amount > 0) {
    safeDispatchGameEvent(`Получено ${amount} ${state.resources[resourceId].name}`, "resource");
  } else if (amount < 0) {
    safeDispatchGameEvent(`Потрачено ${Math.abs(amount)} ${state.resources[resourceId].name}`, "resource");
  }
  
  const newState = {
    ...state,
    resources: {
      ...state.resources,
      [resourceId]: {
        ...state.resources[resourceId],
        value: newValue
      }
    },
    // Обновляем lastUpdate, чтобы не было двойного обновления
    lastUpdate: Date.now()
  };
  
  // Используем новую систему проверки специальных разблокировок
  return checkSpecialUnlocks(newState);
};

// Обработка разблокировки ресурса
export const processUnlockResource = (
  state: GameState,
  payload: { resourceId: string }
): GameState => {
  const { resourceId } = payload;
  
  if (!state.resources[resourceId]) {
    return state;
  }
  
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
