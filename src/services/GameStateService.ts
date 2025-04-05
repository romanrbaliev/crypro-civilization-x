
import { GameState } from '@/context/types';

export class GameStateService {
  /**
   * Обрабатывает обновление состояния игры
   * @param state Текущее состояние игры
   * @returns Обновленное состояние игры
   */
  public processGameStateUpdate(state: GameState): GameState {
    // Проверяем разблокировку зданий
    state = this.checkBuildingUnlocks(state);
    
    // Проверяем разблокировку улучшений
    state = this.checkUpgradeUnlocks(state);
    
    // Проверяем специальные условия
    state = this.checkSpecialConditions(state);
    
    return state;
  }
  
  /**
   * Проверяет условия разблокировки зданий
   * @param state Состояние игры
   * @returns Обновленное состояние игры
   */
  private checkBuildingUnlocks(state: GameState): GameState {
    const updatedBuildings = { ...state.buildings };
    const updatedUnlocks = { ...state.unlocks };
    let isUpdated = false;
    
    // Практика разблокируется после 2+ применений знаний
    if (state.counters.applyKnowledge?.value >= 2 && 
        updatedBuildings.practice && 
        !updatedBuildings.practice.unlocked) {
      updatedBuildings.practice.unlocked = true;
      updatedUnlocks.practice = true;
      isUpdated = true;
      console.log('🔓 Разблокировано здание: Практика');
    }
    
    // Генератор разблокируется после накопления 11+ USDT
    if (state.resources.usdt?.value >= 11 && 
        updatedBuildings.generator && 
        !updatedBuildings.generator.unlocked) {
      updatedBuildings.generator.unlocked = true;
      updatedUnlocks.generator = true;
      isUpdated = true;
      console.log('🔓 Разблокировано здание: Генератор');
    }
    
    // Обновляем состояние, только если были изменения
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
   * @param state Состояние игры
   * @returns Обновленное состояние игры
   */
  private checkUpgradeUnlocks(state: GameState): GameState {
    const updatedUpgrades = { ...state.upgrades };
    const updatedUnlocks = { ...state.unlocks };
    let isUpdated = false;
    
    // Основы блокчейна разблокируются после покупки генератора
    if (state.buildings.generator?.count > 0 && 
        updatedUpgrades.blockchainBasics && 
        !updatedUpgrades.blockchainBasics.unlocked) {
      updatedUpgrades.blockchainBasics.unlocked = true;
      updatedUnlocks.blockchainBasics = true;
      updatedUnlocks.research = true;
      isUpdated = true;
      console.log('🔓 Разблокировано исследование: Основы блокчейна');
    }
    
    // Обновляем состояние, только если были изменения
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
   * Проверяет специальные условия разблокировки
   * @param state Состояние игры
   * @returns Обновленное состояние игры
   */
  private checkSpecialConditions(state: GameState): GameState {
    const updatedUnlocks = { ...state.unlocks };
    let isUpdated = false;
    
    // Разблокировка вкладки "Применить знания" после 3+ кликов на "Изучить крипту"
    if (state.counters.knowledgeClicks?.value >= 3 && !updatedUnlocks.applyKnowledge) {
      updatedUnlocks.applyKnowledge = true;
      isUpdated = true;
      console.log('🔓 Разблокирована функция: Применить знания');
    }
    
    // Обновляем состояние, только если были изменения
    if (isUpdated) {
      return {
        ...state,
        unlocks: updatedUnlocks
      };
    }
    
    return state;
  }
}
