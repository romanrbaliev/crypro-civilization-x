
/// <reference types="vite/client" />

// Определяем типы для Telegram Mini App API
interface Window {
  Telegram?: {
    WebApp?: {
      ready: () => void;
      onEvent: (eventName: string, callback: Function) => void;
      offEvent: (eventName: string, callback: Function) => void;
      CloudStorage?: {
        getItem: (key: string) => Promise<string | null>;
        setItem: (key: string, value: string) => Promise<void>;
        removeItem: (key: string) => Promise<void>;
        getKeys: () => Promise<string[]>;
        getItems: (keys: string[]) => Promise<{ [key: string]: string | null }>;
      };
      BackButton?: {
        onClick: (callback: () => void) => void;
        offClick: (callback: () => void) => void;
        show: () => void;
        hide: () => void;
        isVisible: boolean;
      };
      MainButton?: {
        onClick: (callback: () => void) => void;
        offClick: (callback: () => void) => void;
        show: () => void;
        hide: () => void;
        text: string;
        setText: (text: string) => void;
        textColor: string;
        setTextColor: (color: string) => void;
        color: string;
        setColor: (color: string) => void;
        isVisible: boolean;
        isActive: boolean;
        isProgressVisible: boolean;
        enable: () => void;
        disable: () => void;
        showProgress: (leaveActive: boolean) => void;
        hideProgress: () => void;
      };
      initData: string;
      initDataUnsafe: {
        query_id?: string;
        user?: {
          id: number;
          first_name?: string;
          last_name?: string;
          username?: string;
          language_code?: string;
          photo_url?: string;
        };
        auth_date?: string;
        hash?: string;
        start_param?: string;
      };
      isExpanded?: boolean;
      expand?: () => void;
      close?: () => void;
      requestWriteAccess?: () => Promise<boolean>;
      requestContact?: () => Promise<boolean>;
      showConfirm?: (message: string) => Promise<boolean>;
      showAlert?: (message: string) => Promise<void>;
      showPopup?: (params: {
        title?: string;
        message: string;
        buttons?: Array<{
          id?: string;
          type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
          text: string;
        }>;
      }) => Promise<string>; 
      version?: string;
      platform?: string;
      themeParams?: {
        bg_color: string;
        text_color: string;
        hint_color: string;
        link_color: string;
        button_color: string;
        button_text_color: string;
        secondary_bg_color: string;
      };
      colorScheme?: 'light' | 'dark';
      viewportHeight?: number;
      viewportStableHeight?: number;
      headerColor?: string;
      setHeaderColor?: (color: string) => void;
      switchInlineQuery?: (query: string, choose_chat_types?: string[]) => void;
      openLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
      openTelegramLink?: (url: string) => void;
      openInvoice?: (url: string, callback?: Function) => void;
      setBackgroundColor?: (color: string) => void;
      setBackgroundImage?: (imageUrl: string) => void;
      enableClosingConfirmation?: () => void;
      disableClosingConfirmation?: () => void;
      isClosingConfirmationEnabled?: boolean;
      HapticFeedback?: {
        impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
        notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        selectionChanged: () => void;
      };
      isVersionAtLeast?: (version: string) => boolean;
      setEvent?: (eventType: string, eventData: any) => void;
      sendData?: (data: string) => void;
      receiveData?: (callback: (data: string) => void) => void;
    };
  };
  gameEventBus?: EventTarget;
  __telegramInitialized?: boolean;
  __telegramNotificationShown?: boolean;
  __FORCE_TELEGRAM_MODE?: boolean;
}
