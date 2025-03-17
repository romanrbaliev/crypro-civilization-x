
/// <reference types="vite/client" />

// Расширяем Window для добавления gameEventBus
interface Window {
  gameEventBus: EventTarget;
  Telegram?: {
    WebApp: {
      ready: () => void;
      expand: () => void;
      platform: string;
      version: string;
      initData?: string;
      initDataUnsafe?: {
        user?: {
          id: number;
          username?: string;
        }
      }
      CloudStorage?: any;
    }
  };
  __telegramInitialized?: boolean;
  __telegramNotificationShown?: boolean;
  __supabaseInitialized?: boolean;
  __FORCE_TELEGRAM_MODE?: boolean;
  __game_user_id?: string;
}
