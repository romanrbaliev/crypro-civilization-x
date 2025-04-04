
import { useContext, createContext, useEffect, useState } from 'react';
import { UnlockManager } from '../UnlockManager';
import { useGame } from '@/context/hooks/useGame';

// Создаем контекст для предоставления доступа к менеджеру разблокировок
const UnlockManagerContext = createContext<UnlockManager | null>(null);

// Провайдер контекста
export const UnlockManagerProvider = ({ children }: { children: React.ReactNode }) => {
  const { state } = useGame();
  const [unlockManager, setUnlockManager] = useState<UnlockManager | null>(null);
  
  // Инициализируем менеджер разблокировок при изменении состояния игры
  useEffect(() => {
    const manager = new UnlockManager(state);
    setUnlockManager(manager);
  }, [state.version]); // Пересоздаем только при изменении версии состояния
  
  // Обновляем состояние при изменении игры
  useEffect(() => {
    if (unlockManager) {
      unlockManager.updateGameState(state);
    }
  }, [state, unlockManager]);
  
  return (
    <UnlockManagerContext.Provider value={unlockManager}>
      {children}
    </UnlockManagerContext.Provider>
  );
};

// Хук для использования менеджера разблокировок
export const useUnlockManager = (): UnlockManager => {
  const context = useContext(UnlockManagerContext);
  
  if (!context) {
    // Если контекст недоступен, создаем временный менеджер
    // или выбрасываем ошибку в разработке
    if (process.env.NODE_ENV !== 'production') {
      console.error('useUnlockManager должен быть использован внутри UnlockManagerProvider');
    }
    
    // Получаем состояние игры (запасной вариант)
    const { state } = useGame();
    
    // Возвращаем новый экземпляр менеджера
    return new UnlockManager(state);
  }
  
  return context;
};

// Хук для проверки разблокировки элемента
export const useUnlockStatus = (itemId: string): boolean => {
  const unlockManager = useUnlockManager();
  const { state } = useGame();
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  
  useEffect(() => {
    // Проверяем текущий статус разблокировки
    const checkUnlockStatus = () => {
      const status = unlockManager.isUnlocked(itemId);
      setIsUnlocked(status);
    };
    
    // Проверяем при монтировании и при изменении зависимостей
    checkUnlockStatus();
    
    // Подписываемся на события разблокировки
    const handleUnlockEvent = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.itemId === itemId) {
        checkUnlockStatus();
      }
    };
    
    window.addEventListener('unlock-event', handleUnlockEvent);
    
    return () => {
      window.removeEventListener('unlock-event', handleUnlockEvent);
    };
  }, [itemId, unlockManager, state]);
  
  return isUnlocked;
};

// Компонент высшего порядка для условного рендеринга на основе разблокировки
export const UnlockedContent = ({ 
  itemId, 
  children,
  fallback = null
}: { 
  itemId: string; 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const isUnlocked = useUnlockStatus(itemId);
  
  return isUnlocked ? <>{children}</> : <>{fallback}</>;
};
