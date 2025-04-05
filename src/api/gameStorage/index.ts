
// Реэкспорт функций из файлов
export { saveGameToServer } from './saveGame';
export { loadGameFromServer } from './loadGame';

// Экспорт loadGameState для обратной совместимости
export const loadGameState = loadGameFromServer;
