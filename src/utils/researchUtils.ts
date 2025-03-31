
/**
 * Преобразует технический ID эффекта в удобочитаемое описание на русском языке
 */
export const formatEffectName = (effectId: string): string => {
  // Маппинг для русскоязычного отображения эффектов
  const effectNameMap: { [key: string]: string } = {
    // Эффекты ресурсов
    'knowledgeMax': 'Увеличение максимума знаний',
    'usdtMax': 'Увеличение максимума USDT',
    'electricityMax': 'Увеличение максимума электричества',
    'computingPowerMax': 'Увеличение максимума вычислительной мощности',
    'bitcoinMax': 'Увеличение максимума Bitcoin',
    
    // Бонусы к производству
    'knowledgeBoost': 'Бонус к производству знаний',
    'usdtBoost': 'Бонус к производству USDT',
    'electricityBoost': 'Бонус к производству электричества',
    'computingPowerBoost': 'Бонус к производству вычислительной мощности',
    'bitcoinBoost': 'Бонус к производству Bitcoin',
    
    // Бонусы к максимальному хранению
    'knowledgeMaxBoost': 'Увеличение максимума знаний',
    'usdtMaxBoost': 'Увеличение максимума USDT',
    
    // Уменьшение затрат
    'knowledgeCostReduction': 'Снижение затрат знаний',
    'usdtCostReduction': 'Снижение затрат USDT',
    
    // Другие эффекты
    'miningEfficiency': 'Эффективность майнинга',
    'energyEfficiency': 'Энергоэффективность',
    'btcExchangeBonus': 'Бонус к обмену BTC',
    'practiceEfficiency': 'Эффективность практики'
  };
  
  return effectNameMap[effectId] || `${effectId}`;
};

/**
 * Форматирует значение эффекта в зависимости от типа эффекта
 */
export const formatEffectValue = (value: number, effectId: string): string => {
  // Определяем, какой формат применить
  if (effectId.includes('Boost') || 
      effectId.includes('Efficiency') || 
      effectId === 'exchangeBonus') {
    // Для бонусов и эффективности выводим процент
    return `+${(value * 100).toFixed(0)}%`;
  } else if (effectId.includes('Reduction')) {
    // Для снижения затрат
    return `-${(value * 100).toFixed(0)}%`;
  } else {
    // Для абсолютных значений
    return `+${value}`;
  }
};

/**
 * Преобразует объект эффектов в массив читаемых строк
 */
export const formatEffects = (effects: { [key: string]: number }): string[] => {
  return Object.entries(effects).map(([effectId, value]) => {
    const name = formatEffectName(effectId);
    const formattedValue = formatEffectValue(value, effectId);
    return `${name}: ${formattedValue}`;
  });
};

/**
 * Форматирует отдельный эффект для отображения
 */
export const formatEffect = (effectId: string, value: number): string => {
  const name = formatEffectName(effectId);
  const formattedValue = formatEffectValue(value, effectId);
  return `${name}: ${formattedValue}`;
};

/**
 * Проверяет, исследованы ли "Основы блокчейна"
 */
export const isBlockchainBasicsUnlocked = (state: any): boolean => {
  // Проверяем разные варианты ID для обратной совместимости
  return Object.values(state.upgrades).some((upgrade: any) => 
    (upgrade.id === 'blockchainBasics' || 
     upgrade.id === 'basicBlockchain' || 
     upgrade.id === 'blockchain_basics') && 
    upgrade.purchased
  );
};

/**
 * Возвращает название специализации на русском языке
 */
export const getSpecializationName = (specializationId: string): string => {
  const specializationMap: {[key: string]: string} = {
    'miner': 'Майнер',
    'trader': 'Трейдер',
    'investor': 'Инвестор',
    'influencer': 'Инфлюенсер',
    'analyst': 'Аналитик',
    'founder': 'Основатель',
    'defi': 'DeFi-специалист'
  };
  
  return specializationMap[specializationId] || specializationId;
};

/**
 * Разблокирует связанные исследования после покупки конкретного исследования
 */
export const unlockRelatedUpgrades = (state: any, upgradeId: string): any => {
  let newState = { ...state };
  const upgrade = state.upgrades[upgradeId];
  
  console.log(`Проверка разблокировки связанных исследований для ${upgradeId}`);
  
  // Проходим по всем исследованиям
  Object.values(state.upgrades).forEach((potentialUpgrade: any) => {
    // Если исследование зависит от купленного исследования
    if (potentialUpgrade.requiredUpgrades && 
        potentialUpgrade.requiredUpgrades.includes(upgradeId) && 
        !potentialUpgrade.unlocked) {
      
      // Проверяем, все ли зависимости выполнены
      const allDependenciesMet = potentialUpgrade.requiredUpgrades.every(
        (reqId: string) => newState.upgrades[reqId]?.purchased
      );
      
      if (allDependenciesMet) {
        console.log(`Разблокировка исследования ${potentialUpgrade.id} после покупки ${upgradeId}`);
        newState = {
          ...newState,
          upgrades: {
            ...newState.upgrades,
            [potentialUpgrade.id]: {
              ...potentialUpgrade,
              unlocked: true
            }
          }
        };
      }
    }
  });
  
  return newState;
};

/**
 * Разблокирует связанные здания после покупки конкретного исследования
 */
export const unlockRelatedBuildings = (state: any, upgradeId: string): any => {
  let newState = { ...state };
  
  console.log(`Проверка разблокировки зданий для исследования ${upgradeId}`);
  
  // Специальная обработка для "Основы блокчейна"
  if (upgradeId === 'blockchainBasics' || upgradeId === 'basicBlockchain' || upgradeId === 'blockchain_basics') {
    console.log("Разблокировка криптокошелька после изучения Основ блокчейна");
    
    // Если криптокошелек существует, разблокируем его
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
      console.log("Криптокошелек разблокирован");
    }
  }
  
  // Проходим по всем зданиям
  Object.values(state.buildings).forEach((building: any) => {
    // Если здание требует данное исследование
    if (building.requiredUpgrades && building.requiredUpgrades.includes(upgradeId) && !building.unlocked) {
      // Проверяем, все ли требуемые исследования выполнены
      const allUpgradesMet = building.requiredUpgrades.every(
        (reqId: string) => newState.upgrades[reqId]?.purchased
      );
      
      if (allUpgradesMet) {
        console.log(`Разблокировка здания ${building.id} после покупки исследования ${upgradeId}`);
        newState = {
          ...newState,
          buildings: {
            ...newState.buildings,
            [building.id]: {
              ...building,
              unlocked: true
            }
          }
        };
      }
    }
  });
  
  return newState;
};
