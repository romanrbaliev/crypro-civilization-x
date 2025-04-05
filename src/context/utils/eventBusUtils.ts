
/**
 * Безопасно отправляет событие игры
 * @param message Сообщение
 * @param type Тип сообщения (error, warning, info, success)
 */
export function safeDispatchGameEvent(message: string, type: string): void {
  try {
    const event = new CustomEvent('game-event', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
    console.log(`Отправлено событие: ${type} - ${message}`);
  } catch (error) {
    console.error('Ошибка при отправке события:', error);
  }
}
