
// Вспомогательная функция для безопасного доступа к шине событий
export function safeDispatchGameEvent(
  message: string,
  type: "info" | "error" | "success" | "warning" = "info"
): void {
  if (typeof window !== 'undefined') {
    try {
      // Проверка и создание шины событий, если не существует
      if (!window.gameEventBus) {
        console.log('🔄 Создаем глобальную шину событий gameEventBus');
        window.gameEventBus = new EventTarget();
      }
      
      // Создание и отправка события
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

// Создание шины событий, если она еще не существует
export function ensureGameEventBus(): void {
  if (typeof window !== 'undefined' && !window.gameEventBus) {
    window.gameEventBus = new EventTarget();
    console.log('✅ Глобальная шина событий создана');
  }
}
