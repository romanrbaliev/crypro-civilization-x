
import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { 
  checkAllUnlocks, 
  checkSpecialUnlocks, 
  rebuildAllUnlocks 
} from '@/utils/unlockManager';

/**
 * Централизованный сервис для управления разблокировками контента в игре
 */
export class UnlockManagerService {
  /**
   * Проверяет все разблокировки и применяет их к текущему состоянию
   */
  public static checkAllUnlocks(state: GameState): GameState {
    console.log("UnlockManagerService: Запуск проверки всех разблокировок");
    return checkAllUnlocks(state);
  }
  
  /**
   * Проверяет специальные разблокировки, зависящие от конкретных условий
   */
  public static checkSpecialUnlocks(state: GameState): GameState {
    console.log("UnlockManagerService: Проверка специальных разблокировок");
    return checkSpecialUnlocks(state);
  }
  
  /**
   * Выполняет полное пересоздание всех разблокировок с нуля
   */
  public static rebuildAllUnlocks(state: GameState): GameState {
    console.log("UnlockManagerService: Полное пересоздание всех разблокировок");
    return rebuildAllUnlocks(state);
  }
  
  /**
   * Проверяет конкретную разблокировку исследований
   */
  public static checkResearchUnlock(state: GameState): boolean {
    // Исследования разблокируются после покупки генератора
    const hasGenerator = state.buildings.generator?.count > 0;
    const isUnlocked = state.unlocks.research === true;
    
    console.log(`UnlockManagerService: Проверка разблокировки исследований:
      - Есть генератор: ${hasGenerator ? "Да" : "Нет"}
      - Текущий статус разблокировки: ${isUnlocked ? "Разблокировано" : "Заблокировано"}
    `);
    
    return hasGenerator && !isUnlocked;
  }
  
  /**
   * Проверяет разблокировку криптобиблиотеки
   */
  public static checkCryptoLibraryUnlock(state: GameState): boolean {
    // Криптобиблиотека разблокируется после покупки "Основы криптовалют"
    const hasCryptoBasics = state.upgrades.cryptoCurrencyBasics?.purchased || 
                           state.upgrades.cryptoBasics?.purchased;
    
    const isUnlocked = state.buildings.cryptoLibrary?.unlocked === true;
    
    console.log(`UnlockManagerService: Проверка разблокировки криптобиблиотеки:
      - Куплены "Основы криптовалют": ${hasCryptoBasics ? "Да" : "Нет"}
      - Текущий статус разблокировки: ${isUnlocked ? "Разблокировано" : "Заблокировано"}
    `);
    
    return hasCryptoBasics && !isUnlocked;
  }
  
  /**
   * Проверяет разблокировку системы охлаждения
   */
  public static checkCoolingSystemUnlock(state: GameState): boolean {
    // Система охлаждения разблокируется после 2+ уровней домашнего компьютера
    const hasRequiredLevels = state.buildings.homeComputer?.count >= 2;
    const isUnlocked = state.buildings.coolingSystem?.unlocked === true;
    
    console.log(`UnlockManagerService: Проверка разблокировки системы охлаждения:
      - Компьютеров 2+ уровня: ${hasRequiredLevels ? "Да" : "Нет"}
      - Текущий статус разблокировки: ${isUnlocked ? "Разблокировано" : "Заблокировано"}
    `);
    
    return hasRequiredLevels && !isUnlocked;
  }
  
  /**
   * Проверяет разблокировку улучшенного кошелька
   */
  public static checkEnhancedWalletUnlock(state: GameState): boolean {
    // Улучшенный кошелек разблокируется после 5+ уровней криптокошелька
    const hasRequiredLevels = state.buildings.cryptoWallet?.count >= 5;
    const isUnlockedEnhanced = state.buildings.enhancedWallet?.unlocked === true;
    const isUnlockedImproved = state.buildings.improvedWallet?.unlocked === true;
    
    console.log(`UnlockManagerService: Проверка разблокировки улучшенного кошелька:
      - Криптокошельков 5+ уровня: ${hasRequiredLevels ? "Да" : "Нет"}
      - Текущий статус разблокировки (enhancedWallet): ${isUnlockedEnhanced ? "Разблокировано" : "Заблокировано"}
      - Текущий статус разблокировки (improvedWallet): ${isUnlockedImproved ? "Разблокировано" : "Заблокировано"}
    `);
    
    return hasRequiredLevels && (!isUnlockedEnhanced || !isUnlockedImproved);
  }
}
