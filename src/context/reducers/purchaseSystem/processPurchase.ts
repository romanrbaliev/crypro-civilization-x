
import { GameState } from '@/context/types';
import { hasResources, spendResources } from '@/utils/resourceUtils';

// Функция для обработки покупки
export const processPurchase = (
  state: GameState, 
  itemId: string, 
  itemType: string, 
  quantity: number = 1
): GameState | null => {
  // Получаем объект элемента в зависимости от типа
  let item;
  if (itemType === 'building') {
    item = state.buildings[itemId];
  } else if (itemType === 'upgrade' || itemType === 'research') {
    item = state.upgrades[itemId];
  } else {
    console.error('Неизвестный тип элемента для покупки:', itemType);
    return null;
  }

  // Проверяем, существует ли элемент
  if (!item) {
    console.error(`Элемент с ID ${itemId} не найден в категории ${itemType}`);
    return null;
  }

  // Проверяем наличие ресурсов для покупки
  if (!hasResources(state, item.cost)) {
    console.log(`Недостаточно ресурсов для покупки ${item.name}`);
    return null;
  }

  // Списываем ресурсы
  let newState = spendResources(state, item.cost);

  // Обновляем состояние в зависимости от типа элемента
  if (itemType === 'building') {
    // Расчет новой стоимости
    const newCost = { ...item.cost };
    for (const [resourceId, amount] of Object.entries(item.cost)) {
      newCost[resourceId] = Math.floor(Number(amount) * (item.costMultiplier || 1.1));
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

  return newState;
};
