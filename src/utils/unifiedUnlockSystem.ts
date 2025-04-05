
import { GameState, Building } from '@/context/types';
import { normalizeId } from '@/i18n';

/**
 * Централизованная система управления разблокировками в игре
 */
export class UnlockManager {
  private gameState: GameState;
  private debug: boolean;
  private debugSteps: string[] = [];
  private unlockedItems: string[] = [];
  private lockedItems: string[] = [];
  
  constructor(gameState: GameState, debug: boolean = false) {
    this.gameState = JSON.parse(JSON.stringify(gameState));
    this.debug = debug;
    
    if (this.debug) {
      console.log("UnlockManager создан в режиме отладки");
    }
  }
  
  /**
   * Обновляет состояние игры и проверяет разблокировки
   */
  public updateGameState(gameState: GameState): GameState {
    this.gameState = JSON.parse(JSON.stringify(gameState));
    return this.checkUnlocks();
  }
  
  /**
   * Проверяет разблокировку конкретного элемента
   */
  public isUnlocked(itemId: string): boolean {
    if (!itemId) return false;
    
    try {
      const normalizedId = normalizeId(itemId);
      
      // Проверяем в структуре unlocks
      if (this.gameState.unlocks && normalizedId in this.gameState.unlocks) {
        return !!this.gameState.unlocks[normalizedId];
      }
      
      // Проверяем разблокировку ресурса
      if (this.gameState.resources && normalizedId in this.gameState.resources) {
        return !!this.gameState.resources[normalizedId].unlocked;
      }
      
      // Проверяем разблокировку здания
      if (this.gameState.buildings && normalizedId in this.gameState.buildings) {
        return !!this.gameState.buildings[normalizedId].unlocked;
      }
      
      // Проверяем разблокировку улучшения
      if (this.gameState.upgrades && normalizedId in this.gameState.upgrades) {
        return !!this.gameState.upgrades[normalizedId].unlocked;
      }
      
      // Проверяем разблокировку функции
      if (this.gameState.featureFlags && normalizedId in this.gameState.featureFlags) {
        return !!this.gameState.featureFlags[normalizedId];
      }
      
      return false;
    } catch (error) {
      console.error(`Ошибка при проверке разблокировки ${itemId}:`, error);
      return false;
    }
  }
  
  /**
   * Принудительно разблокирует элемент
   */
  public forceUnlock(itemId: string): GameState {
    if (!itemId) return this.gameState;
    
    try {
      const normalizedId = normalizeId(itemId);
      let newState = JSON.parse(JSON.stringify(this.gameState));
      
      // Разблокируем в структуре unlocks
      newState.unlocks = {
        ...newState.unlocks,
        [normalizedId]: true
      };
      
      // Разблокируем ресурс, если существует
      if (newState.resources && normalizedId in newState.resources) {
        newState.resources[normalizedId] = {
          ...newState.resources[normalizedId],
          unlocked: true
        };
      }
      
      // Разблокируем здание, если существует
      if (newState.buildings && normalizedId in newState.buildings) {
        newState.buildings[normalizedId] = {
          ...newState.buildings[normalizedId],
          unlocked: true
        };
      }
      
      // Разблокируем улучшение, если существует
      if (newState.upgrades && normalizedId in newState.upgrades) {
        newState.upgrades[normalizedId] = {
          ...newState.upgrades[normalizedId],
          unlocked: true
        };
      }
      
      // Разблокируем функцию, если существует
      if (normalizedId in (newState.featureFlags || {})) {
        newState.featureFlags = {
          ...newState.featureFlags,
          [normalizedId]: true
        };
      }
      
      this.gameState = newState;
      return newState;
    } catch (error) {
      console.error(`Ошибка при принудительной разблокировке ${itemId}:`, error);
      return this.gameState;
    }
  }
  
  /**
   * Выполняет полную проверку всех разблокировок
   */
  public forceCheckAllUnlocks(): GameState {
    this.debugSteps = [];
    this.unlockedItems = [];
    this.lockedItems = [];
    
    // Убеждаемся, что все здания имеют свойство cost
    let newState = ensureBuildingsCostProperty(this.gameState);
    this.gameState = newState;
    
    // Проверяем все разблокировки
    this.checkResourceUnlocks();
    this.checkBuildingUnlocks();
    this.checkUpgradeUnlocks();
    this.checkFeatureUnlocks();
    this.checkSpecialUnlocks();
    
    // Запускаем событие разблокировки для всех элементов
    if (typeof window !== 'undefined') {
      this.unlockedItems.forEach(itemId => {
        const event = new CustomEvent('unlock-event', { detail: { itemId } });
        window.dispatchEvent(event);
      });
    }
    
    return this.gameState;
  }
  
  /**
   * Получает отчет о разблокировках для отладки
   */
  public getUnlockReport(): { steps: string[], unlocked: string[], locked: string[] } {
    return {
      steps: this.debugSteps,
      unlocked: this.unlockedItems,
      locked: this.lockedItems
    };
  }
  
  /**
   * Проверяет и применяет все разблокировки
   */
  private checkUnlocks(): GameState {
    // Проверяем все типы разблокировок
    this.checkResourceUnlocks();
    this.checkBuildingUnlocks();
    this.checkUpgradeUnlocks();
    this.checkFeatureUnlocks();
    this.checkSpecialUnlocks();
    
    return this.gameState;
  }
  
  /**
   * Проверяет разблокировки ресурсов
   */
  private checkResourceUnlocks(): void {
    if (this.debug) {
      this.debugSteps.push("Проверка разблокировок ресурсов");
    }
    
    // USDT разблокируется после 3 использований "Применить знания"
    const applyKnowledge = this.gameState.counters.applyKnowledge?.value || 0;
    if (applyKnowledge >= 1 && this.gameState.resources.usdt) {
      this.unlockResource('usdt');
    }
    
    // Электричество разблокируется после покупки Генератора
    const generatorCount = this.gameState.buildings.generator?.count || 0;
    if (generatorCount > 0 && this.gameState.resources.electricity) {
      this.unlockResource('electricity');
    }
    
    // Вычислительная мощность разблокируется после покупки Домашнего компьютера
    const computerCount = this.gameState.buildings.homeComputer?.count || 0;
    if (computerCount > 0 && this.gameState.resources.computingPower) {
      this.unlockResource('computingPower');
    }
    
    // Bitcoin разблокируется после покупки улучшения "Основы криптовалют"
    const cryptoBasics = this.gameState.upgrades.cryptoBasics?.purchased || false;
    if (cryptoBasics && this.gameState.resources.bitcoin) {
      this.unlockResource('bitcoin');
    }
  }
  
  /**
   * Проверяет разблокировки зданий
   */
  private checkBuildingUnlocks(): void {
    if (this.debug) {
      this.debugSteps.push("Проверка разблокировок зданий");
    }
    
    // Практика разблокируется после 2 применений знаний
    const applyKnowledge = this.gameState.counters.applyKnowledge?.value || 0;
    if (applyKnowledge >= 2 && this.gameState.buildings.practice) {
      this.unlockBuilding('practice');
    }
    
    // Генератор разблокируется после накопления 11 USDT
    const usdtValue = this.gameState.resources.usdt?.value || 0;
    if (usdtValue >= 11 && this.gameState.buildings.generator) {
      this.unlockBuilding('generator');
    }
    
    // Домашний компьютер разблокируется после достижения 50 ед. электричества
    const electricityValue = this.gameState.resources.electricity?.value || 0;
    if (electricityValue >= 50 && this.gameState.buildings.homeComputer) {
      this.unlockBuilding('homeComputer');
    }
    
    // Криптокошелек разблокируется после исследования "Основы блокчейна"
    const blockchainBasics = this.gameState.upgrades.blockchainBasics?.purchased || false;
    if (blockchainBasics && this.gameState.buildings.cryptoWallet) {
      this.unlockBuilding('cryptoWallet');
    }
    
    // Интернет-канал разблокируется после покупки домашнего компьютера
    if (computerCount > 0 && this.gameState.buildings.internetChannel) {
      this.unlockBuilding('internetChannel');
    }
    
    // Майнер разблокируется после исследования "Основы криптовалют"
    const cryptoBasics = this.gameState.upgrades.cryptoBasics?.purchased || false;
    if (cryptoBasics && this.gameState.buildings.miner) {
      this.unlockBuilding('miner');
    }
    
    // Криптобиблиотека разблокируется после "Основы криптовалют"
    if (cryptoBasics && this.gameState.buildings.cryptoLibrary) {
      this.unlockBuilding('cryptoLibrary');
    }
    
    // Система охлаждения разблокируется после 2-го уровня Домашнего компьютера
    const computerCount = this.gameState.buildings.homeComputer?.count || 0;
    if (computerCount >= 2 && this.gameState.buildings.coolingSystem) {
      this.unlockBuilding('coolingSystem');
    }
    
    // Улучшенный кошелек разблокируется после 5-го уровня криптокошелька
    const walletCount = this.gameState.buildings.cryptoWallet?.count || 0;
    if (walletCount >= 5 && this.gameState.buildings.improvedWallet) {
      this.unlockBuilding('improvedWallet');
    }
  }
  
  /**
   * Проверяет разблокировки улучшений
   */
  private checkUpgradeUnlocks(): void {
    if (this.debug) {
      this.debugSteps.push("Проверка разблокировок улучшений");
    }
    
    // Основы блокчейна разблокируются после покупки Генератора
    const generatorCount = this.gameState.buildings.generator?.count || 0;
    if (generatorCount > 0 && this.gameState.upgrades.blockchainBasics) {
      this.unlockUpgrade('blockchainBasics');
    }
    
    // Безопасность криптокошельков разблокируется после покупки Криптокошелька
    const walletCount = this.gameState.buildings.cryptoWallet?.count || 0;
    if (walletCount > 0 && this.gameState.upgrades.walletSecurity) {
      this.unlockUpgrade('walletSecurity');
    }
    
    // Основы криптовалют разблокируются после достижения 2 уровня криптокошелька
    if (walletCount >= 2 && this.gameState.upgrades.cryptoBasics) {
      this.unlockUpgrade('cryptoBasics');
    }
    
    // Оптимизация алгоритмов разблокируется после покупки Майнера
    const minerCount = this.gameState.buildings.miner?.count || 0;
    if (minerCount > 0 && this.gameState.upgrades.algorithmOptimization) {
      this.unlockUpgrade('algorithmOptimization');
    }
    
    // Proof of Work разблокируется после покупки Оптимизации алгоритмов
    const algorithmOptimization = this.gameState.upgrades.algorithmOptimization?.purchased || false;
    if (algorithmOptimization && this.gameState.upgrades.proofOfWork) {
      this.unlockUpgrade('proofOfWork');
    }
    
    // Энергоэффективные компоненты разблокируются после Системы охлаждения
    const coolingCount = this.gameState.buildings.coolingSystem?.count || 0;
    if (coolingCount > 0 && this.gameState.upgrades.energyEfficientComponents) {
      this.unlockUpgrade('energyEfficientComponents');
    }
    
    // Криптовалютный трейдинг разблокируется после покупки Улучшенного кошелька
    const improvedWalletCount = this.gameState.buildings.improvedWallet?.count || 0;
    if (improvedWalletCount > 0 && this.gameState.upgrades.cryptoTrading) {
      this.unlockUpgrade('cryptoTrading');
    }
    
    // Торговый бот разблокируется после "Криптовалютный трейдинг"
    const cryptoTrading = this.gameState.upgrades.cryptoTrading?.purchased || false;
    if (cryptoTrading && this.gameState.upgrades.tradingBot) {
      this.unlockUpgrade('tradingBot');
    }
  }
  
  /**
   * Проверяет разблокировки функций
   */
  private checkFeatureUnlocks(): void {
    if (this.debug) {
      this.debugSteps.push("Проверка разблокировок функций");
    }
    
    // Исследования разблокируются после покупки Генератора
    const generatorCount = this.gameState.buildings.generator?.count || 0;
    if (generatorCount > 0) {
      this.unlockFeature('research');
    }
    
    // Трейдинг разблокируется после исследования "Криптовалютный трейдинг"
    const cryptoTrading = this.gameState.upgrades.cryptoTrading?.purchased || false;
    if (cryptoTrading) {
      this.unlockFeature('trading');
    }
  }
  
  /**
   * Проверяет специальные разблокировки
   */
  private checkSpecialUnlocks(): void {
    if (this.debug) {
      this.debugSteps.push("Проверка специальных разблокировок");
    }
    
    // Проверка на разблокировку специализаций
    const totalBuildings = Object.values(this.gameState.buildings).reduce(
      (sum, building) => sum + (building.count || 0), 0
    );
    
    if (totalBuildings >= 10) {
      this.unlockFeature('specialization');
    }
    
    // Проверка на разблокировку рефералов
    const usdtValue = this.gameState.resources.usdt?.value || 0;
    if (usdtValue >= 100) {
      this.unlockFeature('referrals');
    }
  }
  
  /**
   * Разблокирует ресурс и обновляет состояние
   */
  private unlockResource(resourceId: string): void {
    const normalizedId = normalizeId(resourceId);
    
    if (this.gameState.resources[normalizedId] && !this.gameState.resources[normalizedId].unlocked) {
      this.gameState.resources[normalizedId] = {
        ...this.gameState.resources[normalizedId],
        unlocked: true
      };
      
      this.gameState.unlocks = {
        ...this.gameState.unlocks,
        [normalizedId]: true
      };
      
      if (this.debug) {
        this.debugSteps.push(`Разблокирован ресурс: ${normalizedId}`);
        this.unlockedItems.push(normalizedId);
      }
      
      // Запускаем событие разблокировки
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('unlock-event', { detail: { itemId: normalizedId } });
        window.dispatchEvent(event);
      }
    } else if (this.debug && this.gameState.resources[normalizedId]) {
      this.debugSteps.push(`Ресурс уже разблокирован: ${normalizedId}`);
      this.lockedItems.push(normalizedId);
    }
  }
  
  /**
   * Разблокирует здание и обновляет состояние
   */
  private unlockBuilding(buildingId: string): void {
    const normalizedId = normalizeId(buildingId);
    
    if (this.gameState.buildings[normalizedId] && !this.gameState.buildings[normalizedId].unlocked) {
      this.gameState.buildings[normalizedId] = {
        ...this.gameState.buildings[normalizedId],
        unlocked: true
      };
      
      this.gameState.unlocks = {
        ...this.gameState.unlocks,
        [normalizedId]: true
      };
      
      if (this.debug) {
        this.debugSteps.push(`Разблокировано здание: ${normalizedId}`);
        this.unlockedItems.push(normalizedId);
      }
      
      // Запускаем событие разблокировки
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('unlock-event', { detail: { itemId: normalizedId } });
        window.dispatchEvent(event);
      }
    } else if (this.debug && this.gameState.buildings[normalizedId]) {
      this.debugSteps.push(`Здание уже разблокировано: ${normalizedId}`);
      this.lockedItems.push(normalizedId);
    }
  }
  
  /**
   * Разблокирует улучшение и обновляет состояние
   */
  private unlockUpgrade(upgradeId: string): void {
    const normalizedId = normalizeId(upgradeId);
    
    if (this.gameState.upgrades[normalizedId] && !this.gameState.upgrades[normalizedId].unlocked) {
      this.gameState.upgrades[normalizedId] = {
        ...this.gameState.upgrades[normalizedId],
        unlocked: true
      };
      
      this.gameState.unlocks = {
        ...this.gameState.unlocks,
        [normalizedId]: true
      };
      
      if (this.debug) {
        this.debugSteps.push(`Разблокировано улучшение: ${normalizedId}`);
        this.unlockedItems.push(normalizedId);
      }
      
      // Запускаем событие разблокировки
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('unlock-event', { detail: { itemId: normalizedId } });
        window.dispatchEvent(event);
      }
    } else if (this.debug && this.gameState.upgrades[normalizedId]) {
      this.debugSteps.push(`Улучшение уже разблокировано: ${normalizedId}`);
      this.lockedItems.push(normalizedId);
    }
  }
  
  /**
   * Разблокирует функцию и обновляет состояние
   */
  private unlockFeature(featureId: string): void {
    const normalizedId = normalizeId(featureId);
    
    if (!this.gameState.featureFlags[normalizedId]) {
      this.gameState.featureFlags = {
        ...this.gameState.featureFlags,
        [normalizedId]: true
      };
      
      this.gameState.unlocks = {
        ...this.gameState.unlocks,
        [normalizedId]: true
      };
      
      if (this.debug) {
        this.debugSteps.push(`Разблокирована функция: ${normalizedId}`);
        this.unlockedItems.push(normalizedId);
      }
      
      // Запускаем событие разблокировки
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('unlock-event', { detail: { itemId: normalizedId } });
        window.dispatchEvent(event);
      }
    } else if (this.debug) {
      this.debugSteps.push(`Функция уже разблокирована: ${normalizedId}`);
      this.lockedItems.push(normalizedId);
    }
  }
}

/**
 * Проверяет и добавляет свойство cost для зданий
 */
export function ensureBuildingsCostProperty(state: GameState): GameState {
  const newState = JSON.parse(JSON.stringify(state));
  
  Object.keys(newState.buildings).forEach(buildingId => {
    const building = newState.buildings[buildingId];
    
    if (!building.cost) {
      console.warn(`Здание ${buildingId} не имеет свойства cost, добавляем пустой объект`);
      building.cost = {};
    }
  });
  
  return newState;
}
