
// Функция для безопасной отправки игрового события
export const safeDispatchGameEvent = (
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info'
) => {
  try {
    // Создаем событие для глобального слушателя
    const event = new CustomEvent('game-event', {
      detail: {
        message,
        type,
        timestamp: Date.now()
      }
    });
    
    // Отправляем событие
    window.dispatchEvent(event);
    
    // Также выводим в консоль для отладки
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    return true;
  } catch (error) {
    console.error('Ошибка при отправке события:', error);
    return false;
  }
};

// Функция для прослушивания игровых событий
export const setupGameEventListener = (
  callback: (message: string, type: string, timestamp: number) => void
) => {
  const listener = (event: any) => {
    const { message, type, timestamp } = event.detail;
    callback(message, type, timestamp);
  };
  
  window.addEventListener('game-event', listener);
  
  // Возвращаем функцию для удаления слушателя
  return () => {
    window.removeEventListener('game-event', listener);
  };
};
