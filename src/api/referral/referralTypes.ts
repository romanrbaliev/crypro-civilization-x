
/**
 * Типы для реферальной системы
 */

export interface ReferralData {
  id: string;
  username: string;
  activated: boolean;
  hired?: boolean; // Только для фронтенда, в базе данных это поле не хранится
  joinedAt: number;
  assignedBuildingId?: string; // Только для фронтенда, в базе данных это поле не хранится
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
