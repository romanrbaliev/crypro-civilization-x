
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
      close?: () => void;
      share?: (url: string) => void;
      ready?: () => void;
    };
  };
}
