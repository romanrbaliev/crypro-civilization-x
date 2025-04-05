
import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Сервис для управления состоянием игры
 */
export class GameStateService {
  
  /**
   * Выполняет полную синхронизацию состояния игры
   * @param state Текущее состояние игры
   * @returns Обновленное состояние игры
   */
  performFullStateSync(state: GameState): GameState {
    console.log('Выполняем полную синхронизацию состояния игры');
    
    const newState = { ...state };
    
    // Обновляем время последнего обновления
    newState.lastUpdate = Date.now();
    
    // Проверяем разблокировки, если игра запущена
    if (newState.gameStarted) {
      newState.unlocks = this.checkAndUpdateUnlocks(newState);
    }
    
    // Обновляем ресурсы
    this.updateResourceProduction(newState);
    
    // Проверяем специальные события
    this.checkSpecialEvents(newState);
    
    return newState;
  }
  
  /**
   * Проверяет и обновляет разблокировки
   * @param state Текущее состояние игры
   * @returns Обновленные разблокировки
   */
  private checkAndUpdateUnlocks(state: GameState): { [key: string]: boolean } {
    const unlocks = { ...state.unlocks };
    
    // Здесь логика проверки разблокировок
    // Например, базовые разблокировки в начале игры
    
    if (!unlocks.applyKnowledge && (state.counters.learnButtonClicks?.value || 0) >= 3) {
      unlocks.applyKnowledge = true;
      safeDispatchGameEvent('Разблокировано: "Применить знания"', 'success');
    }
    
    if (!unlocks.practice && (state.counters.applyKnowledgeButtonClicks?.value || 0) >= 2) {
      unlocks.practice = true;
      safeDispatchGameEvent('Разблокировано: "Практика"', 'success');
    }
    
    // Добавьте другие проверки разблокировок по мере необходимости
    
    return unlocks;
  }
  
  /**
   * Обновляет производство ресурсов
   * @param state Текущее состояние игры
   */
  private updateResourceProduction(state: GameState): void {
    // Здесь логика расчета производства ресурсов
    // Обновляем perSecond для всех ресурсов
    
    // Пример: обновление производства знаний на основе зданий
    let knowledgePerSecond = state.resources.knowledge?.baseProduction || 0;
    
    // Добавляем производство от "Практики"
    if (state.buildings.practice && state.buildings.practice.unlocked) {
      const practiceCount = state.buildings.practice.count || 0;
      knowledgePerSecond += practiceCount * 1; // 1 знание за каждую практику
    }
    
    // Устанавливаем новое значение производства
    if (state.resources.knowledge) {
      state.resources.knowledge.perSecond = knowledgePerSecond;
    }
  }
  
  /**
   * Проверяет специальные события
   * @param state Текущее состояние игры
   */
  private checkSpecialEvents(state: GameState): void {
    // Здесь логика проверки и обработки специальных событий
    // Например, достижение определенных порогов, случайные события и т.д.
  }
}
