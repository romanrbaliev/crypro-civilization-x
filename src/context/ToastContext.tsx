
import React, { createContext, useContext, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';

interface ToastContextProps {
  showToast: (message: string, type?: 'default' | 'success' | 'error' | 'warning' | 'info') => void;
}

const ToastContext = createContext<ToastContextProps>({
  showToast: () => {}
});

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const showToast = (message: string, type: 'default' | 'success' | 'error' | 'warning' | 'info' = 'default') => {
    toast({
      title: message,
      variant: type === 'error' ? 'destructive' : type
    });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
