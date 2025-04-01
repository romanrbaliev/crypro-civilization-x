
import { GameState } from '@/context/types';

/**
 * Проверяет, разблокировано ли исследование "Основы блокчейна"
 */
export function isBlockchainBasicsUnlocked(state: GameState): boolean {
  // Проверяем все возможные варианты имени исследования
  const isUnlocked = 
    (state.upgrades.blockchainBasics && state.upgrades.blockchainBasics.unlocked) ||
    (state.upgrades.basicBlockchain && state.upgrades.basicBlockchain.unlocked) ||
    (state.upgrades.blockchain_basics && state.upgrades.blockchain_basics.unlocked);
    
  return isUnlocked;
}

/**
 * Проверяет, куплено ли исследование "Основы блокчейна"
 */
export function isBlockchainBasicsPurchased(state: GameState): boolean {
  // Проверяем все возможные варианты имени исследования
  const isPurchased = 
    (state.upgrades.blockchainBasics && state.upgrades.blockchainBasics.purchased) ||
    (state.upgrades.basicBlockchain && state.upgrades.basicBlockchain.purchased) ||
    (state.upgrades.blockchain_basics && state.upgrades.blockchain_basics.purchased);
    
  return isPurchased;
}

/**
 * Получает список разблокированных зданий из фазы 2
 */
export function getUnlockedPhase2Buildings(state: GameState): string[] {
  const unlockedBuildings = [];
  
  // Здания из фазы 2
  const phase2Buildings = [
    'miner',
    'cryptoLibrary',
    'coolingSystem',
    'enhancedWallet'
  ];
  
  // Проверяем каждое здание
  for (const buildingId of phase2Buildings) {
    if (state.buildings[buildingId]?.unlocked) {
      unlockedBuildings.push(buildingId);
    }
  }
  
  return unlockedBuildings;
}

/**
 * Получает список разблокированных исследований из фазы 2
 */
export function getUnlockedPhase2Upgrades(state: GameState): string[] {
  const unlockedUpgrades = [];
  
  // Исследования из фазы 2
  const phase2Upgrades = [
    'cryptoCurrencyBasics',
    'algorithmOptimization',
    'proofOfWork',
    'energyEfficientComponents',
    'cryptoTrading',
    'tradingBot'
  ];
  
  // Проверяем каждое исследование
  for (const upgradeId of phase2Upgrades) {
    if (state.upgrades[upgradeId]?.unlocked) {
      unlockedUpgrades.push(upgradeId);
    }
  }
  
  return unlockedUpgrades;
}

/**
 * Проверяет, достигнуты ли условия для фазы 2
 */
export function isPhase2Unlocked(state: GameState): boolean {
  // Условия для фазы 2: 25+ USDT или разблокировано электричество
  return (state.resources.usdt?.value >= 25) || 
         (state.resources.electricity?.unlocked === true);
}
