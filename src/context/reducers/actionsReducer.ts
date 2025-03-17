
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
    
    // Явно разблокируем здание practice
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

// Обработка покупки практики
export const processPracticePurchase = (state: GameState): GameState => {
  console.log("processPracticePurchase вызван");
  
  // Проверяем наличие здания practice
  if (!state.buildings.practice) {
    console.error("Ошибка: здание practice не найдено в state.buildings");
    return state;
  }
  
  // Расчет текущей стоимости
  const practiceBuilding = state.buildings.practice;
  const currentCost = Math.floor(practiceBuilding.cost.usdt * Math.pow(practiceBuilding.costMultiplier, practiceBuilding.count));
  
  console.log(`Покупка practice: USDT ${state.resources.usdt.value}, требуется ${currentCost}`);
  
  // Проверка достаточности ресурсов
  if (state.resources.usdt.value < currentCost) {
    console.log("Недостаточно USDT для покупки practice");
    return state;
  }
  
  // Обновляем ресурсы
  const newResources = {
    ...state.resources,
    usdt: {
      ...state.resources.usdt,
      value: state.resources.usdt.value - currentCost
    }
  };
  
  // Увеличиваем счетчик здания
  const newBuildings = {
    ...state.buildings,
    practice: {
      ...practiceBuilding,
      count: practiceBuilding.count + 1,
      // Каждый уровень практики дает фиксированные 0.63 знаний/сек
      production: {
        knowledge: 0.63
      }
    }
  };
  
  console.log(`Практика улучшена: новый уровень ${practiceBuilding.count + 1}`);
  safeDispatchGameEvent(`Вы повысили уровень практики! Скорость накопления знаний увеличена.`, "success");
  
  return {
    ...state,
    resources: newResources,
    buildings: newBuildings
  };
};
