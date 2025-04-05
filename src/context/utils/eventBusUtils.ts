
// Безопасная отправка игровых событий
export const safeDispatchGameEvent = (message: string, type: "success" | "warning" | "info" | "error" = "info") => {
  try {
    if (typeof window !== 'undefined') {
      const gameEventBus = window.gameEventBus || new EventTarget();
      
      if (!window.gameEventBus) {
        window.gameEventBus = gameEventBus;
      }
      
      const event = new CustomEvent('game-event', {
        detail: { message, type }
      });
      
      gameEventBus.dispatchEvent(event);
      console.log(`[Event dispatched] ${type}: ${message}`);
    }
  } catch (error) {
    console.error('Error dispatching game event:', error);
  }
};
