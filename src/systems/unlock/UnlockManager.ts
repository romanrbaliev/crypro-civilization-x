
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

  constructor(gameState: GameState, debugMode: boolean = false) {
    this.gameState = gameState;
    this.debugMode = debugMode;
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
        
        if (condition.operator === 'gte') {
          const result = resource.value >= condition.targetValue;
          if (this.debugMode) {
            this.steps.push(`  • Ресурс ${condition.targetId}: ${resource.value} >= ${condition.targetValue} = ${result}`);
          }
          return result;
        }
        
        if (condition.operator === 'eq') {
          const result = resource.value === condition.targetValue;
          if (this.debugMode) {
            this.steps.push(`  • Ресурс ${condition.targetId}: ${resource.value} === ${condition.targetValue} = ${result}`);
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
        
        if (condition.operator === 'gte') {
          const result = building.count >= condition.targetValue;
          if (this.debugMode) {
            this.steps.push(`  • Здание ${condition.targetId}: ${building.count} >= ${condition.targetValue} = ${result}`);
          }
          return result;
        }
        
        if (condition.operator === 'eq') {
          const result = building.count === condition.targetValue;
          if (this.debugMode) {
            this.steps.push(`  • Здание ${condition.targetId}: ${building.count} === ${condition.targetValue} = ${result}`);
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
          const result = Boolean(upgrade.purchased) === condition.targetValue;
          if (this.debugMode) {
            this.steps.push(`  • Улучшение ${condition.targetId} куплено: ${Boolean(upgrade.purchased)} === ${condition.targetValue} = ${result}`);
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
        
        if (condition.operator === 'gte') {
          const result = counterValue >= condition.targetValue;
          if (this.debugMode) {
            this.steps.push(`  • Счетчик ${condition.targetId}: ${counterValue} >= ${condition.targetValue} = ${result}`);
          }
          return result;
        }
        
        if (condition.operator === 'eq') {
          const result = counterValue === condition.targetValue;
          if (this.debugMode) {
            this.steps.push(`  • Счетчик ${condition.targetId}: ${counterValue} === ${condition.targetValue} = ${result}`);
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
            
            // Если электричество, проверяем, есть ли генератор
            if (item.id === 'electricity') {
              const hasGenerator = updatedState.buildings.generator?.count > 0;
              if (!hasGenerator) {
                // Если генератора нет, отменяем разблокировку
                updatedState.resources[item.id].unlocked = false;
                updatedState.unlocks[item.id] = false;
                if (this.debugMode) {
                  this.steps.push(`❌ Отмена разблокировки электричества: нет генератора`);
                }
              }
            }
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
            
            // Особая проверка для здания "Практика" - требуется 2 применения знаний
            if (item.id === 'practice') {
              const applyKnowledgeCount = 
                updatedState.counters.applyKnowledge?.value || 0;
              
              if (applyKnowledgeCount < 2) {
                // Если применений меньше 2, отменяем разблокировку
                updatedState.buildings[item.id].unlocked = false;
                updatedState.unlocks[item.id] = false;
                if (this.debugMode) {
                  this.steps.push(`❌ Отмена разблокировки практики: применений знаний меньше 2 (${applyKnowledgeCount})`);
                }
              }
            }
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
            
            // Специальная обработка для вкладки исследований
            if (item.id === 'research') {
              // Проверяем, есть ли генератор
              const hasGenerator = updatedState.buildings.generator?.count > 0;
              if (!hasGenerator) {
                // Если генератора нет, отменяем разблокировку
                updatedState.unlocks[item.id] = false;
                if (this.debugMode) {
                  this.steps.push(`❌ Отмена разблокировки исследований: нет генератора`);
                }
              }
            }
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
    // Обновляем состояние
    const updatedState = this.updateGameState(this.gameState);
    
    // Особая проверка для важных разблокировок, чтобы гарантировать
    // корректное состояние игры
    
    // 1. Проверяем "Практика"
    if (updatedState.counters.applyKnowledge?.value >= 2) {
      const practiceBuilding = updatedState.buildings.practice;
      if (practiceBuilding) {
        practiceBuilding.unlocked = true;
        updatedState.unlocks.practice = true;
      }
    } else {
      const practiceBuilding = updatedState.buildings.practice;
      if (practiceBuilding) {
        practiceBuilding.unlocked = false;
        updatedState.unlocks.practice = false;
      }
    }
    
    // 2. Проверяем "Электричество" и "Исследования"
    if (updatedState.buildings.generator?.count > 0) {
      // Если есть генератор, разблокируем электричество
      if (updatedState.resources.electricity) {
        updatedState.resources.electricity.unlocked = true;
        updatedState.unlocks.electricity = true;
      }
      
      // Разблокируем вкладку исследований
      updatedState.unlocks.research = true;
    } else {
      // Если генератора нет, блокируем электричество
      if (updatedState.resources.electricity) {
        updatedState.resources.electricity.unlocked = false;
        updatedState.unlocks.electricity = false;
      }
      
      // Блокируем вкладку исследований
      updatedState.unlocks.research = false;
    }
    
    return updatedState;
  }

  /**
   * Возвращает шаги проверки условий для отладки
   */
  public getDebugSteps(): string[] {
    return this.steps;
  }
}
