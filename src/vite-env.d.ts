
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
      };
      BackButton?: {
        onClick: (callback: () => void) => void;
        show: () => void;
        hide: () => void;
        isVisible: boolean;
      };
      MainButton?: {
        onClick: (callback: () => void) => void;
        show: () => void;
        hide: () => void;
        text: string;
        setText: (text: string) => void;
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
        };
        auth_date?: string;
        hash?: string;
      };
      isExpanded?: boolean;
      expand?: () => void;
      close?: () => void;
      requestWriteAccess?: () => Promise<boolean>;
      showConfirm?: (message: string) => Promise<boolean>;
      showAlert?: (message: string) => Promise<void>;
      showPopup?: (params: any) => Promise<string>; 
      version?: string;
      platform?: string;
      themeParams?: {
        bg_color: string;
        text_color: string;
        hint_color: string;
        link_color: string;
        button_color: string;
        button_text_color: string;
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
        impactOccurred: (style: string) => void;
        notificationOccurred: (type: string) => void;
        selectionChanged: () => void;
      };
    };
  };
  gameEventBus?: EventTarget;
}
