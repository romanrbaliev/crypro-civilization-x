
import { GameState } from '@/context/types';
import { unlockableItemsRegistry } from './registry';
import { UnlockCondition, UnlockableItem } from './types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Менеджер разблокировок - централизованно управляет всеми разблокировками в игре
 */
export class UnlockManager {
  private gameState: GameState;
  private debugMode: boolean;
  private steps: string[] = [];
  private lockedItems: string[] = [];
  private unlockedItems: string[] = [];

  constructor(gameState: GameState, debugMode: boolean = false) {
    this.gameState = gameState;
    this.debugMode = debugMode;
    this.steps = [];
    this.lockedItems = [];
    this.unlockedItems = [];
  }

  /**
   * Проверяет выполнение условия разблокировки
   */
  private checkCondition(condition: UnlockCondition): boolean {
    if (this.debugMode) {
      this.steps.push(`• Проверка условия: ${condition.description}`);
    }

    switch (condition.type) {
      case 'resource':
        // Проверяем наличие и количество ресурса
        const resource = this.gameState.resources[condition.targetId];
        if (!resource) {
          if (this.debugMode) this.steps.push(`  • Ресурс ${condition.targetId} не существует`);
          return false;
        }
        
        // Приводим targetValue к числу для сравнения с числовыми значениями
        const resourceTargetValue = Number(condition.targetValue);
        
        if (condition.operator === 'gte') {
          const result = resource.value >= resourceTargetValue;
          if (this.debugMode) {
            this.steps.push(`  • Ресурс ${condition.targetId}: ${resource.value} >= ${resourceTargetValue} = ${result}`);
          }
          return result;
        }
        
        if (condition.operator === 'eq') {
          const result = resource.value === resourceTargetValue;
          if (this.debugMode) {
            this.steps.push(`  • Ресурс ${condition.targetId}: ${resource.value} === ${resourceTargetValue} = ${result}`);
          }
          return result;
        }
        break;
        
      case 'building':
        // Проверяем наличие и количество здания
        const building = this.gameState.buildings[condition.targetId];
        if (!building) {
          if (this.debugMode) this.steps.push(`  • Здание ${condition.targetId} не существует`);
          return false;
        }
        
        // Приводим targetValue к числу для сравнения с числовыми значениями
        const buildingTargetValue = Number(condition.targetValue);
        
        if (condition.operator === 'gte') {
          const result = building.count >= buildingTargetValue;
          if (this.debugMode) {
            this.steps.push(`  • Здание ${condition.targetId}: ${building.count} >= ${buildingTargetValue} = ${result}`);
          }
          return result;
        }
        
        if (condition.operator === 'eq') {
          const result = building.count === buildingTargetValue;
          if (this.debugMode) {
            this.steps.push(`  • Здание ${condition.targetId}: ${building.count} === ${buildingTargetValue} = ${result}`);
          }
          return result;
        }
        break;
        
      case 'upgrade':
        // Проверяем, куплено ли улучшение
        const upgrade = this.gameState.upgrades[condition.targetId];
        if (!upgrade) {
          if (this.debugMode) this.steps.push(`  • Улучшение ${condition.targetId} не существует`);
          return false;
        }
        
        if (condition.operator === 'eq') {
          // Сравниваем напрямую bool с bool
          const targetValueAsBool = Boolean(condition.targetValue);
          const upgradePurchased = Boolean(upgrade.purchased);
          const result = upgradePurchased === targetValueAsBool;
          
          if (this.debugMode) {
            this.steps.push(`  • Улучшение ${condition.targetId} куплено: ${upgradePurchased} === ${targetValueAsBool} = ${result}`);
          }
          return result;
        }
        break;
        
      case 'counter':
        // Проверяем значение счетчика
        const counter = this.gameState.counters[condition.targetId];
        if (!counter) {
          if (this.debugMode) this.steps.push(`  • Счетчик ${condition.targetId} не существует`);
          return false;
        }
        
        const counterValue = typeof counter === 'number' ? counter : counter.value;
        // Приводим targetValue к числу для сравнения с числовыми значениями
        const counterTargetValue = Number(condition.targetValue);
        
        if (condition.operator === 'gte') {
          const result = counterValue >= counterTargetValue;
          if (this.debugMode) {
            this.steps.push(`  • Счетчик ${condition.targetId}: ${counterValue} >= ${counterTargetValue} = ${result}`);
          }
          return result;
        }
        
        if (condition.operator === 'eq') {
          const result = counterValue === counterTargetValue;
          if (this.debugMode) {
            this.steps.push(`  • Счетчик ${condition.targetId}: ${counterValue} === ${counterTargetValue} = ${result}`);
          }
          return result;
        }
        break;
    }
    
    if (this.debugMode) this.steps.push(`  • Неизвестное условие или оператор`);
    return false;
  }

  /**
   * Проверяет все условия разблокировки элемента
   */
  private checkAllConditions(item: UnlockableItem): boolean {
    if (this.debugMode) {
      this.steps.push(`Проверка условий для ${item.type} "${item.name}"`);
    }
    
    // Если условий нет, элемент разблокирован по умолчанию
    if (!item.conditions || item.conditions.length === 0) {
      if (this.debugMode) this.steps.push(`• Нет условий, разблокировано по умолчанию`);
      return true;
    }
    
    // Проверяем все условия
    const result = item.conditions.every(condition => this.checkCondition(condition));
    if (this.debugMode) {
      this.steps.push(`• Итоговый результат: ${result ? "✅ Разблокировано" : "❌ Заблокировано"}`);
      
      // Добавляем сообщение о том, что должно произойти для разблокировки
      if (!result) {
        this.steps.push(`• Для разблокировки необходимо выполнить все условия выше`);
      }
    }
    
    // Сохраняем информацию о разблокировке/блокировке для отчетов
    if (result) {
      this.unlockedItems.push(item.name);
    } else {
      this.lockedItems.push(item.name);
    }
    
    return result;
  }

  /**
   * Проверяет все разблокировки и обновляет состояние игры
   */
  public updateGameState(state: GameState): GameState {
    let updatedState = { ...state };
    
    if (this.debugMode) {
      this.steps.push("🔓 Начало проверки разблокировок");
    }
    
    // Сбрасываем списки разблокированных/заблокированных элементов
    this.unlockedItems = [];
    this.lockedItems = [];
    
    // Проходим по всем элементам в реестре
    Object.values(unlockableItemsRegistry).forEach(item => {
      // Пропускаем элементы, которые не должны автоматически разблокироваться
      if (!item.autoUnlock) return;
      
      // Проверяем условия разблокировки
      const shouldBeUnlocked = this.checkAllConditions(item);
      
      // Обновляем состояние в зависимости от типа элемента
      switch (item.type) {
        case 'resource':
          // Если элемент должен быть разблокирован, но заблокирован сейчас
          if (shouldBeUnlocked && !updatedState.resources[item.id]?.unlocked) {
            if (this.debugMode) {
              this.steps.push(`✅ Разблокирован ресурс: ${item.name}`);
            }
            
            // Обновляем ресурс
            updatedState.resources = {
              ...updatedState.resources,
              [item.id]: {
                ...updatedState.resources[item.id],
                unlocked: true
              }
            };
            
            // Обновляем разблокировки
            updatedState.unlocks = {
              ...updatedState.unlocks,
              [item.id]: true
            };
          } else if (!shouldBeUnlocked && updatedState.resources[item.id]?.unlocked) {
            // Если элемент должен быть заблокирован, но разблокирован сейчас
            if (this.debugMode) {
              this.steps.push(`❌ Заблокирован ресурс: ${item.name}`);
            }
            
            // Обновляем ресурс
            updatedState.resources = {
              ...updatedState.resources,
              [item.id]: {
                ...updatedState.resources[item.id],
                unlocked: false
              }
            };
            
            // Обновляем разблокировки
            updatedState.unlocks = {
              ...updatedState.unlocks,
              [item.id]: false
            };
          }
          break;
          
        case 'building':
          // Если элемент должен быть разблокирован, но заблокирован сейчас
          if (shouldBeUnlocked && !updatedState.buildings[item.id]?.unlocked) {
            if (this.debugMode) {
              this.steps.push(`✅ Разблокировано здание: ${item.name}`);
            }
            
            // Обновляем здание
            updatedState.buildings = {
              ...updatedState.buildings,
              [item.id]: {
                ...updatedState.buildings[item.id],
                unlocked: true
              }
            };
            
            // Обновляем разблокировки
            updatedState.unlocks = {
              ...updatedState.unlocks,
              [item.id]: true
            };
          } else if (!shouldBeUnlocked && updatedState.buildings[item.id]?.unlocked) {
            // Если элемент должен быть заблокирован, но разблокирован сейчас
            if (this.debugMode) {
              this.steps.push(`❌ Заблокировано здание: ${item.name}`);
            }
            
            // Обновляем здание
            updatedState.buildings = {
              ...updatedState.buildings,
              [item.id]: {
                ...updatedState.buildings[item.id],
                unlocked: false
              }
            };
            
            // Обновляем разблокировки
            updatedState.unlocks = {
              ...updatedState.unlocks,
              [item.id]: false
            };
          }
          break;
          
        case 'upgrade':
          // Если элемент должен быть разблокирован, но заблокирован сейчас
          if (shouldBeUnlocked && !updatedState.upgrades[item.id]?.unlocked) {
            if (this.debugMode) {
              this.steps.push(`✅ Разблокировано улучшение: ${item.name}`);
            }
            
            // Обновляем улучшение
            updatedState.upgrades = {
              ...updatedState.upgrades,
              [item.id]: {
                ...updatedState.upgrades[item.id],
                unlocked: true
              }
            };
            
            // Обновляем разблокировки
            updatedState.unlocks = {
              ...updatedState.unlocks,
              [item.id]: true
            };
          } else if (!shouldBeUnlocked && updatedState.upgrades[item.id]?.unlocked) {
            // Если элемент должен быть заблокирован, но разблокирован сейчас
            if (this.debugMode) {
              this.steps.push(`❌ Заблокировано улучшение: ${item.name}`);
            }
            
            // Обновляем улучшение
            updatedState.upgrades = {
              ...updatedState.upgrades,
              [item.id]: {
                ...updatedState.upgrades[item.id],
                unlocked: false
              }
            };
            
            // Обновляем разблокировки
            updatedState.unlocks = {
              ...updatedState.unlocks,
              [item.id]: false
            };
          }
          break;
          
        case 'feature':
          // Если элемент должен быть разблокирован, но заблокирован сейчас
          if (shouldBeUnlocked && !updatedState.unlocks[item.id]) {
            if (this.debugMode) {
              this.steps.push(`✅ Разблокирована функция: ${item.name}`);
            }
            
            // Обновляем разблокировки
            updatedState.unlocks = {
              ...updatedState.unlocks,
              [item.id]: true
            };
          } else if (!shouldBeUnlocked && updatedState.unlocks[item.id]) {
            // Если элемент должен быть заблокирован, но разблокирован сейчас
            if (this.debugMode) {
              this.steps.push(`❌ Заблокирована функция: ${item.name}`);
            }
            
            // Обновляем разблокировки
            updatedState.unlocks = {
              ...updatedState.unlocks,
              [item.id]: false
            };
          }
          break;
      }
    });
    
    if (this.debugMode) {
      this.steps.push("🔓 Завершение проверки разблокировок");
    }
    
    return updatedState;
  }

  /**
   * Проверяет, разблокирован ли элемент
   */
  public isUnlocked(itemId: string): boolean {
    const item = unlockableItemsRegistry[itemId];
    
    if (!item) {
      console.warn(`Элемент с ID "${itemId}" не найден в реестре разблокировок`);
      return false;
    }
    
    switch (item.type) {
      case 'resource':
        return Boolean(this.gameState.resources[itemId]?.unlocked);
      case 'building':
        return Boolean(this.gameState.buildings[itemId]?.unlocked);
      case 'upgrade':
        return Boolean(this.gameState.upgrades[itemId]?.unlocked);
      case 'feature':
        return Boolean(this.gameState.unlocks[itemId]);
      default:
        return false;
    }
  }

  /**
   * Принудительно разблокирует элемент
   */
  public forceUnlock(itemId: string): GameState {
    const item = unlockableItemsRegistry[itemId];
    
    if (!item) {
      console.warn(`Элемент с ID "${itemId}" не найден в реестре разблокировок`);
      return this.gameState;
    }
    
    let newState = { ...this.gameState };
    
    switch (item.type) {
      case 'resource':
        // Разблокируем ресурс
        newState.resources = {
          ...newState.resources,
          [itemId]: {
            ...newState.resources[itemId],
            unlocked: true
          }
        };
        break;
      case 'building':
        // Разблокируем здание
        newState.buildings = {
          ...newState.buildings,
          [itemId]: {
            ...newState.buildings[itemId],
            unlocked: true
          }
        };
        break;
      case 'upgrade':
        // Разблокируем улучшение
        newState.upgrades = {
          ...newState.upgrades,
          [itemId]: {
            ...newState.upgrades[itemId],
            unlocked: true
          }
        };
        break;
    }
    
    // Разблокируем элемент в общем реестре разблокировок
    newState.unlocks = {
      ...newState.unlocks,
      [itemId]: true
    };
    
    return newState;
  }

  /**
   * Проверяет все разблокировки принудительно
   */
  public forceCheckAllUnlocks(): GameState {
    this.debugMode = true;
    // Сбрасываем шаги для новой проверки
    this.steps = [];
    this.steps.push("📊 Начало полной проверки всех разблокировок");
    
    // Обновляем состояние
    const updatedState = this.updateGameState(this.gameState);
    
    this.steps.push("📊 Завершение полной проверки всех разблокировок");
    return updatedState;
  }

  /**
   * Возвращает шаги проверки условий для отладки
   */
  public getDebugSteps(): string[] {
    return this.steps;
  }
  
  /**
   * Возвращает список разблокированных элементов
   */
  public getUnlockedItems(): string[] {
    return this.unlockedItems;
  }
  
  /**
   * Возвращает список заблокированных элементов
   */
  public getLockedItems(): string[] {
    return this.lockedItems;
  }
  
  /**
   * Возвращает полный отчет о разблокировках
   */
  public getUnlockReport(): { steps: string[], unlocked: string[], locked: string[] } {
    return {
      steps: this.steps,
      unlocked: this.unlockedItems,
      locked: this.lockedItems
    };
  }
}
