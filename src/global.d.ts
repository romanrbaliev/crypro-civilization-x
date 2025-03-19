// Добавляем дополнительные глобальные типы
declare global {
  interface Window {
    __telegramInitialized?: boolean;
    __telegramNotificationShown?: boolean;
    __supabaseInitialized?: boolean;
    __FORCE_TELEGRAM_MODE?: boolean;
    __game_user_id?: string | null;
    __cloudflareRetryCount?: number;
  }
  
  var __DEV__: boolean;
}
