
import { ReferralHelper } from '@/context/types';

// Функции для расчета бонусов от помощников

export const getReferralHelpBoost = (
  referralId: string,
  helpers: ReferralHelper[]
): number => {
  if (!helpers || !helpers.length) return 0;
  
  const activeHelperCount = helpers.filter(
    helper => helper.helperId === referralId && helper.status === 'accepted'
  ).length;
  
  return activeHelperCount * 0.1; // 10% бонус за каждое здание, где помогает реферал
};

export const getTotalHelperBoost = (helpers: ReferralHelper[]): number => {
  if (!helpers || !helpers.length) return 0;
  
  const activeHelpers = helpers.filter(helper => helper.status === 'accepted');
  return activeHelpers.length * 0.05; // 5% общий бонус за каждого активного помощника
};

export const getHelperBuildingIds = (
  referralId: string,
  helpers: ReferralHelper[]
): string[] => {
  if (!helpers || !helpers.length) return [];
  
  return helpers
    .filter(helper => helper.helperId === referralId && helper.status === 'accepted')
    .map(helper => helper.buildingId);
};
