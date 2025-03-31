
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
