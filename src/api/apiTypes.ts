
// Типы и интерфейсы для API сервисов

// Глобальное объявление типа для window
declare global {
  interface Window {
    __game_user_id?: string;
    __lastSaveErrorTime?: number;
    __lastLoadErrorTime?: number;
  }
}

// Константы для таблиц
export const SAVES_TABLE = 'game_saves';
export const REFERRAL_TABLE = 'referral_data';
export const REFERRAL_HELPERS_TABLE = 'referral_helpers';
export const CHECK_CONNECTION_INTERVAL = 15000; // 15 секунд между проверками соединения

// Константы для контроля частоты показа уведомлений
export const ERROR_NOTIFICATION_THROTTLE = 5 * 60 * 1000; // 5 минут
