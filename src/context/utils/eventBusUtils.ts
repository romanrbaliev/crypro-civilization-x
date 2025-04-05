
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

// Функция для проверки и создания шины событий, если она не существует
export const ensureGameEventBus = (): EventTarget => {
  if (typeof window !== 'undefined') {
    if (!window.gameEventBus) {
      window.gameEventBus = new EventTarget();
      console.log('GameEventBus создан');
    }
    return window.gameEventBus;
  }
  
  // Возвращаем заглушку для серверного рендеринга
  return new EventTarget();
};
