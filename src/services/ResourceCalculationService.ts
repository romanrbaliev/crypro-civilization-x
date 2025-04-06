import { GameState } from '@/context/types';
import { BuildingProductionCalculationService } from './BuildingProductionCalculationService';
import { UpgradeEffectsCalculationService } from './UpgradeEffectsCalculationService';

/**
 * Сервис для расчета ресурсов
 */
export class ResourceCalculationService {
  /**
   * Рассчитывает общее производство ресурса
   * @param resourceId ID ресурса
   * @param state Игровое состояние
   * @returns Общее производство ресурса
   */
  static calculateResourceProduction(resourceId: string, state: GameState): number {
    let production = 0;

    // Учитываем базовое производство ресурса
    if (state.resources[resourceId]) {
      production += state.resources[resourceId].baseProduction;
    }

    // Учитываем производство от зданий
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      if (building.production && building.production[resourceId]) {
        production += BuildingProductionCalculationService.calculateBuildingProduction(building, state)[resourceId] * building.count;
      }
    }

    // Учитываем эффекты от улучшений
    const upgradeModifiers = UpgradeEffectsCalculationService.calculateUpgradeProductionModifiers(state);
    if (upgradeModifiers[resourceId]) {
      production *= upgradeModifiers[resourceId];
    }

    return production;
  }

  /**
   * Рассчитывает общее потребление ресурса
   * @param resourceId ID ресурса
   * @param state Игровое состояние
   * @returns Общее потребление ресурса
   */
  static calculateResourceConsumption(resourceId: string, state: GameState): number {
    let consumption = 0;

    // Учитываем потребление от зданий
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      if (building.consumption && building.consumption[resourceId]) {
        consumption += BuildingProductionCalculationService.calculateBuildingConsumption(building, state)[resourceId] * building.count;
      }
    }

    // Учитываем эффекты от улучшений
    const upgradeModifiers = UpgradeEffectsCalculationService.calculateUpgradeConsumptionModifiers(state);
    if (upgradeModifiers[resourceId]) {
      consumption *= upgradeModifiers[resourceId];
    }

    return consumption;
  }
}
