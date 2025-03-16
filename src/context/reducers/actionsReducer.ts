
import { GameState } from '../types';

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
    const eventBus = window.gameEventBus;
    if (eventBus) {
      const customEvent = new CustomEvent('game-event', {
        detail: {
          message: "Вы успешно добыли 5 USDT! Теперь вы можете майнить регулярно.",
          type: "success"
        }
      });
      eventBus.dispatchEvent(customEvent);
    }
  }
  
  return {
    ...state,
    resources: newResources,
    counters: newCounters
  };
};

// Обработка применения знаний
export const processApplyKnowledge = (state: GameState): GameState => {
  // Проверяем, достаточно ли знаний
  if (state.resources.knowledge.value < 10) {
    return state;
  }
  
  // Вычитаем знания и добавляем USDT
  const newResources = {
    ...state.resources,
    knowledge: {
      ...state.resources.knowledge,
      value: state.resources.knowledge.value - 10
    },
    usdt: {
      ...state.resources.usdt,
      value: state.resources.usdt.value + 1,
      unlocked: true // Важно: убедимся, что usdt разблокирован
    }
  };
  
  // Увеличиваем счетчик применений знаний
  const newCounters = {
    ...state.counters,
    applyKnowledge: state.counters.applyKnowledge + 1
  };
  
  // При первом применении знаний отправляем сообщение
  if (state.counters.applyKnowledge === 0) {
    const eventBus = window.gameEventBus;
    if (eventBus) {
      const customEvent = new CustomEvent('game-event', {
        detail: {
          message: "Вы применили свои знания и получили 1 USDT!",
          type: "success"
        }
      });
      eventBus.dispatchEvent(customEvent);
    }
  }
  
  // Разблокируем практику после второго применения знаний
  if (state.counters.applyKnowledge === 1) {
    const eventBus = window.gameEventBus;
    if (eventBus) {
      const customEvent = new CustomEvent('game-event', {
        detail: {
          message: "После применения знаний открыта функция 'Практика'",
          type: "info"
        }
      });
      eventBus.dispatchEvent(customEvent);
    }
    
    return {
      ...state,
      resources: newResources,
      counters: newCounters,
      unlocks: {
        ...state.unlocks,
        practice: true
      },
      buildings: {
        ...state.buildings,
        practice: {
          ...state.buildings.practice,
          unlocked: true
        }
      }
    };
  }
  
  return {
    ...state,
    resources: newResources,
    counters: newCounters
  };
};
