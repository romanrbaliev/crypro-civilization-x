
import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

export class UnlockService {
  /**
   * Проверяет условия разблокировки и обновляет состояние
   * @param state Текущее состояние игры
   * @returns Обновленное состояние
   */
  public checkUnlocks(state: GameState): GameState {
    let updatedState = { ...state };
    
    // Проверяем разблокировку ресурсов
    updatedState = this.checkResourceUnlocks(updatedState);
    
    // Проверяем разблокировку зданий
    updatedState = this.checkBuildingUnlocks(updatedState);
    
    // Проверяем разблокировку улучшений
    updatedState = this.checkUpgradeUnlocks(updatedState);
    
    // Проверяем разблокировку функций
    updatedState = this.checkFunctionUnlocks(updatedState);
    
    return updatedState;
  }
  
  /**
   * Проверяет условия разблокировки ресурсов
   * @param state Текущее состояние игры
   * @returns Обновленное состояние
   */
  private checkResourceUnlocks(state: GameState): GameState {
    const updatedResources = { ...state.resources };
    const updatedUnlocks = { ...state.unlocks };
    let isUpdated = false;
    
    // Проверка разблокировки USDT
    if (state.counters.applyKnowledge?.value > 0 && !updatedResources.usdt.unlocked) {
      updatedResources.usdt.unlocked = true;
      updatedUnlocks.usdt = true;
      
      safeDispatchGameEvent('Разблокирован ресурс: USDT', 'success');
      isUpdated = true;
    }
    
    // Проверка разблокировки Электричества
    if (state.buildings.generator?.count > 0 && !updatedResources.electricity.unlocked) {
      updatedResources.electricity.unlocked = true;
      updatedUnlocks.electricity = true;
      
      safeDispatchGameEvent('Разблокирован ресурс: Электричество', 'success');
      isUpdated = true;
    }
    
    if (isUpdated) {
      return {
        ...state,
        resources: updatedResources,
        unlocks: updatedUnlocks
      };
    }
    
    return state;
  }
  
  /**
   * Проверяет условия разблокировки зданий
   * @param state Текущее состояние игры
   * @returns Обновленное состояние
   */
  private checkBuildingUnlocks(state: GameState): GameState {
    const updatedBuildings = { ...state.buildings };
    const updatedUnlocks = { ...state.unlocks };
    let isUpdated = false;
    
    // Практика
    if (state.counters.applyKnowledge?.value >= 2 && 
        updatedBuildings.practice && 
        !updatedBuildings.practice.unlocked) {
      updatedBuildings.practice.unlocked = true;
      updatedUnlocks.practice = true;
      
      safeDispatchGameEvent('Разблокировано здание: Практика', 'success');
      isUpdated = true;
    }
    
    // Генератор
    if (state.resources.usdt?.value >= 11 && 
        updatedBuildings.generator && 
        !updatedBuildings.generator.unlocked) {
      updatedBuildings.generator.unlocked = true;
      updatedUnlocks.generator = true;
      
      safeDispatchGameEvent('Разблокировано здание: Генератор', 'success');
      isUpdated = true;
    }
    
    if (isUpdated) {
      return {
        ...state,
        buildings: updatedBuildings,
        unlocks: updatedUnlocks
      };
    }
    
    return state;
  }
  
  /**
   * Проверяет условия разблокировки улучшений
   * @param state Текущее состояние игры
   * @returns Обновленное состояние
   */
  private checkUpgradeUnlocks(state: GameState): GameState {
    const updatedUpgrades = { ...state.upgrades };
    const updatedUnlocks = { ...state.unlocks };
    let isUpdated = false;
    
    // Основы блокчейна
    if (state.buildings.generator?.count > 0 && 
        updatedUpgrades.blockchainBasics && 
        !updatedUpgrades.blockchainBasics.unlocked) {
      updatedUpgrades.blockchainBasics.unlocked = true;
      updatedUnlocks.blockchainBasics = true;
      updatedUnlocks.research = true;
      
      safeDispatchGameEvent('Разблокировано исследование: Основы блокчейна', 'success');
      isUpdated = true;
    }
    
    if (isUpdated) {
      return {
        ...state,
        upgrades: updatedUpgrades,
        unlocks: updatedUnlocks
      };
    }
    
    return state;
  }
  
  /**
   * Проверяет условия разблокировки функций
   * @param state Текущее состояние игры
   * @returns Обновленное состояние
   */
  private checkFunctionUnlocks(state: GameState): GameState {
    const updatedUnlocks = { ...state.unlocks };
    let isUpdated = false;
    
    // Применение знаний
    if (state.counters.knowledgeClicks?.value >= 3 && !updatedUnlocks.applyKnowledge) {
      updatedUnlocks.applyKnowledge = true;
      
      safeDispatchGameEvent('Разблокирована функция: Применить знания', 'success');
      isUpdated = true;
    }
    
    if (isUpdated) {
      return {
        ...state,
        unlocks: updatedUnlocks
      };
    }
    
    return state;
  }
}
