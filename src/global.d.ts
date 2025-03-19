
// Это файл объявлений глобальных типов для TypeScript

// Объявление типов для глобальных переменных
interface Window {
  // Шина событий для внутриигровой коммуникации
  gameEventBus: EventTarget;
  
  // Кэш для ID пользователя
  __game_user_id?: string;
}

// Объявление типов для глобальных функций
declare var window: Window;
