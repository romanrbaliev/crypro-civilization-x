
import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

// Основная функция для проверки всех разблокировок
export const checkAllUnlocks = (state: GameState): GameState => {
  let newState = JSON.parse(JSON.stringify(state));
  
  // Последовательно проверяем все типы разблокировок
  newState = checkResourceUnlocks(newState);
  newState = checkBuildingUnlocks(newState);
  newState = checkUpgradeUnlocks(newState);
  newState = checkActionUnlocks(newState);
  newState = checkSpecialUnlocks(newState);
  
  return newState;
};

// Проверяет разблокировки ресурсов
export const checkResourceUnlocks = (state: GameState): GameState => {
  const newState = { ...state };
  
  // Проверяем разблокировку USDT
  if (getCounterValue(state, 'applyKnowledge') >= 1 && !state.unlocks.usdt) {
    newState.unlocks.usdt = true;
    
    if (newState.resources.usdt) {
      newState.resources.usdt.unlocked = true;
    }
    
    safeDispatchGameEvent('Разблокирован ресурс: USDT', 'info');
  }
  
  // Проверяем разблокировку Электричества
  if (state.buildings.generator && state.buildings.generator.count > 0 && !state.unlocks.electricity) {
    newState.unlocks.electricity = true;
    
    if (newState.resources.electricity) {
      newState.resources.electricity.unlocked = true;
    }
    
    safeDispatchGameEvent('Разблокирован ресурс: Электричество', 'info');
  }
  
  // Проверяем разблокировку Вычислительной мощности
  if (state.buildings.homeComputer && state.buildings.homeComputer.count > 0 && !state.unlocks.computingPower) {
    newState.unlocks.computingPower = true;
    
    if (newState.resources.computingPower) {
      newState.resources.computingPower.unlocked = true;
    }
    
    safeDispatchGameEvent('Разблокирован ресурс: Вычислительная мощность', 'info');
  }
  
  // Проверяем разблокировку Bitcoin
  if ((state.upgrades.cryptoCurrencyBasics && state.upgrades.cryptoCurrencyBasics.purchased) && !state.unlocks.bitcoin) {
    newState.unlocks.bitcoin = true;
    
    if (newState.resources.bitcoin) {
      newState.resources.bitcoin.unlocked = true;
    }
    
    safeDispatchGameEvent('Разблокирован ресурс: Bitcoin', 'info');
  }
  
  return newState;
};

// Проверяет разблокировки зданий
export const checkBuildingUnlocks = (state: GameState): GameState => {
  const newState = { ...state };
  
  // Проверяем разблокировку Практики
  if (getCounterValue(state, 'applyKnowledge') >= 2 && state.buildings.practice && !state.buildings.practice.unlocked) {
    newState.buildings.practice.unlocked = true;
    newState.unlocks.practice = true;
    safeDispatchGameEvent('Разблокировано здание: Практика', 'info');
  }
  
  // Проверяем разблокировку Генератора
  if (state.resources.usdt && 
      state.resources.usdt.value >= 11 && 
      state.resources.usdt.unlocked && 
      state.buildings.generator && 
      !state.buildings.generator.unlocked) {
    newState.buildings.generator.unlocked = true;
    newState.unlocks.generator = true;
    safeDispatchGameEvent('Разблокировано здание: Генератор', 'info');
  }
  
  // Проверяем разблокировку Домашнего компьютера
  if (state.resources.electricity && 
      state.resources.electricity.value >= 50 && 
      state.resources.electricity.unlocked && 
      state.buildings.homeComputer && 
      !state.buildings.homeComputer.unlocked) {
    newState.buildings.homeComputer.unlocked = true;
    newState.unlocks.homeComputer = true;
    safeDispatchGameEvent('Разблокировано здание: Домашний компьютер', 'info');
  }
  
  // Проверяем разблокировку Криптокошелька
  if (state.upgrades.blockchainBasics && 
      state.upgrades.blockchainBasics.purchased && 
      state.buildings.cryptoWallet && 
      !state.buildings.cryptoWallet.unlocked) {
    newState.buildings.cryptoWallet.unlocked = true;
    newState.unlocks.cryptoWallet = true;
    safeDispatchGameEvent('Разблокировано здание: Криптокошелек', 'info');
  }
  
  return newState;
};

// Проверяет разблокировки улучшений/исследований
export const checkUpgradeUnlocks = (state: GameState): GameState => {
  const newState = { ...state };
  
  // Проверяем разблокировку вкладки исследований
  if (state.buildings.generator && 
      state.buildings.generator.count > 0 && 
      !state.unlocks.research) {
    newState.unlocks.research = true;
    safeDispatchGameEvent('Разблокирована вкладка: Исследования', 'info');
  }
  
  // Проверяем разблокировку исследования "Основы блокчейна"
  if (state.buildings.generator && 
      state.buildings.generator.count > 0 && 
      state.upgrades.blockchainBasics && 
      !state.upgrades.blockchainBasics.unlocked) {
    newState.upgrades.blockchainBasics.unlocked = true;
    safeDispatchGameEvent('Разблокировано исследование: Основы блокчейна', 'info');
  }
  
  // Проверяем разблокировку исследования "Безопасность криптокошельков"
  if (state.buildings.cryptoWallet && 
      state.buildings.cryptoWallet.count > 0 && 
      state.upgrades.walletSecurity && 
      !state.upgrades.walletSecurity.unlocked) {
    newState.upgrades.walletSecurity.unlocked = true;
    safeDispatchGameEvent('Разблокировано исследование: Безопасность криптокошельков', 'info');
  }
  
  // Проверяем разблокировку исследования "Основы криптовалют"
  if (state.buildings.cryptoWallet && 
      state.buildings.cryptoWallet.count >= 2 && 
      state.upgrades.cryptoCurrencyBasics && 
      !state.upgrades.cryptoCurrencyBasics.unlocked) {
    newState.upgrades.cryptoCurrencyBasics.unlocked = true;
    safeDispatchGameEvent('Разблокировано исследование: Основы криптовалют', 'info');
  }
  
  return newState;
};

// Проверяет разблокировки действий
export const checkActionUnlocks = (state: GameState): GameState => {
  const newState = { ...state };
  
  // Проверяем разблокировку кнопки "Применить знания"
  if (getCounterValue(state, 'knowledgeClicks') >= 3 && !state.unlocks.applyKnowledge) {
    newState.unlocks.applyKnowledge = true;
    safeDispatchGameEvent('Разблокировано действие: Применить знания', 'info');
  }
  
  // Проверяем разблокировку обмена Bitcoin
  if (state.resources.bitcoin && 
      state.resources.bitcoin.unlocked && 
      !state.unlocks.bitcoinExchange) {
    newState.unlocks.bitcoinExchange = true;
  }
  
  return newState;
};

// Проверяет специальные разблокировки (для обратной совместимости)
export const checkSpecialUnlocks = (state: GameState): GameState => {
  const newState = { ...state };
  
  // Проверяем разблокировку вкладки Equipment
  const hasUnlockedBuildings = Object.values(state.buildings).some(b => b.unlocked);
  if (hasUnlockedBuildings && !state.unlocks.equipmentTab) {
    newState.unlocks.equipmentTab = true;
  }
  
  // Проверяем разблокировку вкладки Research
  if (state.unlocks.research && !state.unlocks.researchTab) {
    newState.unlocks.researchTab = true;
  }
  
  // Дополнительные специфические разблокировки могут быть добавлены здесь
  
  return newState;
};

// Полное обновление всех разблокировок с нуля
export const rebuildAllUnlocks = (state: GameState): GameState => {
  // Сбрасываем все разблокировки
  let newState = { ...state };
  
  // Пересоздаем состояние разблокировок
  newState = checkAllUnlocks(newState);
  
  return newState;
};

// Вспомогательная функция для безопасного получения значения счетчика
const getCounterValue = (state: GameState, counterId: string): number => {
  const counter = state.counters[counterId];
  if (!counter) return 0;
  
  return typeof counter === 'object' ? counter.value : counter;
};
