
import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { UnlockManager } from '@/systems/unlock/UnlockManager';

/**
 * Централизованный сервис для управления разблокировками контента в игре
 * Использует новую систему разблокировок
 */
export class UnlockManagerService {
  /**
   * Проверяет все разблокировки и применяет их к текущему состоянию
   */
  public static checkAllUnlocks(state: GameState): GameState {
    console.log("UnlockManagerService: Запуск проверки всех разблокировок");
    const unlockManager = new UnlockManager(state);
    return unlockManager.forceCheckAllUnlocks();
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
   * Проверяет разблокировку криптобиблиотеки
   */
  public static checkCryptoLibraryUnlock(state: GameState): boolean {
    const unlockManager = new UnlockManager(state);
    return unlockManager.isUnlocked('cryptoLibrary');
  }
  
  /**
   * Проверяет разблокировку системы охлаждения
   */
  public static checkCoolingSystemUnlock(state: GameState): boolean {
    const unlockManager = new UnlockManager(state);
    return unlockManager.isUnlocked('coolingSystem');
  }
  
  /**
   * Проверяет разблокировку улучшенного кошелька
   */
  public static checkEnhancedWalletUnlock(state: GameState): boolean {
    const unlockManager = new UnlockManager(state);
    return unlockManager.isUnlocked('enhancedWallet');
  }
}
