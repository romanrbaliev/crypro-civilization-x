
// Экспорт функций для хранения и загрузки состояния игры
export { saveGameToServer } from './saveGame';
export { loadGameFromServer } from './loadGame';
export { validateGameState, mergeWithInitialState } from './stateUtils';

// Функция для сброса всех данных игры
export const resetAllGameData = async (): Promise<boolean> => {
  try {
    localStorage.removeItem('gameState');
    return true;
  } catch (error) {
    console.error("Ошибка при сбросе данных игры:", error);
    return false;
  }
};
