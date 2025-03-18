
// Типы и интерфейсы для API сервисов

// Глобальное объявление типа для window
declare global {
  interface Window {
    __game_user_id?: string;
  }
}

// Константы для таблиц
export const SAVES_TABLE = 'game_saves';
export const REFERRAL_TABLE = 'referral_data';
export const REFERRAL_HELPERS_TABLE = 'referral_helpers';
export const CHECK_CONNECTION_INTERVAL = 5000; // 5 секунд между проверками соединения
