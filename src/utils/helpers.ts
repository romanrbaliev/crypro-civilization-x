import { Building, Resource } from '@/context/types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const formatNumber = (number: number): string => {
  if (number === Infinity) return "∞";
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + "M";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + "K";
  } else {
    return number.toFixed(0);
  }
};

export const calculateCost = (
  baseCost: { [key: string]: number },
  multiplier: number,
  count: number
): { [key: string]: number } => {
  const newCost: { [key: string]: number } = {};
  for (const resourceId in baseCost) {
    newCost[resourceId] = Math.ceil(baseCost[resourceId] * Math.pow(multiplier, count));
  }
  return newCost;
};

export const canAffordCost = (
  cost: { [resourceId: string]: number },
  resources: { [resourceId: string]: Resource }
): boolean => {
  for (const resourceId in cost) {
    if (!resources[resourceId] || resources[resourceId].value < cost[resourceId]) {
      return false;
    }
  }
  return true;
};

/**
 * Расчет бонуса от рефералов
 */
export const calculateReferralBonus = (referrals: any[] = []): number => {
  if (!referrals || referrals.length === 0) return 0;
  
  // Фильтруем только активных рефералов и считаем общий бонус (5% за каждого)
  const activeReferrals = referrals.filter(referral => 
    typeof referral.activated === 'boolean' 
      ? referral.activated 
      : String(referral.activated).toLowerCase() === 'true'
  );
  
  console.log("Активированные рефералы:", activeReferrals.map(r => r.id));
  
  // Возвращаем бонус: 5% (0.05) за каждого активного реферала
  return activeReferrals.length * 0.05; 
};

/**
 * Расчет общего бонуса от помощников для конкретного здания
 */
export const calculateBuildingBoostFromHelpers = (
  buildingId: string, 
  helpers: { buildingId: string; helperId: string; status: string }[] = []
): number => {
  if (!helpers || helpers.length === 0) return 0;
  
  // Ищем только активных помощников для указанного здания
  const activeHelpers = helpers.filter(
    helper => helper.buildingId === buildingId && helper.status === 'accepted'
  );
  
  console.log(`Расчет бонуса для здания ${buildingId}: ${activeHelpers.length} помощников, бонус ${activeHelpers.length * 0.1}%`);
  
  // Каждый помощник дает бонус +10% (0.1) к производительности здания
  return activeHelpers.length * 0.1;
};

/**
 * Расчет бонуса от помощников для конкретного реферала
 */
export const calculateHelperBoost = (
  referralId: string, 
  helpers: { buildingId: string; helperId: string; status: string }[] = []
): number => {
  if (!helpers || helpers.length === 0) return 0;
  
  // Ищем только активные запросы, где реферал является помощником
  const activeHelperRequests = helpers.filter(
    helper => helper.helperId === referralId && helper.status === 'accepted'
  );
  
  // Каждый активный запрос дает бонус +10% (0.1)
  return activeHelperRequests.length * 0.1;
};
