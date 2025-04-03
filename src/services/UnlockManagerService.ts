
import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Централизованная система для управления разблокировками контента в игре.
 */
export class UnlockManagerService {
  /**
   * Проверяет все разблокировки и применяет их к текущему состоянию.
   * Это основной метод, который следует вызывать для полной проверки всех разблокировок.
   */
  public static checkAllUnlocks(state: GameState): GameState {
    console.log("🔓 UnlockManagerService: Запуск полной проверки разблокировок");
    
    let updatedState = { ...state };
    
    // Проверяем разблокировки ресурсов
    updatedState = this.checkResourceUnlocks(updatedState);
    
    // Проверяем разблокировки зданий
    updatedState = this.checkBuildingUnlocks(updatedState);
    
    // Проверяем разблокировки исследований
    updatedState = this.checkUpgradeUnlocks(updatedState);
    
    // Проверяем разблокировки интерфейса/вкладок
    updatedState = this.checkInterfaceUnlocks(updatedState);
    
    console.log("🔓 UnlockManagerService: Полная проверка разблокировок завершена");
    return updatedState;
  }
  
  /**
   * Проверяет разблокировки ресурсов
   */
  private static checkResourceUnlocks(state: GameState): GameState {
    console.log("🔓 UnlockManagerService: Проверка разблокировок ресурсов");
    
    let updatedState = { ...state };
    const unlocks = { ...state.unlocks };
    
    // Разблокировка USDT
    const applyKnowledgeCount = this.getCounterValue(state, 'applyKnowledge');
    if (applyKnowledgeCount >= 1 && !unlocks.usdt) {
      console.log("🔓 UnlockManagerService: Разблокировка USDT");
      unlocks.usdt = true;
      
      if (updatedState.resources.usdt) {
        updatedState.resources.usdt = {
          ...updatedState.resources.usdt,
          unlocked: true
        };
      }
    }
    
    // Разблокировка электричества (после покупки генератора)
    if (state.buildings.generator?.count > 0 && !unlocks.electricity) {
      console.log("🔓 UnlockManagerService: Разблокировка электричества");
      unlocks.electricity = true;
      
      if (updatedState.resources.electricity) {
        updatedState.resources.electricity = {
          ...updatedState.resources.electricity,
          unlocked: true
        };
      }
    }
    
    // Разблокировка вычислительной мощности (после покупки домашнего компьютера)
    if (state.buildings.homeComputer?.count > 0 && !unlocks.computingPower) {
      console.log("🔓 UnlockManagerService: Разблокировка вычислительной мощности");
      unlocks.computingPower = true;
      
      if (updatedState.resources.computingPower) {
        updatedState.resources.computingPower = {
          ...updatedState.resources.computingPower,
          unlocked: true
        };
      }
    }
    
    // Разблокировка Bitcoin (после покупки майнера)
    if (state.buildings.miner?.count > 0 && !unlocks.bitcoin) {
      console.log("🔓 UnlockManagerService: Разблокировка Bitcoin");
      unlocks.bitcoin = true;
      
      if (updatedState.resources.bitcoin) {
        updatedState.resources.bitcoin = {
          ...updatedState.resources.bitcoin,
          unlocked: true
        };
      }
    }
    
    return {
      ...updatedState,
      unlocks
    };
  }
  
  /**
   * Проверяет разблокировки зданий
   */
  private static checkBuildingUnlocks(state: GameState): GameState {
    console.log("🔓 UnlockManagerService: Проверка разблокировок зданий");
    
    let updatedState = { ...state };
    const buildings = { ...state.buildings };
    const unlocks = { ...state.unlocks };
    
    // Разблокировка "Практика" (после 2+ применений знаний)
    const applyKnowledgeCount = this.getCounterValue(state, 'applyKnowledge');
    if (applyKnowledgeCount >= 2 && buildings.practice && !buildings.practice.unlocked) {
      console.log("🔓 UnlockManagerService: Разблокировка Практики");
      buildings.practice.unlocked = true;
      unlocks.practice = true;
    }
    
    // Разблокировка "Генератор" (после накопления 11+ USDT)
    if (state.resources.usdt?.unlocked && state.resources.usdt?.value >= 11 && 
        buildings.generator && !buildings.generator.unlocked) {
      console.log("🔓 UnlockManagerService: Разблокировка Генератора");
      buildings.generator.unlocked = true;
      unlocks.generator = true;
    }
    
    // Разблокировка "Домашний компьютер" (после 50+ электричества)
    if (state.resources.electricity?.unlocked && state.resources.electricity?.value >= 50 && 
        buildings.homeComputer && !buildings.homeComputer.unlocked) {
      console.log("🔓 UnlockManagerService: Разблокировка Домашнего компьютера");
      buildings.homeComputer.unlocked = true;
      unlocks.homeComputer = true;
    }
    
    // Разблокировка "Криптобиблиотеки" (после покупки "Основы криптовалют")
    const hasCryptoBasics = state.upgrades.cryptoCurrencyBasics?.purchased || 
                           state.upgrades.cryptoBasics?.purchased;
    if (hasCryptoBasics && buildings.cryptoLibrary && !buildings.cryptoLibrary.unlocked) {
      console.log("🔓 UnlockManagerService: Разблокировка Криптобиблиотеки");
      buildings.cryptoLibrary.unlocked = true;
      unlocks.cryptoLibrary = true;
      safeDispatchGameEvent("Разблокирована криптобиблиотека", "success");
    }
    
    // Разблокировка "Системы охлаждения" (после 2+ уровней домашнего компьютера)
    if (state.buildings.homeComputer?.count >= 2 && 
        buildings.coolingSystem && !buildings.coolingSystem.unlocked) {
      console.log("🔓 UnlockManagerService: Разблокировка Системы охлаждения");
      buildings.coolingSystem.unlocked = true;
      unlocks.coolingSystem = true;
      safeDispatchGameEvent("Разблокирована система охлаждения", "success");
    }
    
    // Разблокировка "Улучшенного кошелька" (после 5+ уровней криптокошелька)
    if (state.buildings.cryptoWallet?.count >= 5) {
      if (buildings.enhancedWallet && !buildings.enhancedWallet.unlocked) {
        console.log("🔓 UnlockManagerService: Разблокировка Улучшенного кошелька (enhancedWallet)");
        buildings.enhancedWallet.unlocked = true;
        unlocks.enhancedWallet = true;
        safeDispatchGameEvent("Разблокирован улучшенный кошелек", "success");
      }
      
      if (buildings.improvedWallet && !buildings.improvedWallet.unlocked) {
        console.log("🔓 UnlockManagerService: Разблокировка Улучшенного кошелька (improvedWallet)");
        buildings.improvedWallet.unlocked = true;
        unlocks.improvedWallet = true;
        safeDispatchGameEvent("Разблокирован улучшенный кошелек", "success");
      }
    }
    
    return {
      ...updatedState,
      buildings,
      unlocks
    };
  }
  
  /**
   * Проверяет разблокировки исследований
   */
  private static checkUpgradeUnlocks(state: GameState): GameState {
    console.log("🔓 UnlockManagerService: Проверка разблокировок исследований");
    
    let updatedState = { ...state };
    const upgrades = { ...state.upgrades };
    
    // "Основы блокчейна" (после покупки генератора)
    if (state.buildings.generator?.count > 0) {
      const basicBlockchainIds = ['blockchainBasics', 'blockchain_basics', 'basicBlockchain'];
      
      for (const upgradeId of basicBlockchainIds) {
        if (upgrades[upgradeId] && !upgrades[upgradeId].unlocked) {
          console.log(`🔓 UnlockManagerService: Разблокировка исследования "${upgradeId}"`);
          upgrades[upgradeId].unlocked = true;
        }
      }
    }
    
    // "Безопасность криптокошельков" (после покупки криптокошелька)
    if (state.buildings.cryptoWallet?.count > 0) {
      const securityIds = ['walletSecurity', 'cryptoWalletSecurity'];
      
      for (const upgradeId of securityIds) {
        if (upgrades[upgradeId] && !upgrades[upgradeId].unlocked) {
          console.log(`🔓 UnlockManagerService: Разблокировка исследования "${upgradeId}"`);
          upgrades[upgradeId].unlocked = true;
        }
      }
    }
    
    // "Оптимизация алгоритмов" (после покупки майнера)
    if (state.buildings.miner?.count > 0) {
      const optimizationIds = ['optimizationAlgorithms', 'algorithmOptimization'];
      
      for (const upgradeId of optimizationIds) {
        if (upgrades[upgradeId] && !upgrades[upgradeId].unlocked) {
          console.log(`🔓 UnlockManagerService: Разблокировка исследования "${upgradeId}"`);
          upgrades[upgradeId].unlocked = true;
          safeDispatchGameEvent(`Разблокировано исследование "${upgrades[upgradeId].name}"`, "success");
        }
      }
    }
    
    return {
      ...updatedState,
      upgrades
    };
  }
  
  /**
   * Проверяет разблокировки интерфейса и вкладок
   */
  private static checkInterfaceUnlocks(state: GameState): GameState {
    console.log("🔓 UnlockManagerService: Проверка разблокировок интерфейса");
    
    let unlocks = { ...state.unlocks };
    
    // Разблокировка вкладки исследований (после покупки генератора)
    if (state.buildings.generator?.count > 0 && !unlocks.research) {
      console.log("🔓 UnlockManagerService: Разблокировка вкладки исследований");
      unlocks.research = true;
      safeDispatchGameEvent("Разблокирована вкладка исследований!", "success");
    }
    
    // Разблокировка обмена BTC (после получения Bitcoin)
    if (state.resources.bitcoin?.unlocked && state.resources.bitcoin?.value > 0 && !unlocks.exchangeBtc) {
      console.log("🔓 UnlockManagerService: Разблокировка обмена BTC");
      unlocks.exchangeBtc = true;
    }
    
    // Разблокировка вкладки специализации (при фазе >= 3)
    if (state.phase >= 3 && !unlocks.specialization) {
      console.log("🔓 UnlockManagerService: Разблокировка вкладки специализации");
      unlocks.specialization = true;
    }
    
    // Разблокировка рефералов (при покупке исследования cryptoCommunity)
    if (state.upgrades.cryptoCommunity?.purchased && !unlocks.referrals) {
      console.log("🔓 UnlockManagerService: Разблокировка рефералов");
      unlocks.referrals = true;
    }
    
    return {
      ...state,
      unlocks
    };
  }
  
  /**
   * Безопасно получает значение счетчика
   */
  private static getCounterValue(state: GameState, counterId: string): number {
    const counter = state.counters[counterId];
    if (!counter) return 0;
    return typeof counter === 'object' ? counter.value : counter;
  }
}
