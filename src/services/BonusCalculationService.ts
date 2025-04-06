
import { GameState } from '@/context/types';
import { calculateProductionRate, calculateConsumptionRate } from '@/utils/resourceCalculations';

export class BonusCalculationService {
  // Рассчитывает общие множители производства для всех ресурсов
  static calculateResourceBonuses(state: GameState): Record<string, number> {
    const bonuses: Record<string, number> = {};
    
    // Базовые значения
    for (const resourceId in state.resources) {
      bonuses[resourceId] = 1.0; // Начальный множитель 100%
    }
    
    // Применяем бонусы от исследований
    for (const upgradeId in state.upgrades) {
      const upgrade = state.upgrades[upgradeId];
      if (upgrade.purchased && upgrade.productionBonus) {
        for (const [resourceId, bonusValue] of Object.entries(upgrade.productionBonus)) {
          bonuses[resourceId] = (bonuses[resourceId] || 1.0) * (1 + Number(bonusValue) / 100);
        }
      }
    }
    
    // Учитываем специализацию игрока, если она выбрана
    if (state.playerSpecialization) {
      const specialization = state.specializations?.[state.playerSpecialization];
      if (specialization?.resourceBonuses) {
        for (const [resourceId, bonusValue] of Object.entries(specialization.resourceBonuses)) {
          bonuses[resourceId] = (bonuses[resourceId] || 1.0) * (1 + Number(bonusValue) / 100);
        }
      }
    }
    
    return bonuses;
  }
  
  // Рассчитывает скорость производства и потребления ресурсов
  static calculateResourceRates(state: GameState) {
    const production: Record<string, number> = {};
    const consumption: Record<string, number> = {};
    
    for (const resourceId in state.resources) {
      production[resourceId] = calculateProductionRate(state, resourceId);
      consumption[resourceId] = calculateConsumptionRate(state, resourceId);
    }
    
    return { production, consumption };
  }
}
