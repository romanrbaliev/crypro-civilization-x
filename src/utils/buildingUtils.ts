
import { Building } from "@/context/types";

/**
 * Вычисляет стоимость здания с учетом количества уже построенных
 */
export const calculateBuildingCost = (
  baseCost: Record<string, number>, 
  count: number = 0, 
  multiplier: number = 1.12
): Record<string, number> => {
  const cost: Record<string, number> = {};
  
  if (!baseCost) return cost;
  
  Object.entries(baseCost).forEach(([resourceId, baseAmount]) => {
    const scaledAmount = baseAmount * Math.pow(multiplier, count);
    cost[resourceId] = Math.round(scaledAmount);
  });
  
  return cost;
};

/**
 * Получает эффекты здания
 */
export const getBuildingEffects = (building: Building): Record<string, number> => {
  return building.effects || {};
};
