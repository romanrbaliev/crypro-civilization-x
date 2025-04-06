
import { GameState } from '@/context/types';
import { PurchasableType } from '@/types/purchasable';
import { updateResourceMaxValues } from '@/utils/resourceUtils';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { checkAllUnlocks } from '@/utils/unlockManager';

export interface PurchasePayload {
  itemId: string;
  itemType: PurchasableType;
  quantity?: number;
}

export const processPurchase = (
  state: GameState, 
  payload: PurchasePayload
): GameState => {
  const { itemId, itemType, quantity = 1 } = payload;
  
  // Получаем предмет в зависимости от типа
  let item;
  if (itemType === 'building') {
    item = state.buildings[itemId];
  } else if (itemType === 'upgrade' || itemType === 'research') {
    item = state.upgrades[itemId];
  } else {
    console.error(`Неизвестный тип предмета: ${itemType}`);
    return state;
  }
  
  // Проверяем, существует ли предмет
  if (!item) {
    console.error(`Предмет с ID ${itemId} не найден`);
    return state;
  }
  
  // Для улучшений проверяем, что оно еще не куплено
  if ((itemType === 'upgrade' || itemType === 'research') && item.purchased) {
    console.log(`Исследование ${item.name} уже куплено`);
    return state;
  }
  
  // Проверяем, хватает ли ресурсов для покупки
  for (const [resourceId, amount] of Object.entries(item.cost)) {
    const resource = state.resources[resourceId];
    if (!resource || resource.value < Number(amount)) {
      console.log(`Недостаточно ресурса ${resourceId} для покупки ${item.name}`);
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
  
  // Обрабатываем покупку в зависимости от типа
  if (itemType === 'building') {
    // Рассчитываем новую стоимость здания
    const newCost = { ...item.cost };
    for (const [resourceId, amount] of Object.entries(item.cost)) {
      newCost[resourceId] = Math.floor(Number(amount) * item.costMultiplier);
    }
    
    // Обновляем здание
    newState.buildings = {
      ...newState.buildings,
      [itemId]: {
        ...item,
        count: item.count + quantity,
        cost: newCost
      }
    };
    
    safeDispatchGameEvent(`Построено: ${item.name}`, 'success');
  } else if (itemType === 'upgrade' || itemType === 'research') {
    // Помечаем улучшение как купленное
    newState.upgrades = {
      ...newState.upgrades,
      [itemId]: {
        ...item,
        purchased: true
      }
    };
    
    safeDispatchGameEvent(`Исследовано: ${item.name}`, 'success');
  }
  
  // Обновляем максимальные значения ресурсов
  newState = updateResourceMaxValues(newState);
  
  // Проверяем разблокировки
  return checkAllUnlocks(newState);
};
