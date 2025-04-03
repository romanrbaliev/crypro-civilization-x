import { GameState, ResourceData } from '../types';

/**
 * Проверяет, достаточно ли ресурсов для покупки
 */
export function hasEnoughResources(state: GameState, cost: Record<string, number>): boolean {
  for (const [resourceId, amount] of Object.entries(cost)) {
    const resource = state.resources[resourceId];
    if (!resource || resource.value < Number(amount)) {
      return false;
    }
  }
  return true;
}

/**
 * Применяет все текущие модификаторы к значениям ресурсов
 */
export function applyResourceModifiers(state: GameState): GameState {
  const newResources = { ...state.resources };
  
  // Пересчитываем значения производства с учетом всех модификаторов
  for (const resourceId in newResources) {
    const resource = newResources[resourceId];
    let baseProduction = resource.baseProduction || 0;
    let productionMultiplier = 1; // Базовый множитель
    
    // Применение модификаторов базового производства
    // ...
    
    // Обновляем текущее значение производства
    resource.production = baseProduction * productionMultiplier;
    resource.perSecond = resource.production; // Для отображения
  }
  
  return {
    ...state,
    resources: newResources
  };
}

/**
 * Обновляет максимальные значения ресурсов на основе эффектов от зданий и исследований
 */
export function updateResourceMaxValues(state: GameState): GameState {
  const newResources = { ...state.resources };
  
  // Базовые максимумы ресурсов
  const baseMaxValues: Record<string, number> = {
    knowledge: 100,
    usdt: 50,
    electricity: 100,
    computingPower: 1000,
    bitcoin: 100
  };
  
  // Обходим все ресурсы и обновляем их максимальные значения
  for (const resourceId in newResources) {
    let maxValue = baseMaxValues[resourceId] || 100; // Базовое значение или 100 по умолчанию
    
    // Проверяем эффекты от зданий
    // Криптокошелек: +50 к макс. USDT за каждый уровень
    if (resourceId === 'usdt' && state.buildings.cryptoWallet) {
      maxValue += 50 * state.buildings.cryptoWallet.count;
    }
    
    // Криптокошелек: +25% к макс. знаниям за каждый уровень
    if (resourceId === 'knowledge' && state.buildings.cryptoWallet) {
      maxValue *= (1 + 0.25 * state.buildings.cryptoWallet.count);
    }
    
    // Криптобиблиотека: +100 к макс. знаниям за каждый уровень
    if (resourceId === 'knowledge' && state.buildings.cryptoLibrary) {
      maxValue += 100 * state.buildings.cryptoLibrary.count;
    }
    
    // Проверяем эффекты от исследований
    // "Основы блокчейна": +50% к макс. хранению знаний
    const hasBlockchainBasics = 
      state.upgrades.blockchainBasics?.purchased || 
      state.upgrades.blockchain_basics?.purchased || 
      state.upgrades.basicBlockchain?.purchased;
      
    if (resourceId === 'knowledge' && hasBlockchainBasics) {
      maxValue *= 1.5;
    }
    
    // "Безопасность криптокошельков": +25% к макс. USDT
    const hasWalletSecurity = 
      state.upgrades.walletSecurity?.purchased || 
      state.upgrades.cryptoWalletSecurity?.purchased;
      
    if (resourceId === 'usdt' && hasWalletSecurity) {
      maxValue *= 1.25;
    }
    
    // Обновляем максимальное значение ресурса
    newResources[resourceId] = {
      ...newResources[resourceId],
      max: maxValue
    };
  }
  
  return {
    ...state,
    resources: newResources
  };
}
