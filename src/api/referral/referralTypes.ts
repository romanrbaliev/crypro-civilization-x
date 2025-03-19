
/**
 * Типы для реферальной системы
 */

export interface ReferralData {
  id: string;
  username: string;
  activated: boolean;
  hired?: boolean;
  joinedAt: number;
  assignedBuildingId?: string;
}

export interface ReferralDataWithActivation extends ReferralData {
  is_activated?: boolean;
}

export interface ReferralHelperRequest {
  id: string;
  buildingId: string;
  helperId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

export interface ReferralHelpersResponse {
  helpers: ReferralHelperRequest[];
  success: boolean;
}
