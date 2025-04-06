import { GameState } from '../types';

/**
 * Обработчик для добавления указанного количества ресурса
 */
export const processIncrementResource = (state: GameState, payload: { resourceId: string, amount: number }): GameState => {
  const { resourceId, amount } = payload;
  
  if (!state.resources[resourceId]) {
    console.error(`Resource ${resourceId} not found`);
    return state;
  }
  
  // Получаем текущее и максимальное значения ресурса
  const currentValue = state.resources[resourceId].value || 0;
  const maxValue = state.resources[resourceId].max || Infinity;
  
  // Учитываем ограничение максимального значения
  const newValue = Math.min(currentValue + amount, maxValue);
  
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
import { Resource } from "@/context/types";

// Функция для обработки изучения крипты
export const processLearnCrypto = (state: GameState): GameState => {
  const knowledge = state.resources.knowledge;
  const usdt = state.resources.usdt;

  if (!knowledge || !usdt) {
    console.error("Отсутствуют ресурсы knowledge или usdt");
    return state;
  }

  // Проверяем, достаточно ли знаний для изучения крипты
  if (knowledge.value < 1) {
    console.log("Недостаточно знаний для изучения крипты");
    return state;
  }

  // Вычисляем, сколько можно добавить USDT (не больше max)
  const amountToAdd = Math.min(1, (usdt.max || 0) - (usdt.value || 0));

  // Если max не установлен или уже достигнут, ничего не делаем
  if (usdt.max === undefined || usdt.value >= usdt.max) {
    console.log("Максимальное значение USDT уже достигнуто");
    return state;
  }

  // Создаем новый объект resources, чтобы избежать мутации state
  const newResources = {
    ...state.resources,
    knowledge: {
      ...knowledge,
      value: knowledge.value - 1 // Уменьшаем знания на 1
    },
    usdt: {
      ...usdt,
      value: usdt.value + amountToAdd // Увеличиваем USDT на вычисленную величину
    }
  };

  // Возвращаем новый state с обновленными ресурсами
  return {
    ...state,
    resources: newResources
  };
};

// Функция для применения знаний
export const processApplyKnowledge = (state: GameState): GameState => {
  const knowledge = state.resources.knowledge;
  const electricity = state.resources.electricity;

  if (!knowledge || !electricity) {
    console.error("Отсутствуют ресурсы knowledge или electricity");
    return state;
  }

  // Проверяем, достаточно ли знаний для применения
  if (knowledge.value < 1) {
    console.log("Недостаточно знаний для применения");
    return state;
  }

  // Увеличиваем производство electricity на 0.1
  const newElectricity = {
    ...electricity,
    production: electricity.production + 0.1
  };

  // Уменьшаем знания на 1
  const newKnowledge = {
    ...knowledge,
    value: knowledge.value - 1
  };

  // Создаем новый объект resources, чтобы избежать мутации state
  const newResources = {
    ...state.resources,
    electricity: newElectricity,
    knowledge: newKnowledge
  };

  // Возвращаем новый state с обновленными ресурсами
  return {
    ...state,
    resources: newResources
  };
};

// Функция для применения всех знаний
export const processApplyAllKnowledge = (state: GameState): GameState => {
  const knowledge = state.resources.knowledge;
  const electricity = state.resources.electricity;

  if (!knowledge || !electricity) {
    console.error("Отсутствуют ресурсы knowledge или electricity");
    return state;
  }

  // Проверяем, достаточно ли знаний для применения
  if (knowledge.value < 10) {
    console.log("Недостаточно знаний для применения");
    return state;
  }

  // Увеличиваем производство electricity на 1
  const newElectricity = {
    ...electricity,
    production: electricity.production + 1
  };

  // Уменьшаем знания на 10
  const newKnowledge = {
    ...knowledge,
    value: knowledge.value - 10
  };

  // Создаем новый объект resources, чтобы избежать мутации state
  const newResources = {
    ...state.resources,
    electricity: newElectricity,
    knowledge: newKnowledge
  };

  // Возвращаем новый state с обновленными ресурсами
  return {
    ...state,
    resources: newResources
  };
};

// Функция для обмена Bitcoin на USDT
export const processExchangeBitcoin = (state: GameState): GameState => {
  const bitcoin = state.resources.bitcoin;
  const usdt = state.resources.usdt;

  if (!bitcoin || !usdt) {
    console.error("Отсутствуют ресурсы bitcoin или usdt");
    return state;
  }

  // Проверяем, достаточно ли Bitcoin для обмена
  if (bitcoin.value < 1) {
    console.log("Недостаточно Bitcoin для обмена");
    return state;
  }

  // Вычисляем, сколько можно добавить USDT (не больше max)
  const amountToAdd = Math.min(100, (usdt.max || 0) - (usdt.value || 0));

  // Если max не установлен или уже достигнут, ничего не делаем
  if (usdt.max === undefined || usdt.value >= usdt.max) {
    console.log("Максимальное значение USDT уже достигнуто");
    return state;
  }

  // Уменьшаем Bitcoin на 1
  const newBitcoin = {
    ...bitcoin,
    value: bitcoin.value - 1
  };

  // Увеличиваем USDT на 100
  const newUsdt = {
    ...usdt,
    value: usdt.value + amountToAdd
  };

  // Создаем новый объект resources, чтобы избежать мутации state
  const newResources = {
    ...state.resources,
    bitcoin: newBitcoin,
    usdt: newUsdt
  };

  // Возвращаем новый state с обновленными ресурсами
  return {
    ...state,
    resources: newResources
  };
};

// Функция для отладки: добавление ресурсов
export const processDebugAddResources = (state: GameState, payload: { resourceId: string; amount: number }): GameState => {
  const { resourceId, amount } = payload;
  const resource = state.resources[resourceId];

  if (!resource) {
    console.error(`Ресурс ${resourceId} не найден`);
    return state;
  }

  // Увеличиваем значение ресурса на указанное количество
  const newResourceValue = Math.min(resource.value + amount, resource.max || Infinity);

  // Создаем новый объект ресурса
  const newResource = {
    ...resource,
    value: newResourceValue
  };

  // Создаем новый объект resources, чтобы избежать мутации state
  const newResources = {
    ...state.resources,
    [resourceId]: newResource
  };

  // Возвращаем новый state с обновленными ресурсами
  return {
    ...state,
    resources: newResources
  };
};
