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
  equipmentTabUnlocked: boolean
} {
  const buildings = state.buildings;
  const buildingsList = Object.keys(buildings);
  const unlockedBuildingsList = buildingsList.filter(id => buildings[id].unlocked);
  
  return {
    buildingsCount: buildingsList.length,
    unlockedBuildingsCount: unlockedBuildingsList.length,
    buildingsList,
    unlockedBuildingsList,
    equipmentTabUnlocked: state.unlocks.equipment === true
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
