
// Типы для событий и деталей событий
import { GameState } from "../types";

/**
 * Интерфейс для деталей игрового события
 */
export interface GameEventDetail {
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

/**
 * Интерфейс для расширенных деталей события с поддержкой i18n
 */
export interface GameEventI18nDetail {
  messageKey: string;
  type: 'info' | 'success' | 'error' | 'warning';
  params?: Record<string, any>;
}

/**
 * Класс шины событий игры
 */
export class GameEventBus extends EventTarget {
  /**
   * Инициализирует шину событий
   */
  constructor() {
    super();
    console.log('🔄 Шина событий игры инициализирована');
  }
  
  /**
   * Отправляет игровое событие
   * @param detail Детали события
   */
  dispatchGameEvent(detail: GameEventDetail | GameEventI18nDetail): void {
    const event = new CustomEvent('game-event', { detail });
    this.dispatchEvent(event);
  }
  
  /**
   * Отправляет детальное игровое событие
   * @param detail Детали события
   */
  dispatchDetailEvent(detail: GameEventDetail | GameEventI18nDetail): void {
    const event = new CustomEvent('game-event-detail', { detail });
    this.dispatchEvent(event);
  }
}

// Глобальная шина событий
export const gameEventBus = new GameEventBus();

/**
 * Проверяет существование шины событий и создает ее при необходимости
 */
export const ensureGameEventBus = (): GameEventBus => {
  if (typeof window !== 'undefined') {
    if (!window.gameEventBus) {
      window.gameEventBus = new GameEventBus();
      console.log('✅ Шина событий игры создана и подключена к window');
    }
    return window.gameEventBus;
  }
  return gameEventBus;
};

/**
 * Отправляет игровое событие с проверкой состояния
 */
export const safeDispatchGameEvent = (
  detail: string | GameEventDetail | GameEventI18nDetail,
  type: GameEventDetail['type'] = 'info'
): void => {
  let eventDetail: GameEventDetail | GameEventI18nDetail;
  
  // Преобразуем строку в объект события, если необходимо
  if (typeof detail === 'string') {
    eventDetail = { message: detail, type };
  } else {
    eventDetail = detail;
  }
  
  if (typeof window !== 'undefined' && window.gameEventBus) {
    window.gameEventBus.dispatchGameEvent(eventDetail);
  } else if (typeof window !== 'undefined') {
    // Если шина событий не определена в window, используем глобальную
    gameEventBus.dispatchGameEvent(eventDetail);
  } else {
    // Для серверного рендеринга
    const message = 'messageKey' in eventDetail ? 
      `[GameEvent] ${eventDetail.type.toUpperCase()}: ${eventDetail.messageKey}` :
      `[GameEvent] ${eventDetail.type.toUpperCase()}: ${(eventDetail as GameEventDetail).message}`;
    console.log(message);
  }
};

/**
 * Отправляет детальное игровое событие с проверкой состояния
 */
export const safeDispatchDetailEvent = (
  detail: string | GameEventDetail | GameEventI18nDetail,
  type: GameEventDetail['type'] = 'info'
): void => {
  let eventDetail: GameEventDetail | GameEventI18nDetail;
  
  // Преобразуем строку в объект события, если необходимо
  if (typeof detail === 'string') {
    eventDetail = { message: detail, type };
  } else {
    eventDetail = detail;
  }
  
  if (typeof window !== 'undefined' && window.gameEventBus) {
    window.gameEventBus.dispatchDetailEvent(eventDetail);
  } else if (typeof window !== 'undefined') {
    // Если шина событий не определена в window, используем глобальную
    gameEventBus.dispatchDetailEvent(eventDetail);
  } else {
    // Для серверного рендеринга
    const message = 'messageKey' in eventDetail ? 
      `[GameDetailEvent] ${eventDetail.type.toUpperCase()}: ${eventDetail.messageKey}` :
      `[GameDetailEvent] ${eventDetail.type.toUpperCase()}: ${(eventDetail as GameEventDetail).message}`;
    console.log(message);
  }
};

// Объявляем gameEventBus как глобальное свойство window
declare global {
  interface Window {
    gameEventBus: GameEventBus;
  }
}

// Инициализация gameEventBus в глобальном контексте
if (typeof window !== 'undefined') {
  window.gameEventBus = gameEventBus;
}
