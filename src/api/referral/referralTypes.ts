
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
  building_id: string; // Используем snake_case как в базе данных
  helper_id: string;   // Используем snake_case как в базе данных
  employer_id: string; // Используем snake_case как в базе данных
  status: 'pending' | 'accepted' | 'rejected';
  created_at: number;
}

export interface ReferralHelpersResponse {
  helpers: ReferralHelperRequest[];
  success: boolean;
}

// Добавляем новый тип для подробной информации о бонусах помощников
export interface HelperBoostInfo {
  buildingId: string;
  buildingName: string;
  boostPercentage: number;
  helperIds: string[];
}

// Добавляем новый тип для зданий с помощниками
export interface HelperBuilding {
  buildingId: string;
  helperIds: string[];
  boostPercentage: number;
}

export interface EmployerHelperBuildingsResponse {
  helperBuildings: HelperBuilding[];
  success: boolean;
}
