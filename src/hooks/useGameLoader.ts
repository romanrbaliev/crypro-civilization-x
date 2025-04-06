
import { useState, useEffect } from 'react';
import { GameState } from '@/context/types';
import { loadGameState } from '@/context/utils/gameStorage';
import { toast } from '@/hooks/use-toast';
import { isTelegramWebAppAvailable } from '@/utils/helpers';

const LOAD_TIMEOUT = 10000;

export const useGameLoader = (
  hasConnection: boolean, 
  setLoadingMessage: (message: string) => void
) => {
  const [loadedState, setLoadedState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gameInitialized, setGameInitialized] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  
  let loadMessageShown = false;

  useEffect(() => {
    const loadSavedGame = async () => {
      try {
        if (gameInitialized) return;
        
        setLoadingMessage("Инициализация игры...");
        
        setLoadingMessage("Проверка соединения с сервером...");
        
        if (!hasConnection) {
          setLoadingMessage("Нет соединения с сервером");
          setIsLoading(false);
          return;
        }
        
        setLoadingMessage("Проверка наличия сохранения...");
        console.log('🔄 Начинаем загрузку сохраненной игры...');
        
        if (isTelegramWebAppAvailable()) {
          console.log('✅ Обнаружен Telegram WebApp, режим Telegram активен');
          setLoadingMessage("Подключение к Telegram...");
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
          try {
            if (window.Telegram?.WebApp?.CloudStorage) {
              setLoadingMessage("Проверка сохранений в Telegram...");
              console.log('✅ CloudStorage API доступен, проверяем наличие сохранений...');
            } else {
              console.warn('⚠️ CloudStorage API недоступен');
            }
          } catch (telegramError) {
            console.error('❌ Ошибка при подготовке Telegram:', telegramError);
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setLoadingMessage("Загрузка данных игры...");
        
        const loadTimeoutId = setTimeout(() => {
          console.warn('⚠️ Превышено время ожидания загрузки, начинаем новую игру');
          setLoadedState(null);
          setIsLoading(false);
          setGameInitialized(true);
          setLoadError(new Error("Превышено время ожидания загрузки"));
          
          toast({
            title: "Ошибка загрузки",
            description: "Превышено время ожидания загрузки. Начинаем новую игру.",
            variant: "destructive",
          });
        }, LOAD_TIMEOUT);
        
        const savedState = await loadGameState();
        
        clearTimeout(loadTimeoutId);
        
        console.log('✅ Загрузка завершена, состояние:', savedState ? 'найдено' : 'не найдено');
        
        if (savedState) {
          console.log('👉 Загруженное состояние:', JSON.stringify(savedState).substring(0, 100) + '...');
          
          // Проверяем разблокировку USDT
          if (savedState.resources && savedState.resources.usdt) {
            if (!savedState.counters || 
                !savedState.counters.applyKnowledge || 
                savedState.counters.applyKnowledge.value < 2) {
              savedState.resources.usdt.unlocked = false;
              
              if (savedState.unlocks) {
                savedState.unlocks.usdt = false;
              }
              
              console.log('🔒 USDT заблокирован при загрузке (проверка в useGameLoader)');
            } else {
              console.log('✅ USDT разблокирован: счетчик applyKnowledge >= 2 (проверка в useGameLoader)');
            }
          }
        }
        
        setLoadedState(savedState);
        setGameInitialized(true);
        
        if (savedState) {
          toast({
            title: "Игра загружена",
            description: "Ваш прогресс успешно восстановлен",
            variant: "default",
          });
        } else {
          toast({
            title: "Новая игра",
            description: "Сохранения не найдены. Начинаем новую игру.",
            variant: "default",
          });
        }
      } catch (err) {
        console.error('❌ Ошибка при загрузке состояния:', err);
        setGameInitialized(true);
        setLoadError(err instanceof Error ? err : new Error(String(err)));
        
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить сохраненную игру. Начинаем новую игру.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedGame();
  }, [gameInitialized, hasConnection, setLoadingMessage]);

  return {
    loadedState,
    isLoading,
    gameInitialized,
    setGameInitialized,
    loadError
  };
};
