
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
  
  // Проверяем, нужно ли разблокировать другие исследования после покупки этого
  const stateAfterPurchase = {
    ...state,
    resources: newResources,
    upgrades: newUpgrades
  };
  
  // Проверяем все улучшения на возможность разблокировки
  const stateWithNewUnlocks = checkUpgradeUnlocks(stateAfterPurchase);
  
  // Обновляем максимальные значения ресурсов
  return updateResourceMaxValues(stateWithNewUnlocks);
};

// Проверка разблокировки улучшений на основе зависимостей
export const checkUpgradeUnlocks = (state: GameState): GameState => {
  const newUpgrades = { ...state.upgrades };
  let hasChanges = false;
  
  Object.values(newUpgrades).forEach(upgrade => {
    // Пропускаем уже разблокированные или купленные улучшения
    if (upgrade.unlocked || upgrade.purchased) return;
    
    // Проверяем, выполнены ли условия для разблокировки
    const shouldUnlock = checkUnlockConditions(state, upgrade);
    
    if (shouldUnlock) {
      newUpgrades[upgrade.id] = {
        ...upgrade,
        unlocked: true
      };
      hasChanges = true;
      
      // Отправляем сообщение о разблокировке нового исследования
      safeDispatchGameEvent(`Разблокировано новое исследование: ${upgrade.name}`, "info");
    }
  });
  
  if (hasChanges) {
    return {
      ...state,
      upgrades: newUpgrades
    };
  }
  
  return state;
};

// Проверка условий разблокировки для улучшения
const checkUnlockConditions = (state: GameState, upgrade: any): boolean => {
  // Проверка зависимостей от других исследований
  if (upgrade.requiredUpgrades && upgrade.requiredUpgrades.length > 0) {
    const allRequiredPurchased = upgrade.requiredUpgrades.every(
      (requiredId: string) => state.upgrades[requiredId]?.purchased
    );
    
    if (!allRequiredPurchased) return false;
  }
  
  // Проверка условий по зданиям
  if (upgrade.unlockCondition?.buildings) {
    for (const [buildingId, count] of Object.entries(upgrade.unlockCondition.buildings)) {
      if (!state.buildings[buildingId] || state.buildings[buildingId].count < Number(count)) {
        return false;
      }
    }
  }
  
  // Проверка условий по ресурсам
  if (upgrade.unlockCondition?.resources) {
    for (const [resourceId, amount] of Object.entries(upgrade.unlockCondition.resources)) {
      if (!state.resources[resourceId] || state.resources[resourceId].value < Number(amount)) {
        return false;
      }
    }
  }
  
  return true;
};
