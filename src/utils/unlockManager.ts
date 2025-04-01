// Импортируем необходимые функции и типы
import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

// Функция для отладки статуса разблокировок
export function debugUnlockStatus(state: GameState) {
  let log: string[] = [];
  
  // Общая информация
  log.push(`Текущая фаза: ${state.phase}`);
  log.push(`USDT разблокирован: ${state.resources.usdt?.unlocked ? '✅' : '❌'}`);
  log.push(`Знания: ${state.resources.knowledge?.value.toFixed(2)}/${state.resources.knowledge?.max}`);
  log.push(`Применено знаний: ${state.counters.applyKnowledge?.value || 0} раз`);
  
  // Проверка условий разблокировки USDT
  const usdtUnlocked = state.resources.usdt?.unlocked === true;
  const applyKnowledgeCount = state.counters.applyKnowledge?.value || 0;
  const usdtUnlockConditionMet = applyKnowledgeCount >= 1;
  
  log.push(`Условие разблокировки USDT выполнено: ${usdtUnlockConditionMet ? '✅' : '❌'}`);
  
  // Здания
  log.push(`--- Здания ---`);
  for (const buildingId in state.buildings) {
    const building = state.buildings[buildingId];
    log.push(`${building.name} (${buildingId}): разблокирован=${building.unlocked ? '✅' : '❌'}, количество=${building.count}`);
  }
  
  // Исследования
  log.push(`--- Исследования ---`);
  for (const upgradeId in state.upgrades) {
    const upgrade = state.upgrades[upgradeId];
    log.push(`${upgrade.name} (${upgradeId}): разблокирован=${upgrade.unlocked ? '✅' : '❌'}, куплен=${upgrade.purchased ? '✅' : '❌'}`);
  }
  
  // Ресурсы
  log.push(`--- Ресурсы ---`);
  for (const resourceId in state.resources) {
    const resource = state.resources[resourceId];
    log.push(`${resource.name} (${resourceId}): разблокирован=${resource.unlocked ? '✅' : '❌'}, значение=${resource.value.toFixed(2)}`);
  }
  
  // Вывод в консоль
  console.log('--- Отладка разблокировок ---');
  log.forEach(line => console.log(line));
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

// Проверяет специальные разблокировки, зависящие от счетчиков и других условий
export const checkSpecialUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Проверяем, разблокирован ли USDT
  if (!newState.resources.usdt?.unlocked && newState.counters.applyKnowledge?.value >= 1) {
    console.log('unlockManager: Разблокирован USDT (1+ применений знаний)');
    newState.resources.usdt.unlocked = true;
    newState.unlocks.usdt = true;
    safeDispatchGameEvent('Разблокирован ресурс: USDT', 'success');
  }
  
  // Проверяем, разблокирована ли практика
  if (!newState.buildings.practice?.unlocked && newState.counters.applyKnowledge?.value >= 2) {
    console.log('unlockManager: Разблокирована практика (2+ применений знаний)');
    newState.buildings.practice.unlocked = true;
    newState.unlocks.practice = true;
    safeDispatchGameEvent('Разблокировано: Практика', 'success');
  }
  
  // Проверяем, разблокирована ли вкладка исследований (после 5 применений знаний)
  if (!newState.unlocks.research && newState.counters.applyKnowledge?.value >= 5) {
    console.log('unlockManager: Разблокирована вкладка исследований (5+ применений знаний)');
    newState.unlocks.research = true;
    safeDispatchGameEvent('Разблокировано: Исследования', 'success');
  }
  
  // Проверяем, нужно ли активировать фазу 2
  if (!newState.unlocks.phase2 && (newState.resources.usdt?.value >= 25 || newState.resources.electricity?.unlocked)) {
    console.log('unlockManager: Активирована фаза 2 (25+ USDT или разблокировано электричество)');
    newState.unlocks.phase2 = true;
    safeDispatchGameEvent('Открыта фаза 2: Основы криптоэкономики', 'success');
  }
  
  return newState;
};

// Проверяет разблокировки ресурсов на основе требований
export const checkResourceUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Пример: Разблокировка электричества при наличии генератора
  if (!newState.resources.electricity?.unlocked && newState.buildings.generator?.count > 0) {
    console.log('unlockManager: Разблокировано электричество (есть генератор)');
    newState.resources.electricity.unlocked = true;
    newState.unlocks.electricity = true;
    safeDispatchGameEvent('Разблокирован ресурс: Электричество', 'success');
  }
  
  return newState;
};

// Проверяет разблокировки зданий на основе требований
export const checkBuildingUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
   // Разблокировка криптокошелька, если изучены основы блокчейна
  if (!newState.buildings.cryptoWallet?.unlocked &&
      (state.upgrades.blockchainBasics?.purchased ||
       state.upgrades.basicBlockchain?.purchased ||
       state.upgrades.blockchain_basics?.purchased)) {
    console.log('unlockManager: Разблокирован криптокошелек (изучены основы блокчейна)');
    newState.buildings.cryptoWallet.unlocked = true;
    newState.unlocks.cryptoWallet = true;
    safeDispatchGameEvent('Разблокировано: Криптокошелек', 'success');
  }
  
  return newState;
};

// Проверяет разблокировки исследований на основе требований
export const checkUpgradeUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Пример: Разблокировка улучшения "Более эффективные майнеры" при наличии 5 майнеров
  if (!newState.upgrades.betterMiners?.unlocked && newState.buildings.miner?.count >= 5) {
    console.log('unlockManager: Разблокировано улучшение "Более эффективные майнеры" (5+ майнеров)');
    newState.upgrades.betterMiners.unlocked = true;
  }
  
  return newState;
};

// Проверяет разблокировки действий на основе требований
export const checkActionUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Пример: Разблокировка действия "Майнить" при наличии 100 вычислительной мощности
  if (!newState.unlocks.mining && state.miningPower >= 100) {
    console.log('unlockManager: Разблокировано действие "Майнить" (100+ вычислительной мощности)');
    newState.unlocks.mining = true;
    safeDispatchGameEvent('Разблокировано действие: Майнинг', 'success');
  }
  
  return newState;
};
