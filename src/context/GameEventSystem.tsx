
import React, { useEffect, useRef } from 'react';
import { 
  createGameEventBus, 
  addGameEventListener, 
  removeGameEventListener 
} from './utils/gameEvents';

// Компонент для управления шиной событий игры
export const GameEventSystem: React.FC = () => {
  // Используем useRef для хранения последних сообщений, чтобы избежать дубликатов
  const lastMessagesRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    // Создаем шину событий
    const eventBus = createGameEventBus();
    
    // Определяем обработчик для детальных пояснений
    const handleGameEvent = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.message) {
        const message = event.detail.message;
        
        // Проверяем, не было ли это сообщение уже отправлено недавно
        if (lastMessagesRef.current.has(message)) {
          return; // Игнорируем дубликаты сообщений
        }
        
        // Добавляем сообщение в набор последних сообщений
        lastMessagesRef.current.add(message);
        
        // Удаляем сообщение из набора через небольшой промежуток времени
        setTimeout(() => {
          lastMessagesRef.current.delete(message);
        }, 2000); // Достаточное время для предотвращения дублирования
        
        // Предотвращаем отправку детального сообщения для уже известных событий
        if (message.startsWith("Накопите") || 
            message.startsWith("Генератор позволяет") ||
            message.startsWith("Домашний компьютер потребляет") ||
            message.startsWith("Автомайнер автоматически") ||
            message.startsWith("Исследование дает")) {
          return; // Не отправляем дополнительное сообщение
        }
        
        // Для новых событий добавляем детальные пояснения
        if (message.includes("Открыта новая функция: Применить знания")) {
          const detailMessage = "Накопите 10 знаний, чтобы применить их и получить USDT";
          
          // Проверяем, что детальное сообщение еще не было отправлено
          if (!lastMessagesRef.current.has(detailMessage)) {
            lastMessagesRef.current.add(detailMessage);
            
            const detailEvent = new CustomEvent('game-event', { 
              detail: { 
                message: detailMessage,
                type: "info"
              } 
            });
            
            setTimeout(() => {
              eventBus.dispatchEvent(detailEvent);
              // Также удаляем детальное сообщение из набора через некоторое время
              setTimeout(() => {
                lastMessagesRef.current.delete(detailMessage);
              }, 2000);
            }, 200);
          }
        }
        else if (message.includes("После применения знаний открыта функция 'Практика'")) {
          const detailMessage = "Накопите 10 USDT, чтобы начать практиковаться и включить фоновое накопление знаний";
          
          if (!lastMessagesRef.current.has(detailMessage)) {
            lastMessagesRef.current.add(detailMessage);
            
            const detailEvent = new CustomEvent('game-event', { 
              detail: { 
                message: detailMessage,
                type: "info"
              } 
            });
            
            setTimeout(() => {
              eventBus.dispatchEvent(detailEvent);
              setTimeout(() => {
                lastMessagesRef.current.delete(detailMessage);
              }, 2000);
            }, 200);
          }
        }
        else if (message.includes("Открыто новое оборудование: Генератор")) {
          const detailMessage = "Генератор позволяет вырабатывать электричество, необходимое для других устройств";
          
          if (!lastMessagesRef.current.has(detailMessage)) {
            lastMessagesRef.current.add(detailMessage);
            
            const detailEvent = new CustomEvent('game-event', { 
              detail: { 
                message: detailMessage,
                type: "info"
              } 
            });
            
            setTimeout(() => {
              eventBus.dispatchEvent(detailEvent);
              setTimeout(() => {
                lastMessagesRef.current.delete(detailMessage);
              }, 2000);
            }, 200);
          }
        }
        else if (message.includes("Открыто новое оборудование: Домашний компьютер")) {
          const detailMessage = "Домашний компьютер потребляет 1 электричество/сек и производит вычислительную мощность";
          
          if (!lastMessagesRef.current.has(detailMessage)) {
            lastMessagesRef.current.add(detailMessage);
            
            const detailEvent = new CustomEvent('game-event', { 
              detail: { 
                message: detailMessage,
                type: "info"
              } 
            });
            
            setTimeout(() => {
              eventBus.dispatchEvent(detailEvent);
              setTimeout(() => {
                lastMessagesRef.current.delete(detailMessage);
              }, 2000);
            }, 200);
          }
        }
        else if (message.includes("Открыто новое оборудование: Автомайнер")) {
          const detailMessage = "Автомайнер автоматически обменивает 50 единиц вычислительной мощности на 5 USDT каждые 5 секунд";
          
          if (!lastMessagesRef.current.has(detailMessage)) {
            lastMessagesRef.current.add(detailMessage);
            
            const detailEvent = new CustomEvent('game-event', { 
              detail: { 
                message: detailMessage,
                type: "info"
              } 
            });
            
            setTimeout(() => {
              eventBus.dispatchEvent(detailEvent);
              setTimeout(() => {
                lastMessagesRef.current.delete(detailMessage);
              }, 2000);
            }, 200);
          }
        }
        else if (message.includes("Разблокировано исследование 'Основы блокчейна'")) {
          const detailMessage = "Исследование дает +50% к максимальному хранению знаний и открывает криптокошелек";
          
          if (!lastMessagesRef.current.has(detailMessage)) {
            lastMessagesRef.current.add(detailMessage);
            
            const detailEvent = new CustomEvent('game-event', { 
              detail: { 
                message: detailMessage,
                type: "info"
              } 
            });
            
            setTimeout(() => {
              eventBus.dispatchEvent(detailEvent);
              setTimeout(() => {
                lastMessagesRef.current.delete(detailMessage);
              }, 2000);
            }, 200);
          }
        }
        else if (message.includes("Разблокировано исследование 'Безопасность криптокошельков'")) {
          const detailMessage = "Исследование дает +25% к максимальному хранению USDT";
          
          if (!lastMessagesRef.current.has(detailMessage)) {
            lastMessagesRef.current.add(detailMessage);
            
            const detailEvent = new CustomEvent('game-event', { 
              detail: { 
                message: detailMessage,
                type: "info"
              } 
            });
            
            setTimeout(() => {
              eventBus.dispatchEvent(detailEvent);
              setTimeout(() => {
                lastMessagesRef.current.delete(detailMessage);
              }, 2000);
            }, 200);
          }
        }
      }
    };
    
    // Регистрируем обработчик
    addGameEventListener(eventBus, handleGameEvent as any);
    
    // Очистка при размонтировании
    return () => {
      removeGameEventListener(eventBus, handleGameEvent as any);
      delete window.gameEventBus;
    };
  }, []);
  
  // Компонент не рендерит никакой UI
  return null;
};
