
// Вспомогательная функция для безопасного доступа к шине событий
export function safeDispatchGameEvent(
  message: string,
  type: "info" | "error" | "success" | "warning" = "info"
): void {
  if (typeof window !== 'undefined' && window.gameEventBus) {
    try {
      const customEvent = new CustomEvent('game-event', { 
        detail: { message, type } 
      });
      window.gameEventBus.dispatchEvent(customEvent);
      console.log(`📢 Событие: ${type} - ${message}`);
    } catch (error) {
      console.error('❌ Ошибка при отправке события:', error, message);
    }
  }
}

// Проверка наличия шины событий
export function isGameEventBusAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.gameEventBus;
}
