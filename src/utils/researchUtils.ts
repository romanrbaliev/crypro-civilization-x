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
    knowledgeBoost: "скорости накопления знаний",
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
  console.log(`Проверка условий разблокировки для ${upgrade.id}: ${upgrade.name}`);
  
  // Проверяем зависимости от других исследований
  if (upgrade.requiredUpgrades && upgrade.requiredUpgrades.length > 0) {
    const allRequiredPurchased = upgrade.requiredUpgrades.every(
      (requiredId: string) => state.upgrades[requiredId]?.purchased
    );
    
    if (!allRequiredPurchased) {
      console.log(`${upgrade.id}: Не выполнено условие requiredUpgrades`);
      return false;
    }
  }
  
  // Проверяем условия по зданиям
  if (upgrade.unlockCondition?.buildings) {
    for (const [buildingId, count] of Object.entries(upgrade.unlockCondition.buildings)) {
      if (!state.buildings[buildingId] || state.buildings[buildingId].count < Number(count)) {
        console.log(`${upgrade.id}: Не выполнено условие по зданию ${buildingId} (требуется: ${count}, есть: ${state.buildings[buildingId]?.count || 0})`);
        return false;
      }
    }
  }
  
  // Проверяем условия по ресурсам
  if (upgrade.unlockCondition?.resources) {
    for (const [resourceId, amount] of Object.entries(upgrade.unlockCondition.resources)) {
      if (!state.resources[resourceId] || state.resources[resourceId].value < Number(amount)) {
        console.log(`${upgrade.id}: Не выполнено условие по ресурсу ${resourceId} (требуется: ${amount}, есть: ${state.resources[resourceId]?.value || 0})`);
        return false;
      }
    }
  }
  
  // Проверяем условия по социальным метрикам
  if (upgrade.unlockCondition?.referrals) {
    const activeReferrals = state.referrals.filter((ref: any) => ref.activated).length;
    if (activeReferrals < upgrade.unlockCondition.referrals) {
      console.log(`${upgrade.id}: Не выполнено условие по рефералам (требуется: ${upgrade.unlockCondition.referrals}, есть: ${activeReferrals})`);
      return false;
    }
  }
  
  console.log(`${upgrade.id}: Все условия выполнены, разблокировка возможна`);
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

// Проверка покупки "Основы блокчейна" у пользователя
export const hasBlockchainBasics = (upgrades: any): boolean => {
  // Проверяем оба возможных ID для этого исследования
  return (
    (upgrades.blockchain_basics && upgrades.blockchain_basics.purchased) ||
    (upgrades.basicBlockchain && upgrades.basicBlockchain.purchased)
  );
};

// Проверка активации реферала по его ID
export const isReferralActive = (referrals: any[], referralId: string): boolean => {
  const referral = referrals.find(ref => ref.id === referralId);
  
  if (!referral) {
    console.log(`Реферал с ID ${referralId} не найден в списке рефералов`);
    return false;
  }
  
  console.log(`Статус активации реферала ${referralId}: ${referral.activated ? 'активен' : 'не активен'}`);
  return !!referral.activated;
};

// Подсчет активных рефералов
export const countActiveReferrals = (referrals: any[]): number => {
  const activeCount = referrals.filter(ref => ref.activated).length;
  console.log(`Общее количество рефералов: ${referrals.length}, активных: ${activeCount}`);
  return activeCount;
};
