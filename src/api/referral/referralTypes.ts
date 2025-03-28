
// Temporary types file to resolve import errors

/**
 * Referral information
 */
export interface Referral {
  id: string;
  username: string;
  activated: boolean;
  hired: boolean;
  joinedAt: number;
  assignedBuildingId?: string;
}

/**
 * Referral status update information
 */
export interface ReferralStatusUpdate {
  referralId: string;
  activated?: boolean;
  hired?: boolean;
  buildingId?: string | null;
}

/**
 * Referral helper status
 */
export type ReferralHelperStatus = 'pending' | 'accepted' | 'rejected';

/**
 * Referral helper request
 */
export interface ReferralHelperRequest {
  id: string;
  helperId: string;
  buildingId: string;
  status: ReferralHelperStatus;
  createdAt: number;
}
