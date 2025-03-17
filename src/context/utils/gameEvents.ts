
export interface GameEventDetail {
  message: string;
  type: "info" | "error" | "success" | "warning";
}

export type GameEventHandler = (event: CustomEvent<GameEventDetail>) => void;

// Создание системы событий
export function createGameEventBus(): EventTarget {
  const eventBus = document.createElement('div');
  
  // Подключаем к window для глобального доступа
  if (typeof window !== 'undefined') {
    window.gameEventBus = eventBus;
  }
  
  return eventBus;
}

// Отправка события через шину событий
export function dispatchGameEvent(
  eventBus: EventTarget,
  message: string,
  type: GameEventDetail["type"] = "info"
): void {
  const customEvent = new CustomEvent('game-event', { 
    detail: { message, type } 
  });
  eventBus.dispatchEvent(customEvent);
}

// Добавление обработчика события на шину
export function addGameEventListener(
  eventBus: EventTarget,
  handler: GameEventHandler
): void {
  eventBus.addEventListener('game-event', handler as EventListener);
}

// Удаление обработчика события с шины
export function removeGameEventListener(
  eventBus: EventTarget,
  handler: GameEventHandler
): void {
  eventBus.removeEventListener('game-event', handler as EventListener);
}

// Получение экземпляра шины событий
export function getGameEventBus(): EventTarget | undefined {
  if (typeof window !== 'undefined') {
    return window.gameEventBus;
  }
  return undefined;
}
