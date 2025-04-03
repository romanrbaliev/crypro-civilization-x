
import { GameState } from '@/context/types';
// Удаляем импорт отсутствующей функции debugUnlockStatus
// и добавляем функцию для отладки разблокировок вместо импорта

/**
 * Функция для отладки статуса разблокировок
 */
export const debugUnlockStatus = (state: GameState) => {
  // Базовая реализация функции отладки разблокировок
  const unlocks = state.unlocks || {};
  const buildings = state.buildings || {};
  const resources = state.resources || {};
  
  // Собираем списки разблокированных и заблокированных элементов
  const unlockedList = Object.keys(unlocks).filter(key => unlocks[key]).sort();
  const unlockedBuildingsList = Object.keys(buildings).filter(key => buildings[key]?.unlocked).sort();
  const unlockedResourcesList = Object.keys(resources).filter(key => resources[key]?.unlocked).sort();
  
  // Создаем список шагов для отображения в UI
  const steps: string[] = [
    '🔓 Разблокированные элементы:',
    ...unlockedList.map(item => `✅ ${item}`),
    
    '🏗️ Разблокированные здания:',
    ...unlockedBuildingsList.map(item => `✅ ${item}`),
    
    '📚 Разблокированные ресурсы:',
    ...unlockedResourcesList.map(item => `✅ ${item}`),
    
    '📊 Счетчики:',
    `• Применение знаний: ${state.counters.applyKnowledge?.value || 0}`,
    `• Домашних компьютеров: ${buildings.homeComputer?.count || 0}`,
    `• Криптокошельков: ${buildings.cryptoWallet?.count || 0}`,
    
    '📚 Исследования:',
    `• Основы блокчейна: ${state.upgrades.blockchainBasics?.purchased ? '✅' : '❌'}`,
    `• Основы криптовалют: ${state.upgrades.cryptoCurrencyBasics?.purchased ? '✅' : '❌'}`
  ];
  
  // Собираем заблокированные элементы для дебаггера
  const allFeatureIds = ['knowledge', 'usdt', 'electricity', 'computingPower', 'bitcoin', 
                         'practice', 'generator', 'homeComputer', 'cryptoWallet', 'miner',
                         'internetChannel', 'cryptoLibrary', 'coolingSystem', 'enhancedWallet',
                         'applyKnowledge', 'research', 'phase2', 'referrals'];
  const lockedList = allFeatureIds.filter(id => !unlockedList.includes(id)).sort();
  
  return {
    unlocks: unlockedList,
    unlockedBuildings: unlockedBuildingsList,
    unlockedResources: unlockedResourcesList,
    applyKnowledgeCount: state.counters.applyKnowledge?.value || 0,
    blockchainBasics: state.upgrades.blockchainBasics?.purchased || false,
    cryptoCurrencyBasics: state.upgrades.cryptoCurrencyBasics?.purchased || false,
    homeComputerCount: buildings.homeComputer?.count || 0,
    cryptoWalletCount: buildings.cryptoWallet?.count || 0,
    // Добавляем свойство steps для компонентов
    steps: steps,
    // Добавляем свойство locked для UnlocksDebugger
    unlocked: unlockedList,
    locked: lockedList
  };
};

// Рассчитывает эффективность применения знаний
export function calculateKnowledgeEfficiency(state: GameState): { 
  efficiency: number, 
  baseRate: number,
  bonusRate: number,
  steps: string[] 
} {
  const steps: string[] = [];
  
  // Базовая эффективность (1 USDT за 10 знаний)
  const baseRate = 0.1;
  steps.push(`Базовая эффективность: ${baseRate} USDT за 1 знание`);
  
  // Бонус от исследований
  let bonusRate = 0;
  if (state.upgrades.cryptoCurrencyBasics?.purchased) {
    bonusRate += state.upgrades.cryptoCurrencyBasics.effects?.knowledgeEfficiencyBoost || 0;
    steps.push(`Бонус от "Основы криптовалют": +${bonusRate * 100}%`);
  }
  
  // Общая эффективность
  const efficiency = baseRate * (1 + bonusRate);
  steps.push(`Итоговая эффективность: ${efficiency} USDT за 1 знание`);
  
  return {
    efficiency,
    baseRate,
    bonusRate,
    steps
  };
}

// Отладка расчета производства знаний
export function debugKnowledgeProduction(state: GameState): { finalValue: number, steps: string[] } {
  const steps: string[] = [];
  let finalValue = 0;
  
  // Базовое производство знаний
  const baseProduction = state.resources.knowledge?.baseProduction || 0;
  steps.push(`Базовое производство: ${baseProduction.toFixed(2)} знаний/сек`);
  
  // Производство от зданий
  let buildingProduction = 0;
  
  // Практика
  if (state.buildings.practice && state.buildings.practice.count > 0) {
    const practiceProduction = state.buildings.practice.count * (state.buildings.practice.production?.knowledge || 1);
    buildingProduction += practiceProduction;
    steps.push(`Практика (${state.buildings.practice.count}): +${practiceProduction.toFixed(2)} знаний/сек`);
  }
  
  // Криптобиблиотека
  if (state.buildings.cryptoLibrary && state.buildings.cryptoLibrary.count > 0) {
    const libraryEffect = state.buildings.cryptoLibrary.count * (state.buildings.cryptoLibrary.production?.knowledgeBoost || 0.5);
    const libraryProduction = (baseProduction + buildingProduction) * libraryEffect;
    steps.push(`Криптобиблиотека (${state.buildings.cryptoLibrary.count}): +${(libraryEffect * 100).toFixed(0)}% = +${libraryProduction.toFixed(2)} знаний/сек`);
    buildingProduction += libraryProduction;
  }
  
  // Суммарное производство от зданий
  steps.push(`Суммарное производство от зданий: ${buildingProduction.toFixed(2)} знаний/сек`);
  
  // Бонусы от исследований
  let researchBonus = 0;
  
  // Основы блокчейна
  if (state.upgrades.blockchainBasics && state.upgrades.blockchainBasics.purchased) {
    const blockchainBonus = 0.10; // 10% бонус к производству
    researchBonus += blockchainBonus;
    steps.push(`Исследование "Основы блокчейна": +${(blockchainBonus * 100).toFixed(0)}% к производству знаний`);
  }
  
  // Интернет-канал
  if (state.buildings.internetConnection && state.buildings.internetConnection.count > 0) {
    const internetBonus = 0.20; // 20% бонус к производству
    researchBonus += internetBonus;
    steps.push(`Интернет-канал: +${(internetBonus * 100).toFixed(0)}% к производству знаний`);
  }
  
  // Другие исследования/эффекты
  // Добавьте здесь другие бонусы...
  
  // Расчет итогового значения
  const totalBaseProduction = baseProduction + buildingProduction;
  const bonusProduction = totalBaseProduction * researchBonus;
  finalValue = totalBaseProduction + bonusProduction;
  
  // Добавляем итоговые шаги в лог
  steps.push(`Базовое + здания: ${totalBaseProduction.toFixed(2)} знаний/сек`);
  if (researchBonus > 0) {
    steps.push(`Бонус от исследований: +${(researchBonus * 100).toFixed(0)}% = +${bonusProduction.toFixed(2)} знаний/сек`);
  }
  steps.push(`Итоговая скорость: ${finalValue.toFixed(2)} знаний/сек`);
  
  return { finalValue, steps };
}
