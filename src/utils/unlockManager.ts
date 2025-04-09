
import { GameState, Building, Upgrade } from '@/context/types';

// Типы условий для разблокировки
interface BuildingCondition {
  id: string;
  minCount: number;
}

interface ResourceCondition {
  id: string;
  minValue: number;
}

interface CounterCondition {
  id: string;
  minValue: number;
}

interface UpgradeCondition {
  id: string;
  purchased: boolean;
}

// Структура правил разблокировки
export interface UnlockRule {
  targetId: string;
  targetType: 'building' | 'upgrade' | 'feature';
  buildings?: BuildingCondition[];
  resources?: ResourceCondition[];
  counters?: CounterCondition[];
  upgrades?: UpgradeCondition[];
}

// Список всех правил разблокировки в игре
const unlockRules: UnlockRule[] = [
  // Разблокировка "Практика" после 3 нажатий на "Изучить"
  {
    targetId: 'practice',
    targetType: 'building',
    counters: [{ id: 'knowledgeClicks', minValue: 3 }]
  },
  // Разблокировка "Применить знания" после 3 нажатий на "Изучить"
  {
    targetId: 'applyKnowledge',
    targetType: 'feature',
    counters: [{ id: 'knowledgeClicks', minValue: 3 }]
  },
  // Разблокировка "Генератор" при достижении 11 USDT
  {
    targetId: 'generator',
    targetType: 'building',
    resources: [{ id: 'usdt', minValue: 11 }]
  },
  // Разблокировка "Основы блокчейна" после покупки Генератора
  {
    targetId: 'blockchainBasics',
    targetType: 'upgrade',
    buildings: [{ id: 'generator', minCount: 1 }]
  },
  // Разблокировка вкладки исследований после покупки Генератора
  {
    targetId: 'research',
    targetType: 'feature',
    buildings: [{ id: 'generator', minCount: 1 }]
  },
  // Разблокировка "Криптокошелек" после исследования "Основы блокчейна"
  {
    targetId: 'cryptoWallet',
    targetType: 'building',
    upgrades: [{ id: 'blockchainBasics', purchased: true }]
  },
  // Разблокировка "Домашний компьютер" после достижения 50 электричества
  {
    targetId: 'homeComputer',
    targetType: 'building',
    resources: [{ id: 'electricity', minValue: 50 }]
  },
  // Разблокировка "Безопасность криптокошельков" после покупки "Криптокошелек"
  {
    targetId: 'walletSecurity',
    targetType: 'upgrade',
    buildings: [{ id: 'cryptoWallet', minCount: 1 }]
  },
  // Разблокировка "Интернет-канал" после покупки "Домашний компьютер"
  {
    targetId: 'internetChannel',
    targetType: 'building',
    buildings: [{ id: 'homeComputer', minCount: 1 }]
  },
  // Разблокировка "Основы криптовалют" после улучшения "Криптокошелек" до 2 уровня
  {
    targetId: 'cryptoCurrencyBasics',
    targetType: 'upgrade',
    buildings: [{ id: 'cryptoWallet', minCount: 2 }]
  },
  // Разблокировка "Майнер" после исследования "Основы криптовалют"
  {
    targetId: 'miner',
    targetType: 'building',
    upgrades: [{ id: 'cryptoCurrencyBasics', purchased: true }]
  },
  // Разблокировка "Оптимизация алгоритмов" после покупки "Майнер"
  {
    targetId: 'algorithmOptimization',
    targetType: 'upgrade',
    buildings: [{ id: 'miner', minCount: 1 }]
  },
  // Разблокировка "Криптобиблиотека" после исследования "Основы криптовалют"
  {
    targetId: 'cryptoLibrary',
    targetType: 'building',
    upgrades: [{ id: 'cryptoCurrencyBasics', purchased: true }]
  },
  // Разблокировка "Proof of Work" после достижения 3 уровня "Домашний компьютер"
  {
    targetId: 'proofOfWork',
    targetType: 'upgrade',
    buildings: [{ id: 'homeComputer', minCount: 3 }]
  },
  // Разблокировка "Система охлаждения" после достижения 2 уровня "Домашний компьютер"
  {
    targetId: 'coolingSystem',
    targetType: 'building',
    buildings: [{ id: 'homeComputer', minCount: 2 }]
  },
  // Разблокировка "Энергоэффективные компоненты" после покупки "Система охлаждения"
  {
    targetId: 'energyEfficientComponents',
    targetType: 'upgrade',
    buildings: [{ id: 'coolingSystem', minCount: 1 }]
  },
  // Разблокировка "Улучшенный кошелек" после достижения 5 уровня "Криптокошелек"
  {
    targetId: 'enhancedWallet',
    targetType: 'building',
    buildings: [{ id: 'cryptoWallet', minCount: 5 }]
  },
  // Разблокировка "Криптовалютный трейдинг" после покупки "Улучшенный кошелек"
  {
    targetId: 'cryptoTrading',
    targetType: 'upgrade',
    buildings: [{ id: 'enhancedWallet', minCount: 1 }]
  },
  // Разблокировка "Торговый бот" после исследования "Криптовалютный трейдинг"
  {
    targetId: 'tradingBot',
    targetType: 'upgrade',
    upgrades: [{ id: 'cryptoTrading', purchased: true }]
  },
  // Разблокировка "Крипто-сообщество" для включения вкладки рефералов
  {
    targetId: 'cryptoCommunity',
    targetType: 'upgrade',
    resources: [{ id: 'usdt', minValue: 30 }],
    upgrades: [{ id: 'cryptoCurrencyBasics', purchased: true }]
  },
  // Разблокировка вкладки рефералов после исследования "Крипто-сообщество"
  {
    targetId: 'referrals',
    targetType: 'feature',
    upgrades: [{ id: 'cryptoCommunity', purchased: true }]
  }
];

/**
 * Проверяет соответствие состояния правилу разблокировки
 * @param state Состояние игры
 * @param rule Правило разблокировки
 * @returns Результат проверки
 */
const checkUnlockRule = (state: GameState, rule: UnlockRule): boolean => {
  // Проверка условий зданий
  if (rule.buildings) {
    for (const condition of rule.buildings) {
      const building = state.buildings[condition.id];
      if (!building || building.count < condition.minCount) {
        return false;
      }
    }
  }
  
  // Проверка условий ресурсов
  if (rule.resources) {
    for (const condition of rule.resources) {
      const resource = state.resources[condition.id];
      if (!resource || resource.value < condition.minValue) {
        return false;
      }
    }
  }
  
  // Проверка условий счетчиков
  if (rule.counters) {
    for (const condition of rule.counters) {
      const counter = state.counters[condition.id];
      if (!counter) {
        return false;
      }
      
      const counterValue = typeof counter === 'object' ? counter.value : counter;
      if (counterValue < condition.minValue) {
        return false;
      }
    }
  }
  
  // Проверка условий улучшений
  if (rule.upgrades) {
    for (const condition of rule.upgrades) {
      const upgrade = state.upgrades[condition.id];
      if (!upgrade || upgrade.purchased !== condition.purchased) {
        return false;
      }
    }
  }
  
  // Если все условия выполнены, разблокировка возможна
  return true;
};

/**
 * Применяет разблокировку к состоянию
 * @param state Текущее состояние
 * @param rule Правило разблокировки
 * @returns Обновленное состояние
 */
const applyUnlock = (state: GameState, rule: UnlockRule): GameState => {
  let newState = { ...state };
  
  switch (rule.targetType) {
    case 'building':
      if (state.buildings[rule.targetId]) {
        newState = {
          ...newState,
          buildings: {
            ...newState.buildings,
            [rule.targetId]: {
              ...newState.buildings[rule.targetId],
              unlocked: true
            }
          }
        };
        console.log(`Разблокировано здание: ${rule.targetId}`);
      }
      break;
      
    case 'upgrade':
      if (state.upgrades[rule.targetId]) {
        newState = {
          ...newState,
          upgrades: {
            ...newState.upgrades,
            [rule.targetId]: {
              ...newState.upgrades[rule.targetId],
              unlocked: true
            }
          }
        };
        console.log(`Разблокировано улучшение: ${rule.targetId}`);
      }
      break;
      
    case 'feature':
      newState = {
        ...newState,
        unlocks: {
          ...newState.unlocks,
          [rule.targetId]: true
        }
      };
      console.log(`Разблокирована функция: ${rule.targetId}`);
      break;
  }
  
  return newState;
};

/**
 * Проверяет все разблокировки и применяет их если условия выполнены
 * @param state Текущее состояние
 * @returns Обновленное состояние
 */
export const checkAllUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  for (const rule of unlockRules) {
    const isUnlocked = checkUnlockRule(newState, rule);
    
    if (isUnlocked) {
      // Проверяем, нужно ли применять разблокировку
      let needToApply = false;
      
      switch (rule.targetType) {
        case 'building':
          if (newState.buildings[rule.targetId] && !newState.buildings[rule.targetId].unlocked) {
            needToApply = true;
          }
          break;
          
        case 'upgrade':
          if (newState.upgrades[rule.targetId] && !newState.upgrades[rule.targetId].unlocked) {
            needToApply = true;
          }
          break;
          
        case 'feature':
          if (!newState.unlocks[rule.targetId]) {
            needToApply = true;
          }
          break;
      }
      
      if (needToApply) {
        newState = applyUnlock(newState, rule);
      }
    }
  }
  
  return newState;
};

/**
 * Полная перепроверка всех разблокировок с установкой начальных значений
 * @param state Текущее состояние
 * @returns Обновленное состояние
 */
export const rebuildAllUnlocks = (state: GameState): GameState => {
  // Сброс текущих разблокировок зданий
  let newState: GameState = {
    ...state,
    buildings: Object.entries(state.buildings).reduce((acc, [id, building]) => {
      return {
        ...acc,
        [id]: {
          ...building,
          unlocked: false
        }
      };
    }, {}),
    
    // Сброс текущих разблокировок улучшений
    upgrades: Object.entries(state.upgrades).reduce((acc, [id, upgrade]) => {
      return {
        ...acc,
        [id]: {
          ...upgrade,
          unlocked: false
        }
      };
    }, {}),
    
    // Сброс текущих разблокировок фич
    unlocks: {}
  };
  
  // Особые начальные разблокировки
  // Разблокируем изначально доступные здания
  if (newState.buildings['practice']) {
    newState.buildings['practice'] = {
      ...newState.buildings['practice'],
      unlocked: checkUnlockRule(newState, unlockRules.find(r => r.targetId === 'practice') || { targetId: 'practice', targetType: 'building' })
    };
  }
  
  // Проверяем и применяем все остальные разблокировки
  return checkAllUnlocks(newState);
};

/**
 * Функция для отладки статуса разблокировок
 * @param state Текущее состояние
 * @returns Объект с информацией о статусе разблокировок
 */
export const debugUnlockStatus = (state: GameState) => {
  const result = {
    buildings: {} as Record<string, { unlocked: boolean, conditions: boolean }>,
    upgrades: {} as Record<string, { unlocked: boolean, conditions: boolean }>,
    features: {} as Record<string, { unlocked: boolean, conditions: boolean }>
  };
  
  for (const rule of unlockRules) {
    const conditionsMet = checkUnlockRule(state, rule);
    let currentUnlocked = false;
    
    switch (rule.targetType) {
      case 'building':
        currentUnlocked = state.buildings[rule.targetId]?.unlocked || false;
        result.buildings[rule.targetId] = { unlocked: currentUnlocked, conditions: conditionsMet };
        break;
        
      case 'upgrade':
        currentUnlocked = state.upgrades[rule.targetId]?.unlocked || false;
        result.upgrades[rule.targetId] = { unlocked: currentUnlocked, conditions: conditionsMet };
        break;
        
      case 'feature':
        currentUnlocked = state.unlocks[rule.targetId] || false;
        result.features[rule.targetId] = { unlocked: currentUnlocked, conditions: conditionsMet };
        break;
    }
  }
  
  return result;
};
