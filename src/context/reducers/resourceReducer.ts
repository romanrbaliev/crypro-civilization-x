
import { GameState, ResourceAction } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Обработка инкрементирования значения ресурса
export const processIncrementResource = (
  state: GameState, 
  payload: { resourceId: string; amount: number }
): GameState => {
  const { resourceId, amount } = payload;
  
  // Проверяем, существует ли ресурс
  if (!state.resources[resourceId]) {
    console.warn(`Ресурс с ID ${resourceId} не найден`);
    return state;
  }
  
  // Получаем текущее значение и максимум
  const currentValue = state.resources[resourceId].value;
  const maxValue = state.resources[resourceId].max;
  
  // Рассчитываем новое значение
  let newValue = currentValue + amount;
  if (maxValue !== undefined && maxValue !== Infinity) {
    newValue = Math.min(newValue, maxValue);
  }
  newValue = Math.max(0, newValue); // Не позволяем значению быть отрицательным
  
  // Обновляем ресурс
  return {
    ...state,
    resources: {
      ...state.resources,
      [resourceId]: {
        ...state.resources[resourceId],
        value: newValue
      }
    }
  };
};

// Обработка применения всех знаний
export const applyAllKnowledge = (
  state: GameState,
  action: ResourceAction
): GameState => {
  // Получаем текущее значение знаний
  const knowledgeValue = state.resources.knowledge?.value || 0;
  
  // Если знаний меньше 10, ничего не делаем
  if (knowledgeValue < 10) {
    return state;
  }
  
  // Определяем количество знаний для конвертации (кратное 10)
  const knowledgeToConvert = Math.floor(knowledgeValue / 10) * 10;
  
  // Определяем базовое количество USDT для начисления (1 USDT за каждые 10 знаний)
  let usdtToAdd = Math.floor(knowledgeToConvert / 10);
  
  // Проверяем наличие бустов для эффективности применения знаний
  const knowledgeEfficiencyBoost = 
    (state.upgrades.cryptoCurrencyBasics?.purchased ? 
      (state.upgrades.cryptoCurrencyBasics.effects?.knowledgeEfficiencyBoost || 0) : 0);
      
  // Применяем буст, если он есть
  if (knowledgeEfficiencyBoost > 0) {
    usdtToAdd *= (1 + knowledgeEfficiencyBoost);
  }
  
  let updatedState = state;
  
  // Проверяем наличие ресурса USDT
  if (!state.resources.usdt) {
    // Если USDT не существует, создаем его
    updatedState = {
      ...updatedState,
      resources: {
        ...updatedState.resources,
        usdt: {
          id: 'usdt',
          name: 'USDT',
          description: 'Стейблкоин для покупок и улучшений',
          type: 'currency',
          value: 0,
          baseProduction: 0,
          production: 0,
          perSecond: 0,
          max: 100,
          unlocked: false,
          icon: 'dollar'
        }
      }
    };
  }
  
  // Инкрементируем счетчик применений знаний
  let applyKnowledgeCounter;
  if (typeof updatedState.counters.applyKnowledge === 'object') {
    applyKnowledgeCounter = {
      ...updatedState.counters.applyKnowledge as { value: number },
      value: ((updatedState.counters.applyKnowledge as { value: number })?.value || 0) + 1,
      updatedAt: Date.now()
    };
  } else {
    applyKnowledgeCounter = {
      value: (updatedState.counters.applyKnowledge as number || 0) + 1,
      updatedAt: Date.now()
    };
  }
  
  updatedState = {
    ...updatedState,
    counters: {
      ...updatedState.counters,
      applyKnowledge: applyKnowledgeCounter
    }
  };
  
  // Проверяем, нужно ли разблокировать USDT (после первого применения знаний)
  if ((applyKnowledgeCounter.value) >= 1 && !updatedState.unlocks.usdt) {
    updatedState = {
      ...updatedState,
      unlocks: {
        ...updatedState.unlocks,
        usdt: true
      },
      resources: {
        ...updatedState.resources,
        usdt: {
          ...updatedState.resources.usdt,
          unlocked: true
        }
      }
    };
    
    safeDispatchGameEvent('Разблокирован ресурс: USDT', 'success');
  }
  
  // Проверяем, нужно ли разблокировать практику (после второго применения знаний)
  if ((applyKnowledgeCounter.value) >= 2 && !updatedState.unlocks.practice) {
    updatedState = {
      ...updatedState,
      unlocks: {
        ...updatedState.unlocks,
        practice: true
      }
    };
    
    // Если здание практики существует, разблокируем его
    if (updatedState.buildings.practice) {
      updatedState = {
        ...updatedState,
        buildings: {
          ...updatedState.buildings,
          practice: {
            ...updatedState.buildings.practice,
            unlocked: true
          }
        }
      };
    }
    
    safeDispatchGameEvent('Разблокировано: Практика', 'success');
  }
  
  // Уменьшаем знания
  updatedState = {
    ...updatedState,
    resources: {
      ...updatedState.resources,
      knowledge: {
        ...updatedState.resources.knowledge,
        value: updatedState.resources.knowledge.value - knowledgeToConvert
      },
      usdt: {
        ...updatedState.resources.usdt,
        value: updatedState.resources.usdt.value + usdtToAdd
      }
    }
  };
  
  return updatedState;
};

// Экспортируем applyAllKnowledge под альтернативным именем для совместимости
export const processApplyAllKnowledge = applyAllKnowledge;
