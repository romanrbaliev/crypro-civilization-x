
import { useTranslation } from "@/i18n";
import { createGameEventBus } from "./gameEvents";

export type GameEventType = "info" | "success" | "warning" | "error";

// Интерфейс для параметризованного сообщения события
export interface GameEventData {
  messageKey: string;
  type: GameEventType;
  params?: Record<string, string | number>;
}

// Функция для инициализации шины событий
export const ensureGameEventBus = (): void => {
  if (typeof window !== 'undefined' && !window.gameEventBus) {
    createGameEventBus();
    console.log('✅ Шина событий игры инициализирована через ensureGameEventBus');
  }
};

// Функция для отправки событий с переводом и параметрами
export const safeDispatchGameEvent = (
  messageOrData: string | GameEventData,
  type: GameEventType = "info"
) => {
  if (typeof window === "undefined" || !window.gameEventBus) {
    console.warn("Game event bus not initialized");
    return;
  }

  try {
    // Определяем, получили ли мы строку или объект с ключом перевода
    if (typeof messageOrData === "string") {
      // Простое сообщение без перевода (для обратной совместимости)
      const event = new CustomEvent("game-event", {
        detail: { message: messageOrData, type },
      });
      window.gameEventBus.dispatchEvent(event);
    } else {
      // Объект с ключом перевода и параметрами
      const { messageKey, type: eventType, params } = messageOrData;
      
      // Динамически получаем текущий язык и функцию перевода
      const getTranslation = () => {
        // Получаем язык из локального хранилища
        const savedLanguage = localStorage.getItem('language') as 'ru' | 'en' || 'ru';
        
        // Получаем переводы
        const translations = require('@/i18n/translations').translations;
        const currentTranslations = translations[savedLanguage];
        
        if (!currentTranslations || !currentTranslations[messageKey]) {
          return messageKey; // Если перевод не найден, возвращаем ключ
        }
        
        // Получаем шаблон перевода
        let translatedText = currentTranslations[messageKey];
        
        // Заменяем параметры в шаблоне
        if (params) {
          Object.entries(params).forEach(([paramKey, paramValue]) => {
            translatedText = translatedText.replace(`{${paramKey}}`, String(paramValue));
          });
        }
        
        return translatedText;
      };
      
      // Получаем переведённое сообщение
      const translatedMessage = getTranslation();
      
      // Отправляем событие с переведенным сообщением
      const event = new CustomEvent("game-event", {
        detail: { message: translatedMessage, type: eventType },
      });
      window.gameEventBus.dispatchEvent(event);
    }
  } catch (error) {
    console.error("Error dispatching game event:", error);
  }
};

// Генератор уникальных идентификаторов для событий
export const generateEventId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};
