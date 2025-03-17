
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
    };
  };
}
