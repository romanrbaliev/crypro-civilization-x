
import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { UnlockManager } from '@/utils/unifiedUnlockSystem';

/**
 * Централизованный сервис для управления разблокировками контента в игре
 * Использует централизованную систему разблокировок
 */
export class UnlockManagerService {
  /**
   * Проверяет все разблокировки и применяет их к текущему состоянию
   */
  public static checkAllUnlocks(state: GameState): GameState {
    console.log("UnlockManagerService: Запуск проверки всех разблокировок");
    const unlockManager = new UnlockManager(state);
    return unlockManager.updateGameState(state);
  }
  
  /**
   * Проверяет специальные разблокировки, зависящие от конкретных условий
   */
  public static checkSpecialUnlocks(state: GameState): GameState {
    console.log("UnlockManagerService: Проверка специальных разблокировок");
    return this.checkAllUnlocks(state);
  }
  
  /**
   * Выполняет полное пересоздание всех разблокировок с нуля
   */
  public static rebuildAllUnlocks(state: GameState): GameState {
    console.log("UnlockManagerService: Полное пересоздание всех разблокировок");
    const unlockManager = new UnlockManager(state);
    return unlockManager.forceCheckAllUnlocks();
  }
  
  /**
   * Проверяет конкретную разблокировку исследований
   */
  public static checkResearchUnlock(state: GameState): boolean {
    const unlockManager = new UnlockManager(state);
    return unlockManager.isUnlocked('research');
  }
  
  /**
   * Проверяет разблокировку любого элемента
   */
  public static checkItemUnlock(state: GameState, itemId: string): boolean {
    const unlockManager = new UnlockManager(state);
    return unlockManager.isUnlocked(itemId);
  }
  
  /**
   * Получает полный отчет о разблокировках для отладки
   */
  public static getDebugReport(state: GameState): { steps: string[], unlocked: string[], locked: string[] } {
    const unlockManager = new UnlockManager(state, true);
    unlockManager.forceCheckAllUnlocks();
    return unlockManager.getUnlockReport();
  }
}
