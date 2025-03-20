
// Экспорт функций для хранения и загрузки состояния игры
export { saveGameToServer } from './saveGame';
export { loadGameFromServer } from './loadGame';
export { validateGameState, mergeWithInitialState } from './stateUtils';

// Функция для полного сброса игровых данных
export const resetAllGameData = async (): Promise<void> => {
  // Очищаем локальное хранилище
  localStorage.removeItem('game_state');
  localStorage.removeItem('last_save_time');
  
  // В будущем здесь может быть код для очистки данных на сервере
  console.log('✅ Все игровые данные сброшены');
  
  return Promise.resolve();
};
