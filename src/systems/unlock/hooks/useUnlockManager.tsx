
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
        console.log("UnlockManagerProvider: Создан новый экземпляр UnlockManager");
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
  
  // ИСПРАВЛЕНИЕ: Используем пустую строку вместо undefined и защищаем от null
  const safeItemId = itemId || '';
  
  // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Полностью переработанный хук useMemo для избежания ошибок с undefined
  const normalizedItemId = useMemo(() => {
    try {
      // Проверяем, что safeItemId - это не пустая строка
      if (!safeItemId) {
        console.log("useUnlockStatus: Обнаружен пустой ID, пропуск нормализации");
        return '';
      }
      
      // Безопасно нормализуем ID
      const normalized = normalizeId(safeItemId);
      console.log(`useUnlockStatus: Нормализация ID ${safeItemId} -> ${normalized}`);
      return normalized;
    } catch (error) {
      console.error("Ошибка нормализации ID:", error, "для itemId:", safeItemId);
      return '';
    }
  }, [safeItemId]); // Только safeItemId в зависимостях
  
  // ИСПРАВЛЕНИЕ: Улучшенный checkUnlockStatus с дополнительными проверками
  const checkUnlockStatus = useCallback(() => {
    try {
      // Пропускаем проверку для пустых ID
      if (!normalizedItemId) {
        console.log(`useUnlockStatus: Пропуск проверки для пустого ID`);
        setIsUnlocked(false);
        return;
      }
      
      // Проверяем наличие менеджера разблокировок
      if (!unlockManager) {
        console.log(`useUnlockStatus: Менеджер разблокировок недоступен для ${normalizedItemId}`);
        setIsUnlocked(false);
        return;
      }
      
      // Проверяем разблокировку
      const status = unlockManager.isUnlocked(normalizedItemId);
      setIsUnlocked(!!status);
      console.log(`useUnlockStatus: Статус для ${normalizedItemId}: ${status ? 'разблокирован' : 'заблокирован'}`);
    } catch (error) {
      console.error(`Ошибка при проверке разблокировки элемента ${normalizedItemId}`, error);
      setIsUnlocked(false);
    }
  }, [unlockManager, normalizedItemId]);
  
  // ИСПРАВЛЕНИЕ: Безопасный обработчик событий
  const handleUnlockEvent = useCallback((event: Event) => {
    try {
      // Проверяем тип события
      if (!(event instanceof CustomEvent) || !event.detail) {
        return;
      }
      
      // Пропускаем обработку для пустых ID
      if (!normalizedItemId) {
        return;
      }
      
      // Получаем ID элемента из события
      const eventId = event.detail?.itemId || '';
      if (!eventId) {
        return;
      }
      
      // Нормализуем ID из события
      let normalizedEventId;
      try {
        normalizedEventId = normalizeId(eventId);
      } catch (error) {
        console.error("Ошибка нормализации eventId:", error);
        return;
      }
      
      // Обрабатываем событие только если ID совпадают
      if (normalizedEventId === normalizedItemId) {
        console.log(`useUnlockStatus: Обработка события разблокировки для ${normalizedItemId}`);
        checkUnlockStatus();
      }
    } catch (error) {
      console.error('Ошибка при обработке события разблокировки', error);
    }
  }, [checkUnlockStatus, normalizedItemId]);
  
  // ИСПРАВЛЕНИЕ: Безопасные эффекты
  useEffect(() => {
    try {
      // Пропускаем эффект для пустых ID
      if (!normalizedItemId) {
        return;
      }
      
      // Выполняем начальную проверку
      console.log(`useUnlockStatus: Начальная проверка для ${normalizedItemId}`);
      checkUnlockStatus();
      
      // Подписываемся на события разблокировки
      window.addEventListener('unlock-event', handleUnlockEvent);
      
      // Отписываемся при размонтировании
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
  // ИСПРАВЛЕНИЕ: Безопасное использование itemId
  const safeItemId = itemId || '';
  const isUnlocked = useUnlockStatus(safeItemId);
  
  return isUnlocked ? <>{children}</> : <>{fallback}</>;
};
