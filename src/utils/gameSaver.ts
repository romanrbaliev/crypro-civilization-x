
import { GameState } from '@/context/types';
import { saveGameState } from '@/context/utils/gameStorage';

let lastSaveTime = 0;
let isSavingInProgress = false;

export const saveGame = async (gameState: GameState, hasConnection: boolean): Promise<boolean> => {
  if (!hasConnection) {
    console.log('⚠️ Нет соединения с сервером, сохранение пропущено');
    return false;
  }
  
  if (isSavingInProgress) {
    console.log('⏳ Сохранение уже выполняется, пропускаем...');
    return false;
  }
  
  const now = Date.now();
  if (now - lastSaveTime < 2000) {
    console.log(`⏱️ Слишком частые сохранения (прошло ${now - lastSaveTime}мс)`);
    return false;
  }
  
  isSavingInProgress = true;
  lastSaveTime = now;
  
  try {
    console.log(`🔄 Запуск сохранения игры (размер: ~${JSON.stringify(gameState).length}b)`);
    
    const success = await saveGameState(gameState);
    
    if (success) {
      console.log('✅ Игра успешно сохранена');
      return true;
    } else {
      console.warn('⚠️ Возникли проблемы при сохранении игры');
      return false;
    }
  } catch (error) {
    console.error('❌ Ошибка при сохранении игры:', error);
    return false;
  } finally {
    isSavingInProgress = false;
  }
};
