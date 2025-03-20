
// Экспорт функций для хранения и загрузки состояния игры
export { saveGameToServer } from './saveGame';
export { loadGameFromServer } from './loadGame';
export { validateGameState, mergeWithInitialState } from './stateUtils';

// Функция для сброса всех данных игры
export const resetAllGameData = async (): Promise<boolean> => {
  try {
    localStorage.removeItem('gameState');
    
    // Принудительно сбрасываем состояния зданий в initialState
    const initialState = await import('../../context/initialState');
    if (initialState.initialBuildings.coolingSystem) {
      initialState.initialBuildings.coolingSystem.unlocked = false;
    }
    
    return true;
  } catch (error) {
    console.error("Ошибка при сбросе данных игры:", error);
    return false;
  }
};
