
import { GameState } from '../types';

// Экспортируем функцию для других модулей
export const updateResourceMaxValues = (state: GameState): GameState => {
  // Создаем новый объект ресурсов для обновления
  const updatedResources = { ...state.resources };
  
  // Обновляем максимальное значение для ресурса "знания"
  if (updatedResources.knowledge) {
    let knowledgeMax = 100; // Базовое значение
    
    // Бонусы от зданий (абсолютные значения)
    if (state.buildings.cryptoLibrary) {
      knowledgeMax += state.buildings.cryptoLibrary.count * 100;
    }
    
    // Бонусы от улучшений (относительные значения)
    // Проверяем "Основы блокчейна" (+50% к макс. хранению знаний)
    if (state.upgrades.blockchainBasics?.purchased || 
        state.upgrades.basicBlockchain?.purchased || 
        state.upgrades.blockchain_basics?.purchased) {
      knowledgeMax *= 1.5;
    }
    
    // Применяем новое максимальное значение
    updatedResources.knowledge = {
      ...updatedResources.knowledge,
      max: knowledgeMax
    };
  }
  
  // Обновляем максимальное значение для USDT
  if (updatedResources.usdt) {
    let usdtMax = 50; // Базовое значение
    
    // Бонусы от зданий (абсолютные значения)
    // Криптокошелек (+50 за уровень)
    if (state.buildings.cryptoWallet) {
      usdtMax += state.buildings.cryptoWallet.count * 50;
    }
    
    // Улучшенный кошелек (+150 за уровень)
    if (state.buildings.enhancedWallet) {
      usdtMax += state.buildings.enhancedWallet.count * 150;
    }
    
    // Альтернативное название улучшенного кошелька
    if (state.buildings.improvedWallet) {
      usdtMax += state.buildings.improvedWallet.count * 150;
    }
    
    // Бонусы от улучшений (относительные значения)
    // Безопасность криптокошельков (+25% к макс. хранению USDT)
    if (state.upgrades.cryptoWalletSecurity?.purchased || 
        state.upgrades.walletSecurity?.purchased) {
      usdtMax *= 1.25;
    }
    
    // Применяем новое максимальное значение
    updatedResources.usdt = {
      ...updatedResources.usdt,
      max: usdtMax
    };
  }
  
  // Обновляем максимальное значение для Bitcoin
  if (updatedResources.bitcoin) {
    let bitcoinMax = 0.01; // Базовое значение
    
    // Улучшенный кошелек (+1 за уровень)
    if (state.buildings.enhancedWallet) {
      bitcoinMax += state.buildings.enhancedWallet.count * 1;
    }
    
    // Альтернативное название улучшенного кошелька
    if (state.buildings.improvedWallet) {
      bitcoinMax += state.buildings.improvedWallet.count * 1;
    }
    
    // Применяем новое максимальное значение
    updatedResources.bitcoin = {
      ...updatedResources.bitcoin,
      max: bitcoinMax
    };
  }
  
  // Обновляем максимальное значение для электричества
  if (updatedResources.electricity) {
    let electricityMax = 100; // Базовое значение
    
    // Генератор (+50 за уровень)
    if (state.buildings.generator) {
      electricityMax += state.buildings.generator.count * 50;
    }
    
    // Применяем новое максимальное значение
    updatedResources.electricity = {
      ...updatedResources.electricity,
      max: electricityMax
    };
  }
  
  // Обновляем максимальное значение для вычислительной мощности
  if (updatedResources.computingPower) {
    let computingPowerMax = 100; // Базовое значение
    
    // Домашний компьютер (+50 за уровень)
    if (state.buildings.homeComputer) {
      computingPowerMax += state.buildings.homeComputer.count * 50;
    }
    
    // Применяем новое максимальное значение
    updatedResources.computingPower = {
      ...updatedResources.computingPower,
      max: computingPowerMax
    };
  }
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    resources: updatedResources
  };
};

// Проверяет разблокировки на основе текущего состояния
export const checkUnlocks = (state: GameState): GameState => {
  // Используем утилиту из unlockManager
  const { checkAllUnlocks } = require('../../utils/unlockSystem');
  return checkAllUnlocks(state);
};

// Добавляем функцию проверки достаточности ресурсов
export const hasEnoughResources = (
  state: GameState,
  costs: { [resourceId: string]: number }
): boolean => {
  // Проверяем каждый ресурс из требуемых затрат
  for (const [resourceId, amount] of Object.entries(costs)) {
    // Проверяем существование ресурса и достаточность его количества
    if (!state.resources[resourceId] || state.resources[resourceId].value < amount) {
      return false;
    }
  }
  
  // Если все проверки пройдены, ресурсов достаточно
  return true;
};
