
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
