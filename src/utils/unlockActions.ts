
import { GameState } from '@/context/types';
import { UnlockManagerService } from '@/services/UnlockManagerService';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { UnlockManager } from '@/systems/unlock/UnlockManager';

/**
 * Принудительно проверяет и применяет все разблокировки
 */
export function forceCheckAllUnlocks(state: GameState): GameState {
  console.log("UnlockActions: Принудительная проверка всех разблокировок");
  
  // Используем новую систему разблокировок
  const unlockManager = new UnlockManager(state);
  let updatedState = unlockManager.forceCheckAllUnlocks();
  
  // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Проверяем и добавляем свойство cost для новых зданий
  updatedState = ensureBuildingsCostProperty(updatedState);
  
  return updatedState;
}

/**
 * Проверяет наличие продвинутых разблокировок
 */
export function forceCheckAdvancedUnlocks(state: GameState): GameState {
  console.log("UnlockActions: Проверка продвинутых разблокировок");
  
  // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Проверяем и добавляем свойство cost для новых зданий
  let updatedState = ensureBuildingsCostProperty(state);
  
  // Используем новую систему разблокировок
  const unlockManager = new UnlockManager(updatedState);
  return unlockManager.forceCheckAllUnlocks();
}

/**
 * Проверяет и добавляет свойство cost для всех зданий, у которых его нет
 */
function ensureBuildingsCostProperty(state: GameState): GameState {
  const newState = { ...state };
  
  // Проверяем все здания и добавляем свойство cost там, где его нет
  for (const buildingKey in newState.buildings) {
    const building = newState.buildings[buildingKey];
    
    if (building && !building.cost) {
      console.log(`ensureBuildingsCostProperty: Добавляем свойство cost для здания ${buildingKey}`);
      
      // Если у здания есть baseCost, используем его значение
      if (building.baseCost) {
        newState.buildings[buildingKey] = {
          ...building,
          cost: { ...building.baseCost }
        };
      } else {
        // Если baseCost отсутствует, создаем пустой объект cost для предотвращения ошибок
        newState.buildings[buildingKey] = {
          ...building,
          cost: {}
        };
      }
    }
  }
  
  return newState;
}
