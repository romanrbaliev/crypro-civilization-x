
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
    let newState = { ...state };
    
    // Практика
    if (this.shouldUnlockPractice(newState)) {
      newState = this.unlockBuilding(newState, 'practice', 'Практика');
    }
    
    // Генератор
    if (this.shouldUnlockGenerator(newState)) {
      newState = this.unlockBuilding(newState, 'generator', 'Генератор');
    }
    
    // Домашний компьютер
    if (this.shouldUnlockHomeComputer(newState)) {
      newState = this.unlockBuilding(newState, 'homeComputer', 'Домашний компьютер');
    }
    
    // Криптокошелек
    if (this.shouldUnlockCryptoWallet(newState)) {
      newState = this.unlockBuilding(newState, 'cryptoWallet', 'Криптокошелек');
    }
    
    // Автомайнер
    if (this.shouldUnlockAutoMiner(newState)) {
      newState = this.unlockBuilding(newState, 'autoMiner', 'Автомайнер');
    }
    
    // Интернет-канал
    if (this.shouldUnlockInternetConnection(newState)) {
      newState = this.unlockBuilding(newState, 'internetConnection', 'Интернет-канал');
    }
    
    // Улучшенный кошелек
    if (this.shouldUnlockImprovedWallet(newState)) {
      newState = this.unlockBuilding(newState, 'improvedWallet', 'Улучшенный кошелек');
    }
    
    // Криптобиблиотека
    if (this.shouldUnlockCryptoLibrary(newState)) {
      newState = this.unlockBuilding(newState, 'cryptoLibrary', 'Криптобиблиотека');
    }
    
    return newState;
  }

  /**
   * Проверяет разблокировки исследований
   */
  private checkUpgradeUnlocks(state: GameState): GameState {
    let newState = { ...state };
    
    // Вкладка исследований
    if (this.shouldUnlockResearchTab(newState)) {
      newState = {
        ...newState,
        unlocks: {
          ...newState.unlocks,
          research: true
        }
      };
    }
    
    // Основы блокчейна
    if (this.shouldUnlockBlockchainBasics(newState)) {
      newState = this.unlockBlockchainBasics(newState);
    }
    
    // Основы криптовалют
    if (this.shouldUnlockCryptoCurrencyBasics(newState)) {
      newState = this.unlockUpgrade(newState, 'cryptoCurrencyBasics', 'Основы криптовалют');
    }
    
    // Безопасность криптокошельков
    if (this.shouldUnlockWalletSecurity(newState)) {
      newState = this.unlockUpgrade(newState, 'walletSecurity', 'Безопасность криптокошельков');
    }
    
    // Криптовалютный трейдинг
    if (this.shouldUnlockCryptoTrading(newState)) {
      newState = this.unlockUpgrade(newState, 'cryptoTrading', 'Криптовалютный трейдинг');
    }
    
    // Оптимизация алгоритмов
    if (this.shouldUnlockAlgorithmOptimization(newState)) {
      newState = this.unlockUpgrade(newState, 'algorithmOptimization', 'Оптимизация алгоритмов');
    }
    
    // Proof of Work
    if (this.shouldUnlockProofOfWork(newState)) {
      newState = this.unlockUpgrade(newState, 'proofOfWork', 'Proof of Work');
    }
    
    return newState;
  }

  /**
   * Проверяет разблокировки действий
   */
  private checkActionUnlocks(state: GameState): GameState {
    let newState = { ...state };
    
    // Применить знания
    if (this.shouldUnlockApplyKnowledge(newState)) {
      newState = {
        ...newState,
        unlocks: {
          ...newState.unlocks,
          applyKnowledge: true
        }
      };
      safeDispatchGameEvent('Открыто действие «Применить знания»', 'success');
    }
    
    // Майнинг
    if (this.shouldUnlockMiningPower(newState)) {
      newState = {
        ...newState,
        unlocks: {
          ...newState.unlocks,
          miningPower: true
        }
      };
      safeDispatchGameEvent('Открыто действие «Майнинг»', 'success');
    }
    
    // Обмен Bitcoin
    if (this.shouldUnlockExchangeBitcoin(newState)) {
      newState = {
        ...newState,
        unlocks: {
          ...newState.unlocks,
          exchangeBitcoin: true
        }
      };
      safeDispatchGameEvent('Открыто действие «Обмен Bitcoin»', 'success');
    }
    
    return newState;
  }

  /**
   * Проверяет специальные разблокировки
   */
  private checkSpecialUnlocks(state: GameState): GameState {
    // Здесь могут быть особые проверки, которые не попадают под стандартные категории
    return state;
  }

  /**
   * Проверка и принудительное применение правила разблокировки USDT
   */
  private enforceUsdtUnlockRules(state: GameState): GameState {
    // Особый случай для USDT: должен быть разблокирован только после двух применений знаний
    if (state.resources.usdt) {
      if (!state.counters.applyKnowledge || state.counters.applyKnowledge.value < 2) {
        // Блокируем USDT
        return {
          ...state,
          resources: {
            ...state.resources,
            usdt: {
              ...state.resources.usdt,
              unlocked: false
            }
          },
          unlocks: {
            ...state.unlocks,
            usdt: false
          }
        };
      } else {
        // Разблокируем USDT
        return {
          ...state,
          resources: {
            ...state.resources,
            usdt: {
              ...state.resources.usdt,
              unlocked: true
            }
          },
          unlocks: {
            ...state.unlocks,
            usdt: true
          }
        };
      }
    }
    return state;
  }

  // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ДЛЯ ПРОВЕРКИ УСЛОВИЙ РАЗБЛОКИРОВКИ

  private shouldUnlockUsdt(state: GameState): boolean {
    return state.counters.applyKnowledge?.value >= 2 && 
           state.resources.usdt && 
           !state.resources.usdt.unlocked;
  }

  private shouldUnlockElectricity(state: GameState): boolean {
    return state.buildings.generator?.count > 0 && 
           state.resources.electricity && 
           !state.resources.electricity.unlocked;
  }

  private shouldUnlockComputingPower(state: GameState): boolean {
    return state.buildings.homeComputer?.count > 0 && 
           state.resources.computingPower && 
           !state.resources.computingPower.unlocked;
  }

  private shouldUnlockBitcoin(state: GameState): boolean {
    return state.buildings.autoMiner?.count > 0 && 
           state.resources.bitcoin && 
           !state.resources.bitcoin.unlocked;
  }

  private shouldUnlockPractice(state: GameState): boolean {
    return state.counters.applyKnowledge?.value >= 2 && 
           state.buildings.practice && 
           !state.buildings.practice.unlocked && 
           !state.unlocks.practice;
  }

  private shouldUnlockGenerator(state: GameState): boolean {
    return state.resources.usdt?.value >= 11 && 
           state.resources.usdt?.unlocked && 
           state.buildings.generator && 
           !state.buildings.generator.unlocked;
  }

  private shouldUnlockHomeComputer(state: GameState): boolean {
    return state.resources.electricity?.value >= 10 && 
           state.resources.electricity?.unlocked && 
           state.buildings.homeComputer && 
           !state.buildings.homeComputer.unlocked;
  }

  private shouldUnlockCryptoWallet(state: GameState): boolean {
    return this.isBlockchainBasicsPurchased(state) && 
           state.buildings.cryptoWallet && 
           !state.buildings.cryptoWallet.unlocked;
  }

  private shouldUnlockAutoMiner(state: GameState): boolean {
    return state.upgrades.cryptoCurrencyBasics?.purchased === true && 
           state.buildings.autoMiner && 
           !state.buildings.autoMiner.unlocked;
  }

  private shouldUnlockInternetConnection(state: GameState): boolean {
    return state.buildings.homeComputer?.count > 0 && 
           state.buildings.internetConnection && 
           !state.buildings.internetConnection.unlocked;
  }

  private shouldUnlockImprovedWallet(state: GameState): boolean {
    return state.buildings.cryptoWallet?.count >= 1 && 
           state.upgrades.walletSecurity?.purchased === true && 
           state.buildings.improvedWallet && 
           !state.buildings.improvedWallet.unlocked;
  }

  private shouldUnlockCryptoLibrary(state: GameState): boolean {
    return state.upgrades.cryptoCurrencyBasics?.purchased === true && 
           state.buildings.cryptoLibrary && 
           !state.buildings.cryptoLibrary.unlocked;
  }

  private shouldUnlockResearchTab(state: GameState): boolean {
    return state.buildings.generator?.count > 0 && 
           !state.unlocks.research;
  }

  private shouldUnlockBlockchainBasics(state: GameState): boolean {
    return state.buildings.generator?.count > 0 && 
           !this.isBlockchainBasicsUnlocked(state);
  }

  private shouldUnlockCryptoCurrencyBasics(state: GameState): boolean {
    return this.isBlockchainBasicsPurchased(state) && 
           state.upgrades.cryptoCurrencyBasics && 
           !state.upgrades.cryptoCurrencyBasics.unlocked;
  }

  private shouldUnlockWalletSecurity(state: GameState): boolean {
    return state.buildings.cryptoWallet?.count > 0 && 
           state.upgrades.walletSecurity && 
           !state.upgrades.walletSecurity.unlocked;
  }

  private shouldUnlockCryptoTrading(state: GameState): boolean {
    return state.buildings.improvedWallet?.count > 0 && 
           state.upgrades.cryptoTrading && 
           !state.upgrades.cryptoTrading.unlocked;
  }

  private shouldUnlockAlgorithmOptimization(state: GameState): boolean {
    return state.buildings.autoMiner?.count > 0 && 
           state.upgrades.algorithmOptimization && 
           !state.upgrades.algorithmOptimization.unlocked;
  }

  private shouldUnlockProofOfWork(state: GameState): boolean {
    return state.buildings.autoMiner?.count > 0 && 
           state.upgrades.proofOfWork && 
           !state.upgrades.proofOfWork.unlocked;
  }

  private shouldUnlockApplyKnowledge(state: GameState): boolean {
    return state.counters.knowledgeClicks?.value >= 3 && 
           !state.unlocks.applyKnowledge;
  }

  private shouldUnlockMiningPower(state: GameState): boolean {
    return state.resources.computingPower?.unlocked && 
           !state.unlocks.miningPower;
  }

  private shouldUnlockExchangeBitcoin(state: GameState): boolean {
    return state.resources.bitcoin?.unlocked && 
           !state.unlocks.exchangeBitcoin;
  }

  // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ДЛЯ ВЫПОЛНЕНИЯ РАЗБЛОКИРОВОК

  private unlockUsdt(state: GameState): GameState {
    if (state.resources.usdt && state.counters.applyKnowledge?.value >= 2) {
      const newState = {
        ...state,
        resources: {
          ...state.resources,
          usdt: {
            ...state.resources.usdt,
            unlocked: true
          }
        },
        unlocks: {
          ...state.unlocks,
          usdt: true
        }
      };
      safeDispatchGameEvent('Открыт ресурс «USDT»', 'success');
      return newState;
    }
    return state;
  }

  private unlockElectricity(state: GameState): GameState {
    if (state.resources.electricity) {
      const newState = {
        ...state,
        resources: {
          ...state.resources,
          electricity: {
            ...state.resources.electricity,
            unlocked: true,
            name: "Электричество"
          }
        },
        unlocks: {
          ...state.unlocks,
          electricity: true
        }
      };
      safeDispatchGameEvent('Открыт ресурс «Электричество»', 'success');
      return newState;
    }
    return state;
  }

  private unlockComputingPower(state: GameState): GameState {
    if (state.resources.computingPower) {
      const newState = {
        ...state,
        resources: {
          ...state.resources,
          computingPower: {
            ...state.resources.computingPower,
            unlocked: true,
            name: "Вычислительная мощность"
          }
        },
        unlocks: {
          ...state.unlocks,
          computingPower: true
        }
      };
      safeDispatchGameEvent('Открыт ресурс «Вычислительная мощность»', 'success');
      return newState;
    }
    return state;
  }

  private unlockBitcoin(state: GameState): GameState {
    // Делаем базовую настройку Bitcoin
    const newState = {
      ...state,
      resources: {
        ...state.resources,
        bitcoin: {
          ...state.resources.bitcoin,
          id: 'bitcoin',
          name: "Bitcoin",
          description: "Bitcoin - первая и основная криптовалюта",
          type: "currency",
          icon: "bitcoin",
          value: state.resources.bitcoin?.value || 0,
          baseProduction: 0,
          production: 0,
          perSecond: 0.00005 * state.buildings.autoMiner.count,
          max: 0.01,
          unlocked: true
        }
      },
      unlocks: {
        ...state.unlocks,
        bitcoin: true
      }
    };
    
    // Установка дополнительных параметров для майнинга
    if (!newState.miningParams) {
      newState.miningParams = {
        miningEfficiency: 1,
        networkDifficulty: 1.0,
        energyEfficiency: 0,
        exchangeRate: 20000,
        exchangeCommission: 0.05,
        volatility: 0.2,
        exchangePeriod: 3600,
        baseConsumption: 1
      };
    }
    
    safeDispatchGameEvent('Открыт ресурс «Bitcoin»', 'success');
    return newState;
  }

  private unlockBuilding(state: GameState, buildingId: string, buildingName: string): GameState {
    if (state.buildings[buildingId]) {
      const newState = {
        ...state,
        buildings: {
          ...state.buildings,
          [buildingId]: {
            ...state.buildings[buildingId],
            unlocked: true
          }
        }
      };
      
      if (buildingId === 'practice') {
        newState.unlocks = {
          ...newState.unlocks,
          practice: true
        };
      }
      
      safeDispatchGameEvent(`Открыта возможность приобрести «${buildingName}»`, 'success');
      return newState;
    }
    return state;
  }

  private unlockBlockchainBasics(state: GameState): GameState {
    const upgrades = { ...state.upgrades };
    let updated = false;
    
    if (upgrades.blockchainBasics) {
      upgrades.blockchainBasics = {
        ...upgrades.blockchainBasics,
        unlocked: true
      };
      updated = true;
    }
    
    if (upgrades.blockchain_basics) {
      upgrades.blockchain_basics = {
        ...upgrades.blockchain_basics,
        unlocked: true
      };
      updated = true;
    }
    
    if (upgrades.basicBlockchain) {
      upgrades.basicBlockchain = {
        ...upgrades.basicBlockchain,
        unlocked: true
      };
      updated = true;
    }
    
    if (updated) {
      safeDispatchGameEvent('Открыто исследование «Основы блокчейна»', 'success');
      return {
        ...state,
        upgrades
      };
    }
    
    return state;
  }

  private unlockUpgrade(state: GameState, upgradeId: string, upgradeName: string): GameState {
    if (state.upgrades[upgradeId]) {
      const newState = {
        ...state,
        upgrades: {
          ...state.upgrades,
          [upgradeId]: {
            ...state.upgrades[upgradeId],
            unlocked: true
          }
        }
      };
      safeDispatchGameEvent(`Открыто исследование «${upgradeName}»`, 'success');
      return newState;
    }
    return state;
  }

  // ВСПОМОГАТЕЛЬНЫЕ ПРОВЕРКИ СОСТОЯНИЯ

  private isBlockchainBasicsPurchased(state: GameState): boolean {
    return (
      (state.upgrades.blockchainBasics && state.upgrades.blockchainBasics.purchased) ||
      (state.upgrades.blockchain_basics && state.upgrades.blockchain_basics.purchased) ||
      (state.upgrades.basicBlockchain && state.upgrades.basicBlockchain.purchased)
    );
  }

  private isBlockchainBasicsUnlocked(state: GameState): boolean {
    return (
      (state.upgrades.blockchainBasics && state.upgrades.blockchainBasics.unlocked) ||
      (state.upgrades.blockchain_basics && state.upgrades.blockchain_basics.unlocked) ||
      (state.upgrades.basicBlockchain && state.upgrades.basicBlockchain.unlocked)
    );
  }
}
