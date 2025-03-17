
export interface GameEventDetail {
  message: string;
  type: "info" | "error" | "success" | "warning";
}

export type GameEventHandler = (event: CustomEvent<GameEventDetail>) => void;

// Проверка инициализации шины событий
let isEventBusInitialized = false;

// Создание системы событий
export function createGameEventBus(): EventTarget {
  // Если шина уже создана, возвращаем её
  if (typeof window !== 'undefined' && window.gameEventBus) {
    console.log('✅ Используем существующую шину событий игры');
    return window.gameEventBus;
  }
  
  console.log('🔄 Создание новой шины событий игры');
  
  // Создаем новую шину на основе DOM-элемента
  const eventBus = document.createElement('div');
  
  // Подключаем к window для глобального доступа
  if (typeof window !== 'undefined') {
    window.gameEventBus = eventBus;
    isEventBusInitialized = true;
    console.log('✅ Новая шина событий игры создана и подключена к window');
  }
  
  return eventBus;
}

// Отправка события через шину событий
export function dispatchGameEvent(
  eventBus: EventTarget,
  message: string,
  type: GameEventDetail["type"] = "info"
): void {
  if (!eventBus) {
    console.warn('⚠️ Шина событий не существует, событие не отправлено:', message);
    return;
  }
  
  try {
    const customEvent = new CustomEvent('game-event', { 
      detail: { message, type } 
    });
    eventBus.dispatchEvent(customEvent);
    console.log(`📢 Событие: ${type} - ${message}`);
  } catch (error) {
    console.error('❌ Ошибка при отправке события:', error, message);
  }
}

// Добавление обработчика события на шину
export function addGameEventListener(
  eventBus: EventTarget,
  handler: GameEventHandler
): void {
  if (!eventBus) {
    console.warn('⚠️ Шина событий не существует, обработчик не добавлен');
    return;
  }
  
  try {
    eventBus.addEventListener('game-event', handler as EventListener);
    console.log('✅ Обработчик событий игры добавлен');
  } catch (error) {
    console.error('❌ Ошибка при добавлении обработчика событий:', error);
  }
}

// Удаление обработчика события с шины
export function removeGameEventListener(
  eventBus: EventTarget,
  handler: GameEventHandler
): void {
  if (!eventBus) {
    console.warn('⚠️ Шина событий не существует, обработчик не удален');
    return;
  }
  
  try {
    eventBus.removeEventListener('game-event', handler as EventListener);
    console.log('✅ Обработчик событий игры удален');
  } catch (error) {
    console.error('❌ Ошибка при удалении обработчика событий:', error);
  }
}

// Получение экземпляра шины событий
export function getGameEventBus(): EventTarget | undefined {
  if (typeof window !== 'undefined') {
    // Если шина не инициализирована, создаем её
    if (!window.gameEventBus && !isEventBusInitialized) {
      console.log('🔄 Автоматическое создание шины событий при первом запросе');
      createGameEventBus();
    }
    return window.gameEventBus;
  }
  return undefined;
}

// Проверка доступности шины событий
export function isGameEventBusAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.gameEventBus;
}
