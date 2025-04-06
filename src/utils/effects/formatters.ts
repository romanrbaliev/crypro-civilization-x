
import { Upgrade } from "@/context/types";

// Форматирует название эффекта для отображения в интерфейсе
export const formatEffectName = (effectId: string): string => {
  const effectMap: Record<string, string> = {
    // Для знаний
    'knowledgeMaxBoost': 'Увеличение максимума знаний',
    'knowledgeBoost': 'Прирост знаний',
    'knowledgeEfficiencyBoost': 'Эффективность накопления знаний',
    'knowledgeProductionBoost': 'Прирост знаний',
    
    // Для USDT
    'usdtMaxBoost': 'Увеличение максимума USDT',
    'usdtEfficiencyBoost': 'Эффективность применения знаний',
    
    // Для электричества
    'electricityMaxBoost': 'Увеличение максимума электричества',
    'electricityEfficiencyBoost': 'Эффективность выработки электричества',
    
    // Для вычислительной мощности
    'computingPowerMaxBoost': 'Увеличение максимума вычислительной мощности',
    'computingPowerEfficiencyBoost': 'Эффективность вычислительной мощности',
    
    // Для bitcoin
    'bitcoinMaxBoost': 'Увеличение максимума Bitcoin',
    'bitcoinEfficiencyBoost': 'Эффективность майнинга Bitcoin',
    
    // Общие эффекты
    'consumptionReduction': 'Снижение потребления ресурсов',
  };
  
  return effectMap[effectId] || `Эффект: ${effectId}`;
};

// Форматирует значение эффекта для отображения в интерфейсе
export const formatEffectValue = (value: number, effectId: string): string => {
  if (effectId.includes('Boost') || effectId.includes('boost')) {
    // Эффекты прироста и бустеры
    if (value >= 1.0) {
      // Множитель (например, 1.5 -> "x1.5")
      return `x${value.toFixed(2)}`;
    } else {
      // Процентный бонус (например, 0.15 -> "+15%")
      return `+${(value * 100).toFixed(0)}%`;
    }
  } else if (effectId.includes('Reduction') || effectId.includes('reduction')) {
    // Эффекты уменьшения потребления
    return `-${(value * 100).toFixed(0)}%`;
  } else if (effectId.includes('Max') || effectId.includes('max')) {
    // Эффекты увеличения максимума
    if (value >= 10) {
      // Абсолютное значение для больших чисел
      return `+${value.toFixed(0)}`;
    } else {
      // Дробное значение для малых чисел
      return `+${value.toFixed(value < 1 ? 3 : 1)}`;
    }
  }
  
  // По умолчанию просто возвращаем значение
  return `${value.toFixed(2)}`;
};

// Формирование полного отформатированного эффекта
export const formatEffect = (effectId: string, value: number): string => {
  return `${formatEffectName(effectId)}: ${formatEffectValue(value, effectId)}`;
};

// Проверяет эффективность исследования для данного типа ресурса
export const checkUpgradeEfficiency = (
  upgrade: Upgrade,
  resourceId: string,
  upgradeType: string
): number => {
  // Проверяем все эффекты исследования
  const effects = upgrade.effects || {};
  
  // Особые случаи для исследований
  if (upgrade.id === 'blockchainBasics' && resourceId === 'knowledge') {
    // Основы блокчейна: +50% к максимуму знаний и +10% к эффективности
    if (upgradeType === 'max') return 0.5; // +50% к максимуму
    if (upgradeType === 'production') return 0.1; // +10% к производству
  }
  
  // Проверяем прямые эффекты для ресурса
  for (const [effectId, value] of Object.entries(effects)) {
    // Проверяем соответствие типу ресурса и эффекта
    if (effectId.toLowerCase().includes(resourceId.toLowerCase()) && 
        effectId.toLowerCase().includes(upgradeType.toLowerCase())) {
      return Number(value);
    }
  }
  
  return 0; // Нет эффекта
};
