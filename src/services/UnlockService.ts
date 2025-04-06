
import { GameState } from '@/context/types';
import { 
  checkAllUnlocks, 
  rebuildAllUnlocks,
  forceCheckAllUnlocks
} from '@/utils/unlockManager';

/**
 * Сервис для управления разблокировками элементов игры
 * Делегирует все функции централизованному unlockManager
 */
export class UnlockService {
  /**
   * Проверяет все разблокировки и обновляет состояние
   */
  checkAllUnlocks(state: GameState): GameState {
    console.log("UnlockService: Делегирование проверки в unlockManager");
    return checkAllUnlocks(state);
  }
  
  /**
   * Выполняет полную перепроверку всех разблокировок с нуля
   */
  rebuildAllUnlocks(state: GameState): GameState {
    console.log("UnlockService: Делегирование полной перепроверки в unlockManager");
    return rebuildAllUnlocks(state);
  }
  
  /**
   * Принудительно проверяет все разблокировки
   */
  forceCheckAllUnlocks(state: GameState): GameState {
    console.log("UnlockService: Делегирование форсированной проверки в unlockManager");
    return forceCheckAllUnlocks(state);
  }
  
  // Оставлены методы для обратной совместимости
  // Они просто делегируют вызовы в централизованный менеджер
  
  /**
   * Проверяет условия для разблокировки USDT
   */
  private shouldUnlockUsdt(state: GameState): boolean {
    const applyKnowledgeCount = this.getApplyKnowledgeCount(state);
    return applyKnowledgeCount >= 1;
  }
  
  /**
   * Проверяет условия для разблокировки Practice
   */
  private shouldUnlockPractice(state: GameState): boolean {
    const applyKnowledgeCount = this.getApplyKnowledgeCount(state);
    return applyKnowledgeCount >= 2;
  }
  
  /**
   * Проверяет условия для разблокировки Generator
   */
  private shouldUnlockGenerator(state: GameState): boolean {
    return (state.resources.usdt?.value || 0) >= 11 && 
           (state.resources.usdt?.unlocked === true);
  }
  
  /**
   * Безопасно получает значение счетчика применения знаний
   */
  private getApplyKnowledgeCount(state: GameState): number {
    const counter = state.counters.applyKnowledge;
    if (!counter) return 0;
    return typeof counter === 'object' ? counter.value : counter;
  }
  
  /**
   * Безопасно получает значение счетчика кликов знаний
   */
  private getKnowledgeClickCount(state: GameState): number {
    const counter = state.counters.knowledgeClicks;
    if (!counter) return 0;
    return typeof counter === 'object' ? counter.value : counter;
  }
}
