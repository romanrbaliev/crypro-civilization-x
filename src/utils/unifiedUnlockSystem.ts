
import { GameState, Building } from '@/context/types';

// Проверка всех разблокировок в игре
export function checkAllUnlocks(state: GameState): GameState {
  return new UnlockManager(state).updateGameState(state);
}

// Принудительная проверка всех разблокировок
export function forceCheckAllUnlocks(state: GameState): GameState {
  return new UnlockManager(state).forceCheckAllUnlocks();
}

// Проверка разблокировки элемента
export function isUnlocked(state: GameState, id: string): boolean {
  return new UnlockManager(state).isUnlocked(id);
}

// Основной класс менеджера разблокировок
export class UnlockManager {
  private state: GameState;
  
  constructor(state: GameState) {
    this.state = { ...state };
  }
  
  // Проверяет разблокирован ли элемент
  isUnlocked(id: string): boolean {
    // Если id не указан, считаем что элемент заблокирован
    if (!id) return false;
    
    // Проверяем разблокировку в state.unlocks
    if (this.state.unlocks && this.state.unlocks[id] === true) {
      return true;
    }
    
    // Проверяем разблокировку в state.buildingUnlocked
    if (this.state.buildingUnlocked && this.state.buildingUnlocked[id] === true) {
      return true;
    }
    
    // Проверяем разблокировку в state.resources
    if (this.state.resources && this.state.resources[id]?.unlocked === true) {
      return true;
    }
    
    // Проверяем разблокировку в state.buildings
    if (this.state.buildings && this.state.buildings[id]?.unlocked === true) {
      return true;
    }
    
    // Проверяем разблокировку в state.upgrades
    if (this.state.upgrades && this.state.upgrades[id]?.unlocked === true) {
      return true;
    }
    
    return false;
  }
  
  // Обновляет состояние игры на основе проверок разблокировок
  updateGameState(state: GameState): GameState {
    this.state = { ...state };
    
    // Проверяем и обновляем разблокировки
    this.checkResourceUnlocks();
    this.checkBuildingUnlocks();
    this.checkUpgradeUnlocks();
    this.checkSpecialUnlocks();
    
    return this.state;
  }
  
  // Принудительно проверяет все разблокировки
  forceCheckAllUnlocks(): GameState {
    // Более тщательная проверка разблокировок
    this.checkResourceUnlocks();
    this.checkBuildingUnlocks();
    this.checkUpgradeUnlocks();
    this.checkSpecialUnlocks();
    this.checkAdvancedUnlocks();
    
    // Проверяем cost у всех зданий
    this.state = ensureBuildingsCostProperty(this.state);
    
    return this.state;
  }
  
  // Проверяет и обновляет разблокировки ресурсов
  private checkResourceUnlocks(): void {
    const { resources, counters, unlocks } = this.state;
    
    // USDT разблокируется после 2+ применений знаний
    if (resources.usdt && counters.applyKnowledge) {
      const shouldUnlock = counters.applyKnowledge.value >= 2;
      resources.usdt.unlocked = shouldUnlock;
      if (unlocks) unlocks.usdt = shouldUnlock;
    }
    
    // Электричество разблокируется после покупки генератора
    if (resources.electricity && this.state.buildings.generator) {
      const shouldUnlock = this.state.buildings.generator.count > 0;
      resources.electricity.unlocked = shouldUnlock;
      if (unlocks) unlocks.electricity = shouldUnlock;
    }
    
    // Вычислительная мощность разблокируется после покупки компьютера
    if (resources.computingPower && this.state.buildings.homeComputer) {
      const shouldUnlock = this.state.buildings.homeComputer.count > 0;
      resources.computingPower.unlocked = shouldUnlock;
      if (unlocks) unlocks.computingPower = shouldUnlock;
    }
    
    // Bitcoin разблокируется после приобретения майнера
    if (resources.bitcoin && this.state.buildings.miner) {
      const shouldUnlock = this.state.buildings.miner.count > 0;
      resources.bitcoin.unlocked = shouldUnlock;
      if (unlocks) unlocks.bitcoin = shouldUnlock;
    }
  }
  
  // Проверяет и обновляет разблокировки зданий
  private checkBuildingUnlocks(): void {
    const { buildings, counters, resources, unlocks } = this.state;
    
    // Практика разблокируется после 2+ применений знаний
    if (buildings.practice && counters.applyKnowledge) {
      const shouldUnlock = counters.applyKnowledge.value >= 2;
      buildings.practice.unlocked = shouldUnlock;
      if (unlocks) unlocks.practice = shouldUnlock;
    }
    
    // Генератор разблокируется после накопления 11+ USDT
    if (buildings.generator && resources.usdt) {
      const shouldUnlock = resources.usdt.value >= 11;
      buildings.generator.unlocked = shouldUnlock;
      if (unlocks) unlocks.generator = shouldUnlock;
    }
    
    // Домашний компьютер разблокируется после покупки генератора
    if (buildings.homeComputer && buildings.generator) {
      const shouldUnlock = buildings.generator.count > 0;
      buildings.homeComputer.unlocked = shouldUnlock;
      if (unlocks) unlocks.homeComputer = shouldUnlock;
    }
    
    // Криптокошелек разблокируется после исследования "Основы блокчейна"
    if (buildings.cryptoWallet && this.state.upgrades.blockchainBasics) {
      const shouldUnlock = this.state.upgrades.blockchainBasics.purchased;
      buildings.cryptoWallet.unlocked = shouldUnlock;
      if (unlocks) unlocks.cryptoWallet = shouldUnlock;
    }
    
    // Интернет-канал разблокируется после покупки домашнего компьютера
    if (buildings.internetChannel && buildings.homeComputer) {
      const shouldUnlock = buildings.homeComputer.count > 0;
      buildings.internetChannel.unlocked = shouldUnlock;
      if (unlocks) unlocks.internetChannel = shouldUnlock;
    }
    
    // Майнер разблокируется после исследования "Основы криптовалют"
    if (buildings.miner && 
        (this.state.upgrades.cryptoBasics?.purchased || 
         this.state.upgrades.cryptoCurrencyBasics?.purchased)) {
      buildings.miner.unlocked = true;
      if (unlocks) unlocks.miner = true;
    }
    
    // Криптобиблиотека разблокируется после исследования "Основы криптовалют"
    if (buildings.cryptoLibrary && 
        (this.state.upgrades.cryptoBasics?.purchased || 
         this.state.upgrades.cryptoCurrencyBasics?.purchased)) {
      buildings.cryptoLibrary.unlocked = true;
      if (unlocks) unlocks.cryptoLibrary = true;
    }
    
    // Система охлаждения разблокируется после 2+ уровней домашнего компьютера
    if (buildings.coolingSystem && buildings.homeComputer) {
      const computerCount = buildings.homeComputer.count;
      const shouldUnlock = computerCount >= 2;
      buildings.coolingSystem.unlocked = shouldUnlock;
      if (unlocks) unlocks.coolingSystem = shouldUnlock;
    }
    
    // Улучшенный кошелек разблокируется после 5+ уровней криптокошелька
    if ((buildings.improvedWallet || buildings.enhancedWallet) && buildings.cryptoWallet) {
      const shouldUnlock = buildings.cryptoWallet.count >= 5;
      
      if (buildings.improvedWallet) {
        buildings.improvedWallet.unlocked = shouldUnlock;
        if (unlocks) unlocks.improvedWallet = shouldUnlock;
      }
      
      if (buildings.enhancedWallet) {
        buildings.enhancedWallet.unlocked = shouldUnlock;
        if (unlocks) unlocks.enhancedWallet = shouldUnlock;
      }
    }
  }
  
  // Проверяет и обновляет разблокировки улучшений
  private checkUpgradeUnlocks(): void {
    const { upgrades, buildings, resources, unlocks } = this.state;
    
    // Разблокировка исследований после покупки генератора
    const hasGenerator = buildings.generator && buildings.generator.count > 0;
    if (unlocks) unlocks.research = hasGenerator;
    
    // Основы блокчейна после покупки генератора
    if (upgrades.blockchainBasics) {
      upgrades.blockchainBasics.unlocked = hasGenerator;
    }
    
    // Безопасность криптокошельков после покупки криптокошелька
    if (upgrades.walletSecurity && buildings.cryptoWallet) {
      upgrades.walletSecurity.unlocked = buildings.cryptoWallet.count > 0;
    }
    
    // Основы криптовалют после достижения 2 уровня криптокошелька
    if (upgrades.cryptoBasics && buildings.cryptoWallet) {
      upgrades.cryptoBasics.unlocked = buildings.cryptoWallet.count >= 2;
    }
    
    // Оптимизация алгоритмов после покупки майнера
    if (upgrades.algorithmOptimization && buildings.miner) {
      upgrades.algorithmOptimization.unlocked = buildings.miner.count > 0;
    }
    
    // Proof of Work после оптимизации алгоритмов
    if (upgrades.proofOfWork && upgrades.algorithmOptimization) {
      upgrades.proofOfWork.unlocked = upgrades.algorithmOptimization.purchased;
    }
    
    // Энергоэффективные компоненты после системы охлаждения
    if (upgrades.energyEfficientComponents && buildings.coolingSystem) {
      upgrades.energyEfficientComponents.unlocked = buildings.coolingSystem.count > 0;
    }
    
    // Криптовалютный трейдинг после 5+ уровня криптокошелька
    if (upgrades.cryptoTrading && buildings.cryptoWallet) {
      upgrades.cryptoTrading.unlocked = buildings.cryptoWallet.count >= 5;
    }
    
    // Торговый бот после криптовалютного трейдинга
    if (upgrades.tradingBot && upgrades.cryptoTrading) {
      upgrades.tradingBot.unlocked = upgrades.cryptoTrading.purchased;
    }
  }
  
  // Проверяет и обновляет специальные разблокировки
  private checkSpecialUnlocks(): void {
    // Здесь могут быть дополнительные проверки
  }
  
  // Проверяет и обновляет продвинутые разблокировки
  private checkAdvancedUnlocks(): void {
    // Здесь могут быть дополнительные проверки для более поздних этапов игры
  }
}

// Вспомогательная функция для проверки и добавления свойства cost для всех зданий
export function ensureBuildingsCostProperty(state: GameState): GameState {
  const newState = { ...state };
  
  // Проходим по всем зданиям
  Object.values(newState.buildings).forEach((building: Building) => {
    // Если у здания нет свойства cost, но есть baseCost, копируем из baseCost
    if (!building.cost && (building as any).baseCost) {
      building.cost = { ...(building as any).baseCost };
    }
    
    // Если нет ни cost, ни baseCost, создаем пустой объект cost
    if (!building.cost) {
      building.cost = {};
    }
  });
  
  return newState;
}
