
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
 * Класс шины событий игры
 */
class GameEventBus extends EventTarget {
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
  dispatchGameEvent(detail: GameEventDetail): void {
    const event = new CustomEvent('game-event', { detail });
    this.dispatchEvent(event);
  }
  
  /**
   * Отправляет детальное игровое событие
   * @param detail Детали события
   */
  dispatchDetailEvent(detail: GameEventDetail): void {
    const event = new CustomEvent('game-event-detail', { detail });
    this.dispatchEvent(event);
  }
}

// Глобальная шина событий
export const gameEventBus = new GameEventBus();

/**
 * Отправляет игровое событие с проверкой состояния
 */
export const safeDispatchGameEvent = (message: string, type: GameEventDetail['type'] = 'info'): void => {
  if (typeof window !== 'undefined' && window.gameEventBus) {
    window.gameEventBus.dispatchGameEvent({ message, type });
  } else if (typeof window !== 'undefined') {
    // Если шина событий не определена в window, используем глобальную
    gameEventBus.dispatchGameEvent({ message, type });
  } else {
    // Для серверного рендеринга
    console.log(`[GameEvent] ${type.toUpperCase()}: ${message}`);
  }
};

/**
 * Отправляет детальное игровое событие с проверкой состояния
 */
export const safeDispatchDetailEvent = (message: string, type: GameEventDetail['type'] = 'info'): void => {
  if (typeof window !== 'undefined' && window.gameEventBus) {
    window.gameEventBus.dispatchDetailEvent({ message, type });
  } else if (typeof window !== 'undefined') {
    // Если шина событий не определена в window, используем глобальную
    gameEventBus.dispatchDetailEvent({ message, type });
  } else {
    // Для серверного рендеринга
    console.log(`[GameDetailEvent] ${type.toUpperCase()}: ${message}`);
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
