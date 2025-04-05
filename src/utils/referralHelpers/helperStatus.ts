
import { ReferralHelper } from '@/context/types';

// Функции для работы со статусами помощников

export const getPendingHelperRequests = (helpers: ReferralHelper[]): ReferralHelper[] => {
  if (!helpers || !helpers.length) return [];
  
  return helpers.filter(helper => helper.status === 'pending');
};

export const getActiveHelpers = (helpers: ReferralHelper[]): ReferralHelper[] => {
  if (!helpers || !helpers.length) return [];
  
  return helpers.filter(helper => helper.status === 'accepted');
};

export const getRejectedHelpers = (helpers: ReferralHelper[]): ReferralHelper[] => {
  if (!helpers || !helpers.length) return [];
  
  return helpers.filter(helper => helper.status === 'rejected');
};

export const getHelperRequestForBuilding = (
  buildingId: string,
  referralId: string,
  helpers: ReferralHelper[]
): ReferralHelper | undefined => {
  if (!helpers || !helpers.length) return undefined;
  
  return helpers.find(
    helper => 
      helper.buildingId === buildingId && 
      helper.helperId === referralId
  );
};

export const hasActiveHelperRequest = (
  referralId: string,
  buildingId: string,
  helpers: ReferralHelper[]
): boolean => {
  if (!helpers || !helpers.length) return false;
  
  return helpers.some(
    helper => 
      helper.helperId === referralId && 
      helper.buildingId === buildingId &&
      helper.status === 'accepted'
  );
};

export const hasPendingHelperRequest = (
  referralId: string,
  buildingId: string,
  helpers: ReferralHelper[]
): boolean => {
  if (!helpers || !helpers.length) return false;
  
  return helpers.some(
    helper => 
      helper.helperId === referralId && 
      helper.buildingId === buildingId &&
      helper.status === 'pending'
  );
};
