
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

/**
 * Рассчитывает скорость производства ресурса
 */
export function calculateResourceProductionRate(resourceId: string, state: GameState): number {
  const resource = state.resources[resourceId];
  if (!resource || !resource.unlocked) return 0;
  
  let productionRate = resource.baseProduction || 0;
  
  // Добавляем производство от зданий
  for (const buildingId in state.buildings) {
    const building = state.buildings[buildingId];
    if (building.count > 0 && building.production && building.production[resourceId]) {
      productionRate += building.production[resourceId] * building.count;
    }
  }
  
  // Применяем бонусы производства
  const productionBonus = calculateProductionBonus(state, resourceId);
  if (productionBonus !== 0) {
    productionRate *= (1 + productionBonus);
  }
  
  return productionRate;
}

/**
 * Рассчитывает скорость потребления ресурса
 */
export function calculateResourceConsumptionRate(resourceId: string, state: GameState): number {
  const resource = state.resources[resourceId];
  if (!resource || !resource.unlocked) return 0;
  
  let consumptionRate = 0;
  
  // Добавляем потребление от зданий
  for (const buildingId in state.buildings) {
    const building = state.buildings[buildingId];
    if (building.count > 0 && building.consumption && building.consumption[resourceId]) {
      consumptionRate += building.consumption[resourceId] * building.count;
    }
  }
  
  return consumptionRate;
}
