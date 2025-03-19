import React, { useEffect, useRef } from 'react';
import { 
  createGameEventBus, 
  addGameEventListener, 
  removeGameEventListener 
} from './utils/gameEvents';
import { toast } from '@/hooks/use-toast';

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
      
      // Логика обработки специфических сообщений
      if (message.includes("Открыта новая функция: Применить знания")) {
        // Сразу добавляем детальное сообщение в Map, чтобы избежать его повторения
        const detailMessage = "Накопите 10 знаний, чтобы применить их и получить USDT";
        sentMessagesRef.current.set(detailMessage, currentTime);
        
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.gameEventBus) {
            const detailEvent = new CustomEvent('game-event-detail', { 
              detail: { 
                message: detailMessage,
                type: "info"
              } 
            });
            window.gameEventBus.dispatchEvent(detailEvent);
          }
        }, 200);
      }
      else if (message.includes("После применения знаний открыта функция 'Практика'")) {
        const detailMessage = "Накопите 10 USDT, чтобы начать практиковаться и включить фоновое накопление знаний";
        sentMessagesRef.current.set(detailMessage, currentTime);
        
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.gameEventBus) {
            const detailEvent = new CustomEvent('game-event-detail', { 
              detail: { 
                message: detailMessage,
                type: "info"
              } 
            });
            window.gameEventBus.dispatchEvent(detailEvent);
          }
        }, 200);
      }
      else if (message.includes("Открыто новое оборудование: Генератор")) {
        const detailMessage = "Генератор позволяет вырабатывать электричество, необходимое для других устройств";
        sentMessagesRef.current.set(detailMessage, currentTime);
        
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.gameEventBus) {
            const detailEvent = new CustomEvent('game-event-detail', { 
              detail: { 
                message: detailMessage,
                type: "info"
              } 
            });
            window.gameEventBus.dispatchEvent(detailEvent);
          }
        }, 200);
      }
      else if (message.includes("Открыто новое оборудование: Домашний компьютер")) {
        const detailMessage = "Домашний компьютер потребляет 1 электричество/сек и производит вычислительную мощность";
        sentMessagesRef.current.set(detailMessage, currentTime);
        
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.gameEventBus) {
            const detailEvent = new CustomEvent('game-event-detail', { 
              detail: { 
                message: detailMessage,
                type: "info"
              } 
            });
            window.gameEventBus.dispatchEvent(detailEvent);
          }
        }, 200);
      }
      else if (message.includes("Открыто новое оборудование: Автомайнер")) {
        const detailMessage = "Автомайнер автоматически обменивает 50 единиц вычислительной мощности на 5 USDT каждые 5 секунд";
        sentMessagesRef.current.set(detailMessage, currentTime);
        
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.gameEventBus) {
            const detailEvent = new CustomEvent('game-event-detail', { 
              detail: { 
                message: detailMessage,
                type: "info"
              } 
            });
            window.gameEventBus.dispatchEvent(detailEvent);
          }
        }, 200);
      }
      else if (message.includes("Разблокировано исследование 'Основы блокчейна'")) {
        const detailMessage = "Исследование дает +50% к максимальному хранению знаний и открывает криптокошелек";
        sentMessagesRef.current.set(detailMessage, currentTime);
        
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.gameEventBus) {
            const detailEvent = new CustomEvent('game-event-detail', { 
              detail: { 
                message: detailMessage,
                type: "info"
              } 
            });
            window.gameEventBus.dispatchEvent(detailEvent);
          }
        }, 200);
      }
      else if (message.includes("Разблокировано исследование 'Безопасность криптокошельков'")) {
        const detailMessage = "Исследование дает +25% к максимальному хранению USDT";
        sentMessagesRef.current.set(detailMessage, currentTime);
        
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.gameEventBus) {
            const detailEvent = new CustomEvent('game-event-detail', { 
              detail: { 
                message: detailMessage,
                type: "info"
              } 
            });
            window.gameEventBus.dispatchEvent(detailEvent);
          }
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
    
    // Обработчик для отладочных событий системы помощников
    const handleDebugHelperEvent = (event: Event) => {
      if (!(event instanceof CustomEvent) || !event.detail?.message) {
        return;
      }
      
      const { message, step } = event.detail;
      
      // Показываем всплывающее уведомление с важной информацией о шагах
      toast({
        title: "Система помощников",
        description: message,
        variant: "default"
      });
      
      // Записываем в журнал информацию о шаге
      console.log(`Отладка системы помощников (шаг: ${step}): ${message}`);
    };
    
    // Обработчик для событий производительности зданий
    const handleProductionEvent = (event: Event) => {
      if (!(event instanceof CustomEvent) || !event.detail) {
        return;
      }
      
      const { buildingId, buildingName } = event.detail;
      
      // Уведомляем о пересчете производительности
      toast({
        title: "Производительность обновлена",
        description: `Пересчитана производительность здания "${buildingName}"`,
        variant: "default"
      });
      
      console.log(`Событие обновления производительности для здания ${buildingId}`);
      
      // Принудительное обновление для пересчета ресурсов
      if (typeof window.dispatchEvent === 'function') {
        setTimeout(() => {
          const forceUpdateEvent = new CustomEvent('force-resource-update');
          window.dispatchEvent(forceUpdateEvent);
        }, 200);
      }
    };
    
    // Обработчик для сводки бонусов
    const handleBoostsSummary = (event: Event) => {
      if (!(event instanceof CustomEvent) || !event.detail?.message) {
        return;
      }
      
      const { message, referralBonus, helperBoosts } = event.detail;
      
      // Формируем подробное сообщение для пользователя
      let detailMessage = message;
      
      if (Object.keys(helperBoosts || {}).length > 0) {
        detailMessage += "\nАктивные бонусы от помощников:";
        Object.entries(helperBoosts).forEach(([buildingId, data]: [string, any]) => {
          detailMessage += `\n- ${data.helperIds.length} помощников (+${data.boost * 100}%)`;
        });
      }
      
      // Показываем всплывающее уведомление со сводкой
      toast({
        title: "Сводка бонусов",
        description: detailMessage,
        variant: "default"
      });
    };
    
    // Обработчик для детальной информации о производстве Практики
    const handlePracticeProduction = (event: Event) => {
      if (!(event instanceof CustomEvent) || !event.detail?.message) {
        return;
      }
      
      const { message } = event.detail;
      
      // Показываем информацию о производительности Практики
      toast({
        title: "Производство знаний (Практика)",
        description: message,
        variant: "default"
      });
    };
    
    // Регистрируем обработчики
    addGameEventListener(eventBus, handleGameEvent as any);
    eventBus.addEventListener('game-event-detail', handleDetailEvent as any);
    eventBus.addEventListener('debug-helper-step', handleDebugHelperEvent as any);
    eventBus.addEventListener('helper-production-update', handleProductionEvent as any);
    eventBus.addEventListener('debug-boosts-summary', handleBoostsSummary as any);
    eventBus.addEventListener('debug-practice-production', handlePracticeProduction as any);
    
    // Очистка при размонтировании
    return () => {
      removeGameEventListener(eventBus, handleGameEvent as any);
      eventBus.removeEventListener('game-event-detail', handleDetailEvent as any);
      eventBus.removeEventListener('debug-helper-step', handleDebugHelperEvent as any);
      eventBus.removeEventListener('helper-production-update', handleProductionEvent as any);
      eventBus.removeEventListener('debug-boosts-summary', handleBoostsSummary as any);
      eventBus.removeEventListener('debug-practice-production', handlePracticeProduction as any);
      if (typeof window !== 'undefined') {
        delete window.gameEventBus;
      }
    };
  }, []);
  
  // Компонент не рендерит никакой UI
  return null;
};
