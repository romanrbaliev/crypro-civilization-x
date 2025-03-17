
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
      };
      MainButton?: {
        onClick: (callback: () => void) => void;
        show: () => void;
        hide: () => void;
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
    };
  };
  gameEventBus?: EventTarget;
}
