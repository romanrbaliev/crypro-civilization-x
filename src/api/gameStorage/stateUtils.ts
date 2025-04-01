
import { initialState } from '@/context/initialState';
import { GameState } from '@/context/types';

/**
 * Проверяет целостность состояния игры
 * @param state Состояние игры для проверки
 * @returns true если состояние валидное
 */
export function validateGameState(state: any): state is GameState {
  return (
    state &&
    typeof state === 'object' &&
    'resources' in state &&
    'buildings' in state
  );
}

/**
 * Объединяет загруженное состояние с начальным состоянием
 * @param loadedState Загруженное состояние
 * @returns Объединенное состояние
 */
export function mergeWithInitialState(loadedState: GameState): GameState {
  return {
    ...initialState,
    ...loadedState,
    // Убедимся, что актуальные метки времени установлены
    lastUpdate: Date.now(),
    lastSaved: Date.now(),
    // Гарантируем, что gameStarted установлен
    gameStarted: true
  };
}
