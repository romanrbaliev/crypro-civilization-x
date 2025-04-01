import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

// Вспомогательная функция для получения значения счетчика
const getCounterValue = (state: GameState, counterId: string): number => {
  const counter = state.counters[counterId];
  if (!counter) return 0;
  
  if (typeof counter === 'object' && 'value' in counter) {
    return counter.value;
  }
  
  return typeof counter === 'number' ? counter : 0;
};

// Функция для отладки статуса разблокировок
export function debugUnlockStatus(state: GameState) {
  let log: string[] = [];
  let unlocked: string[] = [];
  let locked: string[] = [];
  
  // Общая информация
  log.push(`Текущая фаза: ${state.phase}`);
  log.push(`USDT разблокирован: ${state.resources.usdt?.unlocked ? '✅' : '❌'}`);
  log.push(`Знания: ${state.resources.knowledge?.value.toFixed(2)}/${state.resources.knowledge?.max}`);
  log.push(`Применено знаний: ${getCounterValue(state, 'applyKnowledge')} раз`);
  
  // Проверка условий разблокировки USDT
  const usdtUnlocked = state.resources.usdt?.unlocked === true;
  const applyKnowledgeCount = getCounterValue(state, 'applyKnowledge');
  const usdtUnlockConditionMet = applyKnowledgeCount >= 1;
  
  log.push(`Условие разблокировки USDT выполнено: ${usdtUnlockConditionMet ? '✅' : '❌'}`);
  
  // Здания
  log.push(`--- Здания ---`);
  for (const buildingId in state.buildings) {
    const building = state.buildings[buildingId];
    log.push(`${building.name} (${buildingId}): разблокирован=${building.unlocked ? '✅' : '❌'}, количество=${building.count}`);
    
    if (building.unlocked) {
      unlocked.push(`Здание: ${building.name}`);
    } else {
      locked.push(`Здание: ${building.name}`);
    }
  }
  
  // Исследования
  log.push(`--- Исследования ---`);
  for (const upgradeId in state.upgrades) {
    const upgrade = state.upgrades[upgradeId];
    log.push(`${upgrade.name} (${upgradeId}): разблокирован=${upgrade.unlocked ? '✅' : '❌'}, куплен=${upgrade.purchased ? '✅' : '❌'}`);
    
    if (upgrade.unlocked) {
      unlocked.push(`Исследование: ${upgrade.name}`);
    } else {
      locked.push(`Исследование: ${upgrade.name}`);
    }
  }
  
  // Ресурсы
  log.push(`--- Ресурсы ---`);
  for (const resourceId in state.resources) {
    const resource = state.resources[resourceId];
    log.push(`${resource.name} (${resourceId}): разблокирован=${resource.unlocked ? '✅' : '❌'}, значение=${resource.value.toFixed(2)}`);
    
    if (resource.unlocked) {
      unlocked.push(`Ресурс: ${resource.name}`);
    } else {
      locked.push(`Ресурс: ${resource.name}`);
    }
  }
  
  // Вывод в консоль
  console.log('--- Отладка разблокировок ---');
  log.forEach(line => console.log(line));
  
  // Возвращаем структурированные данные
  return {
    unlocked,
    locked,
    steps: log
  };
}

// Проверяет все возможные разблокировки
export const checkAllUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  newState = checkResourceUnlocks(newState);
  newState = checkBuildingUnlocks(newState);
  newState = checkUpgradeUnlocks(newState);
  newState = checkActionUnlocks(newState);
  newState = checkSpecialUnlocks(newState);
  
  return newState;
};

// Добавляем функцию rebuildAllUnlocks
export const rebuildAllUnlocks = (state: GameState): GameState => {
  console.log('Полная перепроверка всех разблокировок');
  // Сброс всех флагов unlocks
  let newState = { ...state };
  
  // Базовая инициализация (знания всегда разблокированы)
  newState.unlocks = {
    knowledge: true
  };
  
  // Проверяем разблокировки шаг за шагом
  newState = checkSpecialUnlocks(newState);
  newState = checkResourceUnlocks(newState);
  newState = checkBuildingUnlocks(newState);
  newState = checkUpgradeUnlocks(newState);
  newState = checkActionUnlocks(newState);
  
  return newState;
};

// Проверяет специальные разблокировки, зависящие от счетчиков и других условий
export const checkSpecialUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Проверяем количество кликов на "Изучить крипту" для разблокировки "Применить знания"
  const knowledgeClicks = getCounterValue(newState, 'knowledgeClicks');
  if (!newState.unlocks.applyKnowledge && knowledgeClicks >= 3) {
    console.log('unlockManager: Разблокирована кнопка "Применить знания" (3+ кликов)');
    newState.unlocks.applyKnowledge = true;
    safeDispatchGameEvent('Разблокировано: Применить знания', 'success');
  }
  
  // Проверяем, разблокирован ли USDT
  const applyKnowledgeCount = getCounterValue(newState, 'applyKnowledge');
  if (!newState.unlocks.usdt && applyKnowledgeCount >= 1) {
    console.log('unlockManager: Разблокирован USDT (1+ применений знаний)');
    
    // Создаем или обновляем ресурс USDT
    if (!newState.resources.usdt) {
      // Если ресурса USDT еще нет, создаем его
      newState.resources.usdt = {
        id: 'usdt',
        name: 'USDT',
        description: 'Стабильная криптовалюта для покупок',
        type: 'resource',
        icon: 'dollar',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 50,
        unlocked: true
      };
    } else {
      // Если ресурс USDT существует, просто разблокируем его
      newState.resources.usdt.unlocked = true;
    }
    
    newState.unlocks.usdt = true;
    safeDispatchGameEvent('Разблокирован ресурс: USDT', 'success');
  }
  
  // Проверяем, разблокирована ли практика
  if (!newState.buildings.practice?.unlocked && applyKnowledgeCount >= 2) {
    console.log('unlockManager: Разблокирована практика (2+ применений знаний)');
    if (newState.buildings.practice) {
      newState.buildings.practice.unlocked = true;
      newState.unlocks.practice = true;
      safeDispatchGameEvent('Разблокировано: Практика', 'success');
    }
  }
  
  // Проверяем, разблокирован ли генератор (11+ USDT)
  if (!newState.buildings.generator?.unlocked && 
      newState.resources.usdt?.unlocked && 
      (newState.resources.usdt?.value || 0) >= 11) {
    console.log('unlockManager: Разблокирован генератор (11+ USDT)');
    if (newState.buildings.generator) {
      newState.buildings.generator.unlocked = true;
      newState.unlocks.generator = true;
      safeDispatchGameEvent('Разблокировано: Генератор', 'success');
      safeDispatchGameEvent('Разблокировано: Исследования', 'success'); // Добавляем уведомление о разблокировке исследований
    }
  }
  
  // Проверяем, разблокированы ли Основы блокчейна и исследования
  if (!newState.upgrades.blockchainBasics?.unlocked && 
      newState.buildings.generator?.count > 0 && 
      newState.buildings.generator?.unlocked) {
    console.log('unlockManager: Разблокированы основы блокчейна (куплен генератор)');
    if (newState.upgrades.blockchainBasics) {
      newState.upgrades.blockchainBasics.unlocked = true;
      newState.unlocks.blockchainBasics = true;
      // Разблокируем исследования вместе с основами блокчейна
      newState.unlocks.research = true;
      safeDispatchGameEvent('Разблокировано: Основы блокчейна', 'success');
      safeDispatchGameEvent('Разблокировано: Исследования', 'success');
    }
  }
  
  // Проверяем, разблокирован ли Домашний компьютер (50+ электричества)
  if (!newState.buildings.homeComputer?.unlocked && 
      newState.resources.electricity?.unlocked && 
      (newState.resources.electricity?.value || 0) >= 50) {
    console.log('unlockManager: Разблокирован домашний компьютер (50+ электричества)');
    if (newState.buildings.homeComputer) {
      newState.buildings.homeComputer.unlocked = true;
      newState.unlocks.homeComputer = true;
      safeDispatchGameEvent('Разблокировано: Домашний компьютер', 'success');
    }
  }
  
  // Проверяем, разблокирован ли Интернет-канал
  if (!newState.buildings.internetChannel?.unlocked && 
      newState.buildings.homeComputer?.count > 0 && 
      newState.buildings.homeComputer?.unlocked) {
    console.log('unlockManager: Разблокирован интернет-канал (куплен домашний компьютер)');
    if (newState.buildings.internetChannel) {
      newState.buildings.internetChannel.unlocked = true;
      newState.unlocks.internetChannel = true;
      safeDispatchGameEvent('Разблокировано: Интернет-канал', 'success');
    }
  }
  
  // Проверяем, нужно ли активировать фазу 2
  if (!newState.unlocks.phase2 && (
      (newState.resources.usdt?.value || 0) >= 25 || 
      newState.resources.electricity?.unlocked)
  ) {
    console.log('unlockManager: Активирована фаза 2 (25+ USDT или разблокировано электричество)');
    newState.unlocks.phase2 = true;
    newState.phase = 2;
    safeDispatchGameEvent('Открыта фаза 2: Основы майнинга', 'success');
  }
  
  return newState;
};

// Остальные функции оставляем без изменений
export const checkResourceUnlocks = (state: GameState): GameState => {
  return state;
};

export const checkBuildingUnlocks = (state: GameState): GameState => {
  return state;
};

export const checkUpgradeUnlocks = (state: GameState): GameState => {
  return state;
};

export const checkActionUnlocks = (state: GameState): GameState => {
  return state;
};
