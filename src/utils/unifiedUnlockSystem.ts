
import { GameState } from '@/context/types';
import { gameIds } from '@/i18n';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Базовый класс для управления разблокировками в игре
 */
export class UnlockManager {
  private state: GameState;
  private debugMode: boolean;
  private unlockSteps: string[] = [];
  private unlocked: string[] = [];
  private locked: string[] = [];

  constructor(state: GameState, debugMode: boolean = false) {
    this.state = state;
    this.debugMode = debugMode;
  }

  /**
   * Обновляет состояние игры на основе текущих разблокировок
   */
  public updateGameState(state: GameState): GameState {
    this.state = state;
    return this.checkAllUnlocks();
  }

  /**
   * Проверяет все возможные разблокировки и обновляет состояние
   */
  public checkAllUnlocks(): GameState {
    if (this.debugMode) {
      this.unlockSteps.push("Запуск проверки всех разблокировок");
    }

    // Проверяем базовые условия разблокировки
    let updatedState = this.state;
    
    // Проверяем, есть ли основные исследования
    updatedState = this.ensureBaseResearchExists(updatedState);
    
    // Проверяем постоянные разблокировки
    if (!updatedState.unlocks.equipment && this.shouldUnlockEquipment()) {
      if (this.debugMode) this.unlockSteps.push("✅ Разблокировка вкладки оборудования");
      updatedState = this.unlockFeature(updatedState, gameIds.features.equipment);
    }
    
    // Проверяем разблокировку USDT
    if (!updatedState.resources.usdt?.unlocked) {
      const knowledgeAppliedCount = this.getCounterValue(updatedState, gameIds.actions.applyKnowledge);
      
      if (knowledgeAppliedCount >= 1) {
        if (this.debugMode) this.unlockSteps.push(`✅ Разблокировка USDT (применено знаний: ${knowledgeAppliedCount})`);
        updatedState = this.unlockResource(updatedState, gameIds.resources.usdt);
      } else {
        if (this.debugMode) this.unlockSteps.push(`❌ USDT не разблокирован (применено знаний: ${knowledgeAppliedCount})`);
      }
    }
    
    // Проверяем разблокировку исследований
    if (!updatedState.unlocks.research) {
      const generatorCount = updatedState.buildings.generator?.count || 0;
      
      if (generatorCount > 0) {
        if (this.debugMode) this.unlockSteps.push(`✅ Разблокировка вкладки исследований (генераторов: ${generatorCount})`);
        updatedState = this.unlockFeature(updatedState, gameIds.features.research);
        
        // Разблокируем первое исследование
        const blockchainBasicsId = gameIds.upgrades.blockchainBasics;
        updatedState = this.unlockUpgrade(updatedState, blockchainBasicsId);
      } else {
        if (this.debugMode) this.unlockSteps.push(`❌ Исследования не разблокированы (генераторов: ${generatorCount})`);
      }
    }
    
    // Проверяем разблокировку криптокошелька
    if (!updatedState.buildings.cryptoWallet?.unlocked) {
      // Проверяем, куплено ли исследование "Основы блокчейна"
      const blockchainBasicsId = gameIds.upgrades.blockchainBasics;
      const blockchainBasicsPurchased = updatedState.upgrades[blockchainBasicsId]?.purchased || false;
      
      if (blockchainBasicsPurchased) {
        if (this.debugMode) this.unlockSteps.push("✅ Разблокировка криптокошелька (Основы блокчейна куплены)");
        updatedState = this.unlockBuilding(updatedState, gameIds.buildings.cryptoWallet);
      } else {
        if (this.debugMode) this.unlockSteps.push("❌ Криптокошелек не разблокирован (Основы блокчейна не куплены)");
      }
    }
    
    // Проверяем разблокировку обмена BTC
    if (!updatedState.unlocks.exchangeBtc) {
      const btcValue = updatedState.resources.bitcoin?.value || 0;
      
      if (btcValue > 0) {
        if (this.debugMode) this.unlockSteps.push(`✅ Разблокировка обмена BTC (BTC: ${btcValue})`);
        updatedState = this.unlockFeature(updatedState, gameIds.features.exchangeBtc);
      } else {
        if (this.debugMode) this.unlockSteps.push(`❌ Обмен BTC не разблокирован (BTC: ${btcValue})`);
      }
    }
    
    return updatedState;
  }

  /**
   * Принудительно проверяет все разблокировки
   */
  public forceCheckAllUnlocks(): GameState {
    if (this.debugMode) {
      this.unlockSteps = [];
      this.unlockSteps.push("Принудительная проверка всех разблокировок");
    }
    
    return this.checkAllUnlocks();
  }

  /**
   * Проверяет, разблокирован ли элемент
   */
  public isUnlocked(itemId: string): boolean {
    // Проверяем прямую разблокировку
    if (this.state.unlocks[itemId] === true) {
      return true;
    }
    
    // Проверяем ресурсы
    if (this.state.resources[itemId]?.unlocked) {
      return true;
    }
    
    // Проверяем здания
    if (this.state.buildings[itemId]?.unlocked) {
      return true;
    }
    
    // Проверяем исследования
    if (this.state.upgrades[itemId]?.unlocked) {
      return true;
    }
    
    return false;
  }

  /**
   * Принудительно разблокирует элемент
   */
  public forceUnlock(itemId: string): GameState {
    let updatedState = { ...this.state };
    
    // Разблокировка в зависимости от типа элемента
    if (itemId in this.state.resources) {
      updatedState = this.unlockResource(updatedState, itemId);
    } else if (itemId in this.state.buildings) {
      updatedState = this.unlockBuilding(updatedState, itemId);
    } else if (itemId in this.state.upgrades) {
      updatedState = this.unlockUpgrade(updatedState, itemId);
    } else {
      // Общая разблокировка
      updatedState = this.unlockFeature(updatedState, itemId);
    }
    
    this.state = updatedState;
    return updatedState;
  }

  /**
   * Получает отчет о разблокировках
   */
  public getUnlockReport(): { steps: string[], unlocked: string[], locked: string[] } {
    // Собираем список разблокированных элементов
    this.unlocked = Object.entries(this.state.unlocks)
      .filter(([_, value]) => value)
      .map(([key, _]) => key);
    
    // Добавляем разблокированные ресурсы
    Object.entries(this.state.resources)
      .filter(([_, resource]) => resource.unlocked)
      .forEach(([key, _]) => this.unlocked.push(`resource:${key}`));
    
    // Добавляем разблокированные здания
    Object.entries(this.state.buildings)
      .filter(([_, building]) => building.unlocked)
      .forEach(([key, _]) => this.unlocked.push(`building:${key}`));
    
    // Добавляем разблокированные исследования
    Object.entries(this.state.upgrades)
      .filter(([_, upgrade]) => upgrade.unlocked)
      .forEach(([key, _]) => this.unlocked.push(`upgrade:${key}`));
    
    // Собираем список заблокированных элементов
    this.locked = Object.keys(this.state.unlocks)
      .filter(key => !this.state.unlocks[key])
      .map(key => key);
    
    // Возвращаем полный отчет
    return {
      steps: this.unlockSteps,
      unlocked: this.unlocked,
      locked: this.locked
    };
  }

  /**
   * Проверяет, должна ли быть разблокирована вкладка оборудования
   */
  private shouldUnlockEquipment(): boolean {
    // Проверяем счетчик разблокированных зданий
    const buildingsUnlockedCount = this.getCounterValue(this.state, 'buildingsUnlocked');
    
    if (buildingsUnlockedCount > 0) {
      return true;
    }
    
    // Проверяем наличие разблокированных зданий
    const hasUnlockedBuildings = Object.values(this.state.buildings)
      .some(building => building.unlocked);
    
    return hasUnlockedBuildings;
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
   * Разблокирует функциональность
   */
  private unlockFeature(state: GameState, featureId: string): GameState {
    if (state.unlocks[featureId]) {
      return state;
    }
    
    // Создаем события для разблокировки
    safeDispatchGameEvent(`Разблокирована новая функция: ${featureId}`, 'success');
    
    if (this.debugMode) {
      this.unlockSteps.push(`Разблокирована новая функция: ${featureId}`);
    }
    
    // Отправляем событие для уведомления компонентов
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('unlock-event', { 
        detail: { itemId: featureId, type: 'feature' } 
      });
      window.dispatchEvent(event);
    }
    
    return {
      ...state,
      unlocks: {
        ...state.unlocks,
        [featureId]: true
      }
    };
  }

  /**
   * Разблокирует ресурс
   */
  private unlockResource(state: GameState, resourceId: string): GameState {
    if (state.resources[resourceId]?.unlocked) {
      return state;
    }
    
    // Создаем события для разблокировки
    safeDispatchGameEvent(`Разблокирован новый ресурс: ${resourceId}`, 'success');
    
    if (this.debugMode) {
      this.unlockSteps.push(`Разблокирован ресурс: ${resourceId}`);
    }
    
    // Отправляем событие для уведомления компонентов
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('unlock-event', { 
        detail: { itemId: resourceId, type: 'resource' } 
      });
      window.dispatchEvent(event);
    }
    
    return {
      ...state,
      resources: {
        ...state.resources,
        [resourceId]: {
          ...state.resources[resourceId],
          unlocked: true
        }
      },
      unlocks: {
        ...state.unlocks,
        [resourceId]: true
      }
    };
  }

  /**
   * Разблокирует здание
   */
  private unlockBuilding(state: GameState, buildingId: string): GameState {
    if (state.buildings[buildingId]?.unlocked) {
      return state;
    }
    
    // Увеличиваем счетчик разблокированных зданий
    const buildingsUnlockedCounter = state.counters.buildingsUnlocked || 
                                    { id: 'buildingsUnlocked', name: 'buildingsUnlocked', value: 0 };
    
    const updatedCounters = {
      ...state.counters,
      buildingsUnlocked: {
        ...(typeof buildingsUnlockedCounter === 'object' ? buildingsUnlockedCounter : { id: 'buildingsUnlocked', name: 'buildingsUnlocked' }),
        value: (typeof buildingsUnlockedCounter === 'object' ? buildingsUnlockedCounter.value : buildingsUnlockedCounter) + 1
      }
    };
    
    // Создаем события для разблокировки
    safeDispatchGameEvent(`Разблокировано новое здание: ${buildingId}`, 'success');
    
    if (this.debugMode) {
      this.unlockSteps.push(`Разблокировано здание: ${buildingId}`);
    }
    
    // Отправляем событие для уведомления компонентов
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('unlock-event', { 
        detail: { itemId: buildingId, type: 'building' } 
      });
      window.dispatchEvent(event);
    }
    
    return {
      ...state,
      buildings: {
        ...state.buildings,
        [buildingId]: {
          ...state.buildings[buildingId],
          unlocked: true
        }
      },
      counters: updatedCounters
    };
  }

  /**
   * Разблокирует исследование
   */
  private unlockUpgrade(state: GameState, upgradeId: string): GameState {
    if (state.upgrades[upgradeId]?.unlocked) {
      return state;
    }
    
    // Создаем события для разблокировки
    safeDispatchGameEvent(`Разблокировано новое исследование: ${upgradeId}`, 'success');
    
    if (this.debugMode) {
      this.unlockSteps.push(`Разблокировано исследование: ${upgradeId}`);
    }
    
    // Отправляем событие для уведомления компонентов
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('unlock-event', { 
        detail: { itemId: upgradeId, type: 'upgrade' } 
      });
      window.dispatchEvent(event);
    }
    
    return {
      ...state,
      upgrades: {
        ...state.upgrades,
        [upgradeId]: {
          ...state.upgrades[upgradeId],
          unlocked: true
        }
      }
    };
  }

  /**
   * Проверяет наличие базовых исследований и добавляет их, если их нет
   */
  private ensureBaseResearchExists(state: GameState): GameState {
    // Проверяем наличие исследования "Основы блокчейна"
    const blockchainBasicsId = gameIds.upgrades.blockchainBasics;
    let updatedState = { ...state };
    
    // Если исследование не существует, добавляем его
    if (!updatedState.upgrades[blockchainBasicsId]) {
      if (this.debugMode) {
        this.unlockSteps.push(`Добавление базового исследования: ${blockchainBasicsId}`);
      }
      
      updatedState = {
        ...updatedState,
        upgrades: {
          ...updatedState.upgrades,
          [blockchainBasicsId]: {
            id: blockchainBasicsId,
            name: "Основы блокчейна",
            description: "Изучение базовых принципов работы блокчейна",
            cost: { knowledge: 100 },
            unlocked: false,
            purchased: false,
            effects: {
              knowledgeMaxBoost: 1.5,
              knowledgeProductionBoost: 1.1
            }
          }
        }
      };
      
      // Проверяем, должно ли быть исследование уже разблокировано
      if (updatedState.buildings.generator?.count > 0) {
        updatedState.upgrades[blockchainBasicsId].unlocked = true;
      }
    }
    
    return updatedState;
  }
}

/**
 * Проверяет все возможные разблокировки и обновляет состояние
 */
export function checkAllUnlocks(state: GameState): GameState {
  const unlockManager = new UnlockManager(state);
  return unlockManager.checkAllUnlocks();
}

/**
 * Принудительно проверяет все разблокировки
 */
export function forceCheckAllUnlocks(state: GameState): GameState {
  const unlockManager = new UnlockManager(state);
  return unlockManager.forceCheckAllUnlocks();
}

/**
 * Проверяет, разблокирован ли элемент
 */
export function isUnlocked(state: GameState, itemId: string): boolean {
  const unlockManager = new UnlockManager(state);
  return unlockManager.isUnlocked(itemId);
}

/**
 * Проверяет и добавляет свойство cost для новых зданий
 */
export function ensureBuildingsCostProperty(state: GameState): GameState {
  const updatedState = { ...state };
  
  // Проверяем все здания
  Object.keys(updatedState.buildings).forEach(buildingId => {
    const building = updatedState.buildings[buildingId];
    
    // Если у здания нет свойства cost, добавляем его
    if (!building.cost) {
      console.log(`Добавление свойства cost для здания ${buildingId}`);
      
      // Определяем стандартную стоимость в зависимости от типа здания
      let defaultCost = {};
      
      switch (buildingId) {
        case gameIds.buildings.practice:
          defaultCost = { usdt: 10 };
          break;
        case gameIds.buildings.generator:
          defaultCost = { usdt: 20 };
          break;
        case gameIds.buildings.cryptoWallet:
          defaultCost = { usdt: 30, knowledge: 50 };
          break;
        case gameIds.buildings.homeComputer:
          defaultCost = { usdt: 55 };
          break;
        case gameIds.buildings.internetChannel:
          defaultCost = { usdt: 75 };
          break;
        case gameIds.buildings.miner:
          defaultCost = { usdt: 150 };
          break;
        case gameIds.buildings.cryptoLibrary:
          defaultCost = { usdt: 200, knowledge: 200 };
          break;
        case gameIds.buildings.coolingSystem:
          defaultCost = { usdt: 200, electricity: 50 };
          break;
        case gameIds.buildings.enhancedWallet:
          defaultCost = { usdt: 300, knowledge: 250 };
          break;
        default:
          defaultCost = { usdt: 50 };
      }
      
      // Обновляем здание
      updatedState.buildings[buildingId] = {
        ...building,
        cost: defaultCost
      };
    }
  });
  
  return updatedState;
}
