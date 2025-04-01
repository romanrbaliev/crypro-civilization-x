
import { GameState } from '@/context/types';

/**
 * Функция для отладочных целей, которая подробно расписывает
 * как рассчитывается производство знаний
 */
export const debugKnowledgeProduction = (state: GameState) => {
  const steps: string[] = [];
  let finalValue = 0;
  
  // Проверяем, существует ли ресурс знаний
  if (!state.resources.knowledge || !state.resources.knowledge.unlocked) {
    steps.push('Ресурс "Знания" не найден или не разблокирован.');
    return { steps, finalValue };
  }
  
  try {
    // Шаг 1: Рассчитываем базовое производство от зданий
    steps.push('Расчет производства знаний:');
    
    // Проверяем наличие практики
    let baseProduction = 0;
    if (state.buildings.practice && state.buildings.practice.count > 0) {
      const practiceCount = state.buildings.practice.count;
      baseProduction = 1 * practiceCount; // 1 знание за практику
      steps.push(`Базовое производство от практики: ${practiceCount} × 1 = ${baseProduction} знаний/сек`);
    } else {
      steps.push('Нет практики для производства знаний.');
    }
    
    // Шаг 2: Применяем бонусы от исследований
    steps.push('\nБонусы от исследований:');
    
    let researchMultiplier = 1;
    const blockchainBasicsPurchased = 
      (state.upgrades.blockchainBasics && state.upgrades.blockchainBasics.purchased) ||
      (state.upgrades.basicBlockchain && state.upgrades.basicBlockchain.purchased) ||
      (state.upgrades.blockchain_basics && state.upgrades.blockchain_basics.purchased);
    
    if (blockchainBasicsPurchased) {
      researchMultiplier += 0.1; // +10%
      steps.push(`• Основы блокчейна: +10%`);
    } else {
      steps.push('Нет бонусов от исследований');
    }
    
    // Шаг 3: Применяем бонусы от зданий
    steps.push('\nБонусы от зданий:');
    let buildingBonusMultiplier = 0;
    
    // Проверяем интернет-канал
    if (state.buildings.internetConnection && state.buildings.internetConnection.count > 0) {
      const internetConnectionCount = state.buildings.internetConnection.count;
      const internetConnectionBonus = 0.2 * internetConnectionCount; // +20% за каждый уровень
      buildingBonusMultiplier += internetConnectionBonus;
      steps.push(`• Интернет-канал (${internetConnectionCount} шт.): +${(internetConnectionBonus * 100).toFixed(0)}%`);
    } else {
      steps.push('Нет бонусов от зданий');
    }
    
    // Шаг 4: Применяем бонусы от специализации
    steps.push('\nБонусы от специализации:');
    let specializationMultiplier = 0;
    
    if (state.specialization === 'analyst') {
      specializationMultiplier += 0.25; // +25%
      steps.push(`• Аналитик: +25%`);
    } else if (state.specialization === 'influencer') {
      specializationMultiplier += 0.1; // +10%
      steps.push(`• Инфлюенсер: +10%`);
    } else {
      steps.push('Нет бонусов от специализации');
    }
    
    // Шаг 5: Рассчитываем бонусы от рефералов и помощников
    steps.push('\nБонусы от рефералов:');
    
    // Проверяем активных рефералов
    const activeReferrals = state.referrals ? Object.values(state.referrals).filter(ref => ref.active).length : 0;
    const referralBonus = activeReferrals * 0.05; // +5% за каждого активного реферала
    
    if (activeReferrals > 0) {
      steps.push(`• Активные рефералы (${activeReferrals} шт.): +${(referralBonus * 100).toFixed(0)}%`);
    } else {
      steps.push('Нет активных рефералов');
    }
    
    // Проверяем помощников
    steps.push('\nБонусы от помощников:');
    let helperBonus = 0;
    const helpers = state.referralHelpers || {};
    let hasActiveHelpers = false;
    let activeHelperCount = 0;
    
    for (const helperId in helpers) {
      const helper = helpers[helperId];
      if (helper.status === 'active' && helper.buildingId === 'practice') {
        hasActiveHelpers = true;
        helperBonus += 0.15; // +15% за каждого помощника на практике
        activeHelperCount++;
        steps.push(`• Статус помощника ${helper.helper_id}: ${helper.status} (+15%)`);
      }
    }
    
    if (!hasActiveHelpers) {
      steps.push('Нет активных помощников');
    }
    
    // Общий бонус от всех факторов
    const totalMultiplier = 1 + researchMultiplier - 1 + buildingBonusMultiplier + specializationMultiplier + referralBonus + helperBonus;
    
    // Шаг 6: Итоговый расчет
    steps.push('\nИтоговый расчет:');
    steps.push(`Базовое производство: ${baseProduction.toFixed(2)} знаний/сек`);
    steps.push(`Общий бонус производства: ×${totalMultiplier.toFixed(2)}`);
    steps.push(`Итоговая скорость: ${baseProduction.toFixed(2)} × ${totalMultiplier.toFixed(2)} = ${(baseProduction * totalMultiplier).toFixed(2)} знаний/сек`);
    
    finalValue = baseProduction * totalMultiplier;
    
    // Добавляем сравнение с текущим значением в состоянии
    steps.push(`\nТекущее значение в state.resources.knowledge.perSecond: ${state.resources.knowledge.perSecond.toFixed(2)} знаний/сек`);
    
    if (Math.abs(state.resources.knowledge.perSecond - finalValue) > 0.01) {
      steps.push(`⚠️ Обнаружено расхождение в расчетах и текущем значении!`);
      steps.push(`Разница: ${Math.abs(state.resources.knowledge.perSecond - finalValue).toFixed(2)}`);
    } else {
      steps.push(`✅ Текущее значение соответствует расчетам`);
    }
    
  } catch (error) {
    steps.push(`Ошибка при расчете: ${error}`);
    console.error('Ошибка при отладке производства знаний:', error);
  }
  
  return { steps, finalValue };
};
