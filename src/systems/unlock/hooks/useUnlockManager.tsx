
import { useContext, createContext, useEffect, useState, useMemo, useCallback } from 'react';
import { UnlockManager } from '@/utils/unifiedUnlockSystem';
import { useGame } from '@/context/hooks/useGame';
import { normalizeId } from '@/i18n';
import { GameState } from '@/context/types';
import { GameContext } from '@/context/GameContext';

// Создаем заглушку состояния для случаев, когда контекст недоступен
const createEmptyGameState = (): GameState => ({
  resources: {},
  buildings: {},
  upgrades: {},
  counters: {},
  knowledge: 0,
  btcPrice: 0,
  miningPower: 0,
  usdtBalance: 0,
  btcBalance: 0,
  gameStarted: false,
  lastUpdate: Date.now(),
  lastSaved: Date.now(),
  version: '1.0.0',
  featureFlags: {},
  buildingUnlocked: {},
  specializationSynergies: {},
  referralCode: null,
  referredBy: null,
  referrals: [],
  referralHelpers: [],
  unlocks: {},
  prestigePoints: 0,
  eventMessages: {},
  gameTime: 0,
  miningParams: {
    miningEfficiency: 1.0,
    networkDifficulty: 1.0,
    energyEfficiency: 1.0,
    exchangeRate: 1.0,
    exchangeCommission: 0.01,
    volatility: 0.05,
    exchangePeriod: 60,
    baseConsumption: 1.0
  },
  phase: 1
});

// Создаем контекст для предоставления доступа к менеджеру разблокировок
const UnlockManagerContext = createContext<UnlockManager | null>(null);

// Провайдер контекста
export const UnlockManagerProvider = ({ children }: { children: React.ReactNode }) => {
  // Получаем контекст игры обычным способом
  const gameContext = useContext(GameContext);
  const state = gameContext?.state || createEmptyGameState();
  const [unlockManager, setUnlockManager] = useState<UnlockManager | null>(null);
  
  // Инициализируем менеджер разблокировок при изменении состояния игры
  useEffect(() => {
    if (state) {
      try {
        const manager = new UnlockManager(state);
        setUnlockManager(manager);
      } catch (error) {
        console.error("Ошибка при создании UnlockManager:", error);
      }
    }
  }, [state?.version]); // Пересоздаем только при изменении версии состояния
  
  // Обновляем состояние при изменении игры
  useEffect(() => {
    if (unlockManager && state) {
      try {
        unlockManager.updateGameState(state);
      } catch (error) {
        console.error("Ошибка при обновлении состояния в UnlockManager:", error);
      }
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
    if (process.env.NODE_ENV !== 'production') {
      console.error('useUnlockManager должен быть использован внутри UnlockManagerProvider');
    }
    
    // Получаем состояние игры (запасной вариант)
    const { state } = useGame();
    
    // Возвращаем новый экземпляр менеджера
    return new UnlockManager(state || createEmptyGameState());
  }
  
  return context;
};

// Хук для проверки разблокировки элемента
export const useUnlockStatus = (itemId: string | undefined): boolean => {
  const unlockManager = useUnlockManager();
  const { state } = useGame();
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  
  // Используем пустую строку вместо undefined и защищаем от null
  const safeItemId = itemId || '';
  
  // Мемоизируем ID с защитой от undefined
  const normalizedItemId = useMemo(() => {
    if (!safeItemId) return '';
    try {
      return normalizeId(safeItemId);
    } catch (error) {
      console.error("Ошибка нормализации ID:", error);
      return '';
    }
  }, [safeItemId]);
  
  // Улучшенный callback с проверками на undefined
  const checkUnlockStatus = useCallback(() => {
    if (!unlockManager || !normalizedItemId) {
      setIsUnlocked(false);
      return;
    }
    
    try {
      const status = unlockManager.isUnlocked(normalizedItemId);
      setIsUnlocked(!!status);
    } catch (error) {
      console.error(`Ошибка при проверке разблокировки элемента ${normalizedItemId}`, error);
      setIsUnlocked(false);
    }
  }, [unlockManager, normalizedItemId]);
  
  // Безопасный обработчик событий
  const handleUnlockEvent = useCallback((event: Event) => {
    if (!(event instanceof CustomEvent) || !event.detail) return;
    
    try {
      const eventId = event.detail?.itemId || '';
      if (!eventId || !normalizedItemId) return;
      
      const normalizedEventId = normalizeId(eventId);
      if (normalizedEventId === normalizedItemId) {
        checkUnlockStatus();
      }
    } catch (error) {
      console.error('Ошибка при обработке события разблокировки', error);
    }
  }, [checkUnlockStatus, normalizedItemId]);
  
  // Безопасная проверка эффектов
  useEffect(() => {
    try {
      // Проверяем при монтировании
      checkUnlockStatus();
      
      // Подписываемся на события разблокировки
      window.addEventListener('unlock-event', handleUnlockEvent);
      
      return () => {
        window.removeEventListener('unlock-event', handleUnlockEvent);
      };
    } catch (error) {
      console.error("Ошибка в эффекте useUnlockStatus:", error);
      return () => {};
    }
  }, [checkUnlockStatus, handleUnlockEvent]);
  
  return isUnlocked;
};

// Компонент высшего порядка для условного рендеринга на основе разблокировки
export const UnlockedContent = ({ 
  itemId, 
  children,
  fallback = null
}: { 
  itemId: string | undefined; 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  // Безопасная проверка itemId
  const safeItemId = itemId || '';
  const isUnlocked = useUnlockStatus(safeItemId);
  
  return isUnlocked ? <>{children}</> : <>{fallback}</>;
};
