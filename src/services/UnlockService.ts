
import { GameState } from '@/context/types';
import { UnlockManager } from '@/systems/unlock/UnlockManager';

/**
 * Сервис для управления разблокировками элементов игры
 * Является адаптером между новой системой разблокировок и старым кодом
 */
export class UnlockService {
  /**
   * Проверяет все разблокировки и обновляет состояние
   */
  checkAllUnlocks(state: GameState): GameState {
    console.log("UnlockService: Проверка всех разблокировок через новую систему");
    
    // Используем новую систему разблокировок
    const unlockManager = new UnlockManager(state);
    return unlockManager.forceCheckAllUnlocks();
  }
  
  /**
   * Выполняет полную перепроверку всех разблокировок с нуля
   */
  rebuildAllUnlocks(state: GameState): GameState {
    console.log("UnlockService: Полная перепроверка всех разблокировок");
    
    // Используем новую систему разблокировок
    const unlockManager = new UnlockManager(state);
    return unlockManager.forceCheckAllUnlocks();
  }
  
  /**
   * Проверяет, разблокирован ли элемент
   */
  isUnlocked(state: GameState, itemId: string): boolean {
    // Используем новую систему разблокировок
    const unlockManager = new UnlockManager(state);
    return unlockManager.isUnlocked(itemId);
  }
  
  /**
   * Принудительно разблокирует элемент
   */
  forceUnlock(state: GameState, itemId: string): GameState {
    // Используем новую систему разблокировок
    const unlockManager = new UnlockManager(state);
    return unlockManager.forceUnlock(itemId);
  }
}
