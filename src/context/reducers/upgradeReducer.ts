
import { GameState } from '../types';

export const processPurchaseUpgrade = (
  state: GameState,
  payload: { upgradeId: string }
): GameState => {
  const { upgradeId } = payload;
  const upgrade = state.upgrades[upgradeId];
  
  if (!upgrade || !upgrade.unlocked || upgrade.purchased) {
    return state;
  }
  
  // Проверяем, достаточно ли ресурсов
  for (const resourceId in upgrade.cost) {
    const resource = state.resources[resourceId];
    if (!resource || resource.value < upgrade.cost[resourceId]) {
      return state;
    }
  }
  
  // Копируем состояние
  const newState = { ...state };
  
  // Списываем ресурсы
  for (const resourceId in upgrade.cost) {
    newState.resources[resourceId] = {
      ...newState.resources[resourceId],
      value: newState.resources[resourceId].value - upgrade.cost[resourceId]
    };
  }
  
  // Отмечаем улучшение как купленное
  newState.upgrades[upgradeId] = {
    ...upgrade,
    purchased: true
  };
  
  return newState;
};
