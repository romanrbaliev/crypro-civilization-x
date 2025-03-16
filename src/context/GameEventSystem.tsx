
import React, { useEffect, useRef } from 'react';
import { 
  createGameEventBus, 
  addGameEventListener, 
  removeGameEventListener 
} from './utils/gameEvents';

// Компонент для управления шиной событий игры
export const GameEventSystem: React.FC = () => {
  // Используем useRef для хранения отправленных сообщений
  const sentMessagesRef = useRef<Map<string, number>>(new Map());
  
  useEffect(() => {
    // Создаем шину событий
    const eventBus = createGameEventBus();
    
    // Определяем обработчик для событий
    const handleGameEvent = (event: Event) => {
      if (!(event instanceof CustomEvent) || !event.detail?.message) {
        return;
      }
      
      const message = event.detail.message;
      const currentTime = Date.now();
      
      // Проверяем, было ли это или похожее сообщение отправлено недавно
      const isDuplicate = Array.from(sentMessagesRef.current.entries()).some(([existingMsg, timestamp]) => {
        // Если прошло менее 3 секунд и сообщения похожи
        const isSimilar = (
          existingMsg === message || 
          (existingMsg.includes(message) || message.includes(existingMsg))
        );
        
        return isSimilar && (currentTime - timestamp < 3000);
      });
      
      if (isDuplicate) {
        console.log("Пропуск дублирующегося сообщения:", message);
        return; // Пропускаем дубликат
      }
      
      // Добавляем сообщение в Map с временной меткой
      sentMessagesRef.current.set(message, currentTime);
      
      // Очищаем старые сообщения (старше 5 секунд)
      const messagesToDelete: string[] = [];
      sentMessagesRef.current.forEach((timestamp, msg) => {
        if (currentTime - timestamp > 5000) {
          messagesToDelete.push(msg);
        }
      });
      
      messagesToDelete.forEach(msg => {
        sentMessagesRef.current.delete(msg);
      });
      
      // Вместо проверки начала сообщений, используем более надежный подход с детальными пояснениями
      if (message.includes("Открыта новая функция: Применить знания")) {
        // Сразу добавляем детальное сообщение в Map, чтобы избежать его повторения
        const detailMessage = "Накопите 10 знаний, чтобы применить их и получить USDT";
        sentMessagesRef.current.set(detailMessage, currentTime);
        
        setTimeout(() => {
          const detailEvent = new CustomEvent('game-event-detail', { 
            detail: { 
              message: detailMessage,
              type: "info"
            } 
          });
          eventBus.dispatchEvent(detailEvent);
        }, 200);
      }
      else if (message.includes("После применения знаний открыта функция 'Практика'")) {
        const detailMessage = "Накопите 10 USDT, чтобы начать практиковаться и включить фоновое накопление знаний";
        sentMessagesRef.current.set(detailMessage, currentTime);
        
        setTimeout(() => {
          const detailEvent = new CustomEvent('game-event-detail', { 
            detail: { 
              message: detailMessage,
              type: "info"
            } 
          });
          eventBus.dispatchEvent(detailEvent);
        }, 200);
      }
      else if (message.includes("Открыто новое оборудование: Генератор")) {
        const detailMessage = "Генератор позволяет вырабатывать электричество, необходимое для других устройств";
        sentMessagesRef.current.set(detailMessage, currentTime);
        
        setTimeout(() => {
          const detailEvent = new CustomEvent('game-event-detail', { 
            detail: { 
              message: detailMessage,
              type: "info"
            } 
          });
          eventBus.dispatchEvent(detailEvent);
        }, 200);
      }
      else if (message.includes("Открыто новое оборудование: Домашний компьютер")) {
        const detailMessage = "Домашний компьютер потребляет 1 электричество/сек и производит вычислительную мощность";
        sentMessagesRef.current.set(detailMessage, currentTime);
        
        setTimeout(() => {
          const detailEvent = new CustomEvent('game-event-detail', { 
            detail: { 
              message: detailMessage,
              type: "info"
            } 
          });
          eventBus.dispatchEvent(detailEvent);
        }, 200);
      }
      else if (message.includes("Открыто новое оборудование: Автомайнер")) {
        const detailMessage = "Автомайнер автоматически обменивает 50 единиц вычислительной мощности на 5 USDT каждые 5 секунд";
        sentMessagesRef.current.set(detailMessage, currentTime);
        
        setTimeout(() => {
          const detailEvent = new CustomEvent('game-event-detail', { 
            detail: { 
              message: detailMessage,
              type: "info"
            } 
          });
          eventBus.dispatchEvent(detailEvent);
        }, 200);
      }
      else if (message.includes("Разблокировано исследование 'Основы блокчейна'")) {
        const detailMessage = "Исследование дает +50% к максимальному хранению знаний и открывает криптокошелек";
        sentMessagesRef.current.set(detailMessage, currentTime);
        
        setTimeout(() => {
          const detailEvent = new CustomEvent('game-event-detail', { 
            detail: { 
              message: detailMessage,
              type: "info"
            } 
          });
          eventBus.dispatchEvent(detailEvent);
        }, 200);
      }
      else if (message.includes("Разблокировано исследование 'Безопасность криптокошельков'")) {
        const detailMessage = "Исследование дает +25% к максимальному хранению USDT";
        sentMessagesRef.current.set(detailMessage, currentTime);
        
        setTimeout(() => {
          const detailEvent = new CustomEvent('game-event-detail', { 
            detail: { 
              message: detailMessage,
              type: "info"
            } 
          });
          eventBus.dispatchEvent(detailEvent);
        }, 200);
      }
    };
    
    // Обработчик для детальных пояснений (использует отдельное событие)
    const handleDetailEvent = (event: Event) => {
      if (!(event instanceof CustomEvent) || !event.detail?.message) {
        return;
      }
      
      // Детали уже проверены на дубликаты в основном обработчике
      // и отправляются через отдельное событие
    };
    
    // Регистрируем обработчики
    addGameEventListener(eventBus, handleGameEvent as any);
    eventBus.addEventListener('game-event-detail', handleDetailEvent as any);
    
    // Очистка при размонтировании
    return () => {
      removeGameEventListener(eventBus, handleGameEvent as any);
      eventBus.removeEventListener('game-event-detail', handleDetailEvent as any);
      delete window.gameEventBus;
    };
  }, []);
  
  // Компонент не рендерит никакой UI
  return null;
};
