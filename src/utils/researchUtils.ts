
// Утилиты для работы с исследованиями и их эффектами

/**
 * Преобразует идентификатор эффекта в читаемое название
 */
export const formatEffectName = (effectId: string): string => {
  // Словарь соответствия идентификаторов и названий
  const effectNames: Record<string, string> = {
    // Бонусы для макс. значений ресурсов
    knowledgeMax: "Макс. знаний",
    knowledgeMaxBoost: "Макс. знаний",
    usdtMax: "Макс. USDT",
    usdtMaxBoost: "Макс. USDT",
    bitcoinMax: "Макс. BTC",
    bitcoinMaxBoost: "Макс. BTC",
    
    // Бонусы для генерации ресурсов
    knowledgeBoost: "Прирост знаний",
    knowledgeEfficiencyBoost: "Эфф. применения знаний",
    computingPowerBoost: "Эфф. вычислений",
    
    // Бонусы для майнинга
    miningEfficiency: "Эфф. майнинга",
    miningEfficiencyBoost: "Эфф. майнинга",
    energyEfficiency: "Энергоэффективность",
    
    // Снижение потребления
    electricityConsumptionReduction: "Потр. электричества",
    computingPowerConsumptionReduction: "Потр. выч. мощности",
    
    // Бонусы для обмена
    btcExchangeBonus: "Эфф. обмена BTC",
    
    // Разблокировки функций
    unlockTrading: "Разблокировка трейдинга",
    autoBtcExchange: "Автообмен BTC"
  };
  
  return effectNames[effectId] || effectId;
};

/**
 * Форматирует значение эффекта в зависимости от его типа
 */
export const formatEffectValue = (value: number, effectId: string): string => {
  // Эффекты в процентах
  const percentEffects = [
    'knowledgeMaxBoost', 'usdtMaxBoost', 'knowledgeBoost', 
    'knowledgeEfficiencyBoost', 'computingPowerBoost', 'miningEfficiency',
    'miningEfficiencyBoost', 'energyEfficiency', 'btcExchangeBonus'
  ];
  
  // Эффекты с отрицательными значениями (снижение потребления)
  const negativeEffects = [
    'electricityConsumptionReduction', 'computingPowerConsumptionReduction'
  ];
  
  if (percentEffects.includes(effectId)) {
    return `+${(value * 100).toFixed(0)}%`;
  } else if (negativeEffects.includes(effectId)) {
    return `-${(value * 100).toFixed(0)}%`;
  } else if (effectId === 'unlockTrading' || effectId === 'autoBtcExchange') {
    return value ? 'Да' : 'Нет';
  } else {
    return `+${value}`;
  }
};

/**
 * Комплексное форматирование эффекта (название и значение)
 */
export const formatEffect = (effectId: string, value: number): string => {
  const name = formatEffectName(effectId);
  const formattedValue = formatEffectValue(value, effectId);
  
  return `${name}: ${formattedValue}`;
};

/**
 * Проверяет зависимости для исследования
 */
export const checkUpgradeDependencies = (
  upgradeId: string,
  purchasedUpgrades: Record<string, boolean>
): boolean => {
  // Определение зависимостей для каждого исследования
  const dependencyMap: Record<string, string[]> = {
    'blockchainBasics': [],
    'walletSecurity': ['cryptoWallet'],
    'cryptoCurrencyBasics': ['blockchainBasics'],
    'algorithmOptimization': ['miner'],
    'proofOfWork': ['algorithmOptimization'],
    'energyEfficientComponents': ['coolingSystem'],
    'cryptoTrading': ['enhancedWallet'],
    'tradingBot': ['cryptoTrading']
  };
  
  const dependencies = dependencyMap[upgradeId] || [];
  
  // Если нет зависимостей, то исследование доступно
  if (dependencies.length === 0) {
    return true;
  }
  
  // Проверка, что все зависимые исследования приобретены
  return dependencies.every(depId => purchasedUpgrades[depId]);
};
