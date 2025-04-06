
import React, { createContext, useContext, useEffect, ReactNode } from 'react';

interface EventBusContextProps {
  dispatch: (type: string, payload?: any) => void;
  subscribe: (type: string, callback: (payload?: any) => void) => () => void;
}

const EventBusContext = createContext<EventBusContextProps>({
  dispatch: () => {},
  subscribe: () => () => {}
});

export const EventBusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const listeners: Record<string, Array<(payload?: any) => void>> = {};

  const dispatch = (type: string, payload?: any) => {
    if (listeners[type]) {
      listeners[type].forEach(callback => callback(payload));
    }
    
    // Также отправляем событие через gameEventBus, если он существует
    if (typeof window !== 'undefined' && window.gameEventBus) {
      const event = new CustomEvent('game-event', { 
        detail: { message: payload?.message || type, type: payload?.type || 'info' } 
      });
      window.gameEventBus.dispatchEvent(event);
    }
  };

  const subscribe = (type: string, callback: (payload?: any) => void) => {
    if (!listeners[type]) {
      listeners[type] = [];
    }
    listeners[type].push(callback);

    return () => {
      if (listeners[type]) {
        listeners[type] = listeners[type].filter(cb => cb !== callback);
      }
    };
  };

  return (
    <EventBusContext.Provider value={{ dispatch, subscribe }}>
      {children}
    </EventBusContext.Provider>
  );
};

export const useEventBus = () => useContext(EventBusContext);
