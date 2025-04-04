
import { GameState } from '@/context/types';

/**
 * Отладка состояния здания "Практика"
 */
export function debugPracticeBuilding(state: GameState): { 
  exists: boolean,
  unlocked: boolean,
  count: number,
  stateInUnlocks: boolean,
  conditionalCheck: boolean
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
  
  return {
    exists,
    unlocked,
    count,
    stateInUnlocks,
    conditionalCheck
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
