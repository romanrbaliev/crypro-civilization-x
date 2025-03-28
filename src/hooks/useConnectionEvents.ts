
import { useEffect } from 'react';
import { GameState } from '@/context/types';
import { toast } from '@/hooks/use-toast';
import { saveGame } from '@/utils/gameSaver';

export const useConnectionEvents = (
  state: GameState,
  isLoading: boolean,
  hasConnection: boolean,
  setHasConnection: (connected: boolean) => void
) => {
  let saveMessageShown = false;

  useEffect(() => {
    if (!state.gameStarted || isLoading) return;
    
    const handleOnline = () => {
      console.log('🔄 Подключение к сети восстановлено, сохранение...');
      setHasConnection(true);
      saveGame(state, true);
      
      if (!saveMessageShown && process.env.NODE_ENV !== 'development') {
        saveMessageShown = true;
        toast({
          title: "Подключение восстановлено",
          description: "Соединение с сервером восстановлено. Прогресс будет синхронизирован.",
          variant: "success",
        });
      }
    };
    
    const handleOffline = () => {
      console.log('⚠️ Соединение с сетью потеряно');
      setHasConnection(false);
      
      if (!saveMessageShown && process.env.NODE_ENV !== 'development') {
        saveMessageShown = true;
        toast({
          title: "Соединение потеряно",
          description: "Соединение с сервером потеряно. Игра может работать некорректно.",
          variant: "destructive",
        });
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state, isLoading, hasConnection, setHasConnection]);
};
