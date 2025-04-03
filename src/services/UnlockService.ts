
import { GameState } from '@/context/types';
import { 
  checkAllUnlocks, 
  rebuildAllUnlocks
} from '@/utils/unlockManager';

/**
 * Сервис для управления разблокировками элементов игры
 */
export class UnlockService {
  /**
   * Проверяет все разблокировки и обновляет состояние
   */
  checkAllUnlocks(state: GameState): GameState {
    console.log("UnlockService: Проверка всех разблокировок");
    
    // Проверка разблокировки ресурсов
    console.log("UnlockService: Проверка разблокировок ресурсов");
    const shouldUnlockUsdt = this.shouldUnlockUsdt(state);
    console.log("UnlockService - shouldUnlockUsdt:", {
      knowledgeClicksValue: this.getKnowledgeClickCount(state),
      applyKnowledgeCount: this.getApplyKnowledgeCount(state),
      usdtResourceExists: !!state.resources.usdt,
      usdtResourceUnlocked: state.resources.usdt?.unlocked || false,
      usdtFlagUnlocked: state.unlocks.usdt || false
    });
    console.log("UnlockService - shouldUnlockUsdt result:", shouldUnlockUsdt);
    
    // Проверка разблокировки зданий
    console.log("UnlockService: Проверка разблокировок зданий");
    const shouldUnlockPractice = this.shouldUnlockPractice(state);
    const shouldUnlockGenerator = this.shouldUnlockGenerator(state);
    
    // Добавляем проверки для недостающих зданий
    const shouldUnlockCryptoLibrary = this.shouldUnlockCryptoLibrary(state);
    const shouldUnlockCoolingSystem = this.shouldUnlockCoolingSystem(state);
    const shouldUnlockEnhancedWallet = this.shouldUnlockEnhancedWallet(state);
    
    console.log("UnlockService - shouldUnlockPractice:", {
      applyKnowledge: this.getApplyKnowledgeCount(state),
      practiceExists: !!state.buildings.practice,
      practiceUnlocked: state.buildings.practice?.unlocked ? "Да" : "Нет",
      practiceInUnlocks: state.unlocks.practice ? "Да" : "Нет",
      result: shouldUnlockPractice
    });
    console.log("UnlockService - shouldUnlockGenerator:", {
      usdtValue: state.resources.usdt?.value || 0,
      usdtUnlocked: state.resources.usdt?.unlocked || false,
      generatorUnlocked: state.buildings.generator?.unlocked ? "Да" : "Нет",
      result: shouldUnlockGenerator
    });
    
    // Логирование проверок для новых зданий
    console.log("UnlockService - shouldUnlockCryptoLibrary:", {
      cryptoBasicsPurchased: state.upgrades.cryptoCurrencyBasics?.purchased || state.upgrades.cryptoBasics?.purchased || false,
      cryptoLibraryExists: !!state.buildings.cryptoLibrary,
      cryptoLibraryUnlocked: state.buildings.cryptoLibrary?.unlocked ? "Да" : "Нет",
      result: shouldUnlockCryptoLibrary
    });
    console.log("UnlockService - shouldUnlockCoolingSystem:", {
      homeComputerCount: state.buildings.homeComputer?.count || 0,
      coolingSystemExists: !!state.buildings.coolingSystem,
      coolingSystemUnlocked: state.buildings.coolingSystem?.unlocked ? "Да" : "Нет",
      result: shouldUnlockCoolingSystem
    });
    console.log("UnlockService - shouldUnlockEnhancedWallet:", {
      cryptoWalletCount: state.buildings.cryptoWallet?.count || 0,
      enhancedWalletExists: !!state.buildings.enhancedWallet,
      enhancedWalletUnlocked: state.buildings.enhancedWallet?.unlocked ? "Да" : "Нет",
      result: shouldUnlockEnhancedWallet
    });
    
    // Проверка разблокировки улучшений и действий
    console.log("UnlockService: Проверка разблокировок улучшений и действий");
    
    // Используем утилиту unlockManager для проверки всех разблокировок
    return checkAllUnlocks(state);
  }
  
  /**
   * Выполняет полную перепроверку всех разблокировок с нуля
   */
  rebuildAllUnlocks(state: GameState): GameState {
    console.log("UnlockService: Полная перепроверка всех разблокировок");
    return rebuildAllUnlocks(state);
  }
  
  /**
   * Проверяет условия для разблокировки USDT (1+ применений знаний)
   * Обновлено согласно базе знаний
   */
  private shouldUnlockUsdt(state: GameState): boolean {
    const applyKnowledgeCount = this.getApplyKnowledgeCount(state);
    return applyKnowledgeCount >= 1; // Требуется 1+ применений знаний
  }
  
  /**
   * Проверяет условия для разблокировки Practice (2+ применений знаний)
   * Обновлено согласно базе знаний
   */
  private shouldUnlockPractice(state: GameState): boolean {
    const applyKnowledgeCount = this.getApplyKnowledgeCount(state);
    return applyKnowledgeCount >= 2; // Требуется 2+ применения знаний
  }
  
  /**
   * Проверяет условия для разблокировки Generator (11+ USDT)
   * Обновлено согласно базе знаний
   */
  private shouldUnlockGenerator(state: GameState): boolean {
    return (state.resources.usdt?.value || 0) >= 11 && 
           (state.resources.usdt?.unlocked === true); // Требуется накопление 11 USDT
  }
  
  /**
   * Проверяет условия для разблокировки домашнего компьютера (50+ электричества)
   * Добавлено согласно базе знаний
   */
  private shouldUnlockHomeComputer(state: GameState): boolean {
    return (state.resources.electricity?.value || 0) >= 50 && 
           (state.resources.electricity?.unlocked === true); // Требуется 50 единиц электричества
  }
  
  /**
   * Проверяет условия для разблокировки основ блокчейна (куплен генератор)
   * Добавлено согласно базе знаний
   */
  private shouldUnlockBlockchainBasics(state: GameState): boolean {
    return (state.buildings.generator?.count > 0) && 
           (state.buildings.generator?.unlocked === true); // Требуется покупка генератора
  }
  
  /**
   * Проверяет условия для разблокировки криптобиблиотеки (после исследования "Основы криптовалют")
   */
  private shouldUnlockCryptoLibrary(state: GameState): boolean {
    // Проверяем, приобретено ли исследование "Основы криптовалют" (может иметь разные ID)
    const hasCryptoBasics = 
      (state.upgrades.cryptoCurrencyBasics?.purchased === true) || 
      (state.upgrades.cryptoBasics?.purchased === true);
    
    return hasCryptoBasics;
  }
  
  /**
   * Проверяет условия для разблокировки системы охлаждения (2+ уровня домашнего компьютера)
   */
  private shouldUnlockCoolingSystem(state: GameState): boolean {
    return (state.buildings.homeComputer?.count >= 2);
  }
  
  /**
   * Проверяет условия для разблокировки улучшенного кошелька (5+ уровня криптокошелька)
   */
  private shouldUnlockEnhancedWallet(state: GameState): boolean {
    return (state.buildings.cryptoWallet?.count >= 5);
  }
  
  /**
   * Безопасно получает значение счетчика применения знаний
   */
  private getApplyKnowledgeCount(state: GameState): number {
    const counter = state.counters.applyKnowledge;
    if (!counter) return 0;
    return typeof counter === 'object' ? counter.value : counter;
  }
  
  /**
   * Безопасно получает значение счетчика кликов знаний
   */
  private getKnowledgeClickCount(state: GameState): number {
    const counter = state.counters.knowledgeClicks;
    if (!counter) return 0;
    return typeof counter === 'object' ? counter.value : counter;
  }
}
