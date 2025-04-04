
import { GameState, Counter } from '@/context/types';

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
    : (applyKnowledgeCounter ? (applyKnowledgeCounter as unknown as Counter).value : 0);
  
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
  // Получаем список всех зданий из state.buildings
  const buildings = state.buildings;
  const buildingsList = Object.keys(buildings);
  const unlockedBuildingsList = buildingsList.filter(id => buildings[id].unlocked);
  
  // Получаем значение счетчика разблокированных зданий
  const buildingsUnlockedCounter = state.counters.buildingsUnlocked;
  const counterValue = buildingsUnlockedCounter ? 
    (typeof buildingsUnlockedCounter === 'number' ? buildingsUnlockedCounter : ((buildingsUnlockedCounter as unknown as Counter).value)) : 0;
  
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
  const equipmentCondition = state.counters.buildingsUnlocked && 
    ((typeof state.counters.buildingsUnlocked === 'number' ? 
      state.counters.buildingsUnlocked : 
      ((state.counters.buildingsUnlocked as unknown as Counter).value)) >= 1)
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
    ? (typeof counter === 'number' ? counter : ((counter as unknown as Counter).value)) 
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
       : ((state.counters.buildingsUnlocked as unknown as Counter).value)) 
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

/**
 * Глубокая проверка состояния счетчиков, связанных с разблокировками
 */
export function debugCountersState(state: GameState): {
  counters: { id: string, type: string, value: number }[],
  buildingsUnlockedCounter: { exists: boolean, type: string, value: number },
  applyKnowledgeCounter: { exists: boolean, type: string, value: number },
  knowledgeClicksCounter: { exists: boolean, type: string, value: number },
  relevantCounters: string,
  practiceUnlockedByCounter: boolean,
  equipmentUnlockedByCounter: boolean
} {
  // Получаем все счетчики
  const counters = Object.keys(state.counters).map(id => {
    const counter = state.counters[id];
    const counterType = typeof counter;
    let counterValue: number = 0;
    
    if (counterType === 'number') {
      // Приводим number к number (безопасно)
      counterValue = counter as number;
    } else if (counterType === 'object' && counter) {
      // Для объекта Counter, получаем значение value
      // Используем явное приведение типов через unknown
      const counterObj = counter as unknown as Counter;
      counterValue = counterObj.value || 0;
    }
    
    return {
      id,
      type: counterType,
      value: counterValue
    };
  });
  
  // Получаем значение счетчика buildingsUnlocked
  const buildingsUnlockedCounter = state.counters.buildingsUnlocked;
  const buildingsUnlockedExists = !!buildingsUnlockedCounter;
  const buildingsUnlockedType = typeof buildingsUnlockedCounter;
  let buildingsUnlockedValue = 0;
  
  if (buildingsUnlockedExists) {
    if (buildingsUnlockedType === 'number') {
      buildingsUnlockedValue = buildingsUnlockedCounter as number;
    } else {
      // Безопасное приведение типа через unknown
      const counterObj = buildingsUnlockedCounter as unknown as Counter;
      buildingsUnlockedValue = counterObj.value || 0;
    }
  }
  
  // Получаем значение счетчика applyKnowledge
  const applyKnowledgeCounter = state.counters.applyKnowledge;
  const applyKnowledgeExists = !!applyKnowledgeCounter;
  const applyKnowledgeType = typeof applyKnowledgeCounter;
  let applyKnowledgeValue = 0;
  
  if (applyKnowledgeExists) {
    if (applyKnowledgeType === 'number') {
      applyKnowledgeValue = applyKnowledgeCounter as number;
    } else {
      // Безопасное приведение типа через unknown
      const counterObj = applyKnowledgeCounter as unknown as Counter;
      applyKnowledgeValue = counterObj.value || 0;
    }
  }
  
  // Получаем значение счетчика knowledgeClicks
  const knowledgeClicksCounter = state.counters.knowledgeClicks;
  const knowledgeClicksExists = !!knowledgeClicksCounter;
  const knowledgeClicksType = typeof knowledgeClicksCounter;
  let knowledgeClicksValue = 0;
  
  if (knowledgeClicksExists) {
    if (knowledgeClicksType === 'number') {
      knowledgeClicksValue = knowledgeClicksCounter as number;
    } else {
      // Безопасное приведение типа через unknown
      const counterObj = knowledgeClicksCounter as unknown as Counter;
      knowledgeClicksValue = counterObj.value || 0;
    }
  }
  
  // Ключевые счетчики для разблокировок
  const relevantCounters = `buildingsUnlocked=${buildingsUnlockedValue}, applyKnowledge=${applyKnowledgeValue}, knowledgeClicks=${knowledgeClicksValue}`;
  
  // Проверяем разблокировку здания Практика по счетчику
  // По документации: "Практика" разблокируется после 2+ применений знаний
  const practiceUnlockedByCounter = applyKnowledgeValue >= 2;
  
  // Проверяем разблокировку вкладки Оборудование по счетчику
  // Вкладка Оборудование разблокируется, когда есть хотя бы одно разблокированное здание
  const equipmentUnlockedByCounter = buildingsUnlockedValue >= 1;
  
  return {
    counters,
    buildingsUnlockedCounter: {
      exists: buildingsUnlockedExists,
      type: buildingsUnlockedType,
      value: buildingsUnlockedValue
    },
    applyKnowledgeCounter: {
      exists: applyKnowledgeExists,
      type: applyKnowledgeType,
      value: applyKnowledgeValue
    },
    knowledgeClicksCounter: {
      exists: knowledgeClicksExists,
      type: knowledgeClicksType,
      value: knowledgeClicksValue
    },
    relevantCounters,
    practiceUnlockedByCounter,
    equipmentUnlockedByCounter
  };
}

