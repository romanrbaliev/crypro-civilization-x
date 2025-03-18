
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
          first_name?: string;
          last_name?: string;
          username?: string;
        };
        start_param?: string; // Добавлено для поддержки параметра запуска
      };
      CloudStorage?: any;
      showPopup?: (params: any) => void; // Добавлено для поддержки метода showPopup
      openTelegramLink?: (url: string) => void; // Добавлено для поддержки метода openTelegramLink
      close?: () => void;
      share?: (url: string) => void;
    }
  };
  __telegramInitialized?: boolean;
  __telegramNotificationShown?: boolean;
  __supabaseInitialized?: boolean;
  __FORCE_TELEGRAM_MODE?: boolean;
  __game_user_id?: string;
}
