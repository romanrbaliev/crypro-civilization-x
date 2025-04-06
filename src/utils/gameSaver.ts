
import { GameState } from '@/context/types';
import { saveGameToServer } from '@/api/gameStorage';
import { checkAllUnlocks } from '@/utils/unlockManager';

/**
 * Сохраняет текущее состояние игры
 */
export const saveGame = async (
  state: GameState, 
  hasConnection: boolean = true
): Promise<boolean> => {
  try {
    console.log('🔄 Сохранение игры...');
    
    // Проверяем и обновляем все разблокировки перед сохранением
    const stateWithUnlocks = checkAllUnlocks(state);
    
    // Устанавливаем время последнего сохранения
    const stateToSave = {
      ...stateWithUnlocks,
      lastSaved: Date.now()
    };
    
    // Сохраняем в локальное хранилище в любом случае
    const serializedState = JSON.stringify(stateToSave);
    localStorage.setItem('gameState', serializedState);
    console.log('✅ Игра сохранена локально');
    
    // Если есть подключение, сохраняем в облако
    if (hasConnection) {
      const serverSaved = await saveGameToServer(stateToSave);
      if (serverSaved) {
        console.log('✅ Игра сохранена в облаке');
      } else {
        console.warn('⚠️ Не удалось сохранить игру в облаке');
      }
      return serverSaved;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка при сохранении игры:', error);
    return false;
  }
};
