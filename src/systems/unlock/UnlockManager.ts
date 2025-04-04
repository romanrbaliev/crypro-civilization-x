import { GameState } from '@/context/types';
import { 
  UnlockableItem, 
  UnlockCondition, 
  UnlockState, 
  UnlockNotification,
  UnlockChangeEvent
} from './types';
import { unlockableItemsRegistry } from './registry';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Менеджер разблокировок - централизованный сервис для управления
 * разблокировками элементов игры
 */
export class UnlockManager {
  private registry: { [itemId: string]: UnlockableItem };
  private unlockState: UnlockState;
  private gameState: GameState;
  
  constructor(gameState: GameState) {
    this.registry = unlockableItemsRegistry;
    this.gameState = gameState;
    this.unlockState = { 
      items: { ...gameState.unlocks }, 
      conditionCache: {}, 
      lastChecked: {} 
    };
    
    // Инициализация начального состояния
    this.initializeUnlockState();
  }
  
  /**
   * Проверяет все условия разблокировки для элемента
   */
  public checkItemUnlockConditions(itemId: string): boolean {
    const item = this.registry[itemId];
    if (!item) return false;
    
    // Если нет условий, элемент разблокирован по умолчанию
    if (item.conditions.length === 0) return true;
    
    // Все условия должны быть выполнены
    return item.conditions.every(condition => this.checkCondition(condition));
  }
  
  /**
   * Проверяет отдельное условие
   */
  private checkCondition(condition: UnlockCondition): boolean {
    // Используем кэш, если условие уже проверялось
    if (this.shouldUseCache(condition.id)) {
      return this.unlockState.conditionCache[condition.id];
    }
    
    let result = false;
    
    switch (condition.type) {
      case 'resource':
        result = this.checkResourceCondition(condition);
        break;
      case 'building':
        result = this.checkBuildingCondition(condition);
        break;
      case 'upgrade':
        result = this.checkUpgradeCondition(condition);
        break;
      case 'counter':
        result = this.checkCounterCondition(condition);
        break;
    }
    
    // Сохраняем результат в кэш
    this.cacheConditionResult(condition.id, result);
    return result;
  }
  
  /**
   * Проверяет условие, связанное с ресурсом
   */
  private checkResourceCondition(condition: UnlockCondition): boolean {
    const resource = this.gameState.resources[condition.targetId];
    if (!resource) return false;
    
    switch (condition.operator) {
      case 'gte':
        return resource.value >= (condition.targetValue as number);
      case 'eq':
        return resource.value === (condition.targetValue as number);
      case 'lte':
        return resource.value <= (condition.targetValue as number);
      default:
        return false;
    }
  }
  
  /**
   * Проверяет условие, связанное со зданием
   */
  private checkBuildingCondition(condition: UnlockCondition): boolean {
    const building = this.gameState.buildings[condition.targetId];
    if (!building) return false;
    
    switch (condition.operator) {
      case 'gte':
        return building.count >= (condition.targetValue as number);
      case 'eq':
        return building.count === (condition.targetValue as number);
      case 'lte':
        return building.count <= (condition.targetValue as number);
      default:
        return false;
    }
  }
  
  /**
   * Проверяет условие, связанное с улучшением
   */
  private checkUpgradeCondition(condition: UnlockCondition): boolean {
    const upgrade = this.gameState.upgrades[condition.targetId];
    if (!upgrade) return false;
    
    // Для улучшений проверяем, приобретено ли оно
    if (condition.operator === 'eq' && condition.targetValue === true) {
      return upgrade.purchased === true;
    }
    
    return false;
  }
  
  /**
   * Проверяет условие, связанное со счетчиком
   */
  private checkCounterCondition(condition: UnlockCondition): boolean {
    // Специальная обработка счетчика buildingsUnlocked
    if (condition.targetId === 'buildingsUnlocked') {
      const unlockedBuildingsCount = Object.values(this.gameState.buildings)
        .filter(building => building.unlocked).length;
      
      switch (condition.operator) {
        case 'gte':
          return unlockedBuildingsCount >= (condition.targetValue as number);
        case 'eq':
          return unlockedBuildingsCount === (condition.targetValue as number);
        case 'lte':
          return unlockedBuildingsCount <= (condition.targetValue as number);
        default:
          return false;
      }
    }
    
    // Для обычных счетчиков
    const counter = this.gameState.counters[condition.targetId];
    if (!counter) return false;
    
    const value = typeof counter === 'object' ? counter.value : counter;
    
    switch (condition.operator) {
      case 'gte':
        return value >= (condition.targetValue as number);
      case 'eq':
        return value === (condition.targetValue as number);
      case 'lte':
        return value <= (condition.targetValue as number);
      default:
        return false;
    }
  }
  
  /**
   * Применяет результаты проверок к состоянию игры
   */
  public applyUnlockResults(): GameState {
    let stateChanged = false;
    const unlocks = { ...this.gameState.unlocks };
    const resources = { ...this.gameState.resources };
    const buildings = { ...this.gameState.buildings };
    const upgrades = { ...this.gameState.upgrades };
    
    // ВАЖНО: Добавляем проверку и обработку счетчика applyKnowledge для разблокировки practice
    const applyKnowledgeCounter = this.gameState.counters.applyKnowledge;
    
    if (applyKnowledgeCounter && applyKnowledgeCounter.value >= 2) {
      // Проверяем наличие и обновляем здание practice, если счетчик >= 2
      if (buildings.practice && !buildings.practice.unlocked) {
        console.log("UnlockManager: Явная проверка разблокировки practice. Счетчик применений:", applyKnowledgeCounter.value);
        
        buildings.practice = {
          ...buildings.practice,
          unlocked: true
        };
        
        unlocks.practice = true;
        stateChanged = true;
        
        // Уведомляем о разблокировке
        safeDispatchGameEvent("Разблокировано новое здание: Практика", "success");
      }
    }
    
    // Проверяем каждый элемент в реестре
    for (const itemId in this.registry) {
      const item = this.registry[itemId];
      const isCurrentlyUnlocked = this.unlockState.items[itemId] === true;
      
      // Особый случай для электричества - должно разблокироваться только через покупку генератора
      if (itemId === 'electricity') {
        const generatorBuilding = buildings.generator;
        if (generatorBuilding && generatorBuilding.count > 0 && !resources.electricity?.unlocked) {
          console.log("UnlockManager: Разблокировка электричества через генератор");
          
          resources.electricity = {
            ...resources.electricity,
            unlocked: true
          };
          
          unlocks.electricity = true;
          stateChanged = true;
          
          // Уведомляем о разблокировке
          safeDispatchGameEvent("Разблокирован новый ресурс: Электричество", "success");
        }
        continue; // Пропускаем обычную проверку для электричества
      }
      
      // Проверяем, нужно ли разблокировать элемент
      if (item.autoUnlock && !isCurrentlyUnlocked) {
        const canUnlock = this.checkItemUnlockConditions(itemId);
        
        if (canUnlock) {
          console.log(`UnlockManager: Проверка разблокировки ${itemId}, результат: можно разблокировать`);
          
          // Обновляем состояние разблокировки
          this.unlockState.items[itemId] = true;
          unlocks[itemId] = true;
          
          // Обновляем конкретный элемент в зависимости от типа
          switch (item.type) {
            case 'resource':
              if (resources[itemId]) {
                resources[itemId] = {
                  ...resources[itemId],
                  unlocked: true
                };
              }
              break;
            case 'building':
              if (buildings[itemId]) {
                buildings[itemId] = {
                  ...buildings[itemId],
                  unlocked: true
                };
              }
              break;
            case 'upgrade':
              if (upgrades[itemId]) {
                upgrades[itemId] = {
                  ...upgrades[itemId],
                  unlocked: true
                };
              }
              break;
          }
          
          // Отмечаем, что состояние изменилось
          stateChanged = true;
          
          // Уведомляем о разблокировке
          this.notifyUnlock(item);
        }
      }
    }
    
    // Если состояние изменилось, возвращаем обновленное состояние
    if (stateChanged) {
      const newState = {
        ...this.gameState,
        unlocks,
        resources,
        buildings,
        upgrades
      };
      
      // Проверяем элементы, которые могут быть затронуты разблокировками
      return this.checkInfluencedItems(newState);
    }
    
    return this.gameState;
  }
  
  /**
   * Проверяет элементы, которые могут быть затронуты разблокировками
   */
  private checkInfluencedItems(state: GameState): GameState {
    // Находим все элементы, которые могут влиять на другие
    const influencers = Object.values(this.registry)
      .filter(item => item.influencesOthers && this.unlockState.items[item.id]);
    
    if (influencers.length > 0) {
      // Обновляем состояние для повторной проверки
      this.gameState = state;
      this.invalidateCache();
      
      // Перезапускаем проверку
      return this.applyUnlockResults();
    }
    
    return state;
  }
  
  /**
   * Уведомление о разблокировке
   */
  private notifyUnlock(item: UnlockableItem) {
    console.log(`UnlockManager: Разблокирован элемент: ${item.id} (тип: ${item.type})`);
    
    // Формируем сообщение для пользователя
    const message = this.getUnlockMessage(item);
    if (message) {
      // Отправляем уведомление через существующую систему событий
      safeDispatchGameEvent(message, "success");
      
      // Дополнительно диспатчим событие для возможной дальнейшей обработки
      this.dispatchUnlockEvent({
        itemId: item.id,
        unlocked: true,
        itemType: item.type,
        itemName: item.name
      });
    }
  }
  
  /**
   * Получение сообщения для уведомления пользователя
   */
  private getUnlockMessage(item: UnlockableItem): string | null {
    // Разные сообщения в зависимости от типа элемента
    switch (item.type) {
      case 'resource':
        return `Разблокирован новый ресурс: ${item.name}`;
      case 'building':
        return `Разблокировано новое здание: ${item.name}`;
      case 'upgrade':
        return `Разблокировано новое исследование: ${item.name}`;
      case 'feature':
        return `Разблокирована новая возможность: ${item.name}`;
      default:
        return null;
    }
  }
  
  /**
   * Диспатчит событие о разблокировке
   */
  private dispatchUnlockEvent(event: UnlockChangeEvent) {
    // Создаем пользовательское событие
    if (typeof window !== 'undefined') {
      const customEvent = new CustomEvent('unlock-event', {
        detail: event
      });
      
      // Диспатчим событие
      window.dispatchEvent(customEvent);
    }
  }
  
  /**
   * Кэширование результата проверки условия
   */
  private cacheConditionResult(conditionId: string, result: boolean) {
    this.unlockState.conditionCache[conditionId] = result;
    this.unlockState.lastChecked[conditionId] = Date.now();
  }
  
  /**
   * Проверяет, нужно ли использовать кэш для условия
   */
  private shouldUseCache(conditionId: string): boolean {
    // Проверяем, есть ли результат в кэше
    if (!this.unlockState.conditionCache.hasOwnProperty(conditionId)) {
      return false;
    }
    
    // Проверяем время последней проверки (кэшируем на 1 секунду)
    const lastChecked = this.unlockState.lastChecked[conditionId] || 0;
    return (Date.now() - lastChecked) < 1000;
  }
  
  /**
   * Сбрасывает кэш проверок
   */
  private invalidateCache() {
    this.unlockState.conditionCache = {};
  }
  
  /**
   * Инициализация начального состояния
   */
  private initializeUnlockState() {
    // Установка разблокировок, которые должны быть всегда активны
    this.unlockState.items['knowledge'] = true;
    
    // Проверяем, нужно ли разблокировать practice
    const applyKnowledgeCounter = this.gameState.counters.applyKnowledge;
    if (applyKnowledgeCounter && applyKnowledgeCounter.value >= 2) {
      this.unlockState.items['practice'] = true;
    }
    
    // Проверка наличия генератора для электричества
    const generator = this.gameState.buildings.generator;
    if (generator && generator.count > 0) {
      this.unlockState.items['electricity'] = true;
    }
  }
  
  /**
   * Проверяет, разблокирован ли элемент
   */
  public isUnlocked(itemId: string): boolean {
    return this.unlockState.items[itemId] === true;
  }
  
  /**
   * Принудительно разблокирует элемент
   */
  public forceUnlock(itemId: string): GameState {
    const item = this.registry[itemId];
    if (!item) return this.gameState;
    
    // Если элемент уже разблокирован, возвращаем текущее состояние
    if (this.isUnlocked(itemId)) return this.gameState;
    
    // Обновляем состояние разблокировки
    this.unlockState.items[itemId] = true;
    
    // Применяем изменения к игровому состоянию
    const unlocks = { ...this.gameState.unlocks, [itemId]: true };
    let resources = { ...this.gameState.resources };
    let buildings = { ...this.gameState.buildings };
    let upgrades = { ...this.gameState.upgrades };
    
    // Обновляем конкретный элемент в зависимости от типа
    switch (item.type) {
      case 'resource':
        if (resources[itemId]) {
          resources = {
            ...resources,
            [itemId]: {
              ...resources[itemId],
              unlocked: true
            }
          };
        }
        break;
      case 'building':
        if (buildings[itemId]) {
          buildings = {
            ...buildings,
            [itemId]: {
              ...buildings[itemId],
              unlocked: true
            }
          };
        }
        break;
      case 'upgrade':
        if (upgrades[itemId]) {
          upgrades = {
            ...upgrades,
            [itemId]: {
              ...upgrades[itemId],
              unlocked: true
            }
          };
        }
        break;
    }
    
    // Уведомляем о разблокировке
    this.notifyUnlock(item);
    
    // Возвращаем обновленное состояние
    const newState = {
      ...this.gameState,
      unlocks,
      resources,
      buildings,
      upgrades
    };
    
    // Обновляем внутреннее состояние
    this.gameState = newState;
    
    // Проверяем элементы, которые могут быть затронуты этой разблокировкой
    return this.checkInfluencedItems(newState);
  }
  
  /**
   * Обновляет игровое состояние и проверяет разблокировки
   */
  public updateGameState(newState: GameState): GameState {
    // Обновляем внутреннее состояние
    this.gameState = newState;
    
    // Инвалидируем кэш для повторной проверки
    this.invalidateCache();
    
    // Применяем результаты проверок
    return this.applyUnlockResults();
  }
  
  /**
   * Принудительно проверяет все разблокировки
   */
  public forceCheckAllUnlocks(): GameState {
    // Инвалидируем кэш
    this.invalidateCache();
    
    // Применяем результаты проверок
    return this.applyUnlockResults();
  }
}
