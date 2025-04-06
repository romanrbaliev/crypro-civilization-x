
import { GameState } from '@/context/types';

/**
 * Рассчитывает бонус производства с учетом различных факторов
 */
export function calculateProductionBonus(state: GameState, resourceId: string): number {
  // Базовый бонус 0%
  let bonus = 0;
  
  // Бонусы от исследований
  for (const upgradeId in state.upgrades) {
    const upgrade = state.upgrades[upgradeId];
    
    if (upgrade.purchased && upgrade.effects) {
      for (const [effectType, effectValue] of Object.entries(upgrade.effects)) {
        if (effectType === `${resourceId}ProductionBoost`) {
          bonus += typeof effectValue === 'number' ? effectValue : 0;
        }
      }
    }
  }
  
  return bonus;
}

/**
 * Рассчитывает модификатор эффективности для данного ресурса
 */
export function calculateEfficiencyModifier(state: GameState, resourceId: string): number {
  // Базовый множитель 1.0 (100%)
  let modifier = 1.0;
  
  // Модификаторы от исследований
  for (const upgradeId in state.upgrades) {
    const upgrade = state.upgrades[upgradeId];
    
    if (upgrade.purchased && upgrade.effects) {
      for (const [effectType, effectValue] of Object.entries(upgrade.effects)) {
        if (effectType === `${resourceId}EfficiencyBoost`) {
          modifier *= (1 + (typeof effectValue === 'number' ? effectValue : 0));
        }
      }
    }
  }
  
  return modifier;
}
