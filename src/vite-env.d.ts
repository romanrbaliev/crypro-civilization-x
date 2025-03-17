
/// <reference types="vite/client" />

// Определяем типы для Telegram Mini App API
interface Window {
  Telegram?: {
    WebApp?: {
      CloudStorage?: {
        getItem: (key: string) => Promise<string | null>;
        setItem: (key: string, value: string) => Promise<void>;
        removeItem: (key: string) => Promise<void>;
      };
      BackButton?: {
        onClick: (callback: () => void) => void;
      };
      MainButton?: {
        onClick: (callback: () => void) => void;
      };
    };
  };
}
