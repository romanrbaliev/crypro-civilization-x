
import { GameState } from '@/context/types';

// Функция расчета производства ресурса
export const calculateProductionRate = (state: GameState, resourceId: string): number => {
  let productionRate = 0;
  
  // Расчет базового производства от зданий
  for (const buildingId in state.buildings) {
    const building = state.buildings[buildingId];
    if (building.production && building.production[resourceId]) {
      productionRate += building.production[resourceId] * building.count;
    }
  }
  
  // Применение бонусов от исследований
  for (const upgradeId in state.upgrades) {
    const upgrade = state.upgrades[upgradeId];
    if (upgrade.purchased && upgrade.effects) {
      // Используем effects вместо productionMultiplier
      if (upgrade.effects.productionBoost && upgrade.effects.productionBoost[resourceId]) {
        productionRate *= 1 + (upgrade.effects.productionBoost[resourceId] / 100);
      }
    }
  }
  
  return productionRate;
};

// Функция расчета потребления ресурса
export const calculateConsumptionRate = (state: GameState, resourceId: string): number => {
  let consumptionRate = 0;
  
  // Расчет потребления от зданий
  for (const buildingId in state.buildings) {
    const building = state.buildings[buildingId];
    if (building.consumption && building.consumption[resourceId]) {
      consumptionRate += building.consumption[resourceId] * building.count;
    }
  }
  
  // Применение бонусов от исследований
  for (const upgradeId in state.upgrades) {
    const upgrade = state.upgrades[upgradeId];
    if (upgrade.purchased && upgrade.effects) {
      // Используем effects вместо consumptionMultiplier
      if (upgrade.effects.consumptionReduction && upgrade.effects.consumptionReduction[resourceId]) {
        consumptionRate *= 1 - (upgrade.effects.consumptionReduction[resourceId] / 100);
      }
    }
  }
  
  return consumptionRate;
};
