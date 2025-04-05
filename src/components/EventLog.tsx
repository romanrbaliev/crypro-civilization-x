
import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { setupGameEventListener } from '@/context/utils/eventBusUtils';

const EventLog: React.FC = () => {
  const { state } = useGame();
  const [events, setEvents] = useState<Array<{
    id: string;
    message: string;
    type: string;
    timestamp: number;
  }>>([]);
  
  // Инициализация событий из состояния
  useEffect(() => {
    if (state.eventMessages) {
      const initialEvents = Object.entries(state.eventMessages).map(([id, data]: [string, any]) => ({
        id,
        message: data.text || data.message || '',
        type: data.type || 'info',
        timestamp: data.timestamp || Date.now()
      }));
      
      setEvents(initialEvents.sort((a, b) => b.timestamp - a.timestamp).slice(0, 15));
    }
  }, [state.eventMessages]);
  
  // Настраиваем слушатель для новых событий
  useEffect(() => {
    const removeListener = setupGameEventListener((message, type, timestamp) => {
      // Добавляем новое событие в начало списка
      setEvents(prevEvents => [{
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        message,
        type,
        timestamp
      }, ...prevEvents].slice(0, 15)); // Оставляем только последние 15 событий
    });
    
    return removeListener;
  }, []);
  
  // Функция для форматирования времени
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };
  
  // Определяем цвет текста в зависимости от типа сообщения
  const getMessageColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'info':
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };
  
  return (
    <div className="space-y-1 event-log">
      {events.length === 0 ? (
        <div className="text-gray-500 text-xs text-center py-2">
          Нет событий
        </div>
      ) : (
        events.map((event) => (
          <div key={event.id} className="flex text-xs event-item">
            <span className="text-gray-500 mr-2 event-time">{formatTime(event.timestamp)}</span>
            <span className={getMessageColor(event.type)}>{event.message}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default EventLog;
