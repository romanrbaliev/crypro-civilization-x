
import React, { createContext, useContext, ReactNode, useState } from 'react';

interface EventBusContextProps {
  dispatch: (eventName: string, payload?: any) => void;
  subscribe: (eventName: string, callback: (payload?: any) => void) => () => void;
}

const EventBusContext = createContext<EventBusContextProps>({
  dispatch: () => {},
  subscribe: () => () => {}
});

export const EventBusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [listeners, setListeners] = useState<Record<string, Array<(payload?: any) => void>>>({});

  const dispatch = (eventName: string, payload?: any) => {
    if (listeners[eventName]) {
      listeners[eventName].forEach(callback => callback(payload));
    }
  };

  const subscribe = (eventName: string, callback: (payload?: any) => void) => {
    setListeners(prev => ({
      ...prev,
      [eventName]: [...(prev[eventName] || []), callback]
    }));

    return () => {
      setListeners(prev => ({
        ...prev,
        [eventName]: prev[eventName]?.filter(cb => cb !== callback) || []
      }));
    };
  };

  return (
    <EventBusContext.Provider value={{ dispatch, subscribe }}>
      {children}
    </EventBusContext.Provider>
  );
};

export const useEventBus = () => useContext(EventBusContext);
