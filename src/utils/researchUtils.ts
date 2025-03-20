import { GameState, Upgrade } from '@/context/types';

// Проверка наличия исследования "Основы блокчейна"
export const isBlockchainBasicsUnlocked = (upgrades: { [key: string]: Upgrade }): boolean => {
  return (
    (upgrades.basicBlockchain && upgrades.basicBlockchain.unlocked) ||
    (upgrades.blockchain_basics && upgrades.blockchain_basics.unlocked) ||
    (upgrades.blockchainBasics && upgrades.blockchainBasics.unlocked)
  );
};

// Проверка наличия купленного исследования "Основы блокчейна"
export const hasBlockchainBasics = (upgrades: { [key: string]: Upgrade }): boolean => {
  return (
    (upgrades.basicBlockchain && upgrades.basicBlockchain.purchased) ||
    (upgrades.blockchain_basics && upgrades.blockchain_basics.purchased) ||
    (upgrades.blockchainBasics && upgrades.blockchainBasics.purchased)
  );
};

// Проверка условий разблокировки для улучшения
export const checkUnlockConditions = (state: GameState, upgrade: Upgrade): boolean => {
  // Проверяем условия разблокировки
  if (upgrade.requirements) {
    for (const [reqId, reqValue] of Object.entries(upgrade.requirements)) {
      // Проверка для требований, связанных с количеством зданий
      if (reqId.endsWith('Count')) {
        const buildingId = reqId.replace('Count', '');
        if (!state.buildings[buildingId] || state.buildings[buildingId].count < reqValue) {
          return false;
        }
      }
      // Проверка для требований, связанных с исследованиями
      else if (state.upgrades[reqId]) {
        if (!state.upgrades[reqId].purchased) {
          return false;
        }
      }
      // Другие типы требований можно добавить по необходимости
    }
    return true;
  }
  
  // Проверка через unlockCondition (альтернативный формат)
  if (upgrade.unlockCondition) {
    // Проверка зданий
    if (upgrade.unlockCondition.buildings) {
      for (const [buildingId, count] of Object.entries(upgrade.unlockCondition.buildings)) {
        if (!state.buildings[buildingId] || state.buildings[buildingId].count < count) {
          return false;
        }
      }
    }
    
    // Проверка ресурсов
    if (upgrade.unlockCondition.resources) {
      for (const [resourceId, amount] of Object.entries(upgrade.unlockCondition.resources)) {
        if (!state.resources[resourceId] || state.resources[resourceId].value < amount) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  // Проверка через requiredUpgrades
  if (upgrade.requiredUpgrades && upgrade.requiredUpgrades.length > 0) {
    for (const reqUpgradeId of upgrade.requiredUpgrades) {
      if (!state.upgrades[reqUpgradeId] || !state.upgrades[reqUpgradeId].purchased) {
        return false;
      }
    }
    return true;
  }
  
  return false; // Если нет условий, не разблокируем автоматически
};

// Форматирование названия эффекта для отображения
export const formatEffectName = (effectId: string): string => {
  const effectNames: { [key: string]: string } = {
    knowledgeBoost: "Скорость накопления знаний",
    knowledgeMaxBoost: "Максимум знаний",
    usdtMaxBoost: "Максимум USDT",
    miningEfficiencyBoost: "Эффективность майнинга",
    energyEfficiencyBoost: "Энергоэффективность",
    computingPowerBoost: "Вычислительная мощность",
    conversionRate: "Эффективность конвертации",
    electricityEfficiencyBoost: "Эффективность использования электричества"
  };
  
  return effectNames[effectId] || effectId;
};

// Форматирование эффекта для отображения
export const formatEffect = (effectId: string, amount: number): string => {
  // Для процентных бустов
  if (effectId.includes('Boost')) {
    const effectName = formatEffectName(effectId);
    const percentage = amount * 100;
    return `+${percentage}% к ${effectName}`;
  }
  
  // Для прямых увеличений максимума
  if (effectId.includes('Max')) {
    const resourceId = effectId.replace('Max', '');
    return `+${amount} к максимуму ${resourceId}`;
  }
  
  // Для других эффектов
  return `+${amount} ${formatEffectName(effectId)}`;
};
