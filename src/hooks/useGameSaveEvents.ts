
import { useEffect } from 'react';
import { GameState } from '@/context/types';
import { saveGame } from '@/utils/gameSaver';

export const useGameSaveEvents = (
  state: GameState, 
  isLoading: boolean, 
  hasConnection: boolean, 
  gameInitialized: boolean
) => {
  useEffect(() => {
    if (!state.gameStarted || isLoading || !hasConnection || !gameInitialized) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('🔄 Страница скрыта, сохранение...');
        saveGame(state, hasConnection);
      }
    };
    
    const handleBeforeUnload = () => {
      console.log('🔄 Страница закрывается, сохранение...');
      saveGame(state, hasConnection);
    };
    
    const handleBlur = () => {
      console.log('🔄 Окно потеряло фокус, сохранение...');
      saveGame(state, hasConnection);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('blur', handleBlur);
      
      console.log('🔄 Сохранение при размонтировании');
      saveGame(state, hasConnection);
    };
  }, [state, isLoading, hasConnection, gameInitialized]);
};
