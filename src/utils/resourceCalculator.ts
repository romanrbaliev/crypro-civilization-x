
import { GameState } from '@/context/types';

/**
 * Вычисляет максимальное значение ресурса на основе текущего состояния игры
 */
export function calculateResourceMaxValue(state: GameState, resourceId: string): number {
  const resource = state.resources[resourceId];
  
  if (!resource) return 0;
  
  let baseMaxValue = resource.max || 100;  // Используем max вместо maxStorage
  let maxValueBonus = 1;
  
  // Добавление бонусов от зданий
  if (resourceId === 'knowledge') {
    // Бонус от криптокошелька
    if (state.buildings.cryptoWallet && state.buildings.cryptoWallet.count > 0) {
      maxValueBonus += state.buildings.cryptoWallet.count * 0.25; // +25% за каждый уровень
    }
    
    // Бонус от криптобиблиотеки
    if (state.buildings.cryptoLibrary && state.buildings.cryptoLibrary.count > 0) {
      maxValueBonus += state.buildings.cryptoLibrary.count * 0.5; // +50% за каждый уровень
    }
    
    // Бонус от улучшения "Основы блокчейна"
    if (state.upgrades.blockchainBasics && state.upgrades.blockchainBasics.purchased) {
      maxValueBonus += 0.5; // +50% к макс. хранению знаний
    }
  } else if (resourceId === 'usdt') {
    // Бонус от криптокошелька
    if (state.buildings.cryptoWallet && state.buildings.cryptoWallet.count > 0) {
      baseMaxValue += 50 * state.buildings.cryptoWallet.count; // +50 за каждый уровень
    }
    
    // Бонус от улучшенного кошелька
    if (state.buildings.enhancedWallet && state.buildings.enhancedWallet.count > 0) {
      baseMaxValue += 150 * state.buildings.enhancedWallet.count; // +150 за каждый уровень
    }
    
    // Бонус от улучшения "Безопасность криптокошельков"
    if (state.upgrades.walletSecurity && state.upgrades.walletSecurity.purchased) {
      maxValueBonus += 0.25; // +25% к макс. USDT
    }
  }
  
  return baseMaxValue * maxValueBonus;
}

/**
 * Обновляет максимальные значения ресурсов на основе эффектов от зданий и исследований
 * Эта функция добавлена для устранения ошибки с отсутствующей функцией updateResourceMaxValues
 */
export function updateResourceMaxValues(state: GameState): GameState {
  const newResources = { ...state.resources };
  
  // Обходим все ресурсы и обновляем их максимальные значения
  for (const resourceId in newResources) {
    const maxValue = calculateResourceMaxValue(state, resourceId);
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
