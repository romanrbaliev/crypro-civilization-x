
// Импортируем функции из соответствующих файлов
import { saveGameToServer } from './saveGame';
import { loadGameFromServer } from './loadGame';

// Реэкспорт функций
export { saveGameToServer };
export { loadGameFromServer };

// Экспорт loadGameState для обратной совместимости
export const loadGameState = loadGameFromServer;
