
import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

// Интерфейс для параметров майнинга
interface MiningParams {
  difficulty: number;
  hashrate: number;
  blockReward: number;
  lastBlockTime: number;
  exchangeRate: number;
  exchangeCommission: number;
  miningEfficiency: number;
  energyEfficiency: number;
  networkDifficulty: number;
  volatility: number;
}

// Функция для проверки всех разблокировок
export const checkAllUnlocks = (state: GameState): GameState => {
  // Создаем копию состояния для модификации
  let newState = { ...state };
  
  // Последовательно проверяем все типы разблокировок
  newState = checkResourceUnlocks(newState);
  newState = checkBuildingUnlocks(newState);
  newState = checkUpgradeUnlocks(newState);
  newState = checkActionUnlocks(newState);
  newState = checkSpecialUnlocks(newState);
  
  return newState;
};

// Полная перепроверка всех разблокировок с нуля
export const rebuildAllUnlocks = (state: GameState): GameState => {
  console.log("unlockManager: Выполняем полную перепроверку всех разблокировок");
  return checkAllUnlocks(state);
};

// Проверяет специальные разблокировки, зависящие от счетчиков и других условий
export const checkSpecialUnlocks = (state: GameState): GameState => {
  // Создаем копию состояния для модификации
  const newState = { ...state };
  
  // Проверяем условия для разблокировки USDT
  const applyKnowledgeCount = getApplyKnowledgeCount(state);
  if (applyKnowledgeCount >= 1 && !newState.unlocks.usdt) {
    newState.unlocks.usdt = true;
    
    // Проверяем, существует ли ресурс USDT
    if (!newState.resources.usdt) {
      newState.resources.usdt = {
        id: 'usdt',
        name: 'USDT',
        description: 'Стабильная криптовалюта, привязанная к доллару',
        type: 'currency',
        icon: 'dollar',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 100,
        unlocked: true,
        consumption: 0
      };
    } else {
      // Если ресурс существует, просто разблокируем его
      newState.resources.usdt.unlocked = true;
    }
    
    safeDispatchGameEvent('Разблокирован ресурс: USDT', 'info');
  }
  
  return newState;
};

// Проверяет разблокировки ресурсов на основе требований
export const checkResourceUnlocks = (state: GameState): GameState => {
  // Создаем копию состояния для модификации
  const newState = { ...state };
  
  // Проверяем условия для разблокировки электричества
  if (newState.buildings.generator && newState.buildings.generator.count > 0 && !newState.unlocks.electricity) {
    newState.unlocks.electricity = true;
    
    // Проверяем, существует ли ресурс электричество
    if (!newState.resources.electricity) {
      newState.resources.electricity = {
        id: 'electricity',
        name: 'Электричество',
        description: 'Энергия для питания компьютеров и майнеров',
        type: 'resource',
        icon: 'zap',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 100,
        unlocked: true,
        consumption: 0
      };
    } else {
      // Если ресурс существует, просто разблокируем его
      newState.resources.electricity.unlocked = true;
    }
    
    safeDispatchGameEvent('Разблокирован ресурс: Электричество', 'info');
  }
  
  // Проверяем условия для разблокировки вычислительной мощности
  if (newState.buildings.homeComputer && newState.buildings.homeComputer.count > 0 && !newState.unlocks.computingPower) {
    newState.unlocks.computingPower = true;
    
    // Проверяем, существует ли ресурс вычислительная мощность
    if (!newState.resources.computingPower) {
      newState.resources.computingPower = {
        id: 'computingPower',
        name: 'Вычислительная мощность',
        description: 'Вычислительные ресурсы для майнинга и анализа',
        type: 'resource',
        icon: 'cpu',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 100,
        unlocked: true,
        consumption: 0
      };
    } else {
      // Если ресурс существует, просто разблокируем его
      newState.resources.computingPower.unlocked = true;
    }
    
    safeDispatchGameEvent('Разблокирован ресурс: Вычислительная мощность', 'info');
  }
  
  return newState;
};

// Проверяет разблокировки зданий на основе требований
export const checkBuildingUnlocks = (state: GameState): GameState => {
  // Создаем копию состояния для модификации
  const newState = { ...state };
  
  // Счетчик применения знаний для разблокировки практики
  const applyKnowledgeCount = getApplyKnowledgeCount(state);
  
  // Проверяем условия для разблокировки Практики (2+ применения знаний)
  if (applyKnowledgeCount >= 2 && newState.buildings.practice && !newState.buildings.practice.unlocked) {
    newState.buildings.practice.unlocked = true;
    newState.unlocks.practice = true;
    safeDispatchGameEvent('Разблокировано здание: Практика', 'info');
  }
  
  // Проверяем условия для разблокировки Генератора (11+ USDT)
  if ((newState.resources.usdt?.value || 0) >= 11 && 
      newState.resources.usdt?.unlocked && 
      newState.buildings.generator && 
      !newState.buildings.generator.unlocked) {
    newState.buildings.generator.unlocked = true;
    newState.unlocks.generator = true;
    safeDispatchGameEvent('Разблокировано здание: Генератор', 'info');
  }
  
  // Проверяем условия для разблокировки Домашнего компьютера (50+ электричества)
  if ((newState.resources.electricity?.value || 0) >= 50 && 
      newState.resources.electricity?.unlocked && 
      newState.buildings.homeComputer && 
      !newState.buildings.homeComputer.unlocked) {
    newState.buildings.homeComputer.unlocked = true;
    newState.unlocks.homeComputer = true;
    safeDispatchGameEvent('Разблокировано здание: Домашний компьютер', 'info');
  }
  
  // Разблокировка криптокошелька после исследования "Основы блокчейна"
  if (newState.upgrades.blockchainBasics && 
      newState.upgrades.blockchainBasics.purchased && 
      newState.buildings.cryptoWallet && 
      !newState.buildings.cryptoWallet.unlocked) {
    newState.buildings.cryptoWallet.unlocked = true;
    newState.unlocks.cryptoWallet = true;
    safeDispatchGameEvent('Разблокировано здание: Криптокошелек', 'info');
  }
  
  return newState;
};

// Проверяет разблокировки исследований на основе требований
export const checkUpgradeUnlocks = (state: GameState): GameState => {
  // Создаем копию состояния для модификации
  const newState = { ...state };
  
  // Проверяем условия для разблокировки исследования "Основы блокчейна" (куплен генератор)
  if (newState.buildings.generator && 
      newState.buildings.generator.count > 0 && 
      newState.upgrades.blockchainBasics && 
      !newState.upgrades.blockchainBasics.unlocked) {
    newState.upgrades.blockchainBasics.unlocked = true;
    
    // Если исследования еще не разблокированы, разблокируем их
    if (!newState.unlocks.research) {
      newState.unlocks.research = true;
      safeDispatchGameEvent('Разблокирована возможность: Исследования', 'info');
    }
    
    safeDispatchGameEvent('Разблокировано исследование: Основы блокчейна', 'info');
  }
  
  // Добавляем проверку для разблокировки других исследований...
  
  return newState;
};

// Проверяет разблокировки действий на основе требований
export const checkActionUnlocks = (state: GameState): GameState => {
  // Создаем копию состояния для модификации
  const newState = { ...state };
  
  // Проверка разблокировки действия "Применить знания" (3+ кликов по "Изучить")
  const knowledgeClicksValue = getKnowledgeClickCount(state);
  if (knowledgeClicksValue >= 3 && !newState.unlocks.applyKnowledge) {
    newState.unlocks.applyKnowledge = true;
    safeDispatchGameEvent('Разблокировано действие: Применить знания', 'info');
  }
  
  return newState;
};

// Функция для отладки статуса разблокировок
export const debugUnlockStatus = (state: GameState): { unlocked: string[], locked: string[], steps: string[] } => {
  const unlocked: string[] = [];
  const locked: string[] = [];
  const steps: string[] = [];
  
  // Проверяем разблокировки ресурсов
  steps.push("Проверка ресурсов:");
  Object.entries(state.resources).forEach(([key, resource]) => {
    if (resource.unlocked) {
      unlocked.push(`Ресурс: ${resource.name}`);
      steps.push(`✅ Ресурс ${resource.name} разблокирован`);
    } else {
      locked.push(`Ресурс: ${resource.name}`);
      steps.push(`❌ Ресурс ${resource.name} заблокирован`);
    }
  });
  
  // Проверяем разблокировки зданий
  steps.push("Проверка зданий:");
  Object.entries(state.buildings).forEach(([key, building]) => {
    if (building.unlocked) {
      unlocked.push(`Здание: ${building.name}`);
      steps.push(`✅ Здание ${building.name} разблокировано`);
    } else {
      locked.push(`Здание: ${building.name}`);
      steps.push(`❌ Здание ${building.name} заблокировано`);
    }
  });
  
  // Проверяем разблокировки исследований
  steps.push("Проверка исследований:");
  Object.entries(state.upgrades).forEach(([key, upgrade]) => {
    if (upgrade.unlocked) {
      unlocked.push(`Исследование: ${upgrade.name}`);
      steps.push(`✅ Исследование ${upgrade.name} разблокировано`);
      
      if (upgrade.purchased) {
        steps.push(`   • Исследование ${upgrade.name} приобретено`);
      } else {
        steps.push(`   • Исследование ${upgrade.name} доступно для покупки`);
      }
    } else {
      locked.push(`Исследование: ${upgrade.name}`);
      steps.push(`❌ Исследование ${upgrade.name} заблокировано`);
    }
  });
  
  // Проверяем общие разблокировки
  steps.push("Проверка общих разблокировок:");
  Object.entries(state.unlocks).forEach(([key, isUnlocked]) => {
    if (isUnlocked) {
      unlocked.push(`Возможность: ${key}`);
      steps.push(`✅ Возможность ${key} разблокирована`);
    } else {
      locked.push(`Возможность: ${key}`);
      steps.push(`❌ Возможность ${key} заблокирована`);
    }
  });
  
  // Проверяем счетчики
  steps.push("Значения счетчиков:");
  Object.entries(state.counters).forEach(([key, counter]) => {
    const value = typeof counter === 'object' ? counter.value : counter;
    steps.push(`   • Счетчик ${key}: ${value}`);
  });
  
  return { unlocked, locked, steps };
};

// Вспомогательные функции для безопасного получения значений счетчиков
const getApplyKnowledgeCount = (state: GameState): number => {
  const counter = state.counters.applyKnowledge;
  if (!counter) return 0;
  return typeof counter === 'object' ? counter.value : counter;
};

const getKnowledgeClickCount = (state: GameState): number => {
  const counter = state.counters.knowledgeClicks;
  if (!counter) return 0;
  return typeof counter === 'object' ? counter.value : counter;
};
