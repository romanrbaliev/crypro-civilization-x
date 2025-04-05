
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import { useI18nContext } from '@/context/I18nContext';

export interface GameEvent {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface EventLogProps {
  events?: GameEvent[];
  maxEvents?: number;
}

const EventLog: React.FC<EventLogProps> = ({ events = [], maxEvents = 50 }) => {
  const { state } = useGame();
  const { t } = useI18nContext();

  // Если передали события через props, используем их
  const displayEvents = events && events.length > 0 
    ? events.slice(0, maxEvents)
    : (state.eventMessages?.messages || []);

  if (!displayEvents || displayEvents.length === 0) {
    return (
      <div className="event-log">
        <h3 className="event-log-title">Журнал событий</h3>
        <p className="text-gray-500 text-left">Нет событий</p>
      </div>
    );
  }

  return (
    <div className="event-log">
      <h3 className="event-log-title">Журнал событий</h3>
      <div className="event-messages">
        {displayEvents.map((message, index) => (
          <div
            key={message.id || index}
            className={`event-message ${message.type || 'info'} text-left`}
          >
            {message.message || message.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventLog;
