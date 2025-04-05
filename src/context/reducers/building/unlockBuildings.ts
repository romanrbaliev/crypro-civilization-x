
import { GameState } from '../../types';
import { safeDispatchGameEvent } from '../../utils/eventBusUtils';
import { initialPhase2Buildings } from '../../initialState';

/**
 * Проверяет и обрабатывает разблокировку зданий на основе прогресса игры
 */
export const checkBuildingUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Проверяем, нужно ли активировать фазу 2
  if ((state.resources.usdt?.value >= 25 || state.resources.electricity?.unlocked) && 
      state.phase < 2) {
    
    console.log("unlockBuildings: Активируем фазу 2");
    
    // Обновляем фазу
    newState.phase = 2;
    
    // Добавляем здания из фазы 2, если они еще не добавлены
    if (initialPhase2Buildings) {
      for (const [buildingId, building] of Object.entries(initialPhase2Buildings)) {
        // Если здание еще не существует в состоянии, добавляем его
        if (!newState.buildings[buildingId]) {
          console.log(`unlockBuildings: Добавляем здание фазы 2: ${buildingId}`);
          newState.buildings[buildingId] = { ...building };
        }
      }
    }
    
    // Уведомляем пользователя
    safeDispatchGameEvent('Открыта фаза 2: Основы криптоэкономики', 'info');
  }
  
  // Возвращаем обновленное состояние
  return newState;
};
