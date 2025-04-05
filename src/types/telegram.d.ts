
interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramWebAppInitData {
  user?: TelegramUser;
  start_param?: string;
  startapp?: string;
  chat_instance?: string;
  chat_type?: string;
  chat?: any;
  auth_date?: string;
  hash?: string;
  query_id?: string;
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  platform: string;
  version: string;
  initData?: string;
  initDataUnsafe?: TelegramWebAppInitData;
  colorScheme?: 'light' | 'dark';
  backgroundColor?: string;
  isExpanded?: boolean;
  viewportHeight?: number;
  viewportStableHeight?: number;
  MainButton?: any;
  BackButton?: any;
  openTelegramLink?: (url: string) => void;
  openLink?: (url: string) => void;
  share?: (url: string) => void;
  showPopup?: (params: any) => void;
  showAlert?: (message: string) => void;
  showConfirm?: (message: string) => void;
  HapticFeedback?: any;
}

interface Telegram {
  WebApp: TelegramWebApp;
}

declare global {
  interface Window {
    Telegram: Telegram;
  }
}

export {};
