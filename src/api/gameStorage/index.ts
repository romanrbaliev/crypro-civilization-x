
// Экспорт функций для хранения и загрузки состояния игры
export { saveGameToServer } from './saveGame';
export { loadGameFromServer } from './loadGame';
export { validateGameState, mergeWithInitialState } from './stateUtils';

// Функция для сброса всех данных игры
export const resetAllGameData = async (): Promise<boolean> => {
  try {
    localStorage.removeItem('gameState');
    
    // Обновленный код: теперь мы используем правильную структуру
    // из initialState вместо несуществующего initialBuildings
    const initialState = await import('../../context/initialState');
    
    // Проверяем здания напрямую в структуре initialState
    if (initialState && 
        initialState.initialState && 
        initialState.initialState.buildings && 
        initialState.initialState.buildings.coolingSystem) {
      initialState.initialState.buildings.coolingSystem.unlocked = false;
    }
    
    return true;
  } catch (error) {
    console.error("Ошибка при сбросе данных игры:", error);
    return false;
  }
};
