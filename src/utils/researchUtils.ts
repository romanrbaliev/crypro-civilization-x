
import { GameState } from '@/context/types';

/**
 * Проверяет, изучены ли основы блокчейна
 */
export const isBlockchainBasicsUnlocked = (state: GameState): boolean => {
  // Проверяем все возможные ID для "Основы блокчейна"
  return state.upgrades.blockchainBasics?.purchased === true ||
         state.upgrades.basicBlockchain?.purchased === true ||
         state.upgrades.blockchain_basics?.purchased === true;
};

/**
 * Получает все разблокированные но не купленные исследования
 */
export const getUnlockedUpgrades = (state: GameState): any[] => {
  return Object.values(state.upgrades).filter(u => u.unlocked && !u.purchased);
};

/**
 * Получает все купленные исследования
 */
export const getPurchasedUpgrades = (state: GameState): any[] => {
  return Object.values(state.upgrades).filter(u => u.purchased);
};

/**
 * Форматирует название эффекта для отображения
 */
export const formatEffectName = (effectId: string): string => {
  const effectNameMap: { [key: string]: string } = {
    'knowledgeMaxBoost': 'Максимум знаний',
    'knowledgeBoost': 'Прирост знаний',
    'knowledgeEfficiencyBoost': 'Эффективность применения знаний',
    'usdtMaxBoost': 'Максимум USDT',
    'miningEfficiency': 'Эффективность майнинга',
    'energyEfficiency': 'Энергоэффективность',
    'electricityMaxBoost': 'Максимум электричества',
    'computingPowerMaxBoost': 'Максимум вычислительной мощности',
    'bitcoinMaxBoost': 'Максимум Bitcoin',
    'bitcoinEfficiencyBoost': 'Эффективность майнинга Bitcoin',
    'electricityConsumptionReduction': 'Снижение потребления электричества',
    'computingPowerEfficiencyBoost': 'Эффективность вычислений'
  };
  
  return effectNameMap[effectId] || effectId;
};

/**
 * Форматирует значение эффекта для отображения
 */
export const formatEffectValue = (value: number, effectId: string): string => {
  // Форматируем как проценты для большинства эффектов
  if (effectId.endsWith('Boost') || 
      effectId.endsWith('Reduction') || 
      effectId === 'knowledgeMaxBoost' || 
      effectId === 'usdtMaxBoost' ||
      effectId === 'electricityMaxBoost' ||
      effectId === 'computingPowerMaxBoost' ||
      effectId === 'bitcoinMaxBoost') {
    return `+${value * 100}%`;
  }
  
  // Для других эффектов просто отображаем значение
  return `${value}`;
};

/**
 * Форматирует эффект для отображения (комбинирует название и значение)
 */
export const formatEffect = (effectId: string, value: number): string => {
  return `${formatEffectName(effectId)}: ${formatEffectValue(value, effectId)}`;
};

/**
 * Возвращает название специализации
 */
export const getSpecializationName = (specialization: string): string => {
  const specializationMap: { [key: string]: string } = {
    'miner': 'Майнер',
    'trader': 'Трейдер',
    'investor': 'Инвестор',
    'influencer': 'Инфлюенсер',
    'defi': 'DeFi',
    'general': 'Общая'
  };
  
  return specializationMap[specialization] || specialization;
};

/**
 * Получает разблокированные здания по группе
 */
export const getUnlockedBuildingsByGroup = (state: GameState, buildingIds: string[]): string[] => {
  return buildingIds.filter(id => state.buildings[id]?.unlocked === true);
};

/**
 * Получает разблокированные исследования по группе
 */
export const getUnlockedUpgradesByGroup = (state: GameState, upgradeIds: string[]): string[] => {
  return upgradeIds.filter(id => state.upgrades[id]?.unlocked === true);
};
