
import { GameState } from '../types';
import { checkSpecialUnlocks } from '@/utils/unlockSystem';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

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
  
  // Определяем сумму инкремента для ресурса
  let incrementAmount = amount;
  
  // ИСПРАВЛЕНИЕ: Для ресурса "knowledge" всегда устанавливаем строго 1 единицу за клик
  if (resourceId === "knowledge") {
    // Принудительно устанавливаем значение 1, независимо от переданного amount
    incrementAmount = 1;
    console.log(`processIncrementResource: Для knowledge устанавливаем СТРОГО 1 единицу за клик`);
  }
  
  const currentValue = state.resources[resourceId].value;
  const maxValue = state.resources[resourceId].max;
  
  // Вычисляем новое значение, но не выше максимального
  let newValue = currentValue + incrementAmount;
  if (maxValue !== Infinity && newValue > maxValue) {
    newValue = maxValue;
  }
  
  // Не позволяем опуститься ниже нуля
  if (newValue < 0) {
    newValue = 0;
  }
  
  // Выводим сообщение в консоль для отладки
  console.log(`Изменение ресурса ${resourceId}: ${currentValue} -> ${newValue} (инкремент: ${incrementAmount})`);
  
  // Отправляем событие для возможного отображения в интерфейсе
  if (incrementAmount > 0) {
    safeDispatchGameEvent(`Получено ${incrementAmount} ${state.resources[resourceId].name}`, "info");
  } else if (incrementAmount < 0) {
    safeDispatchGameEvent(`Потрачено ${Math.abs(incrementAmount)} ${state.resources[resourceId].name}`, "info");
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
