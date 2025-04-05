/**
 * ЕДИНАЯ СИСТЕМА УПРАВЛЕНИЯ РАЗБЛОКИРОВКАМИ
 * 
 * Этот файл заменяет разрозненные системы разблокировок:
 * - utils/unlockSystem.ts
 * - utils/unlockManager.ts
 * - systems/unlock/UnlockManager.ts
 * 
 * Все функции консолидированы в едином месте для предотвращения конфликтов
 */

import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

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
   * Проверяет все возможные разблокировки и обновляет состояние
   * Важно: Не блокирует повторно элементы, которые уже были разблокированы ранее
   */
  public updateGameState(state: GameState): GameState {
    this.state = state;
    this.unlockSteps = [];
    this.unlocked = [];
    this.locked = [];

    // Проход 1: Выполняем общую проверку разблокировок для ресурсов и зданий
    this.checkResourceUnlocks();
    this.checkBuildingUnlocks();
    this.checkUpgradeUnlocks();
    this.checkFeatureUnlocks();

    // Проход 2: Проверяем зависимости дополнительных разблокировок
    this.checkCascadingUnlocks();

    // Проход 3: Проверяем правильность счетчиков разблокировок
    this.fixUnlockCounters();

    if (this.debugMode) {
      console.log("UnlockManager: Шаги разблокировки:", this.unlockSteps);
      console.log("UnlockManager: Разблокировано:", this.unlocked);
      console.log("UnlockManager: Осталось заблокированным:", this.locked);
    }

    return this.state;
  }

  /**
   * Принудительная проверка всех возможных разблокировок
   */
  public forceCheckAllUnlocks(): GameState {
    // Выполняем все проверки
    const result = this.updateGameState(this.state);
    
    // Дополнительно проверяем, что у нас есть основное исследование
    if (this.isUnlocked('research')) {
      this.ensureBaseResearchExists();
    }
    
    return result;
  }

  /**
   * Проверяет, разблокирован ли элемент
   */
  public isUnlocked(itemId: string): boolean {
    // Проверка специальных элементов
    if (itemId === 'research') {
      return !!this.state.unlocks.research;
    }
    
    // Проверка раскрытия действий
    if (itemId === 'applyKnowledge') {
      return !!this.state.unlocks.applyKnowledge;
    }
    
    // Проверка зданий
    if (this.state.buildings[itemId]) {
      return !!this.state.buildings[itemId].unlocked;
    }
    
    // Проверка исследований
    if (this.state.upgrades[itemId]) {
      return !!this.state.upgrades[itemId].unlocked;
    }
    
    // Проверка ресурсов
    if (this.state.resources[itemId]) {
      return !!this.state.resources[itemId].unlocked;
    }
    
    // Проверка в объекте unlocks
    return !!this.state.unlocks[itemId];
  }

  /**
   * Принудительно разблокирует элемент
   */
  public forceUnlock(itemId: string): GameState {
    const itemType = this.getItemType(itemId);
    
    if (this.debugMode) {
      console.log(`UnlockManager: Принудительная разблокировка ${itemId} (тип: ${itemType})`);
    }
    
    switch (itemType) {
      case 'building':
        this.state = {
          ...this.state,
          buildings: {
            ...this.state.buildings,
            [itemId]: {
              ...this.state.buildings[itemId],
              unlocked: true
            }
          },
          unlocks: {
            ...this.state.unlocks,
            [itemId]: true
          }
        };
        
        // Обновляем счетчик разблокированных зданий
        this.incrementBuildingsUnlockedCounter();
        break;
        
      case 'upgrade':
        this.state = {
          ...this.state,
          upgrades: {
            ...this.state.upgrades,
            [itemId]: {
              ...this.state.upgrades[itemId],
              unlocked: true
            }
          },
          unlocks: {
            ...this.state.unlocks,
            [itemId]: true
          }
        };
        break;
        
      case 'resource':
        this.state = {
          ...this.state,
          resources: {
            ...this.state.resources,
            [itemId]: {
              ...this.state.resources[itemId],
              unlocked: true
            }
          },
          unlocks: {
            ...this.state.unlocks,
            [itemId]: true
          }
        };
        break;
        
      case 'feature':
        this.state = {
          ...this.state,
          unlocks: {
            ...this.state.unlocks,
            [itemId]: true
          }
        };
        break;
    }
    
    return this.state;
  }

  /**
   * Получает отчет о разблокировках для отладки
   */
  public getUnlockReport(): { steps: string[], unlocked: string[], locked: string[] } {
    return {
      steps: this.unlockSteps,
      unlocked: this.unlocked,
      locked: this.locked
    };
  }

  // Private methods

  /**
   * Проверяет ресурсы на разблокировку
   * ВАЖНО: Не блокирует повторно ресурсы, которые уже были разблокированы
   */
  private checkResourceUnlocks(): void {
    if (this.debugMode) {
      console.log("UnlockManager: Проверка разблокировок ресурсов");
    }
    
    // USDT разблокируется после применения знаний
    const applyKnowledgeCount = this.getCounterValue('applyKnowledge');
    if (applyKnowledgeCount >= 1 && !this.isUnlocked('usdt')) {
      this.unlockResource('usdt');
    }
    
    // ВАЖНАЯ КОРРЕКЦИЯ: Электричество должно быть разблокировано только если есть генератор
    // И заблокировано, если генератора нет
    const generatorCount = this.state.buildings.generator?.count || 0;
    if (generatorCount > 0) {
      if (!this.isUnlocked('electricity')) {
        this.unlockResource('electricity');
        if (this.debugMode) {
          console.log(`UnlockManager: Разблокировка электричества (количество генераторов: ${generatorCount})`);
        }
      }
    } else {
      // Если генератора нет, убеждаемся что электричество заблокировано
      if (this.state.resources.electricity && this.state.resources.electricity.unlocked) {
        // Явно блокируем электричество
        this.state.resources.electricity.unlocked = false;
        this.state.unlocks.electricity = false;
        if (this.debugMode) {
          console.log("UnlockManager: Блокировка электричества (нет генераторов)");
        }
      }
    }
    
    // Вычислительная мощность разблокируется после покупки домашнего компьютера
    if (this.state.buildings.homeComputer?.count > 0 && !this.isUnlocked('computingPower')) {
      this.unlockResource('computingPower');
    }
    
    // Bitcoin разблокируется после покупки майнера
    if ((this.state.buildings.miner?.count > 0 || this.state.buildings.autoMiner?.count > 0) && !this.isUnlocked('bitcoin')) {
      this.unlockResource('bitcoin');
    }
  }

  /**
   * Проверяет здания на разблокировку
   * ВАЖНО: Не блокирует повторно здания, которые уже были разблокированы
   */
  private checkBuildingUnlocks(): void {
    if (this.debugMode) {
      console.log("UnlockManager: Проверка разблокировок зданий");
    }
    
    // "Практика" разблокируется после 2+ применений знаний
    const applyKnowledgeCount = this.getCounterValue('applyKnowledge');
    if (applyKnowledgeCount >= 2 && this.state.buildings.practice && !this.isUnlocked('practice')) {
      this.unlockBuilding('practice');
    }
    
    // "Генератор" разблокируется после накопления 11+ USDT
    if (this.state.resources.usdt?.unlocked && 
        this.state.resources.usdt?.value >= 11 && 
        this.state.buildings.generator && 
        !this.isUnlocked('generator')) {
      this.unlockBuilding('generator');
    }
    
    // "Домашний компьютер" разблокируется после 50+ электричества
    if (this.state.resources.electricity?.unlocked && 
        this.state.resources.electricity?.value >= 50 && 
        this.state.buildings.homeComputer && 
        !this.isUnlocked('homeComputer')) {
      this.unlockBuilding('homeComputer');
    }
    
    // "Интернет-канал" разблокируется после покупки компьютера
    if (this.state.buildings.homeComputer?.count > 0 && 
        this.state.buildings.internetConnection && 
        !this.isUnlocked('internetConnection')) {
      this.unlockBuilding('internetConnection');
    }
    
    // "Криптокошелек" разблокируется после исследования "Основы блокчейна"
    const hasBlockchainBasics = this.state.upgrades.blockchainBasics?.purchased || 
                               this.state.upgrades.blockchain_basics?.purchased ||
                               this.state.upgrades.basicBlockchain?.purchased;
    if (hasBlockchainBasics && 
        this.state.buildings.cryptoWallet && 
        !this.isUnlocked('cryptoWallet')) {
      this.unlockBuilding('cryptoWallet');
    }
    
    // Другие проверки разблокировок...
  }

  /**
   * Проверяет исследования на разблокировку
   * ВАЖНО: Не блокирует повторно исследования, которые уже были разблокированы
   */
  private checkUpgradeUnlocks(): void {
    if (this.debugMode) {
      console.log("UnlockManager: Проверка разблокировок исследований");
    }
    
    // "Основы блокчейна" разблокируется после покупки генератора
    if (this.state.buildings.generator?.count > 0) {
      const blockchainBasicsIds = ['blockchainBasics', 'blockchain_basics', 'basicBlockchain'];
      
      for (const id of blockchainBasicsIds) {
        if (this.state.upgrades[id] && !this.isUnlocked(id)) {
          this.unlockUpgrade(id);
        }
      }
    }
    
    // "Безопасность криптокошельков" разблокируется после покупки криптокошелька
    if (this.state.buildings.cryptoWallet?.count > 0) {
      const walletSecurityIds = ['walletSecurity', 'cryptoWalletSecurity'];
      
      for (const id of walletSecurityIds) {
        if (this.state.upgrades[id] && !this.isUnlocked(id)) {
          this.unlockUpgrade(id);
        }
      }
    }
    
    // Другие проверки разблокировок...
  }

  /**
   * Проверка разблокировок функций (вкладок, возможностей)
   * ВАЖНО: Не блокирует повторно функции, которые уже были разблокированы
   */
  private checkFeatureUnlocks(): void {
    if (this.debugMode) {
      console.log("UnlockManager: Проверка разблокировок функций");
    }
    
    // Проверка разблокировки вкладки "Оборудование" (equipment)
    const buildingsUnlockedCounter = this.getCounterValue('buildingsUnlocked');
    if (buildingsUnlockedCounter > 0 && !this.isUnlocked('equipment')) {
      this.unlockFeature('equipment');
    }
    
    // Проверка разблокировки вкладки "Исследования" (research)
    if (this.state.buildings.generator?.count > 0 && !this.isUnlocked('research')) {
      this.unlockFeature('research');
    }
    
    // Проверка действия "Применить знания" (applyKnowledge)
    const knowledgeClicksCounter = this.getCounterValue('knowledgeClicks');
    if (knowledgeClicksCounter >= 3 && !this.isUnlocked('applyKnowledge')) {
      this.unlockFeature('applyKnowledge');
    }
    
    // Другие проверки разблокировок...
  }

  /**
   * Проверяет зависимости дополнительных разблокировок
   */
  private checkCascadingUnlocks(): void {
    // Если исследования разблокированы, убедимся что у нас есть базовое исследование
    if (this.isUnlocked('research')) {
      this.ensureBaseResearchExists();
    }
  }

  /**
   * Убеждается, что базовое исследование существует и разблокировано
   */
  private ensureBaseResearchExists(): void {
    if (this.debugMode) {
      console.log("UnlockManager: Проверка базовых исследований");
    }
    
    // Проверяем наличие "Основы блокчейна" и при необходимости создаем
    const blockchainBasicsIds = ['blockchainBasics', 'blockchain_basics', 'basicBlockchain'];
    let blockchainBasicsExists = false;
    let existingId = '';
    
    // Проверяем все возможные ID
    for (const id of blockchainBasicsIds) {
      if (this.state.upgrades && this.state.upgrades[id]) {
        blockchainBasicsExists = true;
        existingId = id;
        break;
      }
    }
    
    if (!blockchainBasicsExists) {
      console.log("UnlockManager: Создаем отсутствующее исследование 'Основы блокчейна'");
      
      // Создаем исследование с каноническим ID
      this.state.upgrades.blockchainBasics = {
        id: 'blockchainBasics',
        name: 'Основы блокчейна',
        description: 'Фундаментальные знания о технологии блокчейн, криптографии и децентрализованных системах.',
        cost: { knowledge: 100 },
        unlocked: false,
        purchased: false,
        effects: {
          knowledgeMaxBoost: 0.5,
          knowledgeBoost: 0.1
        },
        category: 'blockchain',
        tier: 1
      };
    } else if (existingId !== 'blockchainBasics') {
      // Если исследование существует под другим ID, создаем ссылку на каноничный ID
      console.log(`UnlockManager: Найдено исследование 'Основы блокчейна' под ID ${existingId}, создаем канонический ID`);
      
      this.state.upgrades.blockchainBasics = {
        ...this.state.upgrades[existingId],
        id: 'blockchainBasics'
      };
    }
    
    // Проверка разблокировки "Основы блокчейна"
    const generatorExists = this.state.buildings.generator && this.state.buildings.generator.count > 0;
    
    if (generatorExists && !this.state.upgrades.blockchainBasics.unlocked) {
      console.log("UnlockManager: Принудительная разблокировка 'Основы блокчейна'");
      
      this.state.upgrades.blockchainBasics.unlocked = true;
      
      // Отправляем событие о разблокировке
      this.dispatchUnlockEvent('blockchainBasics', 'upgrade');
    }
  }

  /**
   * Полная проверка всех разблокировок с нуля
   */
  public forceCheckAllUnlocks(): GameState {
    // Выполняем все проверки
    const result = this.updateGameState(this.state);
    
    // Дополнительно проверяем, что у нас есть основное исследование
    if (this.isUnlocked('research')) {
      this.ensureBaseResearchExists();
    }
    
    return result;
  }

  /**
   * Проверяет и исправляет счетчики разблокировок
   */
  private fixUnlockCounters(): void {
    // Проверяем счетчик разблокированных зданий
    const unlockedBuildingsCount = Object.values(this.state.buildings)
      .filter(building => building.unlocked)
      .length;
    
    const buildingsUnlockedCounter = this.getCounterValue('buildingsUnlocked');
    
    if (unlockedBuildingsCount > 0 && buildingsUnlockedCounter === 0) {
      // Исп��авляем счетчик buildingsUnlocked
      this.state = {
        ...this.state,
        counters: {
          ...this.state.counters,
          buildingsUnlocked: {
            id: 'buildingsUnlocked',
            name: 'buildingsUnlocked',
            value: unlockedBuildingsCount
          }
        }
      };
      
      if (this.debugMode) {
        console.log(`UnlockManager: Исправлен счетчик buildingsUnlocked: ${unlockedBuildingsCount}`);
      }
    }
  }

  /**
   * Инкрементирует счетчик разблокированных зданий
   */
  private incrementBuildingsUnlockedCounter(): void {
    const buildingsUnlockedCounter = this.state.counters.buildingsUnlocked || { 
      id: 'buildingsUnlocked', 
      name: 'buildingsUnlocked', 
      value: 0 
    };
    
    const counterValue = typeof buildingsUnlockedCounter === 'object' 
      ? buildingsUnlockedCounter.value 
      : buildingsUnlockedCounter;
    
    this.state = {
      ...this.state,
      counters: {
        ...this.state.counters,
        buildingsUnlocked: {
          id: 'buildingsUnlocked',
          name: 'buildingsUnlocked',
          value: counterValue + 1
        }
      }
    };
    
    if (this.debugMode) {
      console.log(`UnlockManager: Увеличен счетчик buildingsUnlocked: ${counterValue + 1}`);
    }
  }

  /**
   * Разблокирует здание
   */
  private unlockBuilding(buildingId: string): void {
    if (!this.state.buildings[buildingId]) {
      if (this.debugMode) {
        console.log(`UnlockManager: Ошибка! Здание ${buildingId} не существует`);
      }
      return;
    }
    
    this.state = {
      ...this.state,
      buildings: {
        ...this.state.buildings,
        [buildingId]: {
          ...this.state.buildings[buildingId],
          unlocked: true
        }
      },
      unlocks: {
        ...this.state.unlocks,
        [buildingId]: true
      }
    };
    
    // Обновляем счетчик разблокированных зданий
    this.incrementBuildingsUnlockedCounter();
    
    if (this.debugMode) {
      this.unlockSteps.push(`Разблокировано здание: ${buildingId}`);
      this.unlocked.push(`building:${buildingId}`);
    }
  }

  /**
   * Разблокирует исследование
   */
  private unlockUpgrade(upgradeId: string): void {
    if (!this.state.upgrades[upgradeId]) {
      if (this.debugMode) {
        console.log(`UnlockManager: Ошибка! Исследование ${upgradeId} не существует`);
      }
      return;
    }
    
    this.state = {
      ...this.state,
      upgrades: {
        ...this.state.upgrades,
        [upgradeId]: {
          ...this.state.upgrades[upgradeId],
          unlocked: true
        }
      },
      unlocks: {
        ...this.state.unlocks,
        [upgradeId]: true
      }
    };
    
    if (this.debugMode) {
      this.unlockSteps.push(`Разблокировано исследование: ${upgradeId}`);
      this.unlocked.push(`upgrade:${upgradeId}`);
    }
  }

  /**
   * Разблокирует ресурс
   */
  private unlockResource(resourceId: string): void {
    if (!this.state.resources[resourceId]) {
      if (this.debugMode) {
        console.log(`UnlockManager: Ошибка! Ресурс ${resourceId} не существует`);
      }
      return;
    }
    
    this.state = {
      ...this.state,
      resources: {
        ...this.state.resources,
        [resourceId]: {
          ...this.state.resources[resourceId],
          unlocked: true
        }
      },
      unlocks: {
        ...this.state.unlocks,
        [resourceId]: true
      }
    };
    
    if (this.debugMode) {
      this.unlockSteps.push(`Разблокирован ресурс: ${resourceId}`);
      this.unlocked.push(`resource:${resourceId}`);
    }
  }

  /**
   * Разблокирует функцию
   */
  private unlockFeature(featureId: string): void {
    this.state = {
      ...this.state,
      unlocks: {
        ...this.state.unlocks,
        [featureId]: true
      }
    };
    
    if (this.debugMode) {
      this.unlockSteps.push(`Разблокирована функция: ${featureId}`);
      this.unlocked.push(`feature:${featureId}`);
    }
  }

  /**
   * Получает тип элемента по его ID
   */
  private getItemType(itemId: string): 'building' | 'upgrade' | 'resource' | 'feature' {
    if (this.state.buildings[itemId]) {
      return 'building';
    }
    
    if (this.state.upgrades[itemId]) {
      return 'upgrade';
    }
    
    if (this.state.resources[itemId]) {
      return 'resource';
    }
    
    return 'feature';
  }

  /**
   * Безопасно получает значение счетчика
   */
  private getCounterValue(counterId: string): number {
    const counter = this.state.counters[counterId];
    if (!counter) return 0;
    return typeof counter === 'object' ? counter.value : counter;
  }

  /**
   * Отправка события о разблокировке для реактивности интерфейса
   */
  private dispatchUnlockEvent(itemId: string, itemType: string): void {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      const event = new CustomEvent('unlock-event', { 
        detail: { itemId, itemType } 
      });
      
      window.dispatchEvent(event);
    }
  }
}

// Эта функция проверяет и добавляет свойство cost для всех зданий, у которых его нет
export function ensureBuildingsCostProperty(state: GameState): GameState {
  const newState = { ...state };
  
  // Проверяем все здания и добавляем свойство cost там, где его нет
  for (const buildingKey in newState.buildings) {
    const building = newState.buildings[buildingKey];
    
    if (building && !building.cost) {
      console.log(`ensureBuildingsCostProperty: Добавляем свойство cost для здания ${buildingKey}`);
      
      // Если у здания есть baseCost, используем его значение
      if (building.baseCost) {
        newState.buildings[buildingKey] = {
          ...building,
          cost: { ...building.baseCost }
        };
      } else {
        // Если baseCost отсутствует, создаем пустой объект cost для предотвращения ошибок
        newState.buildings[buildingKey] = {
          ...building,
          cost: {}
        };
      }
    }
  }
  
  return newState;
}

// Экспортируем вспомогательные функции для обратной совместимости
export function checkAllUnlocks(state: GameState): GameState {
  console.log('unifiedUnlockSystem: checkAllUnlocks вызван');
  const unlockManager = new UnlockManager(state);
  return unlockManager.updateGameState(state);
}

export function forceCheckAllUnlocks(state: GameState): GameState {
  console.log('unifiedUnlockSystem: forceCheckAllUnlocks вызван');
  const unlockManager = new UnlockManager(state);
  return unlockManager.forceCheckAllUnlocks();
}

export function isUnlocked(state: GameState, itemId: string): boolean {
  const unlockManager = new UnlockManager(state);
  return unlockManager.isUnlocked(itemId);
}
