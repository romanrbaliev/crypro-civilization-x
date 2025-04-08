
import { Building, Upgrade } from '@/context/types';

/**
 * Рассчитывает производство, потребление и чистую скорость ресурсов
 * @param resourceId ID ресурса
 * @param buildings Здания
 * @param upgrades Улучшения
 * @returns Объект с производством, потреблением и чистой скоростью
 */
export function calculateResourceProduction(
  resourceId: string,
  buildings: Record<string, Building>,
  upgrades: Record<string, Upgrade>
): { production: number; consumption: number; netPerSecond: number } {
  // Базовые значения
  let production = 0;
  let consumption = 0;
  
  // Учитываем базовое производство от зданий
  for (const buildingId in buildings) {
    const building = buildings[buildingId];
    
    // Пропускаем здания с нулевым количеством
    if (!building.count) continue;
    
    // Учитываем производство от здания
    if (building.production && building.production[resourceId]) {
      production += building.production[resourceId] * building.count;
    }
    
    // Учитываем потребление ресурса зданием
    if (building.consumption && building.consumption[resourceId]) {
      consumption += building.consumption[resourceId] * building.count;
    }
  }
  
  // Учитываем эффекты от улучшений
  let productionMultiplier = 1.0;
  let consumptionMultiplier = 1.0;
  
  for (const upgradeId in upgrades) {
    const upgrade = upgrades[upgradeId];
    
    // Пропускаем неприобретенные улучшения
    if (!upgrade.purchased) continue;
    
    // Учитываем эффекты на производство
    if (upgrade.effects && upgrade.effects[`${resourceId}ProductionBonus`]) {
      productionMultiplier += upgrade.effects[`${resourceId}ProductionBonus`] as number;
    }
    
    // Учитываем общие бонусы к производству
    if (upgrade.effects && upgrade.effects.productionBonus) {
      productionMultiplier += upgrade.effects.productionBonus as number;
    }
    
    // Учитываем эффекты на потребление
    if (upgrade.effects && upgrade.effects[`${resourceId}ConsumptionReduction`]) {
      consumptionMultiplier -= upgrade.effects[`${resourceId}ConsumptionReduction`] as number;
    }
    
    // Учитываем общие бонусы к снижению потребления
    if (upgrade.effects && upgrade.effects.consumptionReduction) {
      consumptionMultiplier -= upgrade.effects.consumptionReduction as number;
    }
  }
  
  // Обеспечиваем, что множители не будут иметь некорректных значений
  productionMultiplier = Math.max(0, productionMultiplier);
  consumptionMultiplier = Math.max(0, consumptionMultiplier);
  
  // Применяем множители
  production *= productionMultiplier;
  consumption *= consumptionMultiplier;
  
  // Рассчитываем чистую скорость
  const netPerSecond = production - consumption;
  
  return { production, consumption, netPerSecond };
}

/**
 * Рассчитывает стоимость здания с учетом его уровня
 * @param building Здание
 * @returns Стоимость здания
 */
export function calculateBuildingCost(building: Building): Record<string, number> {
  const cost: Record<string, number> = {};
  
  // Базовая стоимость здания
  const baseCost = building.baseCost || building.cost;
  
  // Множитель стоимости
  const costMultiplier = building.costMultiplier || 1.15;
  
  // Рассчитываем стоимость для каждого типа ресурса
  for (const resourceId in baseCost) {
    const baseAmount = baseCost[resourceId];
    // Формула: baseAmount * (costMultiplier ^ count)
    const scaledAmount = baseAmount * Math.pow(costMultiplier, building.count);
    cost[resourceId] = Math.ceil(scaledAmount);
  }
  
  return cost;
}

/**
 * Рассчитывает максимальное значение ресурса с учетом улучшений
 * @param resourceId ID ресурса
 * @param buildings Здания
 * @param upgrades Улучшения
 * @returns Максимальное значение ресурса
 */
export function calculateResourceMax(
  resourceId: string,
  buildings: Record<string, Building>,
  upgrades: Record<string, Upgrade>
): number {
  // Базовые максимальные значения для ресурсов
  const baseMaxValues: Record<string, number> = {
    knowledge: 100,
    usdt: 100,
    electricity: 100,
    computingPower: 100,
    bitcoin: 0.1
  };
  
  // Получаем базовый максимум для ресурса
  let maxValue = baseMaxValues[resourceId] || 100;
  
  // Учитываем влияние зданий на максимум
  for (const buildingId in buildings) {
    const building = buildings[buildingId];
    
    // Пропускаем здания с нулевым количеством
    if (!building.count) continue;
    
    // Проверяем, влияет ли здание на максимум данного ресурса
    if (building.effects && building.effects[`${resourceId}MaxBonus`]) {
      maxValue += (building.effects[`${resourceId}MaxBonus`] as number) * building.count;
    }
  }
  
  // Учитываем влияние улучшений на максимум
  let maxMultiplier = 1.0;
  
  for (const upgradeId in upgrades) {
    const upgrade = upgrades[upgradeId];
    
    // Пропускаем неприобретенные улучшения
    if (!upgrade.purchased) continue;
    
    // Проверяем, влияет ли улучшение на максимум данного ресурса
    if (upgrade.effects && upgrade.effects[`${resourceId}MaxBonus`]) {
      maxMultiplier += upgrade.effects[`${resourceId}MaxBonus`] as number;
    }
  }
  
  // Применяем множитель
  maxValue *= maxMultiplier;
  
  return maxValue;
}
