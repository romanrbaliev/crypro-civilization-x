
import { GameState } from '../../types';

// Функция для разблокировки зданий в зависимости от фазы
export const unlockBuildingsByPhase = (state: GameState, phase: number): GameState => {
  // Создаем копию текущего состояния
  let newState = { ...state };
  
  // Разблокируем здания в зависимости от фазы
  switch (phase) {
    case 1:
      // Фаза 1 - базовые здания
      newState = unlockPhase1Buildings(newState);
      break;
    case 2:
      // Фаза 2 - здания второго уровня
      newState = unlockPhase2Buildings(newState);
      break;
    case 3:
      // Фаза 3 - продвинутые здания
      newState = unlockPhase3Buildings(newState);
      break;
    default:
      break;
  }
  
  return newState;
};

// Разблокировка зданий первой фазы
const unlockPhase1Buildings = (state: GameState): GameState => {
  return {
    ...state,
    buildings: {
      ...state.buildings,
      practice: {
        ...state.buildings.practice,
        unlocked: true
      }
    }
  };
};

// Разблокировка зданий второй фазы
const unlockPhase2Buildings = (state: GameState): GameState => {
  return {
    ...state,
    buildings: {
      ...state.buildings,
      generator: {
        ...state.buildings.generator,
        unlocked: true
      }
    }
  };
};

// Разблокировка зданий третьей фазы
const unlockPhase3Buildings = (state: GameState): GameState => {
  return {
    ...state,
    buildings: {
      ...state.buildings,
      homeComputer: {
        ...state.buildings.homeComputer,
        unlocked: true
      }
    }
  };
};
