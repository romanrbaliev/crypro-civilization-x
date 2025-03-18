
// Утилиты для работы с исследованиями и их эффектами

// Форматирование названия эффекта
export const formatEffectName = (name: string): string => {
  // Словарь для перевода названий эффектов
  const effectNameMap: {[key: string]: string} = {
    knowledge: "знаниям",
    miningEfficiency: "эффективности майнинга",
    electricity: "электричеству",
    computingPower: "вычислительной мощности",
    electricityEfficiency: "эффективности электричества",
    electricityConsumption: "потреблению электричества",
    tradingEfficiency: "эффективности трейдинга",
    marketAnalysis: "анализу рынка",
    tradingProfit: "прибыли от трейдинга",
    volatilityPrediction: "предсказанию волатильности",
    automatedTrading: "автоматизированной торговле",
    tradeSpeed: "скорости торговли",
    security: "безопасности",
    automation: "автоматизации",
    reputation: "репутации",
    hashrate: "хешрейту",
    conversionRate: "конверсии",
    usdtMax: "максимальному хранению USDT",
    knowledgeMax: "максимальному хранению знаний",
    // И другие эффекты...
  };
  
  return effectNameMap[name] || name;
};

// Форматирование описания эффекта
export const formatEffect = (effectId: string, amount: number): string => {
  if (effectId === 'knowledgeBoost') {
    return `+${(amount * 100).toFixed(0)}% к скорости накопления Знаний о крипте`;
  } else if (effectId === 'knowledgeMaxBoost') {
    return `+${(amount * 100).toFixed(0)}% к максимуму Знаний о крипте`;
  } else if (effectId === 'usdtMaxBoost') {
    return `+${(amount * 100).toFixed(0)}% к максимуму USDT`;
  } else if (effectId.includes('Boost')) {
    const baseName = effectId.replace('Boost', '');
    return `+${(amount * 100).toFixed(0)}% к ${formatEffectName(baseName)}`;
  } else if (effectId.includes('Reduction')) {
    const baseName = effectId.replace('Reduction', '');
    return `-${(amount * 100).toFixed(0)}% к ${formatEffectName(baseName)}`;
  }
  return `+${amount} к ${formatEffectName(effectId)}`;
};

// Проверка условий разблокировки для исследования
export const checkUnlockConditions = (state: any, upgrade: any): boolean => {
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
  
  // Проверка условий по социальным метрикам
  if (upgrade.unlockCondition?.referrals) {
    const activeReferrals = state.referrals.filter((ref: any) => ref.activated).length;
    if (activeReferrals < upgrade.unlockCondition.referrals) {
      return false;
    }
  }
  
  return true;
};

// Получение специализации в читаемом виде
export const getSpecializationName = (spec: string): string => {
  const specializationMap: {[key: string]: string} = {
    miner: "Майнер",
    trader: "Трейдер",
    investor: "Инвестор",
    influencer: "Инфлюенсер",
    defi: "DeFi",
    general: "Общее"
  };
  
  return specializationMap[spec] || spec;
};
