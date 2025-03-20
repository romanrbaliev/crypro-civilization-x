
import { GameState, Upgrade } from '../types';
import { hasEnoughResources } from '../utils/resourceUtils';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { checkUnlockConditions } from '@/utils/researchUtils';

// Обработка покупки улучшений (исследований)
export const processPurchaseUpgrade = (
  state: GameState,
  payload: { upgradeId: string; markAsUnlocked?: boolean }
): GameState => {
  const { upgradeId, markAsUnlocked = false } = payload;
  const upgrade = state.upgrades[upgradeId];
  
  // Если улучшение не существует или не разблокировано, возвращаем текущее состояние
  if (!upgrade) {
    console.warn(`Улучшение с ID ${upgradeId} не найдено`);
    return state;
  }
  
  // Если мы только хотим разблокировать, но не покупать
  if (markAsUnlocked) {
    console.log(`Разблокировка улучшения ${upgrade.name} (${upgradeId})`);
    
    return {
      ...state,
      upgrades: {
        ...state.upgrades,
        [upgradeId]: {
          ...upgrade,
          unlocked: true
        }
      }
    };
  }
  
  // Проверяем, не куплено ли уже улучшение
  if (upgrade.purchased) {
    console.warn(`Улучшение ${upgrade.name} уже куплено`);
    return state;
  }
  
  // Проверяем, разблокировано ли улучшение
  if (!upgrade.unlocked) {
    console.warn(`Улучшение ${upgrade.name} не разблокировано для покупки`);
    return state;
  }
  
  // Проверяем, достаточно ли ресурсов для покупки
  if (!hasEnoughResources(state, upgrade.cost)) {
    console.warn(`Недостаточно ресурсов для покупки ${upgrade.name}`);
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
  
  // Отмечаем улучшение как купленное
  const newUpgrades = {
    ...state.upgrades,
    [upgradeId]: {
      ...upgrade,
      purchased: true
    }
  };
  
  console.log(`Куплено улучшение ${upgrade.name}`);
  safeDispatchGameEvent(`Приобретено исследование: ${upgrade.name}`, "success");
  
  // Применяем эффекты улучшения, если они есть
  let newState = {
    ...state,
    resources: newResources,
    upgrades: newUpgrades
  };
  
  // Разблокировка особых возможностей при покупке определенных улучшений
  if (upgradeId === 'basicBlockchain' || upgradeId === 'blockchain_basics' || upgradeId === 'blockchainBasics') {
    console.log('Разблокировка Криптокошелька после исследования "Основы блокчейна"');
    
    // Разблокируем здание Криптокошелек
    if (newState.buildings.cryptoWallet) {
      newState = {
        ...newState,
        buildings: {
          ...newState.buildings,
          cryptoWallet: {
            ...newState.buildings.cryptoWallet,
            unlocked: true
          }
        }
      };
      safeDispatchGameEvent("Разблокирован Криптокошелек!", "success");
    }
  }
  
  // Разблокировка безопасности кошельков после покупки криптокошелька
  if (upgradeId === 'cryptoWallet' && newState.upgrades.walletSecurity && !newState.upgrades.walletSecurity.unlocked) {
    newState = {
      ...newState,
      upgrades: {
        ...newState.upgrades,
        walletSecurity: {
          ...newState.upgrades.walletSecurity,
          unlocked: true
        }
      }
    };
    safeDispatchGameEvent("Разблокировано исследование: Безопасность криптокошельков", "info");
  }
  
  // Проверяем и разблокируем другие исследования, если выполняются их условия
  newState = checkUpgradeUnlocks(newState);
  
  return newState;
};

// Проверяет и разблокирует исследования, если выполняются условия
export const checkUpgradeUnlocks = (state: GameState): GameState => {
  const upgrades = { ...state.upgrades };
  let anyUnlocked = false;
  
  // Проходим по всем улучшениям и проверяем условия разблокировки
  Object.keys(upgrades).forEach(upgradeId => {
    const upgrade = upgrades[upgradeId];
    
    // Если уже разблокировано, пропускаем
    if (upgrade.unlocked) return;
    
    // Проверяем условия разблокировки
    if (checkUnlockConditions(state, upgrade)) {
      upgrades[upgradeId] = {
        ...upgrade,
        unlocked: true
      };
      
      console.log(`Разблокировано исследование ${upgrade.name}`);
      safeDispatchGameEvent(`Доступно новое исследование: ${upgrade.name}`, "info");
      anyUnlocked = true;
    }
  });
  
  // Если ничего не разблокировано, возвращаем исходное состояние
  if (!anyUnlocked) return state;
  
  return {
    ...state,
    upgrades
  };
};
