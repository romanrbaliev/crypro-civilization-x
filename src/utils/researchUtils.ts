
import { Upgrade, GameState } from "@/context/types";

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

// Добавленная функция для форматирования эффекта
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

// Добавим недостающие функции, которые упоминаются в ошибках

// Проверяет, изучено ли исследование "Основы блокчейна"
export const isBlockchainBasicsUnlocked = (state: GameState): boolean => {
  return state.upgrades.blockchainBasics?.purchased === true;
};

// Получает название специализации
export const getSpecializationName = (specId: string): string => {
  const specializationMap: Record<string, string> = {
    'miner': 'Майнер',
    'trader': 'Трейдер',
    'investor': 'Инвестор',
    'influencer': 'Инфлюенсер',
    'defi': 'DeFi',
    'technology': 'Технологии',
    'financial': 'Финансы',
    'social': 'Социальные',
    'temporal': 'Временные',
    'mystical': 'Мистические'
  };
  
  return specializationMap[specId] || specId;
};

// Получает разблокированные здания по группе
export const getUnlockedBuildingsByGroup = (
  state: GameState, 
  buildingIds: string[]
): string[] => {
  return buildingIds.filter(id => 
    state.buildings[id]?.unlocked === true
  );
};

// Получает разблокированные исследования по группе
export const getUnlockedUpgradesByGroup = (
  state: GameState, 
  upgradeIds: string[]
): string[] => {
  return upgradeIds.filter(id => 
    state.upgrades[id]?.unlocked === true || state.upgrades[id]?.purchased === true
  );
};

// Применяет эффекты исследования к состоянию
export const applyUpgradeEffects = (state: GameState, upgradeId: string): GameState => {
  const upgrade = state.upgrades[upgradeId];
  if (!upgrade || !upgrade.purchased) {
    return state;
  }
  
  let newState = { ...state, resources: { ...state.resources } };
  
  // Фиксированные эффекты для известных исследований
  if (upgradeId === 'blockchainBasics') {
    // Обновляем максимум знаний (+50%)
    if (newState.resources.knowledge) {
      const currentMax = newState.resources.knowledge.max || 100;
      newState.resources.knowledge.max = currentMax * 1.5;
      
      // Увеличиваем производство знаний на 10%
      const baseProd = newState.resources.knowledge.baseProduction || 0;
      newState.resources.knowledge.baseProduction = baseProd * 1.1;
      
      console.log(`Применен эффект Основы блокчейна: максимум знаний=${newState.resources.knowledge.max}, базовое производство=${newState.resources.knowledge.baseProduction}`);
    }
  }
  
  // Обработка динамических эффектов из upgrade.effects
  if (upgrade.effects) {
    for (const [effectId, value] of Object.entries(upgrade.effects)) {
      if (effectId.includes('Max') || effectId.includes('max')) {
        // Эффекты на максимум ресурсов
        const resourcePart = effectId.toLowerCase().replace('max', '').replace('boost', '');
        const resourceId = mapResourceId(resourcePart);
        
        if (newState.resources[resourceId]) {
          const currentMax = newState.resources[resourceId].max || 0;
          
          // Если эффект процентный (>= 1.0 или < 1.0)
          if (Number(value) >= 1.0) {
            newState.resources[resourceId].max = currentMax * Number(value);
          } else {
            newState.resources[resourceId].max = currentMax * (1 + Number(value));
          }
          
          console.log(`Применен эффект ${effectId} для ${resourceId}: новый максимум=${newState.resources[resourceId].max}`);
        }
      } else if (effectId.includes('Production') || effectId.includes('production') || effectId.includes('Boost') || effectId.includes('boost')) {
        // Эффекты на производство ресурсов
        const resourcePart = effectId.toLowerCase().replace('production', '').replace('boost', '');
        const resourceId = mapResourceId(resourcePart);
        
        if (newState.resources[resourceId]) {
          const currentProduction = newState.resources[resourceId].baseProduction || 0;
          
          // Если эффект процентный (>= 1.0 или < 1.0)
          if (Number(value) >= 1.0) {
            newState.resources[resourceId].baseProduction = currentProduction * Number(value);
          } else {
            newState.resources[resourceId].baseProduction = currentProduction * (1 + Number(value));
          }
          
          console.log(`Применен эффект ${effectId} для ${resourceId}: новое базовое производство=${newState.resources[resourceId].baseProduction}`);
        }
      }
    }
  }
  
  return newState;
};

// Вспомогательная функция для преобразования названия эффекта в ID ресурса
const mapResourceId = (resourcePart: string): string => {
  const resourceIdMap: Record<string, string> = {
    'knowledge': 'knowledge',
    'usdt': 'usdt',
    'bitcoin': 'bitcoin',
    'electricity': 'electricity',
    'computingpower': 'computingPower',
    'computing': 'computingPower'
  };
  
  return resourceIdMap[resourcePart] || resourcePart;
};
