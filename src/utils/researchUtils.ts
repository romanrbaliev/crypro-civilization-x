
import { GameState, Upgrade } from "@/context/types";

// Проверяет, соответствует ли состояние игры условиям разблокировки
export const checkUnlockConditions = (state: GameState, upgrade: Upgrade): boolean => {
  // Если требуется определенное количество ресурсов
  if (upgrade.unlockCondition?.resources) {
    for (const [resourceId, amount] of Object.entries(upgrade.unlockCondition.resources)) {
      const resource = state.resources[resourceId];
      if (!resource || resource.value < amount) {
        return false;
      }
    }
  }

  // Если требуется определенное количество зданий
  if (upgrade.unlockCondition?.buildings) {
    for (const [buildingId, count] of Object.entries(upgrade.unlockCondition.buildings)) {
      const building = state.buildings[buildingId];
      if (!building || building.count < count) {
        return false;
      }
    }
  }

  // Проверка требований по ресурсам (устаревший формат)
  if (upgrade.requirements) {
    for (const [resourceId, amount] of Object.entries(upgrade.requirements)) {
      const resource = state.resources[resourceId];
      if (!resource || resource.value < amount) {
        return false;
      }
    }
  }

  // Если требуются другие улучшения
  if (upgrade.requiredUpgrades && upgrade.requiredUpgrades.length > 0) {
    for (const requiredUpgradeId of upgrade.requiredUpgrades) {
      if (!state.upgrades[requiredUpgradeId] || !state.upgrades[requiredUpgradeId].purchased) {
        return false;
      }
    }
  }

  return true;
};

// Проверяет, разблокировано ли исследование "Основы блокчейна"
export const isBlockchainBasicsUnlocked = (upgrades: { [key: string]: Upgrade }): boolean => {
  // Добавим подробные логи для отладки
  const basicBlockchainUnlock = upgrades['basicBlockchain']?.unlocked || false;
  const blockchainBasicsUnlock = upgrades['blockchain_basics']?.unlocked || false;
  
  console.log('Проверка разблокировки исследования "Основы блокчейна" в интерфейсе:', 
    basicBlockchainUnlock || blockchainBasicsUnlock ? 'ДА' : 'НЕТ');

  // Проверяем как новый, так и старый ID исследования
  return basicBlockchainUnlock || blockchainBasicsUnlock;
};

// Проверяет, куплено ли исследование "Основы блокчейна"
export const hasBlockchainBasics = (upgrades: { [key: string]: Upgrade }): boolean => {
  // Добавим подробные логи для отладки
  const basicBlockchainPurchased = upgrades['basicBlockchain']?.purchased || false;
  const blockchainBasicsPurchased = upgrades['blockchain_basics']?.purchased || false;
  
  console.log('Пользователь', 
    basicBlockchainPurchased || blockchainBasicsPurchased ? 'ИМЕЕТ' : 'НЕ имеет',
    'купленное исследование "Основы блокчейна"');

  // Проверяем как новый, так и старый ID исследования
  return basicBlockchainPurchased || blockchainBasicsPurchased;
};
