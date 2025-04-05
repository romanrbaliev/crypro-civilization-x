
import { useState, useEffect } from 'react';

type ToastType = 'default' | 'success' | 'error' | 'destructive' | 'warning';

interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastType;
  duration?: number;
}

interface Toast extends ToastProps {
  id: string;
}

// Эмуляция функции toast из shadcn/ui
export function toast(props: ToastProps) {
  const event = new CustomEvent('toast', {
    detail: {
      ...props,
      id: Math.random().toString(36).substring(2, 9)
    }
  });
  
  window.dispatchEvent(event);
}

// Хук для использования тостов
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  function addToast(toast: ToastProps) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    
    // Автоматически удаляем toast через указанное время
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  }
  
  function removeToast(id: string) {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }
  
  // Слушаем события toast
  useEffect(() => {
    const handleToast = (event: CustomEvent) => {
      addToast(event.detail);
    };
    
    window.addEventListener('toast', handleToast as EventListener);
    
    return () => {
      window.removeEventListener('toast', handleToast as EventListener);
    };
  }, []);
  
  return {
    toasts,
    addToast,
    removeToast,
    toast
  };
}
