
import { GameEventBus } from '../context/utils/eventBusUtils';

declare global {
  interface Window {
    gameEventBus: GameEventBus;
    __game_user_id?: string;
    __lastSaveErrorTime?: number;
    __lastLoadErrorTime?: number;
  }
}

export {};
