
import { GameState } from '../types';
import { hasEnoughResources, updateResourceMaxValues } from '../utils/resourceUtils';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Обработка покупки улучшений
export const processPurchaseUpgrade = (
  state: GameState,
  payload: { upgradeId: string }
): GameState => {
  const { upgradeId } = payload;
  const upgrade = state.upgrades[upgradeId];
  
  // Если улучшение не существует, не разблокировано или уже куплено, возвращаем текущее состояние
  if (!upgrade || !upgrade.unlocked || upgrade.purchased) {
    return state;
  }
  
  // Проверяем, хватает ли ресурсов
  const canAfford = hasEnoughResources(state, upgrade.cost);
  if (!canAfford) {
    return state;
  }
  
  // Вычитаем ресурсы
  const newResources = { ...state.resources };
  for (const [resourceId, cost] of Object.entries(upgrade.cost)) {
    newResources[resourceId] = {
      ...newResources[resourceId],
      value: newResources[resourceId].value - cost
    };
  }
  
  // Помечаем улучшение как купленное
  const newUpgrades = {
    ...state.upgrades,
    [upgradeId]: {
      ...upgrade,
      purchased: true
    }
  };
  
  // Если приобретены "Основы блокчейна", разблокируем криптокошелек
  if (upgradeId === 'basicBlockchain') {
    const newBuildings = {
      ...state.buildings,
      cryptoWallet: {
        ...state.buildings.cryptoWallet,
        unlocked: true
      }
    };

    console.log("Разблокирован криптокошелек из-за исследования 'Основы блокчейна'");
    
    // Отправляем сообщение о разблокировке криптокошелька
    safeDispatchGameEvent("Разблокирован криптокошелек", "info");
    
    // Добавляем описательное сообщение о криптокошельке
    setTimeout(() => {
      safeDispatchGameEvent("Криптокошелек увеличивает максимальное хранение USDT и знаний", "info");
    }, 200);
    
    const newState = {
      ...state,
      resources: newResources,
      upgrades: newUpgrades,
      buildings: newBuildings
    };
    
    // Обновляем максимальные значения ресурсов
    return updateResourceMaxValues(newState);
  }
  
  // Для любого улучшения обновляем максимальные значения ресурсов
  const updatedState = {
    ...state,
    resources: newResources,
    upgrades: newUpgrades
  };
  
  return updateResourceMaxValues(updatedState);
};
