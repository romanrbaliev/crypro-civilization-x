
import { GameEventDetail } from '../types';

// Перенаправление и нормализация событий
export const safeDispatchGameEvent = (detail: GameEventDetail): void => {
  // Если window не определен (SSR), выходим
  if (typeof window === 'undefined') return;

  // Убедимся, что шина событий существует
  ensureGameEventBus();

  try {
    // Преобразуем messageKey в читабельное сообщение
    const messageParts = detail.messageKey.split('.');
    let messageType = messageParts[0] || 'event';
    let messageAction = messageParts[1] || 'generic';
    
    let humanReadableMessage = '';
    
    // Простая локализация сообщений о событиях
    switch (detail.messageKey) {
      case 'event.buildingPurchased':
        humanReadableMessage = `Построено: ${detail.params?.name || 'здание'}`;
        break;
      case 'event.upgradeCompleted':
        humanReadableMessage = `Исследовано: ${detail.params?.name || 'улучшение'}`;
        break;
      case 'event.resourceUnlocked':
        humanReadableMessage = `Разблокирован ресурс: ${detail.params?.name || 'ресурс'}`;
        break;
      case 'event.knowledgeApplied':
        humanReadableMessage = 'Знания применены';
        break;
      default:
        humanReadableMessage = detail.params?.message || 
                              `${messageType}: ${messageAction}`;
    }
    
    // Стандартизируем тип события
    const eventType = detail.type || 'info';
    
    // Отправляем событие через шину событий
    window.gameEventBus.dispatchEvent(new CustomEvent('game-event', { 
      detail: { message: humanReadableMessage, type: eventType } 
    }));
    
    // Для более подробных сообщений
    window.gameEventBus.dispatchEvent(new CustomEvent('game-event-detail', { 
      detail: { 
        ...detail,
        message: humanReadableMessage
      } 
    }));
    
    console.log(`Событие отправлено: ${humanReadableMessage} (${eventType})`, detail);
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
