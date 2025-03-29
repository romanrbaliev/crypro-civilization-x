
// Вспомогательные функции для системы исследований

import { GameState } from '@/context/types';

// Проверка условий разблокировки исследования
export const checkUnlockConditions = (state: GameState, conditions: any): boolean => {
  if (!conditions) return true;
  
  // Проверка требований к зданиям
  if (conditions.buildings) {
    for (const [buildingId, requiredCount] of Object.entries(conditions.buildings)) {
      if (!state.buildings[buildingId] || state.buildings[buildingId].count < Number(requiredCount)) {
        return false;
      }
    }
  }
  
  // Проверка требований к ресурсам
  if (conditions.resources) {
    for (const [resourceId, requiredAmount] of Object.entries(conditions.resources)) {
      if (!state.resources[resourceId] || state.resources[resourceId].value < Number(requiredAmount)) {
        return false;
      }
    }
  }
  
  // Проверка требований к улучшениям
  if (conditions.upgrades) {
    for (const upgradeId of conditions.upgrades) {
      if (!state.upgrades[upgradeId] || !state.upgrades[upgradeId].purchased) {
        return false;
      }
    }
  }
  
  return true;
};

// Проверка, разблокировано ли исследование "Основы блокчейна"
export const isBlockchainBasicsUnlocked = (state: GameState): boolean => {
  // Проверяем все возможные идентификаторы этого исследования
  const blockchainBasicsIds = ['blockchainBasics', 'basicBlockchain', 'blockchain_basics'];
  
  for (const id of blockchainBasicsIds) {
    if (state.upgrades[id] && state.upgrades[id].unlocked) {
      return true;
    }
  }
  
  return false;
};

// Проверка, куплено ли исследование "Основы блокчейна"
export const isBlockchainBasicsPurchased = (state: GameState): boolean => {
  // Проверяем все возможные идентификаторы этого исследования
  const blockchainBasicsIds = ['blockchainBasics', 'basicBlockchain', 'blockchain_basics'];
  
  for (const id of blockchainBasicsIds) {
    if (state.upgrades[id] && state.upgrades[id].purchased) {
      return true;
    }
  }
  
  return false;
};

// Форматирование имени эффекта для отображения пользователю
export const formatEffectName = (effectId: string): string => {
  const effectMapping: { [key: string]: string } = {
    knowledgeBoost: "Прирост знаний",
    knowledgeMaxBoost: "Максимум знаний",
    usdtMaxBoost: "Максимум USDT",
    miningEfficiencyBoost: "Эффективность майнинга",
    securityBoost: "Безопасность",
    stakingRewardBoost: "Награда за стейкинг",
    tradingProfitBoost: "Прибыль от трейдинга",
    portfolioVolatility: "Волатильность портфеля",
    reputationBoost: "Репутация",
    hashrateBost: "Хешрейт",
    tradingEfficiencyBoost: "Эффективность трейдинга",
    electricityEfficiencyBoost: "Эффективность использования электричества",
    computingPowerBoost: "Вычислительная мощность",
    electricityConsumptionReduction: "Снижение потребления электричества"
  };
  
  return effectMapping[effectId] || effectId;
};

// Форматирование эффекта для отображения пользователю
export const formatEffect = (effectId: string, amount: number): string => {
  const formattedName = formatEffectName(effectId);
  
  // Определяем, является ли эффект процентным или абсолютным
  const isPercentage = effectId.includes('Boost') || 
                      effectId.includes('Efficiency') || 
                      effectId.includes('Reduction') ||
                      effectId.includes('Volatility');
  
  if (isPercentage) {
    const sign = amount >= 0 ? '+' : '';
    return `${formattedName}: ${sign}${(amount * 100).toFixed(0)}%`;
  } else {
    const sign = amount >= 0 ? '+' : '';
    return `${formattedName}: ${sign}${amount}`;
  }
};
