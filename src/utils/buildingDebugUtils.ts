
import { GameState } from '@/context/types';
import { unlockableItemsRegistry } from '@/systems/unlock/registry';

/**
 * Возвращает отладочную информацию о здании "Практика"
 */
export function debugPracticeBuilding(state: GameState) {
  // Проверяем наличие здания в state.buildings
  const practiceExists = !!state.buildings.practice;
  
  // Проверяем, разблокировано ли здание
  const practiceUnlocked = practiceExists && state.buildings.practice.unlocked;
  
  // Количество зданий "Практика"
  const practiceCount = practiceExists ? state.buildings.practice.count : 0;
  
  // Проверяем наличие разблокировки в state.unlocks
  const practiceStateInUnlocks = !!state.unlocks.practice;
  
  // Проверяем, выполнено ли условие разблокировки (счетчик applyKnowledge >= 2)
  const applyKnowledgeCounter = state.counters.applyKnowledge;
  let applyKnowledgeValue = 0;
  
  if (applyKnowledgeCounter) {
    applyKnowledgeValue = typeof applyKnowledgeCounter === 'object' 
      ? applyKnowledgeCounter.value 
      : applyKnowledgeCounter;
  }
  
  const conditionalCheck = applyKnowledgeValue >= 2;
  
  // Проверяем, отображается ли здание в BuildingsContainer
  // (это можно определить только косвенно)
  const displayInBuildingsContainer = practiceExists && practiceUnlocked;
  
  // Проверяем, отображается ли здание в EquipmentTab
  // (это тоже можно определить только косвенно)
  const equipmentTabUnlocked = !!state.unlocks.equipment;
  const displayInEquipmentTab = displayInBuildingsContainer && equipmentTabUnlocked;
  
  // Проверяем, есть ли здание в списке всех зданий
  const inBuildingsList = practiceExists;
  
  return {
    exists: practiceExists,
    unlocked: practiceUnlocked,
    count: practiceCount,
    stateInUnlocks: practiceStateInUnlocks,
    conditionalCheck,
    displayInBuildingsContainer,
    displayInEquipmentTab,
    inBuildingsList,
    applyKnowledgeCounter: applyKnowledgeValue
  };
}

/**
 * Возвращает отладочную информацию о состоянии отображения зданий
 */
export function debugBuildingDisplay(state: GameState) {
  // Подсчитываем количество зданий
  const buildingsCount = Object.keys(state.buildings).length;
  
  // Подсчитываем количество разблокированных зданий
  const unlockedBuildingsCount = Object.values(state.buildings)
    .filter(building => building.unlocked)
    .length;
  
  // Проверяем, разблокирована ли вкладка "Equipment"
  const equipmentTabUnlocked = !!state.unlocks.equipment;
  
  // Проверяем счетчик разблокированных зданий
  const buildingsUnlockedCounter = state.counters.buildingsUnlocked;
  let buildingsUnlockedCounterValue = 0;
  
  if (buildingsUnlockedCounter) {
    buildingsUnlockedCounterValue = typeof buildingsUnlockedCounter === 'object'
      ? buildingsUnlockedCounter.value
      : buildingsUnlockedCounter;
  }
  
  return {
    buildingsCount,
    unlockedBuildingsCount,
    equipmentTabUnlocked,
    buildingsUnlockedCounterValue
  };
}

/**
 * Возвращает список всех зданий с их статусом
 */
export function listAllBuildings(state: GameState) {
  return Object.keys(state.buildings).map(buildingId => {
    const building = state.buildings[buildingId];
    
    return {
      id: buildingId,
      exists: true,
      unlocked: building.unlocked,
      count: building.count
    };
  });
}

/**
 * Возвращает отладочную информацию о разблокировке вкладок
 */
export function debugTabsUnlocks(state: GameState) {
  // Проверяем статус вкладки "Оборудование"
  const equipmentUnlocked = !!state.unlocks.equipment;
  
  // Проверяем статус вкладки "Исследования"
  const researchUnlocked = !!state.unlocks.research;
  
  // Проверяем статус вкладки "Специализация"
  const specializationUnlocked = !!state.unlocks.specialization;
  
  // Получаем все вкладки
  const allTabs = Object.entries(state.unlocks)
    .filter(([key]) => ['equipment', 'research', 'specialization', 'referrals', 'trading'].includes(key))
    .map(([id, unlocked]) => ({ id, unlocked }));
  
  return {
    equipment: {
      unlocked: equipmentUnlocked,
      condition: 'buildingsUnlocked > 0'
    },
    research: {
      unlocked: researchUnlocked,
      condition: 'generator count > 0'
    },
    specialization: {
      unlocked: specializationUnlocked,
      condition: 'cryptoBasics = true'
    },
    allTabs
  };
}

/**
 * Анализирует состояние счетчика applyKnowledge
 */
export function debugApplyKnowledgeCounter(state: GameState) {
  // Проверяем наличие счетчика
  const counter = state.counters.applyKnowledge;
  const counterExists = !!counter;
  
  // Определяем тип и значение счетчика
  let counterValue = 0;
  let counterType = 'undefined';
  
  if (counterExists) {
    counterType = typeof counter === 'object' ? 'object' : typeof counter;
    counterValue = typeof counter === 'object' ? counter.value : counter;
  }
  
  // Находим порог разблокировки здания "Практика"
  const practiceUnlockItem = unlockableItemsRegistry['practice'];
  let practiceUnlockThreshold = 0;
  
  if (practiceUnlockItem) {
    const applyKnowledgeCondition = practiceUnlockItem.conditions.find(
      condition => condition.targetId === 'applyKnowledge'
    );
    
    if (applyKnowledgeCondition) {
      practiceUnlockThreshold = applyKnowledgeCondition.targetValue as number;
    }
  }
  
  // Проверяем состояние здания "Практика"
  const practiceExists = !!state.buildings.practice;
  const practiceUnlocked = practiceExists && state.buildings.practice.unlocked;
  
  // Проверяем разблокировку вкладки "Оборудование"
  const equipmentTabUnlocked = !!state.unlocks.equipment;
  
  // Проверяем счетчик разблокированных зданий
  const buildingsUnlockedCounter = state.counters.buildingsUnlocked;
  let buildingsUnlockedValue = 0;
  
  if (buildingsUnlockedCounter) {
    buildingsUnlockedValue = typeof buildingsUnlockedCounter === 'object'
      ? buildingsUnlockedCounter.value
      : buildingsUnlockedCounter;
  }
  
  // Формируем рекомендации
  const recommendations: string[] = [];
  
  if (!counterExists) {
    recommendations.push('Создайте счетчик applyKnowledge');
  } else if (counterValue < practiceUnlockThreshold && !practiceUnlocked && practiceExists) {
    recommendations.push(`Увеличьте счетчик applyKnowledge до ${practiceUnlockThreshold} или разблокируйте здание "Практика" вручную`);
  }
  
  if (practiceUnlocked && !equipmentTabUnlocked) {
    recommendations.push('Разблокируйте вкладку "Оборудование"');
  }
  
  if (buildingsUnlockedValue === 0 && practiceUnlocked) {
    recommendations.push('Увеличьте счетчик buildingsUnlocked');
  }
  
  return {
    counterExists,
    counterValue,
    counterType,
    practiceUnlockThreshold,
    practiceExists,
    practiceUnlocked,
    equipmentTabUnlocked,
    buildingsUnlockedCounter: buildingsUnlockedValue,
    recommendations
  };
}
