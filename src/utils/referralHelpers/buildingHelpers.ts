
import { Building, ReferralHelper } from '@/context/types';

// Функции для работы с зданиями в контексте помощников

export const getBuildingHelperCount = (
  buildingId: string,
  helpers: ReferralHelper[]
): number => {
  if (!helpers || !helpers.length) return 0;
  
  return helpers.filter(
    helper => helper.buildingId === buildingId && helper.status === 'accepted'
  ).length;
};

export const getBuildingHelperBoost = (
  buildingId: string,
  helpers: ReferralHelper[]
): number => {
  const helperCount = getBuildingHelperCount(buildingId, helpers);
  return helperCount * 0.1; // 10% бонус за каждого помощника
};

export const getBuildingHelpers = (
  buildingId: string,
  helpers: ReferralHelper[]
): ReferralHelper[] => {
  if (!helpers || !helpers.length) return [];
  
  return helpers.filter(
    helper => helper.buildingId === buildingId && helper.status === 'accepted'
  );
};

export const hasHelperForBuilding = (
  buildingId: string,
  referralId: string,
  helpers: ReferralHelper[]
): boolean => {
  if (!helpers || !helpers.length) return false;
  
  return helpers.some(
    helper => 
      helper.buildingId === buildingId && 
      helper.helperId === referralId && 
      helper.status === 'accepted'
  );
};
