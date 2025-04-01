
import { GameState } from '../../types';
import { safeDispatchGameEvent } from '../../utils/eventBusUtils';
import { checkBuildingUnlocks as checkBuildingUnlocksFromUnlockManager } from '@/utils/unlockManager';

// Проверка условий разблокировки зданий (обертка над функцией из unlockManager)
export const checkBuildingUnlocks = (state: GameState): GameState => {
  console.log("Проверка разблокировки зданий через централизованную систему...");
  
  // Добавляем дополнительный лог для улучшения отладки
  console.log("Текущие здания и их статус разблокировки:", Object.entries(state.buildings)
    .map(([id, building]) => `${id}: ${building.unlocked ? 'Разблокировано' : 'Заблокировано'}`));
  
  // Создаем копию состояния перед передачей в централизованную систему разблокировок
  const newState = { ...state };
  
  // Дополнительная проверка, чтобы электричество не разблокировалось до покупки генератора
  if (newState.buildings.generator && newState.buildings.generator.count === 0 
      && newState.unlocks.electricity) {
    console.log("Исправление: электричество должно быть разблокировано только после покупки генератора");
    
    newState.unlocks.electricity = false;
    
    if (newState.resources.electricity) {
      newState.resources.electricity = {
        ...newState.resources.electricity,
        unlocked: false
      };
    }
  }
  
  return checkBuildingUnlocksFromUnlockManager(newState);
};
