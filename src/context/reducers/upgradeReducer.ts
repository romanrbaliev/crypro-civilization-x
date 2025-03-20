import { GameState, Upgrade } from '../types';
import { hasEnoughResources } from '../utils/resourceUtils';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { checkUnlockConditions } from '@/utils/researchUtils';

// Проверка, является ли улучшение "Основы блокчейна"
const isBlockchainBasics = (upgradeId: string): boolean => {
  return upgradeId === 'basicBlockchain' || 
         upgradeId === 'blockchain_basics' || 
         upgradeId === 'blockchainBasics';
};

// Проверка, является ли улучшение "Основы криптовалют"
const isCryptoCurrencyBasics = (upgradeId: string): boolean => {
  return upgradeId === 'cryptoCurrencyBasics' || 
         upgradeId === 'cryptocurrency_basics';
};

// Обработка покупки улучшений
export const processPurchaseUpgrade = (
  state: GameState,
  payload: { upgradeId: string }
): GameState => {
  const { upgradeId } = payload;
  const upgrade = state.upgrades[upgradeId];
  
  // Если улучшение не существует или уже куплено, возвращаем текущее состояние
  if (!upgrade || upgrade.purchased) {
    console.warn(`Попытка купить недоступное улучшение: ${upgradeId}`);
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
  
  // Помечаем улучшение как купленное
  const newUpgrades = {
    ...state.upgrades,
    [upgradeId]: {
      ...upgrade,
      purchased: true
    }
  };
  
  console.log(`Куплено улучшение ${upgrade.name}`);
  
  // Применяем эффекты улучшения
  if (upgrade.effects) {
    // Обработка каждого эффекта улучшения
    for (const [effectId, amount] of Object.entries(upgrade.effects)) {
      if (effectId === 'knowledgeBoost') {
        // Увеличиваем базовый прирост знаний
        newResources.knowledge = {
          ...newResources.knowledge,
          baseProduction: newResources.knowledge.baseProduction + Number(amount)
        };
      }
      
      if (effectId === 'knowledgeMaxBoost') {
        // Увеличиваем максимум знаний
        newResources.knowledge = {
          ...newResources.knowledge,
          max: newResources.knowledge.max + Number(amount)
        };
      }
      
      if (effectId === 'usdtMaxBoost') {
        // Увеличиваем максимум USDT
        newResources.usdt = {
          ...newResources.usdt,
          max: newResources.usdt.max + Number(amount)
        };
      }
      
      if (effectId === 'miningEfficiencyBoost') {
        // Увеличиваем эффективность майнинга
        // TODO: Implement mining efficiency boost
      }
      
      if (effectId === 'energyEfficiencyBoost') {
        // Увеличиваем энергоэффективность
        // TODO: Implement energy efficiency boost
      }
    }
  }
  
  let newState = {
    ...state,
    resources: newResources,
    upgrades: newUpgrades
  };
  
  // Особая обработка для разблокировки зданий и ресурсов в зависимости от улучшения
  
  // Разблокировка криптокошелька после "Основы блокчейна"
  if (isBlockchainBasics(upgradeId)) {
    if (newState.buildings.cryptoWallet) {
      console.log("Разблокируем криптокошелек после покупки 'Основы блокчейна'");
      newState.buildings.cryptoWallet.unlocked = true;
      safeDispatchGameEvent("Разблокирован Криптокошелек", "info");
    }
    
    // Разблокировка "Основы криптовалют" после "Основы блокчейна"
    if (newState.upgrades.cryptoCurrencyBasics) {
      newState.upgrades.cryptoCurrencyBasics.unlocked = true;
      safeDispatchGameEvent("Доступно новое исследование: Основы криптовалют", "info");
    }
  }
  
  // Разблокировка "Безопасность криптокошельков" после покупки криптокошелька
  if (upgradeId === 'cryptoWalletSecurity' || upgradeId === 'walletSecurity') {
    // Логика разблокировки после безопасности кошелька...
  }
  
  // Разблокировка автомайнера после "Основы криптовалют"
  if (isCryptoCurrencyBasics(upgradeId)) {
    if (newState.buildings.autoMiner) {
      console.log("Разблокируем автомайнер после покупки 'Основы криптовалют'");
      newState.buildings.autoMiner.unlocked = true;
      safeDispatchGameEvent("Разблокирован Автомайнер", "info");
    }
  }
  
  // Проверка условий разблокировки для других исследований
  newState = checkUpgradeUnlocks(newState);
  
  return newState;
};

// Проверка условий разблокировки улучшений
export const checkUpgradeUnlocks = (state: GameState): GameState => {
  const newUpgrades = { ...state.upgrades };
  let hasChanges = false;

  // Проверка условий разблокировки для каждого улучшения
  Object.values(newUpgrades).forEach(upgrade => {
    // Пропускаем уже разблокированные или купленные улучшения
    if (upgrade.unlocked || upgrade.purchased) return;

    // Базовые условия для различных исследований
    
    // "Безопасность криптокошельков" разблокируется после покупки криптокошелька
    if ((upgrade.id === 'walletSecurity' || upgrade.id === 'cryptoWalletSecurity') && 
        state.buildings.cryptoWallet && 
        state.buildings.cryptoWallet.count > 0) {
      upgrade.unlocked = true;
      hasChanges = true;
      safeDispatchGameEvent(`Доступно новое исследование: ${upgrade.name}`, "info");
    }
    
    // "Оптимизация алгоритмов" разблокируется после покупки автомайнера
    else if (upgrade.id === 'algorithmOptimization' && 
             state.buildings.autoMiner && 
             state.buildings.autoMiner.count > 0) {
      upgrade.unlocked = true;
      hasChanges = true;
      safeDispatchGameEvent(`Доступно новое исследование: ${upgrade.name}`, "info");
    }
    
    // Универсальная проверка условий разблокировки
    else if (checkUnlockConditions(state, upgrade)) {
      upgrade.unlocked = true;
      hasChanges = true;
      safeDispatchGameEvent(`Доступно новое исследование: ${upgrade.name}`, "info");
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
