
import { GameState } from '@/context/types';
import { 
  checkAllUnlocks, 
  rebuildAllUnlocks
} from '@/utils/unlockManager';

/**
 * Сервис для управления разблокировками элементов игры
 */
export class UnlockService {
  /**
   * Проверяет все разблокировки и обновляет состояние
   */
  checkAllUnlocks(state: GameState): GameState {
    console.log("UnlockService: Проверка всех разблокировок");
    
    // Проверка разблокировки ресурсов
    console.log("UnlockService: Проверка разблокировок ресурсов");
    const shouldUnlockUsdt = this.shouldUnlockUsdt(state);
    console.log("UnlockService - shouldUnlockUsdt:", {
      counterValue: this.getApplyKnowledgeCount(state),
      usdtResourceExists: !!state.resources.usdt,
      usdtResourceUnlocked: state.resources.usdt?.unlocked || false,
      usdtFlagUnlocked: state.unlocks.usdt || false
    });
    console.log("UnlockService - shouldUnlockUsdt result:", shouldUnlockUsdt);
    
    // Проверка разблокировки зданий
    console.log("UnlockService: Проверка разблокировок зданий");
    const shouldUnlockPractice = this.shouldUnlockPractice(state);
    const shouldUnlockGenerator = this.shouldUnlockGenerator(state);
    console.log("UnlockService - shouldUnlockPractice:", {
      applyKnowledge: this.getApplyKnowledgeCount(state),
      practiceExists: !!state.buildings.practice,
      practiceUnlocked: state.buildings.practice?.unlocked ? "Да" : "Нет",
      practiceInUnlocks: state.unlocks.practice ? "Да" : "Нет",
      result: shouldUnlockPractice
    });
    console.log("UnlockService - shouldUnlockGenerator:", {
      usdtValue: state.resources.usdt?.value || 0,
      usdtUnlocked: state.resources.usdt?.unlocked || false,
      generatorUnlocked: state.buildings.generator?.unlocked ? "Да" : "Нет",
      result: shouldUnlockGenerator
    });
    
    // Проверка разблокировки улучшений
    console.log("UnlockService: Проверка разблокировок улучшений");
    
    // Проверка разблокировки действий
    console.log("UnlockService: Проверка разблокировок действий");
    
    // Специальные проверки
    console.log("UnlockService: Проверка специальных разблокировок");
    
    // Проверка счетчика применения знаний для разблокировки USDT
    console.log("UnlockService: Счетчик применения знаний:", this.getApplyKnowledgeCount(state));
    console.log("UnlockService: Применение особых правил разблокировки USDT");
    const counter = state.counters.applyKnowledge;
    console.log("UnlockService: Проверка счетчика применения знаний:", this.getApplyKnowledgeCount(state));
    
    // Используем утилиту unlockManager для проверки всех разблокировок
    return checkAllUnlocks(state);
  }
  
  /**
   * Выполняет полную перепроверку всех разблокировок с нуля
   */
  rebuildAllUnlocks(state: GameState): GameState {
    console.log("UnlockService: Полная перепроверка всех разблокировок");
    return rebuildAllUnlocks(state);
  }
  
  /**
   * Проверяет условия для разблокировки USDT (1+ применений знаний)
   */
  private shouldUnlockUsdt(state: GameState): boolean {
    const counter = state.counters.applyKnowledge;
    if (!counter) return false;
    
    const count = typeof counter === 'object' ? counter.value : counter;
    return count >= 1;
  }
  
  /**
   * Проверяет условия для разблокировки Practice (2+ применений знаний)
   */
  private shouldUnlockPractice(state: GameState): boolean {
    const counter = state.counters.applyKnowledge;
    if (!counter) return false;
    
    const count = typeof counter === 'object' ? counter.value : counter;
    return count >= 2;
  }
  
  /**
   * Проверяет условия для разблокировки Generator (11+ USDT)
   */
  private shouldUnlockGenerator(state: GameState): boolean {
    return state.resources.usdt?.value >= 11;
  }
  
  /**
   * Безопасно получает значение счетчика применения знаний
   */
  private getApplyKnowledgeCount(state: GameState): number {
    const counter = state.counters.applyKnowledge;
    if (!counter) return 0;
    return typeof counter === 'object' ? counter.value : counter;
  }
}
