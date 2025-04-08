
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
    const shouldUnlockHomeComputer = this.shouldUnlockHomeComputer(state);
    const shouldUnlockCryptoWallet = this.shouldUnlockCryptoWallet(state);
    const shouldUnlockInternetChannel = this.shouldUnlockInternetChannel(state);
    const shouldUnlockMiner = this.shouldUnlockMiner(state);
    const shouldUnlockCryptoLibrary = this.shouldUnlockCryptoLibrary(state);
    const shouldUnlockCoolingSystem = this.shouldUnlockCoolingSystem(state);
    const shouldUnlockEnhancedWallet = this.shouldUnlockEnhancedWallet(state);
    
    console.log("UnlockService - разблокировка зданий:", {
      practice: shouldUnlockPractice,
      generator: shouldUnlockGenerator,
      homeComputer: shouldUnlockHomeComputer,
      cryptoWallet: shouldUnlockCryptoWallet,
      internetChannel: shouldUnlockInternetChannel,
      miner: shouldUnlockMiner,
      cryptoLibrary: shouldUnlockCryptoLibrary,
      coolingSystem: shouldUnlockCoolingSystem,
      enhancedWallet: shouldUnlockEnhancedWallet
    });
    
    // Проверка разблокировки улучшений
    console.log("UnlockService: Проверка разблокировок улучшений");
    const shouldUnlockBlockchainBasics = this.shouldUnlockBlockchainBasics(state);
    const shouldUnlockCryptoWalletSecurity = this.shouldUnlockCryptoWalletSecurity(state);
    const shouldUnlockCryptoCurrencyBasics = this.shouldUnlockCryptoCurrencyBasics(state);
    const shouldUnlockAlgorithmOptimization = this.shouldUnlockAlgorithmOptimization(state);
    const shouldUnlockProofOfWork = this.shouldUnlockProofOfWork(state);
    const shouldUnlockEnergyEfficientComponents = this.shouldUnlockEnergyEfficientComponents(state);
    const shouldUnlockCryptoTrading = this.shouldUnlockCryptoTrading(state);
    const shouldUnlockTradingBot = this.shouldUnlockTradingBot(state);
    
    console.log("UnlockService - разблокировка улучшений:", {
      blockchainBasics: shouldUnlockBlockchainBasics,
      cryptoWalletSecurity: shouldUnlockCryptoWalletSecurity,
      cryptoCurrencyBasics: shouldUnlockCryptoCurrencyBasics,
      algorithmOptimization: shouldUnlockAlgorithmOptimization,
      proofOfWork: shouldUnlockProofOfWork,
      energyEfficientComponents: shouldUnlockEnergyEfficientComponents,
      cryptoTrading: shouldUnlockCryptoTrading,
      tradingBot: shouldUnlockTradingBot
    });
    
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
   * Проверяет условия для разблокировки криптокошелька (после исследования "Основы блокчейна")
   * Добавлено согласно базе знаний
   */
  private shouldUnlockCryptoWallet(state: GameState): boolean {
    return (state.upgrades.blockchainBasics?.purchased === true || 
            state.upgrades.basicBlockchain?.purchased === true); // Требуется исследование "Основы блокчейна"
  }
  
  /**
   * Проверяет условия для разблокировки интернет-канала (после покупки домашнего компьютера)
   * Добавлено согласно базе знаний
   */
  private shouldUnlockInternetChannel(state: GameState): boolean {
    return (state.buildings.homeComputer?.count > 0);
  }
  
  /**
   * Проверяет условия для разблокировки майнера (после "Основы криптовалют")
   * Добавлено согласно базе знаний
   */
  private shouldUnlockMiner(state: GameState): boolean {
    return (state.upgrades.cryptoCurrencyBasics?.purchased === true || 
            state.upgrades.cryptoBasics?.purchased === true);
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
   * Проверяет условия для разблокировки безопасности криптокошельков (после покупки криптокошелька)
   * Добавлено согласно базе знаний
   */
  private shouldUnlockCryptoWalletSecurity(state: GameState): boolean {
    return (state.buildings.cryptoWallet?.count > 0 || 
            state.buildings.wallet?.count > 0);
  }
  
  /**
   * Проверяет условия для разблокировки основ криптовалют (после достижения 2 уровня криптокошелька)
   * Добавлено согласно базе знаний
   */
  private shouldUnlockCryptoCurrencyBasics(state: GameState): boolean {
    return (state.buildings.cryptoWallet?.count >= 2 || 
            state.buildings.wallet?.count >= 2);
  }
  
  /**
   * Проверяет условия для разблокировки оптимизации алгоритмов (после покупки майнера)
   * Добавлено согласно базе знаний
   */
  private shouldUnlockAlgorithmOptimization(state: GameState): boolean {
    return (state.buildings.miner?.count > 0);
  }
  
  /**
   * Проверяет условия для разблокировки Proof of Work (после Оптимизации алгоритмов)
   * Добавлено согласно базе знаний
   */
  private shouldUnlockProofOfWork(state: GameState): boolean {
    return (state.upgrades.algorithmOptimization?.purchased === true);
  }
  
  /**
   * Проверяет условия для разблокировки криптобиблиотеки (после исследования "Основы криптовалют")
   * Добавлено согласно базе знаний
   */
  private shouldUnlockCryptoLibrary(state: GameState): boolean {
    return (state.upgrades.cryptoCurrencyBasics?.purchased === true || 
            state.upgrades.cryptoBasics?.purchased === true);
  }
  
  /**
   * Проверяет условия для разблокировки системы охлаждения (после 2-го уровня домашнего компьютера)
   * Добавлено согласно базе знаний
   */
  private shouldUnlockCoolingSystem(state: GameState): boolean {
    return (state.buildings.homeComputer?.count >= 2);
  }
  
  /**
   * Проверяет условия для разблокировки улучшенного кошелька (после 5-го уровня криптокошелька)
   * Добавлено согласно базе знаний
   */
  private shouldUnlockEnhancedWallet(state: GameState): boolean {
    return (state.buildings.cryptoWallet?.count >= 5);
  }
  
  /**
   * Проверяет условия для разблокировки энергоэффективных компонентов (после системы охлаждения)
   * Добавлено согласно базе знаний
   */
  private shouldUnlockEnergyEfficientComponents(state: GameState): boolean {
    return (state.buildings.coolingSystem?.count > 0);
  }
  
  /**
   * Проверяет условия для разблокировки криптотрейдинга (после улучшенного кошелька)
   * Добавлено согласно базе знаний
   */
  private shouldUnlockCryptoTrading(state: GameState): boolean {
    return (state.buildings.enhancedWallet?.count > 0);
  }
  
  /**
   * Проверяет условия для разблокировки торгового бота (после криптотрейдинга)
   * Добавлено согласно базе знаний
   */
  private shouldUnlockTradingBot(state: GameState): boolean {
    return (state.upgrades.cryptoTrading?.purchased === true);
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
