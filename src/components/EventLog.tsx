
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import { useI18nContext } from '@/context/I18nContext';

const EventLog: React.FC = () => {
  const { state } = useGame();
  const { t } = useI18nContext();
  const { eventMessages } = state;

  if (!eventMessages || !eventMessages.messages || eventMessages.messages.length === 0) {
    return (
      <div className="event-log">
        <h3 className="event-log-title">{t('ui.eventLog')}</h3>
        <p className="text-gray-500 text-left">{t('ui.noEvents')}</p>
      </div>
    );
  }

  return (
    <div className="event-log">
      <h3 className="event-log-title">{t('ui.eventLog')}</h3>
      <div className="event-messages">
        {eventMessages.messages.map((message, index) => (
          <div
            key={index}
            className={`event-message ${message.type || 'info'}`}
          >
            {message.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventLog;
