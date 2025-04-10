
import { Building, GameState } from '@/context/types';

/**
 * Проверяет, может ли игрок позволить себе купить здание
 * @param building Здание для проверки
 * @param state Состояние игры
 * @returns true, если ресурсов достаточно для покупки
 */
export function canAffordBuilding(building: Building, state: GameState): boolean {
  for (const [resourceId, amount] of Object.entries(building.cost)) {
    const resource = state.resources[resourceId];
    if (!resource || resource.value < calculateCost(building, resourceId)) {
      return false;
    }
  }
  return true;
}

/**
 * Рассчитывает стоимость здания с учетом уже купленных экземпляров
 * @param building Здание для расчета
 * @param resourceId Идентификатор ресурса
 * @returns Расчетная стоимость здания
 */
export function calculateCost(building: Building, resourceId: string): number {
  const baseCost = building.cost[resourceId] as number;
  const multiplier = building.costMultiplier || 1.15;
  
  return Math.floor(baseCost * Math.pow(multiplier, building.count));
}

/**
 * Рассчитывает общую стоимость здания
 * @param building Здание для расчета
 * @returns Объект с расчетной стоимостью каждого ресурса
 */
export function calculateTotalCost(building: Building): Record<string, number> {
  const totalCost: Record<string, number> = {};
  
  for (const resourceId of Object.keys(building.cost)) {
    totalCost[resourceId] = calculateCost(building, resourceId);
  }
  
  return totalCost;
}

/**
 * Получает форматированную строку производства ресурсов зданием
 * @param building Здание для анализа
 * @returns Форматированная строка производства
 */
export function getBuildingProductionString(building: Building): string {
  const productions: string[] = [];
  
  for (const [resourceId, amount] of Object.entries(building.production)) {
    if (amount > 0) {
      productions.push(`+${amount} ${resourceId}/сек`);
    }
  }
  
  return productions.join(', ');
}

/**
 * Получает форматированную строку потребления ресурсов зданием
 * @param building Здание для анализа
 * @returns Форматированная строка потребления
 */
export function getBuildingConsumptionString(building: Building): string {
  if (!building.consumption) return '';
  
  const consumptions: string[] = [];
  
  for (const [resourceId, amount] of Object.entries(building.consumption)) {
    if (amount > 0) {
      consumptions.push(`-${amount} ${resourceId}/сек`);
    }
  }
  
  return consumptions.join(', ');
}
