
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
      knowledgeClicksValue: this.getKnowledgeClickCount(state),
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
    
    // Проверка разблокировки улучшений и действий
    console.log("UnlockService: Проверка разблокировок улучшений и действий");
    
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
   * Проверяет условия для разблокировки USDT (3+ кликов на Изучить крипту)
   * Обновлено согласно базе знаний
   */
  private shouldUnlockUsdt(state: GameState): boolean {
    const counter = state.counters.knowledgeClicks;
    if (!counter) return false;
    
    const count = typeof counter === 'object' ? counter.value : counter;
    return count >= 3; // Требуется 3 клика на "Изучить крипту"
  }
  
  /**
   * Проверяет условия для разблокировки Practice (2+ применений знаний)
   * Обновлено согласно базе знаний
   */
  private shouldUnlockPractice(state: GameState): boolean {
    const counter = state.counters.applyKnowledge;
    if (!counter) return false;
    
    const count = typeof counter === 'object' ? counter.value : counter;
    return count >= 2; // Требуется 2 использования "Применить знания"
  }
  
  /**
   * Проверяет условия для разблокировки Generator (11+ USDT)
   * Обновлено согласно базе знаний
   */
  private shouldUnlockGenerator(state: GameState): boolean {
    return state.resources.usdt?.value >= 11 && state.resources.usdt?.unlocked; // Требуется накопление 11 USDT и разблокированный USDT
  }
  
  /**
   * Проверяет условия для разблокировки домашнего компьютера (50+ электричества)
   * Добавлено согласно базе знаний
   */
  private shouldUnlockHomeComputer(state: GameState): boolean {
    return state.resources.electricity?.value >= 50 && state.resources.electricity?.unlocked; // Требуется 50 единиц электричества и разблокированное электричество
  }
  
  /**
   * Проверяет условия для разблокировки основ блокчейна (куплен генератор)
   * Добавлено согласно базе знаний
   */
  private shouldUnlockBlockchainBasics(state: GameState): boolean {
    return state.buildings.generator?.count > 0 && state.buildings.generator?.unlocked; // Требуется покупка генератора
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
