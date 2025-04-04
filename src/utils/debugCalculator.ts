
import { GameState } from '@/context/types';
import { UnlockManager } from '@/systems/unlock/UnlockManager';
import { debugPracticeBuilding, listAllBuildings } from './buildingDebugUtils';

/**
 * Получает полную отладочную информацию о разблокировках
 */
export function debugUnlockStatus(state: GameState): { steps: string[], unlocked: string[], locked: string[] } {
  try {
    // Добавим дополнительную отладку для здания "Практика"
    const practiceDebug = debugPracticeBuilding(state);
    console.log("Отладка здания Практика:", practiceDebug);
    
    // Получаем список всех зданий
    const allBuildings = listAllBuildings(state);
    console.log("Все здания в состоянии:", allBuildings);
    
    // Создаем менеджер с включенным режимом отладки
    const unlockManager = new UnlockManager(state, true);
    
    // Запускаем проверку всех разблокировок
    unlockManager.forceCheckAllUnlocks();
    
    // Получаем отладочную информацию
    return unlockManager.getUnlockReport();
  } catch (error) {
    console.error('Ошибка при анализе разблокировок:', error);
    return { 
      steps: [`Ошибка при анализе разблокировок: ${error}`],
      unlocked: [],
      locked: []
    };
  }
}

/**
 * Принудительно проверяет все разблокировки и возвращает обновленное состояние
 */
export function forceCheckUnlocks(state: GameState): GameState {
  try {
    const unlockManager = new UnlockManager(state);
    return unlockManager.forceCheckAllUnlocks();
  } catch (error) {
    console.error('Ошибка при проверке разблокировок:', error);
    return state;
  }
}

/**
 * Проверяет разблокировку конкретного элемента
 */
export function checkItemUnlock(state: GameState, itemId: string): boolean {
  try {
    const unlockManager = new UnlockManager(state);
    return unlockManager.isUnlocked(itemId);
  } catch (error) {
    console.error(`Ошибка при проверке разблокировки элемента ${itemId}:`, error);
    return false;
  }
}

/**
 * Отладка расчета производства знаний
 * Возвращает пошаговый расчет и итоговое значение
 */
export function debugKnowledgeProduction(state: GameState): { steps: string[], finalValue: number } {
  try {
    const steps: string[] = [];
    let finalValue = 0;
    
    steps.push('📊 Начало расчета производства знаний');
    
    // Проверяем базовое производство
    const baseProduction = state.resources.knowledge?.baseProduction || 0;
    steps.push(`• Базовое производство: ${baseProduction.toFixed(2)}/сек`);
    finalValue += baseProduction;
    
    // Проверяем производство от практики
    if (state.buildings.practice && state.buildings.practice.unlocked) {
      const practiceCount = state.buildings.practice.count || 0;
      const practiceProduction = practiceCount * 1; // 1 знание за практику
      
      steps.push(`• Здание "Практика" (${practiceCount} шт.): +${practiceProduction.toFixed(2)}/сек`);
      finalValue += practiceProduction;
      
      // Проверяем бонус от "Основы блокчейна"
      const hasBlockchainBasics = 
        (state.upgrades.blockchainBasics?.purchased === true) || 
        (state.upgrades.basicBlockchain?.purchased === true) || 
        (state.upgrades.blockchain_basics?.purchased === true);
      
      if (hasBlockchainBasics && practiceProduction > 0) {
        const bonus = practiceProduction * 0.1; // +10% бонус к производству знаний
        steps.push(`• Исследование "Основы блокчейна": +${bonus.toFixed(2)}/сек (+10%)`);
        finalValue += bonus;
      }
      
      // Проверяем бонус от интернет-канала
      if (state.buildings.internetChannel && state.buildings.internetChannel.count > 0 && state.buildings.internetChannel.unlocked) {
        const internetChannelCount = state.buildings.internetChannel.count;
        const currentKnowledgeValue = finalValue; // Текущее значение до бонуса
        
        // +20% к знаниям за каждый интернет-канал
        const internetBonus = currentKnowledgeValue * 0.2 * internetChannelCount;
        steps.push(`• Здание "Интернет-канал" (${internetChannelCount} шт.): +${internetBonus.toFixed(2)}/сек (+20% за каждый канал)`);
        finalValue += internetBonus;
      }
    } else {
      steps.push('⚠️ Здание "Практика" не разблокировано или отсутствует');
    }
    
    // Проверяем специализацию
    if (state.specialization === 'analyst') {
      const currentValue = finalValue;
      const bonusValue = currentValue * 0.25; // +25% для аналитика
      
      steps.push(`• Бонус специализации "Аналитик": +${bonusValue.toFixed(2)}/сек (+25%)`);
      finalValue += bonusValue;
    }
    
    // Проверяем общие бонусы от специализации
    if (state.specialization === 'influencer') {
      const currentValue = finalValue;
      const bonusValue = currentValue * 0.1; // +10% ко всем ресурсам
      
      steps.push(`• Бонус специализации "Инфлюенсер": +${bonusValue.toFixed(2)}/сек (+10%)`);
      finalValue += bonusValue;
    } else if (state.specialization === 'investor') {
      const currentValue = finalValue;
      const bonusValue = currentValue * 0.05; // +5% ко всем ресурсам
      
      steps.push(`• Бонус специализации "Инвестор": +${bonusValue.toFixed(2)}/сек (+5%)`);
      finalValue += bonusValue;
    }
    
    // Добавляем итоговый результат
    steps.push(`Итоговая скорость производства знаний: ${finalValue.toFixed(2)}/сек`);
    
    // Проверяем на расхождение с текущим значением
    const currentPerSecond = state.resources.knowledge?.perSecond || 0;
    if (Math.abs(finalValue - currentPerSecond) > 0.01) {
      steps.push(`⚠️ РАСХОЖДЕНИЕ: Расчетное значение ${finalValue.toFixed(2)}/сек отличается от текущего ${currentPerSecond.toFixed(2)}/сек`);
    } else {
      steps.push(`✅ Расчетное значение ${finalValue.toFixed(2)}/сек соответствует текущему ${currentPerSecond.toFixed(2)}/сек`);
    }
    
    return { steps, finalValue };
  } catch (error) {
    console.error('Ошибка при отладке производства знаний:', error);
    return { 
      steps: [`Ошибка при отладке производства знаний: ${error}`],
      finalValue: 0
    };
  }
}
