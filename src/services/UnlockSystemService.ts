
import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Централизованный сервис для управления всеми разблокировками в игре
 */
export class UnlockSystemService {
  /**
   * Проверяет все возможные разблокировки и обновляет состояние
   */
  checkAllUnlocks(state: GameState): GameState {
    console.log("UnlockSystemService: Проверка всех разблокировок");
    
    // Создаем глубокую копию состояния для модификации
    let newState = JSON.parse(JSON.stringify(state));
    
    // Последовательно проверяем разблокировки разных типов
    newState = this.checkActionUnlocks(newState);
    newState = this.checkResourceUnlocks(newState);
    newState = this.checkBuildingUnlocks(newState);
    newState = this.checkUpgradeUnlocks(newState);
    newState = this.checkTabUnlocks(newState);
    
    return newState;
  }
  
  /**
   * Проверяет разблокировки ресурсов
   */
  private checkResourceUnlocks(state: GameState): GameState {
    const newState = { ...state };
    const resources = { ...state.resources };
    
    // 1. Проверка разблокировки USDT (после 1+ применений знаний)
    const applyKnowledgeCount = this.getCounterValue(state, 'applyKnowledge');
    if (applyKnowledgeCount >= 1 && !state.unlocks.usdt) {
      newState.unlocks.usdt = true;
      
      if (resources.usdt) {
        resources.usdt.unlocked = true;
      } else {
        resources.usdt = {
          id: 'usdt',
          name: 'USDT',
          description: 'Стабильная криптовалюта, привязанная к доллару',
          type: 'currency',
          icon: 'dollar',
          value: 0,
          baseProduction: 0,
          production: 0,
          perSecond: 0,
          max: 100,
          unlocked: true,
          consumption: 0
        };
      }
      
      safeDispatchGameEvent('Разблокирован ресурс: USDT', 'info');
    }
    
    // 2. Проверка разблокировки Электричества (после покупки генератора)
    if (state.buildings.generator && state.buildings.generator.count > 0 && !state.unlocks.electricity) {
      newState.unlocks.electricity = true;
      
      if (resources.electricity) {
        resources.electricity.unlocked = true;
      } else {
        resources.electricity = {
          id: 'electricity',
          name: 'Электричество',
          description: 'Энергия для питания компьютеров и майнеров',
          type: 'resource',
          icon: 'zap',
          value: 0,
          baseProduction: 0,
          production: 0,
          perSecond: 0,
          max: 100,
          unlocked: true,
          consumption: 0
        };
      }
      
      safeDispatchGameEvent('Разблокирован ресурс: Электричество', 'info');
    }
    
    // 3. Проверка разблокировки Вычислительной мощности (после покупки компьютера)
    if (state.buildings.homeComputer && state.buildings.homeComputer.count > 0 && !state.unlocks.computingPower) {
      newState.unlocks.computingPower = true;
      
      if (resources.computingPower) {
        resources.computingPower.unlocked = true;
      } else {
        resources.computingPower = {
          id: 'computingPower',
          name: 'Вычислительная мощность',
          description: 'Вычислительные ресурсы для майнинга и анализа',
          type: 'resource',
          icon: 'cpu',
          value: 0,
          baseProduction: 0,
          production: 0,
          perSecond: 0,
          max: 100,
          unlocked: true,
          consumption: 0
        };
      }
      
      safeDispatchGameEvent('Разблокирован ресурс: Вычислительная мощность', 'info');
    }
    
    // 4. Проверка разблокировки Bitcoin (после исследования криптовалют)
    if ((state.upgrades.cryptoCurrencyBasics && state.upgrades.cryptoCurrencyBasics.purchased) && !state.unlocks.bitcoin) {
      newState.unlocks.bitcoin = true;
      
      if (resources.bitcoin) {
        resources.bitcoin.unlocked = true;
      }
      
      safeDispatchGameEvent('Разблокирован ресурс: Bitcoin', 'info');
    }
    
    newState.resources = resources;
    return newState;
  }
  
  /**
   * Проверяет разблокировки действий (кнопок)
   */
  private checkActionUnlocks(state: GameState): GameState {
    const newState = { ...state };
    
    // 1. Проверка разблокировки кнопки "Применить знания" (3+ кликов по "Изучить")
    const knowledgeClicksCount = this.getCounterValue(state, 'knowledgeClicks');
    if (knowledgeClicksCount >= 3 && !state.unlocks.applyKnowledge) {
      newState.unlocks.applyKnowledge = true;
      safeDispatchGameEvent('Разблокировано действие: Применить знания', 'info');
    }
    
    // 2. Проверка разблокировки обмена Bitcoin
    if (state.resources.bitcoin && 
        state.resources.bitcoin.unlocked && 
        !state.unlocks.bitcoinExchange) {
      newState.unlocks.bitcoinExchange = true;
    }
    
    return newState;
  }
  
  /**
   * Проверяет разблокировки зданий
   */
  private checkBuildingUnlocks(state: GameState): GameState {
    const newState = { ...state };
    const buildings = { ...state.buildings };
    
    // 1. Проверка разблокировки здания "Практика" (2+ применений знаний)
    const applyKnowledgeCount = this.getCounterValue(state, 'applyKnowledge');
    if (applyKnowledgeCount >= 2 && buildings.practice && !buildings.practice.unlocked) {
      buildings.practice.unlocked = true;
      newState.unlocks.practice = true;
      safeDispatchGameEvent('Разблокировано здание: Практика', 'info');
    }
    
    // 2. Проверка разблокировки здания "Генератор" (11+ USDT)
    if (state.resources.usdt && 
        state.resources.usdt.value >= 11 && 
        state.resources.usdt.unlocked && 
        buildings.generator && 
        !buildings.generator.unlocked) {
      buildings.generator.unlocked = true;
      newState.unlocks.generator = true;
      safeDispatchGameEvent('Разблокировано здание: Генератор', 'info');
    }
    
    // 3. Проверка разблокировки здания "Домашний компьютер" (50+ электричества)
    if (state.resources.electricity && 
        state.resources.electricity.value >= 50 && 
        state.resources.electricity.unlocked && 
        buildings.homeComputer && 
        !buildings.homeComputer.unlocked) {
      buildings.homeComputer.unlocked = true;
      newState.unlocks.homeComputer = true;
      safeDispatchGameEvent('Разблокировано здание: Домашний компьютер', 'info');
    }
    
    // 4. Проверка разблокировки здания "Криптокошелек" (после исследования "Основы блокчейна")
    if (state.upgrades.blockchainBasics && 
        state.upgrades.blockchainBasics.purchased && 
        buildings.cryptoWallet && 
        !buildings.cryptoWallet.unlocked) {
      buildings.cryptoWallet.unlocked = true;
      newState.unlocks.cryptoWallet = true;
      safeDispatchGameEvent('Разблокировано здание: Криптокошелек', 'info');
    }
    
    // 5. Проверка разблокировки здания "Интернет-канал" (после покупки компьютера)
    if (state.buildings.homeComputer && 
        state.buildings.homeComputer.count > 0 && 
        buildings.internetChannel && 
        !buildings.internetChannel.unlocked) {
      buildings.internetChannel.unlocked = true;
      newState.unlocks.internetChannel = true;
      safeDispatchGameEvent('Разблокировано здание: Интернет-канал', 'info');
    }
    
    newState.buildings = buildings;
    return newState;
  }
  
  /**
   * Проверяет разблокировки исследований
   */
  private checkUpgradeUnlocks(state: GameState): GameState {
    const newState = { ...state };
    const upgrades = { ...state.upgrades };
    
    // 1. Проверка разблокировки вкладки исследований
    if (state.buildings.generator && 
        state.buildings.generator.count > 0 && 
        !state.unlocks.research) {
      newState.unlocks.research = true;
      safeDispatchGameEvent('Разблокирована вкладка: Исследования', 'info');
    }
    
    // 2. Проверка разблокировки исследования "Основы блокчейна" (после покупки генератора)
    if (state.buildings.generator && 
        state.buildings.generator.count > 0 && 
        upgrades.blockchainBasics && 
        !upgrades.blockchainBasics.unlocked) {
      upgrades.blockchainBasics.unlocked = true;
      safeDispatchGameEvent('Разблокировано исследование: Основы блокчейна', 'info');
    }
    
    // 3. Проверка разблокировки исследования "Безопасность криптокошельков" (после покупки кошелька)
    if (state.buildings.cryptoWallet && 
        state.buildings.cryptoWallet.count > 0 && 
        upgrades.walletSecurity && 
        !upgrades.walletSecurity.unlocked) {
      upgrades.walletSecurity.unlocked = true;
      safeDispatchGameEvent('Разблокировано исследование: Безопасность криптокошельков', 'info');
    }
    
    // 4. Проверка разблокировки исследования "Основы криптовалют" (после 2+ уровня криптокошелька)
    if (state.buildings.cryptoWallet && 
        state.buildings.cryptoWallet.count >= 2 && 
        upgrades.cryptoCurrencyBasics && 
        !upgrades.cryptoCurrencyBasics.unlocked) {
      upgrades.cryptoCurrencyBasics.unlocked = true;
      safeDispatchGameEvent('Разблокировано исследование: Основы криптовалют', 'info');
    }
    
    newState.upgrades = upgrades;
    return newState;
  }
  
  /**
   * Проверяет разблокировки вкладок/разделов
   */
  private checkTabUnlocks(state: GameState): GameState {
    const newState = { ...state };
    
    // 1. Проверка разблокировки вкладки Equipment (есть разблокированные здания)
    const hasUnlockedBuildings = Object.values(state.buildings).some(b => b.unlocked);
    if (hasUnlockedBuildings && !state.unlocks.equipmentTab) {
      newState.unlocks.equipmentTab = true;
    }
    
    // 2. Проверка разблокировки вкладки Research (есть исследования)
    if (state.unlocks.research && !state.unlocks.researchTab) {
      newState.unlocks.researchTab = true;
    }
    
    // 3. Проверка разблокировки вкладки Specialization
    if ((state.player && state.player.specialization) || state.unlocks.specialization) {
      newState.unlocks.specialization = true;
    }
    
    // 4. Проверка разблокировки вкладки Referrals
    if (state.upgrades.cryptoCommunity && 
        state.upgrades.cryptoCommunity.purchased && 
        !state.unlocks.referrals) {
      newState.unlocks.referrals = true;
      safeDispatchGameEvent('Разблокирована вкладка: Рефералы', 'info');
    }
    
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
}

// Создаем экземпляр сервиса для экспорта
export const unlockSystemService = new UnlockSystemService();
