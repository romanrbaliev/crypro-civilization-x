
import { GameState } from '../../types';
import { safeDispatchGameEvent } from '../../utils/eventBusUtils';
import { checkBuildingUnlocks as checkBuildingUnlocksFromUnlockManager } from '@/utils/unlockManager';

// Проверка условий разблокировки зданий (обертка над функцией из unlockManager)
export const checkBuildingUnlocks = (state: GameState): GameState => {
  console.log("Проверка разблокировки зданий через централизованную систему...");
  // Добавляем дополнительный лог для улучшения отладки
  console.log("Текущие здания и их статус разблокировки:", Object.entries(state.buildings)
    .map(([id, building]) => `${id}: ${building.unlocked ? 'Разблокировано' : 'Заблокировано'}`));
  return checkBuildingUnlocksFromUnlockManager(state);
};
