
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
  
  // ИСПРАВЛЕНИЕ: Фиксированное значение для ресурса "знания"
  let incrementAmount = amount;
  if (resourceId === "knowledge") {
    // Всегда строго 1 знание за клик, независимо от переданного значения
    incrementAmount = 1;
    // Дополнительный лог для отслеживания
    console.log(`processIncrementResource: Для knowledge устанавливаем строго incrementAmount=${incrementAmount}`);
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
  console.log(`Изменение ресурса ${resourceId}: ${currentValue} -> ${newValue}`);
  
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
