
import { GameState } from '@/context/types';
import { loadGameFromServer } from '@/api/gameStorage/loadGame';
import { initialState } from '@/context/initialState';

/**
 * Загружает сохранение игры
 */
export const loadGame = async (): Promise<GameState | null> => {
  try {
    // Загружаем игру с сервера
    const savedGame = await loadGameFromServer();
    
    // Если есть сохранение, возвращаем его
    if (savedGame) {
      // Преобразуем данные к типу GameState, убедившись, что они имеют нужную структуру
      const typedSavedGame = savedGame as unknown as GameState;
      return typedSavedGame;
    }
    
    // Если нет сохранения, возвращаем начальное состояние
    return null;
  } catch (error) {
    console.error('Ошибка при загрузке игры:', error);
    return null;
  }
};
