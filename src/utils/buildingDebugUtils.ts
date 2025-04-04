import { GameState } from '@/context/types';

/**
 * Отладка состояния здания "Практика"
 */
export function debugPracticeBuilding(state: GameState): { 
  exists: boolean,
  unlocked: boolean,
  count: number,
  stateInUnlocks: boolean,
  conditionalCheck: boolean,
  displayInBuildingsContainer: boolean,
  displayInEquipmentTab: boolean,
  inBuildingsList: boolean
} {
  // Проверка существования здания в state.buildings
  const practiceBuilding = state.buildings.practice;
  const exists = !!practiceBuilding;
  
  // Проверка разблокировки в state.buildings
  const unlocked = exists ? !!practiceBuilding.unlocked : false;
  
  // Количество купленных зданий
  const count = exists ? (practiceBuilding.count || 0) : 0;
  
  // Проверка в state.unlocks
  const stateInUnlocks = !!state.unlocks.practice;
  
  // Проверка условий разблокировки (2+ применения знаний)
  const applyKnowledgeCounter = state.counters.applyKnowledge;
  const applyKnowledgeCount = typeof applyKnowledgeCounter === 'number' 
    ? applyKnowledgeCounter 
    : (applyKnowledgeCounter ? applyKnowledgeCounter.value : 0);
  
  const conditionalCheck = applyKnowledgeCount >= 2;
  
  // Проверка, отображается ли в BuildingsContainer
  const displayInBuildingsContainer = exists && unlocked; 
  
  // Проверка, отображается ли в EquipmentTab
  const displayInEquipmentTab = exists && unlocked;
  
  // Проверка наличия в списке зданий
  const inBuildingsList = Object.keys(state.buildings).includes('practice');
  
  return {
    exists,
    unlocked,
    count,
    stateInUnlocks,
    conditionalCheck,
    displayInBuildingsContainer,
    displayInEquipmentTab,
    inBuildingsList
  };
}

/**
 * Проверяет все здания и их состояние
 */
export function listAllBuildings(state: GameState): { 
  id: string, 
  exists: boolean, 
  unlocked: boolean, 
  count: number
}[] {
  // Получаем список всех зданий из state.buildings
  return Object.keys(state.buildings).map(id => {
    const building = state.buildings[id];
    return {
      id,
      exists: !!building,
      unlocked: building ? !!building.unlocked : false,
      count: building ? (building.count || 0) : 0
    };
  });
}

/**
 * Детальная отладка компонентов отображения зданий
 */
export function debugBuildingDisplay(state: GameState): {
  buildingsCount: number,
  unlockedBuildingsCount: number,
  buildingsList: string[], 
  unlockedBuildingsList: string[],
  equipmentTabUnlocked: boolean,
  buildingsUnlockedCounterValue: number
} {
  const buildings = state.buildings;
  const buildingsList = Object.keys(buildings);
  const unlockedBuildingsList = buildingsList.filter(id => buildings[id].unlocked);
  
  // Получаем значение счетчика разблокированных зданий
  const buildingsUnlockedCounter = state.counters.buildingsUnlocked;
  const counterValue = buildingsUnlockedCounter ? 
    (typeof buildingsUnlockedCounter === 'number' ? buildingsUnlockedCounter : buildingsUnlockedCounter.value) : 0;
  
  return {
    buildingsCount: buildingsList.length,
    unlockedBuildingsCount: unlockedBuildingsList.length,
    buildingsList,
    unlockedBuildingsList,
    equipmentTabUnlocked: state.unlocks.equipment === true,
    buildingsUnlockedCounterValue: counterValue
  };
}

/**
 * Отладка состояния разблокировок вкладок интерфейса
 */
export function debugTabsUnlocks(state: GameState): { 
  equipment: { unlocked: boolean, condition: string },
  research: { unlocked: boolean, condition: string },
  specialization: { unlocked: boolean, condition: string },
  referrals: { unlocked: boolean, condition: string },
  trading: { unlocked: boolean, condition: string },
  allTabs: { id: string, unlocked: boolean }[]
} {
  // Получаем базовую информацию о вкладках
  const equipmentUnlocked = !!state.unlocks.equipment;
  const researchUnlocked = !!state.unlocks.research;
  const specializationUnlocked = !!state.unlocks.specialization;
  const referralsUnlocked = !!state.unlocks.referrals;
  const tradingUnlocked = !!state.unlocks.trading;
  
  // Проверяем условия разблокировки для каждой вкладки
  // Вкладка Оборудование (Equipment)
  const equipmentCondition = state.counters.buildingsUnlocked && state.counters.buildingsUnlocked.value >= 1 
    ? "✅ Разблокировано хотя бы одно здание" 
    : "❌ Не разблокировано ни одно здание";
  
  // Вкладка Исследования (Research)
  const researchCondition = state.buildings.generator && state.buildings.generator.count > 0 
    ? "✅ Имеется хотя бы один генератор" 
    : "❌ Не куплен генератор";
  
  // Вкладка Специализация (Specialization)
  const specializationCondition = state.upgrades.cryptoBasics && state.upgrades.cryptoBasics.purchased 
    ? "✅ Изучены Основы криптовалют" 
    : "❌ Не изучены Основы криптовалют";
  
  // Вкладка Рефералы (Referrals)
  const referralsCondition = state.upgrades.cryptoCommunity && state.upgrades.cryptoCommunity.purchased 
    ? "✅ Изучено Криптосообщество" 
    : "❌ Не изучено Криптосообщество";
  
  // Вкладка Трейдинг (Trading)
  const tradingCondition = state.upgrades.cryptoTrading && state.upgrades.cryptoTrading.purchased 
    ? "✅ Изучен Криптовалютный трейдинг" 
    : "❌ Не изучен Криптовалютный трейдинг";
  
  // Получаем список всех вкладок
  const allTabs = [
    { id: 'main', unlocked: true }, // Главная вкладка всегда разблокирована
    { id: 'equipment', unlocked: equipmentUnlocked },
    { id: 'research', unlocked: researchUnlocked },
    { id: 'specialization', unlocked: specializationUnlocked },
    { id: 'referrals', unlocked: referralsUnlocked },
    { id: 'trading', unlocked: tradingUnlocked }
  ];
  
  return {
    equipment: { unlocked: equipmentUnlocked, condition: equipmentCondition },
    research: { unlocked: researchUnlocked, condition: researchCondition },
    specialization: { unlocked: specializationUnlocked, condition: specializationCondition },
    referrals: { unlocked: referralsUnlocked, condition: referralsCondition },
    trading: { unlocked: tradingUnlocked, condition: tradingCondition },
    allTabs
  };
}

/**
 * Анализ состояния счетчика applyKnowledge и его влияния на разблокировки
 */
export function debugApplyKnowledgeCounter(state: GameState): {
  counterExists: boolean,
  counterValue: number,
  counterType: string,
  practiceUnlockThreshold: number,
  practiceUnlocked: boolean,
  practiceExists: boolean,
  equipmentTabUnlocked: boolean,
  buildingsUnlockedCounter: number,
  recommendations: string[]
} {
  // Проверяем существование счетчика
  const counter = state.counters.applyKnowledge;
  const counterExists = !!counter;
  
  // Получаем значение счетчика
  const counterValue = counterExists 
    ? (typeof counter === 'number' ? counter : counter.value) 
    : 0;
  
  // Определяем тип счетчика
  const counterType = counterExists 
    ? (typeof counter === 'number' ? 'number' : 'object') 
    : 'не существует';
  
  // Пороговое значение для разблокировки Практики (по документации)
  const practiceUnlockThreshold = 2;
  
  // Проверяем разблокировку здания Практика
  const practiceExists = !!state.buildings.practice;
  const practiceUnlocked = practiceExists ? !!state.buildings.practice.unlocked : false;
  
  // Проверяем разблокировку вкладки Оборудование
  const equipmentTabUnlocked = !!state.unlocks.equipment;
  
  // Получаем значение счетчика разблокированных зданий
  const buildingsUnlockedCounter = state.counters.buildingsUnlocked 
    ? (typeof state.counters.buildingsUnlocked === 'number' 
       ? state.counters.buildingsUnlocked 
       : state.counters.buildingsUnlocked.value) 
    : 0;
  
  // Формируем рекомендации
  const recommendations: string[] = [];
  
  if (counterValue >= practiceUnlockThreshold && !practiceUnlocked && practiceExists) {
    recommendations.push('Здание "Практика" должно быть разблокировано, но не разблокировано. Возможно, нужно вызвать FORCE_CHECK_UNLOCKS.');
  }
  
  if (practiceUnlocked && !equipmentTabUnlocked) {
    recommendations.push('Здание "Практика" разблокировано, но вкладка "Оборудование" не разблокирована. Проверьте счетчик buildingsUnlocked.');
  }
  
  if (practiceUnlocked && buildingsUnlockedCounter < 1) {
    recommendations.push('Обнаружено расхождение: здание разблокировано, но счетчик buildingsUnlocked = 0. Требуется корректировка.');
  }
  
  if (counterValue < practiceUnlockThreshold && practiceUnlocked) {
    recommendations.push(`Значение счетчика applyKnowledge (${counterValue}) меньше порогового (${practiceUnlockThreshold}), но здание "Практика" уже разблокировано.`);
  }
  
  return {
    counterExists,
    counterValue,
    counterType,
    practiceUnlockThreshold,
    practiceUnlocked,
    practiceExists,
    equipmentTabUnlocked,
    buildingsUnlockedCounter,
    recommendations
  };
}
