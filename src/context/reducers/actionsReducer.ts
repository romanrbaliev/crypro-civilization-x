
import { GameState } from '../types';
import { updateResourceMaxValues } from '../utils/resourceUtils';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Обработка майнинга вычислительной мощности
export const processMiningPower = (state: GameState): GameState => {
  // Проверяем, достаточно ли вычислительной мощности
  if (state.resources.computingPower.value < 50) {
    return state;
  }
  
  // Вычитаем вычислительную мощность и добавляем USDT
  const newResources = {
    ...state.resources,
    computingPower: {
      ...state.resources.computingPower,
      value: state.resources.computingPower.value - 50
    },
    usdt: {
      ...state.resources.usdt,
      value: state.resources.usdt.value + 5, // 5 USDT
      unlocked: true 
    }
  };
  
  // Увеличиваем счетчик майнинга
  const newCounters = {
    ...state.counters,
    mining: state.counters.mining + 1
  };
  
  // Разблокируем кнопку майнинга при первом майнинге
  if (state.counters.mining === 0) {
    safeDispatchGameEvent("Вы успешно добыли 5 USDT! Теперь вы можете майнить регулярно.", "success");
  }
  
  return {
    ...state,
    resources: newResources,
    counters: newCounters
  };
};

// Обработка применения знаний
export const processApplyKnowledge = (state: GameState): GameState => {
  // Проверка наличия достаточного количества знаний
  if (state.resources.knowledge.value < 10) {
    console.log("Недостаточно знаний для применения");
    return state;
  }
  
  // Вычитаем знания
  const newResources = {
    ...state.resources,
    knowledge: {
      ...state.resources.knowledge,
      value: state.resources.knowledge.value - 10
    },
    usdt: {
      ...state.resources.usdt,
      value: state.resources.usdt.value + 1,
      unlocked: true
    }
  };
  
  console.log("Применены знания: -10 знаний, +1 USDT");
  
  // Увеличиваем счетчик применения знаний
  const newCounters = {
    ...state.counters,
    applyKnowledge: (state.counters.applyKnowledge || 0) + 1
  };
  
  // Проверяем, нужно ли разблокировать практику
  let newUnlocks = { ...state.unlocks };
  let newBuildings = { ...state.buildings };
  
  // Разблокируем практику после 2-го применения знаний
  if (newCounters.applyKnowledge >= 2 && !state.unlocks.practice) {
    console.log("Разблокировка практики после 2-го применения знаний");
    newUnlocks.practice = true;
    
    // Важно: явно разблокируем здание practice
    if (newBuildings.practice) {
      console.log("Разблокировка здания practice");
      newBuildings.practice = {
        ...newBuildings.practice,
        unlocked: true
      };
    } else {
      console.warn("Здание practice не найдено в state.buildings");
    }
    
    safeDispatchGameEvent("Разблокирована возможность практиковаться", "info");
  }
  
  const newState = {
    ...state,
    resources: newResources,
    counters: newCounters,
    unlocks: newUnlocks,
    buildings: newBuildings
  };
  
  return updateResourceMaxValues(newState);
};
