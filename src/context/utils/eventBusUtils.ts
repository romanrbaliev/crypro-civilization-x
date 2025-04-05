
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

// Функция для подписки на события игры
export const subscribeToGameEvents = (
  callback: (event: CustomEvent) => void
): () => void => {
  const eventBus = ensureGameEventBus();
  
  const handleEvent = (e: Event) => {
    if (e instanceof CustomEvent) {
      callback(e);
    }
  };
  
  eventBus.addEventListener('game-event', handleEvent);
  
  // Возвращаем функцию для отписки
  return () => {
    eventBus.removeEventListener('game-event', handleEvent);
  };
};

// Отправить событие с деталями
export const dispatchGameEventWithDetails = (
  message: string, 
  type: "success" | "warning" | "info" | "error" = "info",
  details?: any
) => {
  try {
    const eventBus = ensureGameEventBus();
    
    const event = new CustomEvent('game-event-detail', {
      detail: { message, type, details }
    });
    
    eventBus.dispatchEvent(event);
    console.log(`[Event with details dispatched] ${type}: ${message}`, details);
  } catch (error) {
    console.error('Error dispatching detailed game event:', error);
  }
};
