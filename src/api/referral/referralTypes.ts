
// Типы данных для реферальной системы

// Расширяем интерфейс для работы с is_activated
export interface ReferralDataWithActivation {
  user_id: string;
  referral_code: string;
  referred_by: string | null;
  is_activated: boolean;
  created_at: string | null;
}

// Интерфейс для реферала в Redux state
export interface Referral {
  id: string;
  username: string;
  activated: boolean;
  joinedAt: number;
}
