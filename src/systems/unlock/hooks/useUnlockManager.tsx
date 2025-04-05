
import { useContext, createContext, useEffect, useState, useMemo, useCallback } from 'react';
import { UnlockManager } from '@/utils/unifiedUnlockSystem';
import { useGame } from '@/context/hooks/useGame';
import { normalizeId } from '@/i18n';
import { GameState } from '@/context/types';
import { GameContext } from '@/context/GameContext';

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

const UnlockManagerContext = createContext<UnlockManager | null>(null);

export const UnlockManagerProvider = ({ children }: { children: React.ReactNode }) => {
  const gameContext = useContext(GameContext);
  const state = gameContext?.state || createEmptyGameState();
  const [unlockManager, setUnlockManager] = useState<UnlockManager | null>(null);
  
  useEffect(() => {
    if (state) {
      try {
        const manager = new UnlockManager(state);
        setUnlockManager(manager);
        console.log("UnlockManagerProvider: Создан новый экземпляр UnlockManager");
      } catch (error) {
        console.error("Ошибка при создании UnlockManager:", error);
      }
    }
  }, [state?.version]);
  
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

export const useUnlockManager = (): UnlockManager => {
  const context = useContext(UnlockManagerContext);
  
  if (!context) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('useUnlockManager должен быть использован внутри UnlockManagerProvider');
    }
    
    const { state } = useGame();
    
    return new UnlockManager(state || createEmptyGameState());
  }
  
  return context;
};

export const useUnlockStatus = (itemId: string | undefined): boolean => {
  const unlockManager = useUnlockManager();
  const { state } = useGame();
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  
  // Безопасно получаем ID
  const safeItemId = useMemo(() => itemId || '', [itemId]);
  
  // Нормализуем ID только если он не пустой
  const normalizedItemId = useMemo(() => {
    try {
      if (!safeItemId) {
        return '';
      }
      
      const normalized = normalizeId(safeItemId);
      return normalized || '';
    } catch (error) {
      console.error("Ошибка нормализации ID:", error, "для itemId:", safeItemId);
      return '';
    }
  }, [safeItemId]);
  
  const checkUnlockStatus = useCallback(() => {
    try {
      if (!normalizedItemId) {
        setIsUnlocked(false);
        return;
      }
      
      if (!unlockManager) {
        setIsUnlocked(false);
        return;
      }
      
      const status = unlockManager.isUnlocked(normalizedItemId);
      setIsUnlocked(!!status);
    } catch (error) {
      console.error(`Ошибка при проверке разблокировки элемента ${normalizedItemId}`, error);
      setIsUnlocked(false);
    }
  }, [unlockManager, normalizedItemId]);
  
  const handleUnlockEvent = useCallback((event: Event) => {
    if (!normalizedItemId) {
      return;
    }
    
    try {
      if (!(event instanceof CustomEvent) || !event.detail) {
        return;
      }
      
      const eventId = event.detail?.itemId || '';
      if (!eventId) {
        return;
      }
      
      let normalizedEventId;
      try {
        normalizedEventId = normalizeId(eventId) || '';
      } catch (error) {
        console.error("Ошибка нормализации eventId:", error);
        return;
      }
      
      if (normalizedEventId === normalizedItemId) {
        checkUnlockStatus();
      }
    } catch (error) {
      console.error('Ошибка при обработке события разблокировки', error);
    }
  }, [checkUnlockStatus, normalizedItemId]);
  
  useEffect(() => {
    if (normalizedItemId === '') {
      return;
    }
    
    try {
      checkUnlockStatus();
      
      window.addEventListener('unlock-event', handleUnlockEvent);
      
      return () => {
        window.removeEventListener('unlock-event', handleUnlockEvent);
      };
    } catch (error) {
      console.error("Ошибка в эффекте useUnlockStatus:", error);
      return () => {};
    }
  }, [checkUnlockStatus, handleUnlockEvent, normalizedItemId]);
  
  return isUnlocked;
};

export const UnlockedContent = ({ 
  itemId, 
  children,
  fallback = null
}: { 
  itemId: string | undefined; 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const safeItemId = itemId || '';
  const isUnlocked = useUnlockStatus(safeItemId);
  
  return isUnlocked ? <>{children}</> : <>{fallback}</>;
};
