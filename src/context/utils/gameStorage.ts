
import { GameState } from '@/context/types';
import { initialState } from '@/context/initialState';
import { loadGameFromServer } from '@/api/gameStorage';
import { checkAllUnlocks } from '@/utils/unlockManager';

/**
 * Загружает состояние игры из локального хранилища или с сервера
 */
export const loadGameState = async (): Promise<GameState | null> => {
  try {
    console.log('🔄 Загрузка состояния игры...');
    
    // Сначала пробуем загрузить с сервера
    const serverState = await loadGameFromServer();
    
    if (serverState) {
      console.log('✅ Игра загружена с сервера');
      
      // Проверяем и обновляем все разблокировки после загрузки
      const stateWithUnlocks = checkAllUnlocks(serverState);
      
      return stateWithUnlocks;
    }
    
    // Если не удалось загрузить с сервера, пробуем из локального хранилища
    const serializedState = localStorage.getItem('gameState');
    
    if (!serializedState) {
      console.log('❌ Локальное сохранение не найдено');
      return null;
    }
    
    const localState = JSON.parse(serializedState) as GameState;
    console.log('✅ Игра загружена из локального хранилища');
    
    // Проверяем и обновляем все разблокировки после загрузки
    const stateWithUnlocks = checkAllUnlocks(localState);
    
    return stateWithUnlocks;
  } catch (error) {
    console.error('❌ Ошибка при загрузке состояния:', error);
    return null;
  }
};

/**
 * Сбрасывает состояние игры до начального
 */
export const resetGameState = (): GameState => {
  localStorage.removeItem('gameState');
  return { ...initialState };
};
