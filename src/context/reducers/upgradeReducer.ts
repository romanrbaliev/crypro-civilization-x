
import { GameState } from '../types';
import { hasEnoughResources, updateResourceMaxValues } from '../utils/resourceUtils';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { checkUnlockConditions } from '@/utils/researchUtils';
import { activateReferral } from '@/api/gameDataService';

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
  
  console.log(`Куплено исследование ${upgradeId} с эффектами:`, upgrade.effect);
  
  // Если приобретены "Основы блокчейна", разблокируем криптокошелек и активируем реферала
  if (upgradeId === 'basicBlockchain' || upgradeId === 'blockchain_basics') {
    // Разблокируем криптокошелек
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
    
    // Добавлен описательное сообщение о криптокошельке
    setTimeout(() => {
      safeDispatchGameEvent("Криптокошелек увеличивает максимальное хранение USDT и знаний", "info");
    }, 200);
    
    // Новый код - Активируем реферала, если пользователь был приглашен
    if (state.referredBy) {
      console.log('Активируем реферала для пригласившего пользователя через API', state.referredBy);
      // Запоминаем текущий userId для активации как реферала
      const userId = window.__game_user_id || 'unknown';
      
      // Асинхронно активируем реферала (вызываем API без ожидания результата)
      activateReferral(userId).then(result => {
        console.log('Результат активации реферала для', userId, ':', result);
        if (result) {
          safeDispatchGameEvent("Ваш реферер получил бонус за ваше развитие!", "success");
        }
      });
    }
    
    // Обновляем состояние
    const stateAfterPurchase = {
      ...state,
      resources: newResources,
      upgrades: newUpgrades,
      buildings: newBuildings
    };
    
    // Обновляем максимальные значения ресурсов и проверяем разблокировки
    const updatedState = updateResourceMaxValues(stateAfterPurchase);
    return checkUpgradeUnlocks(updatedState);
  }
  
  // Для других исследований просто обновляем состояние
  const stateAfterPurchase = {
    ...state,
    resources: newResources,
    upgrades: newUpgrades
  };
  
  // Проверяем разблокировки и обновляем максимальные значения ресурсов
  const stateWithNewUnlocks = checkUpgradeUnlocks(stateAfterPurchase);
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
      const categoryText = upgrade.category ? ` (${upgrade.specialization || upgrade.category})` : '';
      safeDispatchGameEvent(`Разблокировано новое исследование: ${upgrade.name}${categoryText}`, "info");
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
