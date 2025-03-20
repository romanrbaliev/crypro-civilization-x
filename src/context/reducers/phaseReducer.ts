
import { GameState } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Обработка обновления фазы игры
export const processUpdatePhase = (
  state: GameState,
  payload: { phase: number }
): GameState => {
  const { phase } = payload;
  
  // Если текущая фаза уже равна или выше запрошенной, ничего не делаем
  if (state.phase >= phase) {
    return state;
  }
  
  console.log(`Обновление фазы игры: ${state.phase} -> ${phase}`);
  
  // Обновляем фазу
  return {
    ...state,
    phase
  };
};
