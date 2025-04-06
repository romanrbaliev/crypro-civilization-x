
declare global {
  interface Window {
    gameEventBus: EventTarget;
    __game_user_id?: string;
    __lastSaveErrorTime?: number;
    __lastLoadErrorTime?: number;
  }
}

export {};
