import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { ensureUnlocksExist } from './unlockHelper';

/**
 * Централизованная система для управления всеми разблокировками в игре
 */
export class UnlockManager {
  /**
   * Проверяет все возможные разблокировки и обновляет состояние
   */
  checkAllUnlocks(state: GameState): GameState {
    console.log("UnlockManager: Проверка всех разблокировок");
    
    // Создаем глубокую копию состояния для модификации
    let newState = { ...state };
    
    // Последовательно проверяем разблокировки разных типов
    newState = this.checkResourceUnlocks(newState);
    newState = this.checkBuildingUnlocks(newState);
    newState = this.checkUpgradeUnlocks(newState);
    
    // Обеспечиваем обратную совместимость
    newState = ensureUnlocksExist(newState);
    
    return newState;
  }
  
  /**
   * Проверяет разблокировки ресурсов
   */
  checkResourceUnlocks(state: GameState): GameState {
    const newState = { ...state };
    const resources = { ...state.resources };
    
    // 1. Проверка разблокировки USDT (после 1+ применений знаний)
    const applyKnowledgeCount = this.getCounterValue(state, 'applyKnowledge');
    if (applyKnowledgeCount >= 1 && !resources.usdt.unlocked) {
      resources.usdt.unlocked = true;
      safeDispatchGameEvent({
        message: `Разблокирован ресурс: ${resources.usdt.name}`,
        type: 'info'
      });
    }
    
    // 2. Проверка разблокировки Электричества (после покупки генератора)
    if (state.buildings.generator && state.buildings.generator.count > 0 && !resources.electricity.unlocked) {
      resources.electricity.unlocked = true;
      safeDispatchGameEvent({
        message: `Разблокирован ресурс: ${resources.electricity.name}`,
        type: 'info'
      });
    }
    
    // 3. Проверка разблокировки Вычислительной мощности (после покупки компьютера)
    if (state.buildings.homeComputer && state.buildings.homeComputer.count > 0 && !resources.computingPower.unlocked) {
      resources.computingPower.unlocked = true;
      safeDispatchGameEvent({
        message: `Разблокирован ресурс: ${resources.computingPower.name}`,
        type: 'info'
      });
    }
    
    // 4. Проверка разблокировки Bitcoin (после исследования криптовалют)
    if ((state.upgrades.cryptoBasics && state.upgrades.cryptoBasics.purchased) && !resources.bitcoin.unlocked) {
      resources.bitcoin.unlocked = true;
      safeDispatchGameEvent({
        message: `Разблокирован ресурс: ${resources.bitcoin.name}`,
        type: 'info'
      });
    }
    
    newState.resources = resources;
    return newState;
  }
  
  /**
   * Проверяет разблокировки зданий
   */
  checkBuildingUnlocks(state: GameState): GameState {
    const newState = { ...state };
    const buildings = { ...state.buildings };
    
    // 1. Проверка разблокировки здания "Практика" (2+ применений знаний)
    const applyKnowledgeCount = this.getCounterValue(state, 'applyKnowledge');
    if (applyKnowledgeCount >= 2 && buildings.practice && !buildings.practice.unlocked) {
      buildings.practice.unlocked = true;
      safeDispatchGameEvent({
        message: `Разблокировано здание: ${buildings.practice.name}`,
        type: 'info'
      });
    }
    
    // 2. Проверка разблокировки здания "Генератор" (11+ USDT)
    if (state.resources.usdt && 
        state.resources.usdt.value >= 11 && 
        state.resources.usdt.unlocked && 
        buildings.generator && 
        !buildings.generator.unlocked) {
      buildings.generator.unlocked = true;
      safeDispatchGameEvent({
        message: `Разблокировано здание: ${buildings.generator.name}`,
        type: 'info'
      });
    }
    
    // 3. Проверка разблокировки здания "Домашний компьютер" (50+ электричества)
    if (state.resources.electricity && 
        state.resources.electricity.value >= 50 && 
        state.resources.electricity.unlocked && 
        buildings.homeComputer && 
        !buildings.homeComputer.unlocked) {
      buildings.homeComputer.unlocked = true;
      safeDispatchGameEvent({
        message: `Разблокировано здание: ${buildings.homeComputer.name}`,
        type: 'info'
      });
    }
    
    // 4. Проверка разблокировки здания "Криптокошелек" (после исследования "Основы блокчейна")
    if (state.upgrades.blockchainBasics && 
        state.upgrades.blockchainBasics.purchased && 
        buildings.cryptoWallet && 
        !buildings.cryptoWallet.unlocked) {
      buildings.cryptoWallet.unlocked = true;
      safeDispatchGameEvent({
        message: `Разблокировано здание: ${buildings.cryptoWallet.name}`,
        type: 'info'
      });
    }
    
    // 5. Проверка разблокировки здания "Интернет-канал" (после покупки компьютера)
    if (state.buildings.homeComputer && 
        state.buildings.homeComputer.count > 0 && 
        buildings.internetChannel && 
        !buildings.internetChannel.unlocked) {
      buildings.internetChannel.unlocked = true;
      safeDispatchGameEvent({
        message: `Разблокировано здание: ${buildings.internetChannel.name}`,
        type: 'info'
      });
    }
    
    // 6. Проверка разблокировки "Майнера" (после исследования "Основы криптовалют")
    if (state.upgrades.cryptoBasics && 
        state.upgrades.cryptoBasics.purchased && 
        buildings.miner && 
        !buildings.miner.unlocked) {
      buildings.miner.unlocked = true;
      safeDispatchGameEvent({
        message: `Разблокировано здание: ${buildings.miner.name}`,
        type: 'info'
      });
    }
    
    // 7. Проверка разблокировки "Криптобиблиотеки" (после исследования "Основы криптовалют")
    if (state.upgrades.cryptoBasics && 
        state.upgrades.cryptoBasics.purchased && 
        buildings.cryptoLibrary && 
        !buildings.cryptoLibrary.unlocked) {
      buildings.cryptoLibrary.unlocked = true;
      safeDispatchGameEvent({
        message: `Разблокировано здание: ${buildings.cryptoLibrary.name}`,
        type: 'info'
      });
    }
    
    // 8. Проверка разблокировки "ASIC-майнера" (после покупки обычного майнера)
    if (state.buildings.miner && 
        state.buildings.miner.count > 0 && 
        buildings.asicMiner && 
        !buildings.asicMiner.unlocked) {
      buildings.asicMiner.unlocked = true;
      safeDispatchGameEvent({
        message: `Разблокировано здание: ${buildings.asicMiner.name}`,
        type: 'info'
      });
    }
    
    // 9. Проверка разблокировки "Системы охлаждения" (после 2+ уровня домашнего компьютера)
    if (state.buildings.homeComputer && 
        state.buildings.homeComputer.count >= 2 && 
        buildings.coolingSystem && 
        !buildings.coolingSystem.unlocked) {
      buildings.coolingSystem.unlocked = true;
      safeDispatchGameEvent({
        message: `Разблокировано здание: ${buildings.coolingSystem.name}`,
        type: 'info'
      });
    }
    
    // 10. Проверка разблокировки "Улучшенного кошелька" (после 5+ уровня криптокошелька)
    if (state.buildings.cryptoWallet && 
        state.buildings.cryptoWallet.count >= 5 && 
        buildings.enhancedWallet && 
        !buildings.enhancedWallet.unlocked) {
      buildings.enhancedWallet.unlocked = true;
      safeDispatchGameEvent({
        message: `Разблокировано здание: ${buildings.enhancedWallet.name}`,
        type: 'info'
      });
    }
    
    newState.buildings = buildings;
    return newState;
  }
  
  /**
   * Проверяет разблокировки исследований
   */
  checkUpgradeUnlocks(state: GameState): GameState {
    const newState = { ...state };
    const upgrades = { ...state.upgrades };
    
    // 1. Проверка разблокировки исследования "Основы блокчейна" (после покупки генератора)
    if (state.buildings.generator && 
        state.buildings.generator.count > 0 && 
        upgrades.blockchainBasics && 
        !upgrades.blockchainBasics.unlocked) {
      upgrades.blockchainBasics.unlocked = true;
      safeDispatchGameEvent({
        message: `Разблокировано исследование: ${upgrades.blockchainBasics.name}`,
        type: 'info'
      });
    }
    
    // 2. Проверка разблокировки исследования "Безопасность криптокошельков" (после покупки кошелька)
    if (state.buildings.cryptoWallet && 
        state.buildings.cryptoWallet.count > 0 && 
        upgrades.walletSecurity && 
        !upgrades.walletSecurity.unlocked) {
      upgrades.walletSecurity.unlocked = true;
      safeDispatchGameEvent({
        message: `Разблокировано исследование: ${upgrades.walletSecurity.name}`,
        type: 'info'
      });
    }
    
    // 3. Проверка разблокировки исследования "Основы криптовалют" (после 2+ уровня криптокошелька)
    if (state.buildings.cryptoWallet && 
        state.buildings.cryptoWallet.count >= 2 && 
        upgrades.cryptoBasics && 
        !upgrades.cryptoBasics.unlocked) {
      upgrades.cryptoBasics.unlocked = true;
      safeDispatchGameEvent({
        message: `Разблокировано исследование: ${upgrades.cryptoBasics.name}`,
        type: 'info'
      });
    }
    
    // 4. Проверка разблокировки "Оптимизация алгоритмов" (после покупки майнера)
    if (state.buildings.miner && 
        state.buildings.miner.count > 0 && 
        upgrades.algorithmOptimization && 
        !upgrades.algorithmOptimization.unlocked) {
      upgrades.algorithmOptimization.unlocked = true;
      safeDispatchGameEvent({
        message: `Разблокировано исследование: ${upgrades.algorithmOptimization.name}`,
        type: 'info'
      });
    }
    
    // 5. Проверка разблокировки "Proof of Work" (после исследования "Оптимизация алгоритмов")
    if (state.upgrades.algorithmOptimization && 
        state.upgrades.algorithmOptimization.purchased && 
        upgrades.proofOfWork && 
        !upgrades.proofOfWork.unlocked) {
      upgrades.proofOfWork.unlocked = true;
      safeDispatchGameEvent({
        message: `Разблокировано исследование: ${upgrades.proofOfWork.name}`,
        type: 'info'
      });
    }
    
    // 6. Проверка разблокировки "Энергоэффективные компоненты" (после покупки системы охлаждения)
    if (state.buildings.coolingSystem && 
        state.buildings.coolingSystem.count > 0 && 
        upgrades.energyEfficientComponents && 
        !upgrades.energyEfficientComponents.unlocked) {
      upgrades.energyEfficientComponents.unlocked = true;
      safeDispatchGameEvent({
        message: `Разблокировано исследование: ${upgrades.energyEfficientComponents.name}`,
        type: 'info'
      });
    }
    
    // 7. Проверка разблокировки "Криптовалютный трейдинг" (после покупки улучшенного кошелька)
    if (state.buildings.enhancedWallet && 
        state.buildings.enhancedWallet.count > 0 && 
        upgrades.cryptoTrading && 
        !upgrades.cryptoTrading.unlocked) {
      upgrades.cryptoTrading.unlocked = true;
      safeDispatchGameEvent({
        message: `Разблокировано исследование: ${upgrades.cryptoTrading.name}`,
        type: 'info'
      });
    }
    
    // 8. Проверка разблокировки "Торговый бот" (после исследования "Криптовалютный трейдинг")
    if (state.upgrades.cryptoTrading && 
        state.upgrades.cryptoTrading.purchased && 
        upgrades.tradingBot && 
        !upgrades.tradingBot.unlocked) {
      upgrades.tradingBot.unlocked = true;
      safeDispatchGameEvent({
        message: `Разблокировано исследование: ${upgrades.tradingBot.name}`,
        type: 'info'
      });
    }
    
    newState.upgrades = upgrades;
    return newState;
  }
  
  /**
   * Безопасно получает значение счетчика
   */
  private getCounterValue(state: GameState, counterId: string): number {
    const counter = state.counters?.[counterId];
    if (!counter) return 0;
    
    return typeof counter === 'object' ? counter.value : counter;
  }
  
  /**
   * Форсированно проверяет все разблокировки
   */
  forceCheckAllUnlocks(state: GameState): GameState {
    return this.checkAllUnlocks(state);
  }
  
  /**
   * Отладочная функция для вывода статуса разблокировок
   */
  debugUnlockStatus(state: GameState): Record<string, any> {
    return {
      resources: Object.fromEntries(
        Object.entries(state.resources).map(([id, r]) => [id, r.unlocked])
      ),
      buildings: Object.fromEntries(
        Object.entries(state.buildings).map(([id, b]) => [id, b.unlocked])
      ),
      upgrades: Object.fromEntries(
        Object.entries(state.upgrades).map(([id, u]) => [id, { unlocked: u.unlocked, purchased: u.purchased }])
      ),
      counters: state.counters
    };
  }
}

// Создаем экземпляр менеджера для экспорта
const unlockManager = new UnlockManager();

// Экспортируем функцию для проверки всех разблокировок
export const checkAllUnlocks = (state: GameState): GameState => {
  return unlockManager.checkAllUnlocks(state);
};

// Экспортируем функцию для форсированной проверки разблокировок
export const forceCheckAllUnlocks = (state: GameState): GameState => {
  return unlockManager.forceCheckAllUnlocks(state);
};

// Экспортируем отдельные функции проверки для обратной совместимости
export const checkBuildingUnlocks = (state: GameState): GameState => {
  return unlockManager.checkBuildingUnlocks(state);
};

export const checkResourceUnlocks = (state: GameState): GameState => {
  return unlockManager.checkResourceUnlocks(state);
};

export const checkUpgradeUnlocks = (state: GameState): GameState => {
  return unlockManager.checkUpgradeUnlocks(state);
};

// Экспортируем функцию отладки
export const debugUnlockStatus = (state: GameState): Record<string, any> => {
  return unlockManager.debugUnlockStatus(state);
};

// Заглушки для обратной совместимости
export const checkActionUnlocks = (state: GameState): GameState => {
  return checkAllUnlocks(state);
};

export const checkSpecialUnlocks = (state: GameState): GameState => {
  return checkAllUnlocks(state);
};

// Функция для обновления состояния через проверку всех разблокировок
export const rebuildAllUnlocks = (state: GameState): GameState => {
  return checkAllUnlocks(state);
};
