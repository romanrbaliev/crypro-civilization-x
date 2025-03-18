
// Расширяем интерфейс Window для наших глобальных переменных
interface Window {
  __game_user_id?: string;
  Telegram?: {
    WebApp?: {
      initDataUnsafe?: {
        user?: {
          id: string;
          first_name?: string;
          last_name?: string;
          username?: string;
        };
        start_param?: string;
      };
      // Добавляем недостающие методы и свойства Telegram WebApp
      close?: () => void;
      share?: (url: string) => void;
      ready?: () => void;
      expand?: () => void;
      platform?: string;
      version?: string;
      initData?: string;
      CloudStorage?: any;
      showPopup?: (params: any) => void;
      openTelegramLink?: (url: string) => void;
    };
  };
}
