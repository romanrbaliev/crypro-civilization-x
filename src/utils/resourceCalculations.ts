
// Базовые функции для расчета ресурсов
import { GameState } from "@/context/types";
import { BuildingProductionCalculationService } from "@/services/BuildingProductionCalculationService";
import { UpgradeEffectsCalculationService } from "@/services/UpgradeEffectsCalculationService";

/**
 * Вычисляет общую скорость производства для заданного ресурса
 * @param resourceId ID ресурса
 * @param state Игровое состояние
 * @returns Скорость производства в единицах/сек
 */
export const calculateResourceProductionRate = (resourceId: string, state: GameState): number => {
  let production = 0;

  // Учитываем базовое производство ресурса
  if (state.resources[resourceId]) {
    production += state.resources[resourceId].baseProduction || 0;
  }

  // Учитываем производство от зданий
  for (const buildingId in state.buildings) {
    const building = state.buildings[buildingId];
    if (building.count > 0 && building.production && building.production[resourceId]) {
      const buildingProduction = building.production[resourceId] * building.count;
      production += buildingProduction;
    }
  }

  // Применяем модификаторы от улучшений, если доступен сервис
  const upgradeModifiers = UpgradeEffectsCalculationService.calculateUpgradeProductionModifiers(state);
  if (upgradeModifiers[resourceId]) {
    production *= upgradeModifiers[resourceId];
  }

  return production;
};

/**
 * Вычисляет общую скорость потребления для заданного ресурса
 * @param resourceId ID ресурса
 * @param state Игровое состояние
 * @returns Скорость потребления в единицах/сек
 */
export const calculateResourceConsumptionRate = (resourceId: string, state: GameState): number => {
  let consumption = 0;

  // Учитываем потребление от зданий
  for (const buildingId in state.buildings) {
    const building = state.buildings[buildingId];
    if (building.count > 0 && building.consumption && building.consumption[resourceId]) {
      const buildingConsumption = building.consumption[resourceId] * building.count;
      consumption += buildingConsumption;
    }
  }

  // Применяем модификаторы от улучшений
  const upgradeModifiers = UpgradeEffectsCalculationService.calculateUpgradeConsumptionModifiers(state);
  if (upgradeModifiers[resourceId]) {
    consumption *= upgradeModifiers[resourceId];
  }

  return consumption;
};

/**
 * Вычисляет максимальную вместимость для заданного ресурса
 * @param resourceId ID ресурса
 * @param state Игровое состояние
 * @returns Максимальная вместимость
 */
export const calculateResourceMaxCapacity = (resourceId: string, state: GameState): number => {
  let maxCapacity = 100; // Базовое значение максимальной вместимости
  
  // Если у ресурса уже есть максимальное значение, используем его
  if (state.resources[resourceId] && state.resources[resourceId].max) {
    maxCapacity = state.resources[resourceId].max;
  }
  
  // Применяем бонусы от зданий, улучшений и т.д.
  // Добавим более подробную реализацию позже
  
  return maxCapacity;
};
