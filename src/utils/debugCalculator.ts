
import { GameState } from '@/context/types';
import { UnlockManager } from '@/systems/unlock/UnlockManager';

/**
 * Получает полную отладочную информацию о разблокировках
 */
export function debugUnlockStatus(state: GameState): { steps: string[], unlocked: string[], locked: string[] } {
  try {
    // Создаем менеджер с включенным режимом отладки
    const unlockManager = new UnlockManager(state, true);
    
    // Запускаем проверку всех разблокировок
    unlockManager.forceCheckAllUnlocks();
    
    // Получаем отладочную информацию
    return unlockManager.getUnlockReport();
  } catch (error) {
    console.error('Ошибка при анализе разблокировок:', error);
    return { 
      steps: [`Ошибка при анализе разблокировок: ${error}`],
      unlocked: [],
      locked: []
    };
  }
}

/**
 * Принудительно проверяет все разблокировки и возвращает обновленное состояние
 */
export function forceCheckUnlocks(state: GameState): GameState {
  try {
    const unlockManager = new UnlockManager(state);
    return unlockManager.forceCheckAllUnlocks();
  } catch (error) {
    console.error('Ошибка при проверке разблокировок:', error);
    return state;
  }
}

/**
 * Проверяет разблокировку конкретного элемента
 */
export function checkItemUnlock(state: GameState, itemId: string): boolean {
  try {
    const unlockManager = new UnlockManager(state);
    return unlockManager.isUnlocked(itemId);
  } catch (error) {
    console.error(`Ошибка при проверке разблокировки элемента ${itemId}:`, error);
    return false;
  }
}
