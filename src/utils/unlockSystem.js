
import { initialState } from '@/context/initialState';

/**
 * Проверяет условия и обновляет состояние разблокировок
 */
export const checkAllUnlocks = (state) => {
  // Клонируем состояние для модификаций
  const newState = { ...state };
  
  // Проверка разблокировок ресурсов
  checkResourceUnlocks(newState);
  
  // Проверка разблокировок зданий
  checkBuildingUnlocks(newState);
  
  // Проверка разблокировок улучшений
  checkUpgradeUnlocks(newState);
  
  // Проверка разблокировок функций
  checkFeatureUnlocks(newState);
  
  return newState;
};

/**
 * Проверяет специальные условия разблокировок, которые требуют
 * глубокого анализа игрового состояния
 */
export const checkSpecialUnlocks = (state) => {
  const newState = { ...state };
  
  // Проверка USDT - разблокируется после 1+ применения знаний
  const applyKnowledgeCount = getApplyKnowledgeCount(state);
  
  console.log('checkSpecialUnlocks: проверка USDT', {
    applyKnowledgeCount,
    usdtExists: !!newState.resources.usdt,
    usdtUnlocked: newState.resources.usdt?.unlocked || false
  });
  
  if (applyKnowledgeCount >= 1) {
    // Проверяем, существует ли ресурс USDT
    if (!newState.resources.usdt) {
      // Если USDT ещё не создан, создаем его
      newState.resources.usdt = {
        id: 'usdt',
        name: 'USDT',
        description: 'Стейблкоин, универсальная валюта для покупок',
        type: 'currency',
        icon: 'dollar',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 50,
        unlocked: true
      };
      console.log('checkSpecialUnlocks: USDT создан и разблокирован');
    } else {
      // Если USDT уже существует, просто разблокируем его
      newState.resources.usdt.unlocked = true;
      console.log('checkSpecialUnlocks: USDT разблокирован');
    }
    
    // Также устанавливаем общий флаг разблокировки
    newState.unlocks = {
      ...newState.unlocks,
      usdt: true
    };
  }

  // Проверка Practice - разблокируется после 2+ применений знаний
  if (applyKnowledgeCount >= 2) {
    if (!newState.buildings.practice) {
      // Если Practice ещё не создана, создаем её
      newState.buildings.practice = {
        id: 'practice',
        name: 'Практика',
        description: 'Автоматическое получение знаний',
        cost: { usdt: 10 },
        costMultiplier: 1.12,
        production: { knowledge: 1 },
        consumption: {},
        count: 0,
        unlocked: true,
        productionBoost: 1
      };
      console.log('checkSpecialUnlocks: Practice создана и разблокирована');
    } else {
      // Если Practice уже существует, просто разблокируем её
      newState.buildings.practice.unlocked = true;
      console.log('checkSpecialUnlocks: Practice разблокирована');
    }
    
    // Также устанавливаем общий флаг разблокировки
    newState.unlocks = {
      ...newState.unlocks,
      practice: true
    };
  }

  // Проверка Generator - разблокируется после накопления 11+ USDT
  if (newState.resources.usdt?.unlocked && newState.resources.usdt?.value >= 11) {
    if (!newState.buildings.generator) {
      // Если Generator ещё не создан, создаем его
      newState.buildings.generator = {
        id: 'generator',
        name: 'Генератор',
        description: 'Производит электричество для компьютеров',
        cost: { usdt: 20 },
        costMultiplier: 1.12,
        production: { electricity: 0.5 },
        consumption: {},
        count: 0,
        unlocked: true,
        productionBoost: 1
      };
      console.log('checkSpecialUnlocks: Generator создан и разблокирован');
    } else {
      // Если Generator уже существует, просто разблокируем его
      newState.buildings.generator.unlocked = true;
      console.log('checkSpecialUnlocks: Generator разблокирован');
    }
    
    // Также устанавливаем общий флаг разблокировки
    newState.unlocks = {
      ...newState.unlocks,
      generator: true,
      electricity: true
    };
    
    // Разблокируем ресурс электричество
    if (!newState.resources.electricity) {
      newState.resources.electricity = {
        id: 'electricity',
        name: 'Электричество',
        description: 'Электроэнергия для питания устройств',
        type: 'resource',
        icon: 'zap',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 100,
        unlocked: true
      };
    } else {
      newState.resources.electricity.unlocked = true;
    }
  }
  
  return newState;
};

/**
 * Проверяет и разблокирует ресурсы в зависимости от условий
 */
const checkResourceUnlocks = (state) => {
  // Проверка для USDT
  const applyKnowledgeCount = getApplyKnowledgeCount(state);
  if (applyKnowledgeCount >= 1) {
    // Проверяем, существует ли ресурс USDT
    if (!state.resources.usdt) {
      state.resources.usdt = {
        id: 'usdt',
        name: 'USDT',
        description: 'Стейблкоин, универсальная валюта для покупок',
        type: 'currency',
        icon: 'dollar',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 50,
        unlocked: true
      };
    } else {
      state.resources.usdt.unlocked = true;
    }
    
    // Также устанавливаем общий флаг разблокировки
    state.unlocks = {
      ...state.unlocks,
      usdt: true
    };
  }
};

/**
 * Проверяет и разблокирует здания в зависимости от условий
 */
const checkBuildingUnlocks = (state) => {
  // Логика разблокировки зданий
};

/**
 * Проверяет и разблокирует улучшения в зависимости от условий
 */
const checkUpgradeUnlocks = (state) => {
  // Логика разблокировки улучшений
};

/**
 * Проверяет и разблокирует функции в зависимости от условий
 */
const checkFeatureUnlocks = (state) => {
  // Логика разблокировки функций
};

/**
 * Безопасно получает значение счетчика применения знаний
 */
const getApplyKnowledgeCount = (state) => {
  const counter = state.counters.applyKnowledge;
  if (!counter) return 0;
  return typeof counter === 'object' ? counter.value : counter;
};

/**
 * Безопасно получает значение счетчика кликов знаний
 */
const getKnowledgeClickCount = (state) => {
  const counter = state.counters.knowledgeClicks;
  if (!counter) return 0;
  return typeof counter === 'object' ? counter.value : counter;
};

/**
 * Принудительно проверяет все продвинутые разблокировки
 */
export const forceCheckAdvancedUnlocks = (state) => {
  // Клонируем состояние для модификаций
  const newState = { ...state };

  return newState;
};
