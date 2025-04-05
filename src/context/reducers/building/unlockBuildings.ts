
import { GameState, Building } from '@/types/game';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

export function processUnlockBuildings(state: GameState): GameState {
  // Копируем текущее состояние зданий
  const updatedBuildings = { ...state.buildings };
  
  // Здание "Практика" разблокируется после 2 раз использования "Применить знания"
  if (state.counters.applyKnowledge && state.counters.applyKnowledge.value >= 2) {
    if (updatedBuildings.practice && !updatedBuildings.practice.unlocked) {
      updatedBuildings.practice = {
        ...updatedBuildings.practice,
        unlocked: true
      };
      
      safeDispatchGameEvent("Разблокировано новое здание: Практика!", "success");
    }
  }
  
  // Здание "Генератор" разблокируется после накопления 11+ USDT
  if (state.resources.usdt && state.resources.usdt.unlocked && state.resources.usdt.value >= 11) {
    if (updatedBuildings.generator && !updatedBuildings.generator.unlocked) {
      updatedBuildings.generator = {
        ...updatedBuildings.generator,
        unlocked: true
      };
      
      safeDispatchGameEvent("Разблокировано новое здание: Генератор!", "success");
    }
  }
  
  // Здание "Криптокошелек" разблокируется после исследования "Основы блокчейна"
  if (state.upgrades.blockchainBasics && state.upgrades.blockchainBasics.purchased) {
    if (updatedBuildings.cryptoWallet && !updatedBuildings.cryptoWallet.unlocked) {
      updatedBuildings.cryptoWallet = {
        ...updatedBuildings.cryptoWallet,
        unlocked: true
      };
      
      safeDispatchGameEvent("Разблокировано новое здание: Криптокошелек!", "success");
    }
  }
  
  // Здание "Домашний компьютер" разблокируется после достижения 50 единиц электричества
  if (state.resources.electricity && state.resources.electricity.value >= 50) {
    if (updatedBuildings.homeComputer && !updatedBuildings.homeComputer.unlocked) {
      updatedBuildings.homeComputer = {
        ...updatedBuildings.homeComputer,
        unlocked: true
      };
      
      safeDispatchGameEvent("Разблокировано новое здание: Домашний компьютер!", "success");
    }
  }
  
  // Здание "Интернет-канал" разблокируется после покупки домашнего компьютера
  if (updatedBuildings.homeComputer && updatedBuildings.homeComputer.count > 0) {
    if (updatedBuildings.internetConnection && !updatedBuildings.internetConnection.unlocked) {
      updatedBuildings.internetConnection = {
        ...updatedBuildings.internetConnection,
        unlocked: true
      };
      
      safeDispatchGameEvent("Разблокировано новое здание: Интернет-канал!", "success");
    }
  }
  
  // Здание "Майнер" разблокируется после исследования "Основы криптовалют"
  if (state.upgrades.cryptoBasics && state.upgrades.cryptoBasics.purchased) {
    if (updatedBuildings.miner && !updatedBuildings.miner.unlocked) {
      updatedBuildings.miner = {
        ...updatedBuildings.miner,
        unlocked: true
      };
      
      safeDispatchGameEvent("Разблокировано новое здание: Майнер!", "success");
    }
  }
  
  return {
    ...state,
    buildings: updatedBuildings
  };
}
