
// Перенаправление и нормализация событий
export interface GameEventDetail {
  messageKey: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  params?: Record<string, any>;
  message?: string;
}

export const safeDispatchGameEvent = (
  detailOrMessage: GameEventDetail | string, 
  type?: 'info' | 'success' | 'warning' | 'error'
): void => {
  // Если window не определен (SSR), выходим
  if (typeof window === 'undefined') return;

  // Убедимся, что шина событий существует
  ensureGameEventBus();

  try {
    // Проверяем, передана ли строка или объект
    let detail: GameEventDetail;
    
    if (typeof detailOrMessage === 'string') {
      detail = {
        messageKey: 'custom.message',
        type: type || 'info',
        params: { message: detailOrMessage },
        message: detailOrMessage
      };
    } else {
      detail = detailOrMessage;
    }
    
    // Преобразуем messageKey в читабельное сообщение если сообщение не задано явно
    if (!detail.message) {
      const messageParts = detail.messageKey.split('.');
      let messageType = messageParts[0] || 'event';
      let messageAction = messageParts[1] || 'generic';
      
      // Простая локализация сообщений о событиях
      switch (detail.messageKey) {
        case 'event.buildingPurchased':
          detail.message = `Построено: ${detail.params?.name || 'здание'}`;
          break;
        case 'event.upgradeCompleted':
          detail.message = `Исследовано: ${detail.params?.name || 'улучшение'}`;
          break;
        case 'event.resourceUnlocked':
          detail.message = `Разблокирован ресурс: ${detail.params?.name || 'ресурс'}`;
          break;
        case 'event.knowledgeApplied':
          detail.message = 'Знания применены';
          break;
        default:
          detail.message = detail.params?.message || 
                        `${messageType}: ${messageAction}`;
      }
    }
    
    // Стандартизируем тип события
    const eventType = detail.type || 'info';
    
    // Отправляем событие через шину событий
    window.gameEventBus?.dispatchEvent(new CustomEvent('game-event', { 
      detail: { message: detail.message, type: eventType } 
    }));
    
    // Для более подробных сообщений
    window.gameEventBus?.dispatchEvent(new CustomEvent('game-event-detail', { 
      detail: { 
        ...detail,
        message: detail.message
      } 
    }));
    
    console.log(`Событие отправлено: ${detail.message} (${eventType})`, detail);
  } catch (error) {
    console.error('Ошибка при отправке события:', error);
  }
};

// Убедимся, что шина событий существует
export const ensureGameEventBus = (): void => {
  if (typeof window !== 'undefined' && !window.gameEventBus) {
    window.gameEventBus = new EventTarget();
    console.log('EventBus создан');
  }
};

// Расширяем window для включения gameEventBus
declare global {
  interface Window {
    gameEventBus?: EventTarget;
  }
}
