
/// <reference types="vite/client" />

// Расширяем Window для добавления gameEventBus
interface Window {
  gameEventBus: EventTarget;
  Telegram?: {
    WebApp: {
      ready: () => void;
      expand: () => void;
      close: () => void;
      platform: string;
      version: string;
      initData?: string;
      initDataUnsafe?: {
        user?: {
          id: number;
          first_name?: string;
          last_name?: string;
          username?: string;
          language_code?: string;
        };
        start_param?: string;
        startapp?: string; // Добавляем поле startapp для параметра запуска мини-приложения
      };
      ColorScheme?: 'light' | 'dark';
      backgroundColor?: string;
      isExpanded?: boolean;
      viewportHeight?: number;
      viewportStableHeight?: number;
      MainButton?: any;
      BackButton?: any;
      CloudStorage?: any;
      showPopup?: (params: any) => void;
      showAlert?: (message: string) => void;
      showConfirm?: (message: string) => void;
      openTelegramLink?: (url: string) => void;
      openLink?: (url: string) => void;
      close?: () => void;
      share?: (url: string) => void;
      HapticFeedback?: any;
    }
  };
  __telegramInitialized?: boolean;
  __telegramNotificationShown?: boolean;
  __supabaseInitialized?: boolean;
  __FORCE_TELEGRAM_MODE?: boolean;
  __game_user_id?: string;
}
