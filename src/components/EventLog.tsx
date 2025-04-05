
import React, { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface GameEvent {
  id: string;
  timestamp: number;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

interface EventLogProps {
  events: GameEvent[];
  maxEvents?: number;
}

const EventLog: React.FC<EventLogProps> = ({ events, maxEvents = 50 }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Автоматическая прокрутка вверх при новых событиях
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = 0;
    }
  }, [events]);
  
  // Отображаем только последние N событий
  const displayEvents = events.slice(-maxEvents);
  
  // Форматирование времени события
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };
  
  // Стили для разных типов событий
  const getEventStyle = (type: GameEvent["type"]): string => {
    switch (type) {
      case "success":
        return "text-green-600 border-green-200";
      case "warning":
        return "text-amber-600 border-amber-200";
      case "error":
        return "text-red-600 border-red-200";
      case "info":
      default:
        return "text-blue-600 border-blue-200";
    }
  };
  
  return (
    <div className="h-full p-2">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-xs">Журнал событий</h2>
        <div className="text-xs text-gray-500">
          {displayEvents.length} {displayEvents.length === 1 ? 'событие' : 
            (displayEvents.length >= 2 && displayEvents.length <= 4) ? 'события' : 'событий'}
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100%-28px)]" ref={scrollAreaRef}>
        <div className="space-y-1 pr-2">
          {displayEvents.length > 0 ? (
            displayEvents.map(event => (
              <div 
                key={event.id} 
                className={`text-xs p-1.5 border-l-2 ${getEventStyle(event.type)} bg-gray-50 animate-fade-in`}
              >
                <span className="text-xs text-gray-500 mr-2">{formatTime(event.timestamp)}</span>
                {event.message}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4 text-xs">
              Пока нет событий
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EventLog;
