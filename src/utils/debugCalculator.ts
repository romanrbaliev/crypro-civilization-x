
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
    }
    
    // Проверяем криптобиблиотеку (фаза 2)
    if (state.buildings.cryptoLibrary && state.buildings.cryptoLibrary.count > 0) {
      const cryptoLibraryCount = state.buildings.cryptoLibrary.count;
      const cryptoLibraryBonus = 0.5 * cryptoLibraryCount; // +50% за каждый уровень
      buildingBonusMultiplier += cryptoLibraryBonus;
      steps.push(`• Криптобиблиотека (${cryptoLibraryCount} шт.): +${(cryptoLibraryBonus * 100).toFixed(0)}%`);
    }
    
    if (buildingBonusMultiplier === 0) {
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
    
    // ДОБАВЛЕНО: Статус разблокировок критических элементов
    steps.push('\n📋 Статус разблокировок:');
    steps.push(`• Применить знания: ${state.unlocks.applyKnowledge ? '✅' : '❌'} (Нужно 3+ кликов на "Изучить крипту")`);
    steps.push(`• USDT: ${state.resources.usdt?.unlocked ? '✅' : '❌'} (Нужно 1+ использований "Применить знания")`);
    steps.push(`• Практика: ${state.buildings.practice?.unlocked ? '✅' : '❌'} (Нужно 2+ использований "Применить знания")`);
    steps.push(`• Генератор: ${state.buildings.generator?.unlocked ? '✅' : '❌'} (Нужно 11+ USDT)`);
    steps.push(`• Электричество: ${state.resources.electricity?.unlocked ? '✅' : '❌'} (Автоматически при покупке генератора)`);
    steps.push(`• Исследования: ${state.unlocks.research ? '✅' : '❌'} (Нужна 1+ Практика)`);
    steps.push(`• Основы блокчейна: ${state.upgrades.blockchainBasics?.unlocked ? '✅' : '❌'} (Нужен 1+ Генератор)`);
    steps.push(`• Криптокошелек: ${state.buildings.cryptoWallet?.unlocked ? '✅' : '❌'} (Нужны купленные Основы блокчейна)`);
    steps.push(`• Домашний компьютер: ${state.buildings.homeComputer?.unlocked ? '✅' : '❌'} (Нужно 50+ электричества)`);
    
  } catch (error) {
    steps.push(`Ошибка при расчете: ${error}`);
    console.error('Ошибка при отладке производства знаний:', error);
  }
  
  return { steps, finalValue };
};

/**
 * NEW: Функция для отладочных целей, которая отображает информацию
 * о разблокировке элементов и выполнении условий
 */
export const debugUnlockStatus = (state: GameState) => {
  const steps: string[] = [];
  
  try {
    steps.push('📊 Счетчики:');
    steps.push(`• Клики на "Изучить крипту": ${getCounterValue(state, 'knowledgeClicks')} (нужно 3+ для разблокировки "Применить знания")`);
    steps.push(`• Применение знаний: ${getCounterValue(state, 'applyKnowledge')} (нужно 1+ для USDT, 2+ для Практики)`);
    
    steps.push('\n🔓 Статус разблокировок:');
    steps.push(`• Применить знания: ${state.unlocks.applyKnowledge ? '✅' : '❌'}`);
    steps.push(`• USDT: ${state.unlocks.usdt ? '✅' : '❌'} (ресурс: ${state.resources.usdt?.unlocked ? '✅' : '❌'})`);
    steps.push(`• Практика: ${state.unlocks.practice ? '✅' : '❌'} (здание: ${state.buildings.practice?.unlocked ? '✅' : '❌'})`);
    steps.push(`• Генератор: ${state.unlocks.generator ? '✅' : '❌'} (здание: ${state.buildings.generator?.unlocked ? '✅' : '❌'})`);
    steps.push(`• Электричество: ${state.unlocks.electricity ? '✅' : '❌'} (ресурс: ${state.resources.electricity?.unlocked ? '✅' : '❌'})`);
    steps.push(`• Основы блокчейна: ${state.unlocks.blockchainBasics ? '✅' : '❌'} (исследование: ${state.upgrades.blockchainBasics?.unlocked ? '✅' : '❌'})`);
    steps.push(`• Криптокошелек: ${state.unlocks.cryptoWallet ? '✅' : '❌'} (здание: ${state.buildings.cryptoWallet?.unlocked ? '✅' : '❌'})`);
    steps.push(`• Домашний компьютер: ${state.unlocks.homeComputer ? '✅' : '❌'} (здание: ${state.buildings.homeComputer?.unlocked ? '✅' : '❌'})`);
    steps.push(`• Интернет-канал: ${state.unlocks.internetChannel ? '✅' : '❌'} (здание: ${state.buildings.internetChannel?.unlocked ? '✅' : '❌'})`);
    steps.push(`• Майнер: ${state.unlocks.miner ? '✅' : '❌'} (здание: ${state.buildings.miner?.unlocked ? '✅' : '❌'})`);
    steps.push(`• Bitcoin: ${state.unlocks.bitcoin ? '✅' : '❌'} (ресурс: ${state.resources.bitcoin?.unlocked ? '✅' : '❌'})`);
    steps.push(`• Исследования: ${state.unlocks.research ? '✅' : '❌'}`);
    
    steps.push('\n🏗️ Здания:');
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      if (building) {
        steps.push(`• ${building.name || buildingId}: ${building.count} шт. (${building.unlocked ? '✅ разблокировано' : '❌ заблокировано'})`);
      }
    }
    
    steps.push('\n📚 Исследования:');
    for (const upgradeId in state.upgrades) {
      const upgrade = state.upgrades[upgradeId];
      if (upgrade) {
        steps.push(`• ${upgrade.name || upgradeId}: ${upgrade.purchased ? '✅ изучено' : upgrade.unlocked ? '⏳ доступно' : '❌ заблокировано'}`);
      }
    }
    
  } catch (error) {
    steps.push(`Ошибка при сборе данных о разблокировках: ${error}`);
    console.error('Ошибка при анализе разблокировок:', error);
  }
  
  return { steps };
};

// Вспомогательная функция для безопасного получения значения счетчика
function getCounterValue(state: GameState, counterId: string): number {
  const counter = state.counters[counterId];
  if (!counter) return 0;
  return typeof counter === 'object' ? counter.value : counter;
}
