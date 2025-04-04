
import { Building } from '@/context/types';

/**
 * Рассчитывает текущую стоимость здания с учетом его уровня и множителя стоимости
 */
export const getCost = (building: Building): { [key: string]: number } => {
  const calculatedCost: { [key: string]: number } = {};
  
  for (const [resourceId, baseCost] of Object.entries(building.cost)) {
    // Рассчитываем текущую стоимость с учетом множителя и текущего количества
    const costMultiplier = building.costMultiplier || 1.15;
    const currentCost = Math.floor(Number(baseCost) * Math.pow(costMultiplier, building.count));
    calculatedCost[resourceId] = currentCost;
  }
  
  return calculatedCost;
};

/**
 * Рассчитывает сумму возврата при продаже здания (50% от стоимости)
 */
export const getRefundAmount = (building: Building): { [key: string]: number } => {
  const cost = getCost(building);
  const refund: { [key: string]: number } = {};
  
  for (const [resourceId, amount] of Object.entries(cost)) {
    // При продаже возвращается 50% стоимости
    refund[resourceId] = Math.floor(Number(amount) * 0.5);
  }
  
  return refund;
};
