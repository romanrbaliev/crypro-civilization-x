
import { GameState } from '../types';
import { checkUnlocks } from '../utils/resourceUtils';

// Обработка инкремента ресурсов
export const processIncrementResource = (
  state: GameState,
  payload: { resourceId: string; amount: number }
): GameState => {
  const { resourceId, amount } = payload;
  
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
  
  const newState = {
    ...state,
    resources: {
      ...state.resources,
      [resourceId]: {
        ...state.resources[resourceId],
        value: newValue
      }
    }
  };
  
  // Разблокировка "Применить знания" после 3-х кликов
  if (resourceId === 'knowledge' && !state.unlocks.applyKnowledge && newValue >= 3) {
    const eventBus = window.gameEventBus;
    if (eventBus) {
      const customEvent = new CustomEvent('game-event', { 
        detail: { 
          message: "Открыта новая функция: Применить знания", 
          type: "info" 
        } 
      });
      eventBus.dispatchEvent(customEvent);
      
      // Добавляем дополнительное пояснение
      setTimeout(() => {
        const detailEvent = new CustomEvent('game-event', { 
          detail: { 
            message: "Накопите 10 знаний, чтобы применить их и получить USDT", 
            type: "info" 
          } 
        });
        eventBus.dispatchEvent(detailEvent);
      }, 200);
    }
    
    return {
      ...newState,
      unlocks: {
        ...newState.unlocks,
        applyKnowledge: true
      }
    };
  }
  
  // Проверяем условия для разблокировки зданий и улучшений
  return checkUnlocks(newState);
};
