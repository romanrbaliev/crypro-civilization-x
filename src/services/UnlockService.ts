
import { GameState } from '@/context/types';
import { UnlockManager } from '@/systems/unlock/UnlockManager';

/**
 * Сервис для управления разблокировками элементов игры
 * Использует централизованную систему разблокировок
 */
export class UnlockService {
  /**
   * Проверяет все разблокировки и обновляет состояние
   */
  checkAllUnlocks(state: GameState): GameState {
    console.log("UnlockService: Проверка всех разблокировок через централизованную систему");
    
    // Используем централизованную систему разблокировок
    const unlockManager = new UnlockManager(state);
    return unlockManager.updateGameState(state);
  }
  
  /**
   * Выполняет полную перепроверку всех разблокировок с нуля
   */
  rebuildAllUnlocks(state: GameState): GameState {
    console.log("UnlockService: Полная перепроверка всех разблокировок");
    
    // Используем централизованную систему разблокировок
    const unlockManager = new UnlockManager(state);
    return unlockManager.forceCheckAllUnlocks();
  }
  
  /**
   * Проверяет, разблокирован ли элемент
   */
  isUnlocked(state: GameState, itemId: string): boolean {
    // Используем централизованную систему разблокировок
    const unlockManager = new UnlockManager(state);
    return unlockManager.isUnlocked(itemId);
  }
  
  /**
   * Принудительно разблокирует элемент
   */
  forceUnlock(state: GameState, itemId: string): GameState {
    // Используем централизованную систему разблокировок
    const unlockManager = new UnlockManager(state);
    return unlockManager.forceUnlock(itemId);
  }
  
  /**
   * Получает полный отчет о разблокировках для отладки
   */
  getDebugReport(state: GameState): { steps: string[], unlocked: string[], locked: string[] } {
    const unlockManager = new UnlockManager(state, true);
    unlockManager.forceCheckAllUnlocks();
    return unlockManager.getUnlockReport();
  }
}
