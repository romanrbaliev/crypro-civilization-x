import { GameState } from '../types';
import { checkAllUnlocks } from '@/utils/unlockManager';
import { calculateCost, canAffordCost, deductResources } from '@/utils/helpers';

// Обработчик для действия "Изучить крипту"
export const processLearnCrypto = (state: GameState): GameState => {
  // Используем копию состояния для модификации
  let updatedState = { ...state };
  
  // Увеличиваем счетчик нажатий на кнопку "Изучить"
  updatedState.counters.knowledgeClicks = {
    id: 'knowledgeClicks',
    value: (updatedState.counters.knowledgeClicks?.value || 0) + 1
  };
  
  // Получаем текущие знания
  const knowledge = updatedState.resources.knowledge;
  
  // Увеличиваем знания на 1
  const updatedKnowledge = {
    ...knowledge,
    value: Math.min(knowledge.value + 1, knowledge.max),
  };
  
  // Обновляем статистику
  const updatedStats = {
    ...state.stats,
    totalKnowledgeGained: (state.stats?.totalKnowledgeGained || 0) + 1,
    totalClicks: (state.stats?.totalClicks || 0) + 1
  };
  
  // Возвращаем обновленное состояние
  updatedState = {
    ...updatedState,
    resources: {
      ...updatedState.resources,
      knowledge: updatedKnowledge,
    },
    stats: updatedStats
  };
  
  // Проверяем разблокировки
  return checkAllUnlocks(updatedState);
};

// Обработчик для применения знаний (обмен знаний на USDT)
export const processApplyKnowledge = (state: GameState): GameState => {
  // Получаем текущие знания и USDT
  const knowledge = state.resources.knowledge;
  const usdt = state.resources.usdt;
  
  // Рассчитываем, сколько знаний обменять
  const exchangeRate = 10; // 10 знаний = 1 USDT базовый курс
  const efficiencyBoost = state.effects?.knowledgeEfficiencyBoost || 0;
  const actualRate = exchangeRate / (1 + efficiencyBoost);
  
  // Сколько знаний можно обменять (кратно actualRate)
  const exchangeableKnowledge = Math.floor(knowledge.value / actualRate) * actualRate;
  
  // Если не хватает знаний для обмена, возвращаем текущее состояние
  if (exchangeableKnowledge < actualRate) {
    return state;
  }
  
  // Рассчитываем, сколько USDT получим
  const usdtGained = Math.floor(exchangeableKnowledge / actualRate);
  
  // Обновляем статистику
  const updatedStats = {
    ...state.stats,
    totalUsdtGained: (state.stats?.totalUsdtGained || 0) + usdtGained
  };
  
  // Инкрементируем счетчик обменов
  let updatedState = { ...state };
  updatedState.counters.applyKnowledge = {
    id: 'applyKnowledge',
    value: (updatedState.counters.applyKnowledge?.value || 0) + 1
  };
  
  // Проверяем, нужно ли разблокировать здание "Практика"
  let shouldUnlockPractice = false;
  if (updatedState.counters.applyKnowledge.value >= 2 && !updatedState.buildings.practice.unlocked) {
    shouldUnlockPractice = true;
  }
  
  // Возвращаем обновленное состояние
  updatedState = {
    ...updatedState,
    resources: {
      ...updatedState.resources,
      knowledge: {
        ...knowledge,
        value: knowledge.value - exchangeableKnowledge
      },
      usdt: {
        ...usdt,
        value: Math.min(usdt.value + usdtGained, usdt.max)
      }
    },
    buildings: {
      ...updatedState.buildings,
      ...(shouldUnlockPractice && {
        practice: {
          ...updatedState.buildings.practice,
          unlocked: true
        }
      })
    },
    stats: updatedStats
  };
  
  return updatedState;
};

// Обработчик для применения всех знаний (обмен всех знаний на USDT)
export const processApplyAllKnowledge = (state: GameState): GameState => {
  // Получаем текущие знания и USDT
  const knowledge = state.resources.knowledge;
  const usdt = state.resources.usdt;
  
  // Рассчитываем, сколько знаний обменять
  const exchangeRate = 10; // 10 знаний = 1 USDT базовый курс
  const efficiencyBoost = state.effects?.knowledgeEfficiencyBoost || 0;
  const actualRate = exchangeRate / (1 + efficiencyBoost);
  
  // Сколько знаний можно обменять (кратно actualRate)
  const exchangeableKnowledge = Math.floor(knowledge.value / actualRate) * actualRate;
  
  // Если не хватает знаний для обмена, возвращаем текущее состояние
  if (exchangeableKnowledge < actualRate) {
    return state;
  }
  
  // Рассчитываем, сколько USDT получим
  const usdtGained = Math.floor(exchangeableKnowledge / actualRate);
  
  // Обновляем статистику
  const updatedStats = {
    ...state.stats,
    totalUsdtGained: (state.stats?.totalUsdtGained || 0) + usdtGained
  };
  
  // Инкрементируем счетчик обменов
  let updatedState = { ...state };
  updatedState.counters.applyKnowledge = {
    id: 'applyKnowledge',
    value: (updatedState.counters.applyKnowledge?.value || 0) + 1
  };
  
  // Проверяем, нужно ли разблокировать здание "Практика"
  let shouldUnlockPractice = false;
  if (updatedState.counters.applyKnowledge.value >= 2 && !updatedState.buildings.practice.unlocked) {
    shouldUnlockPractice = true;
  }
  
  // Возвращаем обновленное состояние
  updatedState = {
    ...updatedState,
    resources: {
      ...updatedState.resources,
      knowledge: {
        ...knowledge,
        value: knowledge.value - exchangeableKnowledge
      },
      usdt: {
        ...usdt,
        value: Math.min(usdt.value + usdtGained, usdt.max)
      }
    },
    buildings: {
      ...updatedState.buildings,
      ...(shouldUnlockPractice && {
        practice: {
          ...updatedState.buildings.practice,
          unlocked: true
        }
      })
    },
    stats: updatedStats
  };
  
  return updatedState;
};

// Обработчик для добычи вычислительной мощности
export const processMiningPower = (state: GameState): GameState => {
  return state; // Заглушка
};

// Обработчик для обмена BTC на USDT
export const processExchangeBitcoin = (state: GameState): GameState => {
  return state; // Заглушка
};

// Обработчик для покупки практики
export const processPracticePurchase = (state: GameState): GameState => {
  return state; // Заглушка
};

// Разблокировка здания
export const processUnlockBuilding = (state: GameState, payload: { buildingId: string }): GameState => {
  const { buildingId } = payload;
  
  return {
    ...state,
    buildings: {
      ...state.buildings,
      [buildingId]: {
        ...state.buildings[buildingId],
        unlocked: true
      }
    }
  };
};

// Исследование апгрейда
export const processResearchUpgrade = (state: GameState, payload: { upgradeId: string }): GameState => {
  const { upgradeId } = payload;
  const upgrade = state.upgrades[upgradeId];
  
  // Проверка наличия исследования и отсутствия его покупки
  if (!upgrade || upgrade.purchased) {
    return state;
  }
  
  // Проверка наличия ресурсов для исследования
  for (const [resourceId, amount] of Object.entries(upgrade.cost)) {
    if (state.resources[resourceId].value < Number(amount)) {
      return state;
    }
  }
  
  // Обновление исследований
  const research = state.research || {};
  
  // Обновляем состояние ресурсов
  const updatedResources = { ...state.resources };
  for (const [resourceId, amount] of Object.entries(upgrade.cost)) {
    updatedResources[resourceId] = {
      ...updatedResources[resourceId],
      value: updatedResources[resourceId].value - Number(amount)
    };
  }
  
  return {
    ...state,
    resources: updatedResources,
    upgrades: {
      ...state.upgrades,
      [upgradeId]: {
        ...upgrade,
        purchased: true
      }
    },
    research: {
      ...research,
      [upgradeId]: {
        researched: true,
        cost: upgrade.cost
      }
    }
  };
};

// Разблокировка исследований
export const processUnlockResearch = (state: GameState): GameState => {
  // Вместо обновления state.unlocks.research мы должны
  // обновить статус разблокировки в каждом апгрейде
  const upgrades = { ...state.upgrades };
  
  // Разблокируем основное исследование
  if (upgrades.blockchainBasics) {
    upgrades.blockchainBasics.unlocked = true;
  }
  
  return {
    ...state,
    upgrades
  };
};

// Разблокировка обмена Bitcoin
export const processUnlockBitcoinExchange = (state: GameState): GameState => {
  return {
    ...state
  };
};

// Добавление ресурсов для отладки
export const processDebugAddResources = (state: GameState, payload: { resources: Record<string, number> }): GameState => {
  const { resources } = payload;
  const updatedResources = { ...state.resources };
  
  for (const [resourceId, amount] of Object.entries(resources)) {
    if (updatedResources[resourceId]) {
      updatedResources[resourceId] = {
        ...updatedResources[resourceId],
        value: Math.min(
          updatedResources[resourceId].value + amount,
          updatedResources[resourceId].max
        )
      };
    }
  }
  
  return {
    ...state,
    resources: updatedResources
  };
};

// Разблокировка здания "Практика"
export const processUnlockBuildingPractice = (state: GameState): GameState => {
  return {
    ...state,
    buildings: {
      ...state.buildings,
      practice: {
        ...state.buildings.practice,
        unlocked: true
      }
    },
    player: {
      ...state.player,
      specialization: state.player?.specialization || null
    }
  };
};

// Разблокировка здания "Генератор"
export const processUnlockBuildingGenerator = (state: GameState): GameState => {
  return {
    ...state,
    buildings: {
      ...state.buildings,
      generator: {
        ...state.buildings.generator,
        unlocked: true
      }
    },
    research: {
      ...state.research,
      basicBlockchain: {
        ...state.research?.basicBlockchain,
        researched: state.research?.basicBlockchain?.researched || false,
        cost: state.research?.basicBlockchain?.cost || { knowledge: 100 }
      },
      walletSecurity: {
        ...state.research?.walletSecurity,
        researched: state.research?.walletSecurity?.researched || false,
        cost: state.research?.walletSecurity?.cost || { knowledge: 175 }
      },
      cryptoCurrencyBasics: {
        ...state.research?.cryptoCurrencyBasics,
        researched: state.research?.cryptoCurrencyBasics?.researched || false,
        cost: state.research?.cryptoCurrencyBasics?.cost || { knowledge: 200 }
      },
      algorithmOptimization: {
        ...state.research?.algorithmOptimization,
        researched: state.research?.algorithmOptimization?.researched || false,
        cost: state.research?.algorithmOptimization?.cost || { knowledge: 150, usdt: 100 }
      }
    }
  };
};

export const checkBuildingUnlocks = (buildingId: { buildingId: string }) => {
  // Заглушка для функции
  return buildingId;
};

export const checkUnlocks = () => {
  // Заглушка для функции
  return null;
};
