
/// <reference types="vite/client" />

// Определение типов для Telegram WebApp API
interface TelegramWebApp {
  ready(): void;
  expand(): void;
  close(): void;
  isExpanded: boolean;
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    start_param?: string;
    auth_date?: number;
    hash?: string;
  };
  showAlert(message: string): void;
  showConfirm(message: string): Promise<boolean>;
  platform: string;
  version: string;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  BackButton: any;
  MainButton: any;
  HapticFeedback: any;
  CloudStorage?: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    getItems(keys: string[]): Promise<Record<string, string | null>>;
    removeItems(keys: string[]): Promise<void>;
  };
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
  __telegramInitialized?: boolean;
  __telegramNotificationShown?: boolean;
  __supabaseInitialized?: boolean;
  __FORCE_TELEGRAM_MODE?: boolean;
  __game_user_id?: string;
  gameEventBus?: EventTarget; // Добавляем свойство gameEventBus типа EventTarget
}

// Добавляем тип для GameEventDetail, используемый в gameEvents.ts
interface GameEventDetail {
  message: string;
  type: "info" | "error" | "success" | "warning";
}
