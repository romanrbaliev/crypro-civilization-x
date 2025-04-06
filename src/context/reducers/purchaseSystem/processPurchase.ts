
import { GameState } from '@/context/types';
import { PurchasableType } from '@/types/purchasable';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { updateResourceMaxValues } from '@/utils/resourceUtils';
import { checkAllUnlocks } from '@/utils/unlockManager';

// Опции для функции processPurchase
interface PurchaseOptions {
  calculateMaxValues?: boolean;
  skipUnlockCheck?: boolean;
}

/**
 * Универсальная функция для обработки покупок предметов
 */
export const processPurchase = (
  state: GameState, 
  payload: { 
    itemId: string; 
    itemType: PurchasableType;
    quantity: number;
  },
  options: PurchaseOptions = {}
): GameState => {
  const { itemId, itemType, quantity = 1 } = payload;
  const { calculateMaxValues = true, skipUnlockCheck = false } = options;
  
  let item;
  if (itemType === 'building') {
    item = state.buildings[itemId];
  } else if (itemType === 'upgrade' || itemType === 'research') {
    item = state.upgrades[itemId];
  } else {
    console.error(`Неизвестный тип элемента: ${itemType}`);
    return state;
  }
  
  if (!item) {
    console.error(`Элемент с ID ${itemId} не найден в категории ${itemType}`);
    return state;
  }
  
  // Для исследований проверяем, что оно еще не куплено
  if ((itemType === 'upgrade' || itemType === 'research') && item.purchased) {
    console.log(`Исследование ${item.name} уже куплено`);
    return state;
  }
  
  // Проверка наличия ресурсов для покупки
  for (const [resourceId, amount] of Object.entries(item.cost)) {
    const resource = state.resources[resourceId];
    if (!resource || resource.value < Number(amount)) {
      console.log(`Недостаточно ресурсов для покупки ${item.name}`);
      return state;
    }
  }
  
  // Создаем копию состояния
  let newState = { ...state };
  const resources = { ...state.resources };
  
  // Списываем ресурсы
  for (const [resourceId, amount] of Object.entries(item.cost)) {
    if (resources[resourceId]) {
      resources[resourceId] = {
        ...resources[resourceId],
        value: Math.max(0, resources[resourceId].value - Number(amount))
      };
    }
  }
  
  newState.resources = resources;
  
  // Обработка покупки в зависимости от типа
  if (itemType === 'building') {
    // Рассчитываем новую стоимость здания
    const newCost = { ...item.cost };
    for (const [resourceId, amount] of Object.entries(item.cost)) {
      newCost[resourceId] = Math.floor(Number(amount) * item.costMultiplier);
    }
    
    // Обновляем здание
    newState = {
      ...newState,
      buildings: {
        ...newState.buildings,
        [itemId]: {
          ...item,
          count: item.count + quantity,
          cost: newCost
        }
      }
    };
    
    // Обновляем счетчики
    if (itemId === 'practice' && newState.counters?.practiceBuilt) {
      newState = {
        ...newState,
        counters: {
          ...newState.counters,
          practiceBuilt: {
            ...newState.counters.practiceBuilt,
            value: newState.counters.practiceBuilt.value + quantity
          }
        }
      };
    }
    
  } else if (itemType === 'upgrade' || itemType === 'research') {
    // Отмечаем улучшение как купленное
    newState = {
      ...newState,
      upgrades: {
        ...newState.upgrades,
        [itemId]: {
          ...item,
          purchased: true
        }
      }
    };
  }
  
  // Обновляем максимальные значения ресурсов, если нужно
  if (calculateMaxValues) {
    newState = updateResourceMaxValues(newState);
  }
  
  // Проверяем разблокировки, если нужно
  if (!skipUnlockCheck) {
    newState = checkAllUnlocks(newState);
  }
  
  return newState;
};
