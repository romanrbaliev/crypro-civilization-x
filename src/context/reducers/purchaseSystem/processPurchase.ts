
import { GameState } from '@/context/types';
import { checkAffordability } from './checkAffordability';

/**
 * Обрабатывает процесс покупки любого объекта в игре
 */
export function processPurchase(
  state: GameState, 
  cost: Record<string, number>,
  purchaseAction: (state: GameState) => GameState
): GameState {
  // Проверяем, хватает ли ресурсов для покупки
  if (!checkAffordability(state, cost)) {
    console.warn('Недостаточно ресурсов для покупки');
    return state;
  }
  
  // Создаем копию состояния
  let newState = { ...state };
  
  // Списываем ресурсы
  for (const [resourceId, amount] of Object.entries(cost)) {
    newState = {
      ...newState,
      resources: {
        ...newState.resources,
        [resourceId]: {
          ...newState.resources[resourceId],
          value: (newState.resources[resourceId]?.value || 0) - amount
        }
      }
    };
  }
  
  // Выполняем действие покупки
  newState = purchaseAction(newState);
  
  return newState;
}
