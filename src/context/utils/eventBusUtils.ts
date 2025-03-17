
// Вспомогательная функция для безопасного доступа к шине событий
export function safeDispatchGameEvent(
  message: string,
  type: "info" | "error" | "success" | "warning" = "info"
): void {
  if (typeof window !== 'undefined' && window.gameEventBus) {
    const customEvent = new CustomEvent('game-event', { 
      detail: { message, type } 
    });
    window.gameEventBus.dispatchEvent(customEvent);
  }
}
