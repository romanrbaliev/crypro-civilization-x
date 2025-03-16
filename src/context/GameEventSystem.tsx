
import React, { useEffect } from 'react';
import { 
  createGameEventBus, 
  addGameEventListener, 
  removeGameEventListener 
} from './utils/gameEvents';

// Компонент для управления шиной событий игры
export const GameEventSystem: React.FC = () => {
  useEffect(() => {
    // Создаем шину событий
    const eventBus = createGameEventBus();
    
    // Определяем обработчик для детальных пояснений
    const handleGameEvent = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.message) {
        const message = event.detail.message;
        
        if (message.includes("Открыта новая функция: Применить знания")) {
          const detailEvent = new CustomEvent('game-event', { 
            detail: { 
              message: "Накопите 10 знаний, чтобы применить их и получить USDT",
              type: "info"
            } 
          });
          setTimeout(() => eventBus.dispatchEvent(detailEvent), 200);
        }
        else if (message.includes("После применения знаний открыта функция 'Практика'")) {
          const detailEvent = new CustomEvent('game-event', { 
            detail: { 
              message: "Накопите 10 USDT, чтобы начать практиковаться и включить фоновое накопление знаний",
              type: "info"
            } 
          });
          setTimeout(() => eventBus.dispatchEvent(detailEvent), 200);
        }
        else if (message.includes("Открыто новое оборудование: Генератор")) {
          const detailEvent = new CustomEvent('game-event', { 
            detail: { 
              message: "Генератор позволяет вырабатывать электричество, необходимое для других устройств",
              type: "info"
            } 
          });
          setTimeout(() => eventBus.dispatchEvent(detailEvent), 200);
        }
        else if (message.includes("Открыто новое оборудование: Домашний компьютер")) {
          const detailEvent = new CustomEvent('game-event', { 
            detail: { 
              message: "Домашний компьютер потребляет 1 электричество/сек и производит вычислительную мощность",
              type: "info"
            } 
          });
          setTimeout(() => eventBus.dispatchEvent(detailEvent), 200);
        }
        else if (message.includes("Открыто новое оборудование: Автомайнер")) {
          const detailEvent = new CustomEvent('game-event', { 
            detail: { 
              message: "Автомайнер автоматически обменивает 50 единиц вычислительной мощности на 5 USDT каждые 5 секунд",
              type: "info"
            } 
          });
          setTimeout(() => eventBus.dispatchEvent(detailEvent), 200);
        }
        else if (message.includes("Разблокировано исследование 'Основы блокчейна'")) {
          const detailEvent = new CustomEvent('game-event', { 
            detail: { 
              message: "Исследование дает +50% к максимальному хранению знаний и открывает криптокошелек",
              type: "info"
            } 
          });
          setTimeout(() => eventBus.dispatchEvent(detailEvent), 200);
        }
        else if (message.includes("Разблокировано исследование 'Безопасность криптокошельков'")) {
          const detailEvent = new CustomEvent('game-event', { 
            detail: { 
              message: "Исследование дает +25% к максимальному хранению USDT",
              type: "info"
            } 
          });
          setTimeout(() => eventBus.dispatchEvent(detailEvent), 200);
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
