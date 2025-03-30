
import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Сервис для управления разблокировками игровых элементов.
 * Централизует всю логику разблокировок и обеспечивает ее единообразное применение.
 */
export class UnlockService {
  /**
   * Проверяет и применяет все возможные разблокировки
   */
  public checkAllUnlocks(state: GameState): GameState {
    console.log('UnlockService: Проверка всех разблокировок');
    
    let newState = { ...state };
    let anyUnlockApplied = false;
    
    // Проверяем разблокировки в определенном порядке
    newState = this.checkResourceUnlocks(newState);
    newState = this.checkBuildingUnlocks(newState);
    newState = this.checkUpgradeUnlocks(newState);
    newState = this.checkActionUnlocks(newState);
    newState = this.checkSpecialUnlocks(newState);
    
    // Обрабатываем особый случай с USDT
    newState = this.enforceUsdtUnlockRules(newState);
    
    return newState;
  }

  /**
   * Полностью перестраивает все разблокировки с нуля
   */
  public rebuildAllUnlocks(state: GameState): GameState {
    console.log('UnlockService: Полная перестройка разблокировок');
    
    // Создаем копию состояния, но не копируем значения unlocked,
    // они будут установлены заново на основе фактических условий
    let newState = JSON.parse(JSON.stringify(state));
    
    // Применяем все проверки разблокировок
    return this.checkAllUnlocks(newState);
  }

  /**
   * Проверяет разблокировки ресурсов
   */
  private checkResourceUnlocks(state: GameState): GameState {
    console.log('UnlockService: Проверка разблокировок ресурсов');
    
    let newState = { ...state };
    
    // USDT разблокировка
    if (this.shouldUnlockUsdt(newState)) {
      newState = this.unlockUsdt(newState);
    }
    
    // Электричество
    if (this.shouldUnlockElectricity(newState)) {
      newState = this.unlockElectricity(newState);
    }
    
    // Вычислительная мощность
    if (this.shouldUnlockComputingPower(newState)) {
      newState = this.unlockComputingPower(newState);
    }
    
    // Bitcoin
    if (this.shouldUnlockBitcoin(newState)) {
      newState = this.unlockBitcoin(newState);
    }
    
    return newState;
  }

  /**
   * Проверяет разблокировки зданий
   */
  private checkBuildingUnlocks(state: GameState): GameState {
    console.log('UnlockService: Проверка разблокировок зданий');
    
    let newState = { ...state };
    
    // Practice (Практика)
    if (this.shouldUnlockPractice(newState)) {
      newState = this.unlockPractice(newState);
    }
    
    // Generator (Генератор)
    if (this.shouldUnlockGenerator(newState)) {
      newState = this.unlockGenerator(newState);
    }
    
    // Home Computer (Домашний компьютер)
    if (this.shouldUnlockHomeComputer(newState)) {
      newState = this.unlockHomeComputer(newState);
    }
    
    // Crypto Wallet (Криптокошелек)
    if (this.shouldUnlockCryptoWallet(newState)) {
      newState = this.unlockCryptoWallet(newState);
    }
    
    return newState;
  }

  /**
   * Проверяет разблокировки улучшений
   */
  private checkUpgradeUnlocks(state: GameState): GameState {
    console.log('UnlockService: Проверка разблокировок улучшений');
    
    let newState = { ...state };
    
    // Другие проверки улучшений
    // ...
    
    return newState;
  }

  /**
   * Проверяет разблокировки действий
   */
  private checkActionUnlocks(state: GameState): GameState {
    console.log('UnlockService: Проверка разблокировок действий');
    
    let newState = { ...state };
    
    // Apply Knowledge
    if (state.counters.knowledgeClicks && state.counters.knowledgeClicks.value >= 3 && !state.unlocks.applyKnowledge) {
      console.log('UnlockService: 🔓 Разблокировка Apply Knowledge: счетчик кликов >= 3');
      
      newState = {
        ...newState,
        unlocks: {
          ...newState.unlocks,
          applyKnowledge: true
        }
      };
    }
    
    return newState;
  }

  /**
   * Проверяет специальные разблокировки
   */
  private checkSpecialUnlocks(state: GameState): GameState {
    console.log('UnlockService: Проверка специальных разблокировок');
    
    let newState = { ...state };
    
    // Проверка Practice после 2-го применения знаний
    const applyKnowledgeCounter = state.counters.applyKnowledge;
    if (applyKnowledgeCounter) {
      const applyKnowledgeCount = typeof applyKnowledgeCounter === 'object' 
        ? applyKnowledgeCounter.value 
        : applyKnowledgeCounter;

      if (applyKnowledgeCount >= 2 && (!state.unlocks.practice || !state.buildings.practice?.unlocked)) {
        console.log("UnlockService: 🔍 Особая проверка Practice: счетчик применения знаний >= 2");
        
        newState = this.unlockPractice(newState);
      }
    }
    
    return newState;
  }

  /**
   * Проверяет и принудительно применяет правила разблокировки USDT
   */
  private enforceUsdtUnlockRules(state: GameState): GameState {
    console.log('UnlockService: Применение особых правил разблокировки USDT');
    
    // Если уже явно установлен флаг разблокировки USDT в unlocks, то разблокируем ресурс
    if (state.unlocks.usdt === true && state.resources.usdt && !state.resources.usdt.unlocked) {
      console.log('UnlockService: Принудительная разблокировка USDT из флага unlocks');
      
      return {
        ...state,
        resources: {
          ...state.resources,
          usdt: {
            ...state.resources.usdt,
            unlocked: true
          }
        }
      };
    }
    
    // Если ресурс USDT уже разблокирован, то устанавливаем флаг разблокировки
    if (state.resources.usdt && state.resources.usdt.unlocked && !state.unlocks.usdt) {
      console.log('UnlockService: Установка флага разблокировки USDT из ресурса');
      
      return {
        ...state,
        unlocks: {
          ...state.unlocks,
          usdt: true
        }
      };
    }
    
    // Проверяем, был ли счетчик применения знаний >= 1, и если да, то разблокируем USDT
    const applyKnowledgeCounter = state.counters.applyKnowledge;
    if (applyKnowledgeCounter) {
      const applyKnowledgeCount = typeof applyKnowledgeCounter === 'object' 
        ? applyKnowledgeCounter.value 
        : applyKnowledgeCounter;
        
      if (applyKnowledgeCount >= 1) {
        console.log('UnlockService: Разблокировка USDT по счетчику применения знаний >= 1');
        
        return this.unlockUsdt(state);
      }
    }
    
    return state;
  }

  /**
   * Проверяет условие разблокировки USDT
   */
  private shouldUnlockUsdt(state: GameState): boolean {
    // USDT разблокируется после применения знаний или если уже установлен флаг разблокировки
    const counter = state.counters.applyKnowledge;
    const value = counter ? (typeof counter === 'object' ? counter.value : counter) : 0;
    const usdtResourceUnlocked = state.resources.usdt && state.resources.usdt.unlocked;
    const usdtFlagUnlocked = state.unlocks.usdt === true;
    
    console.log('UnlockService - shouldUnlockUsdt:', {
      counterValue: value,
      usdtResourceUnlocked,
      usdtFlagUnlocked
    });
    
    return (value >= 1 || usdtFlagUnlocked) && !usdtResourceUnlocked;
  }

  /**
   * Проверяет условие разблокировки практики
   */
  private shouldUnlockPractice(state: GameState): boolean {
    // Получаем значение счетчика применения знаний
    const counter = state.counters.applyKnowledge;
    const value = counter ? (typeof counter === 'object' ? counter.value : counter) : 0;
    
    // Проверяем существование и разблокировку здания практики
    const practiceExists = !!state.buildings.practice;
    const practiceUnlocked = practiceExists && state.buildings.practice.unlocked;
    const practiceInUnlocks = state.unlocks.practice === true;
    
    console.log('UnlockService - shouldUnlockPractice:', {
      applyKnowledge: value,
      practiceExists,
      practiceUnlocked: practiceUnlocked ? 'Да' : 'Нет',
      practiceInUnlocks: practiceInUnlocks ? 'Да' : 'Нет',
      result: value >= 2 && (!practiceUnlocked || !practiceInUnlocks)
    });
    
    // Практика разблокируется после 2-х применений знаний
    return value >= 2 && (!practiceUnlocked || !practiceInUnlocks);
  }

  /**
   * Проверяет условие разблокировки генератора
   */
  private shouldUnlockGenerator(state: GameState): boolean {
    // Получаем значение USDT
    const usdtValue = state.resources.usdt?.value || 0;
    const usdtUnlocked = state.resources.usdt?.unlocked || false;
    
    // Проверяем разблокировку генератора
    const generatorUnlocked = state.buildings.generator && state.buildings.generator.unlocked;
    
    console.log('UnlockService - shouldUnlockGenerator:', {
      usdtValue,
      usdtUnlocked,
      generatorUnlocked: generatorUnlocked ? 'Да' : 'Нет',
      result: usdtValue >= 11 && usdtUnlocked && !generatorUnlocked
    });
    
    // Генератор разблокируется при достижении 11 USDT
    return usdtValue >= 11 && usdtUnlocked && !generatorUnlocked;
  }

  /**
   * Проверяет условие разблокировки домашнего компьютера
   */
  private shouldUnlockHomeComputer(state: GameState): boolean {
    // Компьютер разблокируется при наличии 10+ электричества
    return state.resources.electricity && 
           state.resources.electricity.unlocked && 
           state.resources.electricity.value >= 10 && 
           (!state.buildings.homeComputer || !state.buildings.homeComputer.unlocked);
  }

  /**
   * Проверяет условие разблокировки криптокошелька
   */
  private shouldUnlockCryptoWallet(state: GameState): boolean {
    // Кошелек разблокируется после исследования Blockchain Basics
    return state.upgrades.blockchainBasics && 
           state.upgrades.blockchainBasics.purchased && 
           (!state.buildings.cryptoWallet || !state.buildings.cryptoWallet.unlocked);
  }

  /**
   * Проверяет условие разблокировки вычислительной мощности
   */
  private shouldUnlockComputingPower(state: GameState): boolean {
    // Вычислительная мощность разблокируется при наличии компьютера и электричества
    return state.resources.electricity && 
           state.resources.electricity.unlocked && 
           state.buildings.homeComputer && 
           state.buildings.homeComputer.count > 0 && 
           (!state.resources.computingPower || !state.resources.computingPower.unlocked);
  }

  /**
   * Проверяет условие разблокировки Bitcoin
   */
  private shouldUnlockBitcoin(state: GameState): boolean {
    // Bitcoin разблокируется при наличии вычислительной мощности
    return state.resources.computingPower && 
           state.resources.computingPower.unlocked && 
           (!state.resources.bitcoin || !state.resources.bitcoin.unlocked);
  }

  /**
   * Разблокирует ресурс USDT
   */
  private unlockUsdt(state: GameState): GameState {
    console.log('UnlockService: 🔓 Разблокировка USDT');
    
    let updatedResources = { ...state.resources };
    
    // Если ресурс USDT не существует, создаем его
    if (!updatedResources.usdt) {
      updatedResources.usdt = {
        id: 'usdt',
        name: 'USDT',
        description: 'Стейблкоин, привязанный к стоимости доллара США',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 50,
        unlocked: true,
        type: 'currency',
        icon: 'dollar'
      };
    } else {
      // Если ресурс USDT существует, обновляем его свойство unlocked
      updatedResources.usdt = {
        ...updatedResources.usdt,
        unlocked: true
      };
    }
    
    // Возвращаем обновленное состояние
    return {
      ...state,
      resources: updatedResources,
      unlocks: {
        ...state.unlocks,
        usdt: true
      }
    };
  }

  /**
   * Разблокирует ресурс Electricity
   */
  private unlockElectricity(state: GameState): GameState {
    console.log('UnlockService: 🔓 Разблокировка Electricity');
    
    let updatedResources = { ...state.resources };
    
    // Если ресурс Electricity не существует, создаем его
    if (!updatedResources.electricity) {
      updatedResources.electricity = {
        id: 'electricity',
        name: 'Электричество',
        description: 'Энергия для питания оборудования',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 1000,
        unlocked: true,
        type: 'resource',
        icon: 'zap'
      };
    } else {
      // Если ресурс Electricity существует, обновляем его свойство unlocked
      updatedResources.electricity = {
        ...updatedResources.electricity,
        unlocked: true
      };
    }
    
    // Возвращаем обновленное состояние
    return {
      ...state,
      resources: updatedResources,
      unlocks: {
        ...state.unlocks,
        electricity: true
      }
    };
  }

  /**
   * Разблокирует здание Practice
   */
  private unlockPractice(state: GameState): GameState {
    console.log('UnlockService: 🔓 Разблокировка Practice');
    
    let updatedBuildings = { ...state.buildings };
    
    // Если здание не существует, создаем его
    if (!updatedBuildings.practice) {
      updatedBuildings.practice = {
        id: 'practice',
        name: 'Практика',
        description: 'Автоматическое накопление знаний',
        cost: { usdt: 10 },
        count: 0,
        unlocked: true,
        costMultiplier: 1.15,
        production: { knowledge: 0.63 },
        consumption: {},
        productionBoost: 0,
        unlockedBy: 'applyKnowledge_2'
      };
    } else {
      // Если здание существует, обновляем его свойство unlocked
      updatedBuildings.practice = {
        ...updatedBuildings.practice,
        unlocked: true
      };
    }
    
    // Возвращаем обновленное состояние
    return {
      ...state,
      buildings: updatedBuildings,
      unlocks: {
        ...state.unlocks,
        practice: true
      }
    };
  }

  /**
   * Разблокирует здание Generator
   */
  private unlockGenerator(state: GameState): GameState {
    console.log('UnlockService: 🔓 Разблокировка Generator');
    
    let updatedBuildings = { ...state.buildings };
    
    // Если здание не существует, создаем его
    if (!updatedBuildings.generator) {
      updatedBuildings.generator = {
        id: 'generator',
        name: 'Генератор',
        description: 'Вырабатывает электричество',
        cost: { usdt: 25 },
        count: 0,
        unlocked: true,
        costMultiplier: 1.15,
        production: { electricity: 0.5 },
        consumption: {},
        productionBoost: 0,
        unlockedBy: 'usdt_11'
      };
    } else {
      // Если здание существует, обновляем его свойство unlocked
      updatedBuildings.generator = {
        ...updatedBuildings.generator,
        unlocked: true
      };
    }
    
    // Возвращаем обновленное состояние
    return {
      ...state,
      buildings: updatedBuildings,
      unlocks: {
        ...state.unlocks,
        generator: true
      }
    };
  }

  /**
   * Разблокирует здание Home Computer
   */
  private unlockHomeComputer(state: GameState): GameState {
    console.log('UnlockService: 🔓 Разблокировка Home Computer');
    
    let updatedBuildings = { ...state.buildings };
    
    // Если здание не существует, создаем его
    if (!updatedBuildings.homeComputer) {
      updatedBuildings.homeComputer = {
        id: 'homeComputer',
        name: 'Домашний компьютер',
        description: 'Создает вычислительную мощность',
        cost: { usdt: 30 },
        count: 0,
        unlocked: true,
        costMultiplier: 1.15,
        production: { computingPower: 2 },
        consumption: { electricity: 1 },
        productionBoost: 0,
        unlockedBy: 'electricity_10'
      };
    } else {
      // Если здание существует, обновляем его свойство unlocked
      updatedBuildings.homeComputer = {
        ...updatedBuildings.homeComputer,
        unlocked: true
      };
    }
    
    // Возвращаем обновленное состояние
    return {
      ...state,
      buildings: updatedBuildings,
      unlocks: {
        ...state.unlocks,
        homeComputer: true
      }
    };
  }

  /**
   * Разблокирует здание Crypto Wallet
   */
  private unlockCryptoWallet(state: GameState): GameState {
    console.log('UnlockService: 🔓 Разблокировка Crypto Wallet');
    
    let updatedBuildings = { ...state.buildings };
    
    // Если здание не существует, создаем его
    if (!updatedBuildings.cryptoWallet) {
      updatedBuildings.cryptoWallet = {
        id: 'cryptoWallet',
        name: 'Криптокошелек',
        description: 'Увеличивает максимальный объем хранения криптовалют',
        cost: { usdt: 15, knowledge: 25 },
        count: 0,
        unlocked: true,
        costMultiplier: 1.15,
        production: {},
        consumption: {},
        productionBoost: 0,
        unlockedBy: 'blockchainBasics'
      };
    } else {
      // Если здание существует, обновляем его свойство unlocked
      updatedBuildings.cryptoWallet = {
        ...updatedBuildings.cryptoWallet,
        unlocked: true
      };
    }
    
    // Возвращаем обновленное состояние
    return {
      ...state,
      buildings: updatedBuildings,
      unlocks: {
        ...state.unlocks,
        cryptoWallet: true
      }
    };
  }

  /**
   * Разблокирует ресурс Computing Power
   */
  private unlockComputingPower(state: GameState): GameState {
    console.log('UnlockService: 🔓 Разблокировка Computing Power');
    
    let updatedResources = { ...state.resources };
    
    // Если ресурс не существует, создаем его
    if (!updatedResources.computingPower) {
      updatedResources.computingPower = {
        id: 'computingPower',
        name: 'Вычислительная мощность',
        description: 'Мощность для вычислений и майнинга',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 500,
        unlocked: true,
        type: 'resource',
        icon: 'cpu'
      };
    } else {
      // Если ресурс существует, обновляем его свойство unlocked
      updatedResources.computingPower = {
        ...updatedResources.computingPower,
        unlocked: true
      };
    }
    
    // Возвращаем обновленное состояние
    return {
      ...state,
      resources: updatedResources,
      unlocks: {
        ...state.unlocks,
        computingPower: true
      }
    };
  }

  /**
   * Разблокирует ресурс Bitcoin
   */
  private unlockBitcoin(state: GameState): GameState {
    console.log('UnlockService: 🔓 Разблокировка Bitcoin');
    
    let updatedResources = { ...state.resources };
    
    // Если ресурс не существует, создаем его
    if (!updatedResources.bitcoin) {
      updatedResources.bitcoin = {
        id: 'bitcoin',
        name: 'Bitcoin',
        description: 'Криптовалюта, добываемая майнингом',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 0.01,
        unlocked: true,
        type: 'currency',
        icon: 'bitcoin'
      };
    } else {
      // Если ресурс существует, обновляем его свойство unlocked
      updatedResources.bitcoin = {
        ...updatedResources.bitcoin,
        unlocked: true
      };
    }
    
    // Возвращаем обновленное состояние
    return {
      ...state,
      resources: updatedResources,
      unlocks: {
        ...state.unlocks,
        bitcoin: true
      }
    };
  }
}
