
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
        messageKey: 'event.resourceUnlocked',
        type: 'info',
        params: { name: resources.usdt.name }
      });
    }
    
    // 2. Проверка разблокировки Электричества (после покупки генератора)
    if (state.buildings.generator && state.buildings.generator.count > 0 && !resources.electricity.unlocked) {
      resources.electricity.unlocked = true;
      safeDispatchGameEvent({
        messageKey: 'event.resourceUnlocked',
        type: 'info',
        params: { name: resources.electricity.name }
      });
    }
    
    // 3. Проверка разблокировки Вычислительной мощности (после покупки компьютера)
    if (state.buildings.homeComputer && state.buildings.homeComputer.count > 0 && !resources.computingPower.unlocked) {
      resources.computingPower.unlocked = true;
      safeDispatchGameEvent({
        messageKey: 'event.resourceUnlocked',
        type: 'info',
        params: { name: resources.computingPower.name }
      });
    }
    
    // 4. Проверка разблокировки Bitcoin (после исследования криптовалют)
    if ((state.upgrades.cryptoBasics && state.upgrades.cryptoBasics.purchased) && !resources.bitcoin.unlocked) {
      resources.bitcoin.unlocked = true;
      safeDispatchGameEvent({
        messageKey: 'event.resourceUnlocked',
        type: 'info',
        params: { name: resources.bitcoin.name }
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
        messageKey: 'event.buildingUnlocked',
        type: 'info',
        params: { name: buildings.practice.name }
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
        messageKey: 'event.buildingUnlocked',
        type: 'info',
        params: { name: buildings.generator.name }
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
        messageKey: 'event.buildingUnlocked',
        type: 'info',
        params: { name: buildings.homeComputer.name }
      });
    }
    
    // 4. Проверка разблокировки здания "Криптокошелек" (после исследования "Основы блокчейна")
    if (state.upgrades.blockchainBasics && 
        state.upgrades.blockchainBasics.purchased && 
        buildings.cryptoWallet && 
        !buildings.cryptoWallet.unlocked) {
      buildings.cryptoWallet.unlocked = true;
      safeDispatchGameEvent({
        messageKey: 'event.buildingUnlocked',
        type: 'info',
        params: { name: buildings.cryptoWallet.name }
      });
    }
    
    // 5. Проверка разблокировки здания "Интернет-канал" (после покупки компьютера)
    if (state.buildings.homeComputer && 
        state.buildings.homeComputer.count > 0 && 
        buildings.internetChannel && 
        !buildings.internetChannel.unlocked) {
      buildings.internetChannel.unlocked = true;
      safeDispatchGameEvent({
        messageKey: 'event.buildingUnlocked',
        type: 'info',
        params: { name: buildings.internetChannel.name }
      });
    }
    
    // 6. Проверка разблокировки "Майнера" (после исследования "Основы криптовалют")
    if (state.upgrades.cryptoBasics && 
        state.upgrades.cryptoBasics.purchased && 
        buildings.miner && 
        !buildings.miner.unlocked) {
      buildings.miner.unlocked = true;
      safeDispatchGameEvent({
        messageKey: 'event.buildingUnlocked',
        type: 'info',
        params: { name: buildings.miner.name }
      });
    }
    
    // 7. Проверка разблокировки "Криптобиблиотеки" (после исследования "Основы криптовалют")
    if (state.upgrades.cryptoBasics && 
        state.upgrades.cryptoBasics.purchased && 
        buildings.cryptoLibrary && 
        !buildings.cryptoLibrary.unlocked) {
      buildings.cryptoLibrary.unlocked = true;
      safeDispatchGameEvent({
        messageKey: 'event.buildingUnlocked',
        type: 'info',
        params: { name: buildings.cryptoLibrary.name }
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
        messageKey: 'event.upgradeUnlocked',
        type: 'info',
        params: { name: upgrades.blockchainBasics.name }
      });
    }
    
    // 2. Проверка разблокировки исследования "Безопасность криптокошельков" (после покупки кошелька)
    if (state.buildings.cryptoWallet && 
        state.buildings.cryptoWallet.count > 0 && 
        upgrades.walletSecurity && 
        !upgrades.walletSecurity.unlocked) {
      upgrades.walletSecurity.unlocked = true;
      safeDispatchGameEvent({
        messageKey: 'event.upgradeUnlocked',
        type: 'info',
        params: { name: upgrades.walletSecurity.name }
      });
    }
    
    // 3. Проверка разблокировки исследования "Основы криптовалют" (после 2+ уровня криптокошелька)
    if (state.buildings.cryptoWallet && 
        state.buildings.cryptoWallet.count >= 2 && 
        upgrades.cryptoBasics && 
        !upgrades.cryptoBasics.unlocked) {
      upgrades.cryptoBasics.unlocked = true;
      safeDispatchGameEvent({
        messageKey: 'event.upgradeUnlocked',
        type: 'info',
        params: { name: upgrades.cryptoBasics.name }
      });
    }
    
    newState.upgrades = upgrades;
    return newState;
  }
  
  /**
   * Безопасно получает значение счетчика
   */
  private getCounterValue(state: GameState, counterId: string): number {
    const counter = state.counters[counterId];
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
