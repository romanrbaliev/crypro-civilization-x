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
  // Разблокировка "Практика" после 2 применений знаний
  {
    targetId: 'practice',
    targetType: 'building',
    counters: [{ id: 'applyKnowledge', minValue: 2 }]
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
  // Разблокировка "Proof of Work" после покупки "Оптимизация алгоритмов"
  {
    targetId: 'proofOfWork',
    targetType: 'upgrade',
    upgrades: [{ id: 'algorithmOptimization', purchased: true }]
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
export const checkUnlockRule = (state: GameState, rule: UnlockRule): boolean => {
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
export const applyUnlock = (state: GameState, rule: UnlockRule): GameState => {
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
  let hasChanges = false;
  
  // Добавляем логирование для проверки зданий
  console.log("Проверка разблокировок. Текущие здания:", Object.entries(state.buildings)
    .map(([id, building]) => `${id}: count=${building.count}, unlocked=${building.unlocked}`)
    .join(', '));
  
  // Дополнительная проверка для проблемных зданий
  const criticalBuildings = ['enhancedWallet', 'cryptoLibrary', 'coolingSystem'];
  for (const id of criticalBuildings) {
    if (state.buildings[id]) {
      console.log(`Состояние здания ${id}: unlocked=${state.buildings[id].unlocked}`);
    } else {
      console.log(`Здание ${id} не найдено в state.buildings`);
    }
  }
  
  for (const rule of unlockRules) {
    const isUnlocked = checkUnlockRule(newState, rule);
    
    if (isUnlocked) {
      // Проверяем, нужно ли применять разблокировку
      let needToApply = false;
      
      switch (rule.targetType) {
        case 'building':
          if (newState.buildings[rule.targetId] && !newState.buildings[rule.targetId].unlocked) {
            needToApply = true;
            console.log(`Условия для разблокировки здания ${rule.targetId} выполнены, применение...`);
          }
          break;
          
        case 'upgrade':
          if (newState.upgrades[rule.targetId] && !newState.upgrades[rule.targetId].unlocked) {
            needToApply = true;
            console.log(`Условия для разблокировки улучшения ${rule.targetId} выполнены, применение...`);
          }
          break;
          
        case 'feature':
          if (!newState.unlocks[rule.targetId]) {
            needToApply = true;
            console.log(`Условия для разблокировки функции ${rule.targetId} выполнены, применение...`);
          }
          break;
      }
      
      if (needToApply) {
        const prevState = newState;
        newState = applyUnlock(newState, rule);
        hasChanges = true;
        
        // Проверяем применилась ли разблокировка
        if (rule.targetType === 'building' && 
            prevState.buildings[rule.targetId]?.unlocked !== newState.buildings[rule.targetId]?.unlocked) {
          console.log(`Разблокировка здания ${rule.targetId} успешно применена`);
        } else if (rule.targetType === 'upgrade' && 
                  prevState.upgrades[rule.targetId]?.unlocked !== newState.upgrades[rule.targetId]?.unlocked) {
          console.log(`Разблокировка улучшения ${rule.targetId} успешно применена`);
        }
      }
    } else if (rule.targetId === 'enhancedWallet' || rule.targetId === 'cryptoLibrary' || 
              rule.targetId === 'coolingSystem' || rule.targetId === 'cryptoCommunity') {
      // Отладочная информация для проблемных элементов
      console.log(`Условия для разблокировки ${rule.targetId} НЕ выполнены. Проверка деталей:`);
      
      // Проверка условий зданий
      if (rule.buildings) {
        for (const condition of rule.buildings) {
          const building = newState.buildings[condition.id];
          console.log(`- Требуется: ${condition.id} (кол-во >= ${condition.minCount}), ` +
                     `Фактически: ${building ? building.count : 'отсутствует'}`);
        }
      }
      
      // Проверка условий улучшений
      if (rule.upgrades) {
        for (const condition of rule.upgrades) {
          const upgrade = newState.upgrades[condition.id];
          console.log(`- Требуется: ${condition.id} (куплено=${condition.purchased}), ` +
                     `Фактически: ${upgrade ? `куплено=${upgrade.purchased}` : 'отсутствует'}`);
        }
      }
    }
  }
  
  // Принудительно разблокируем проблемные здания если выполнены их условия
  newState = forceUnlockCriticalBuildings(newState);
  
  if (hasChanges) {
    console.log("В результате проверки были применены разблокировки");
  } else {
    console.log("Проверка завершена, новых разблокировок не применено");
  }
  
  return newState;
};

/**
 * Принудительно разблокирует критические здания, если выполнены их условия
 */
const forceUnlockCriticalBuildings = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Проверка для Улучшенного кошелька (EnhancedWallet)
  if (newState.buildings.cryptoWallet && newState.buildings.cryptoWallet.count >= 5) {
    if (newState.buildings.enhancedWallet) {
      console.log("Принудительно разблокируем Улучшенный кошелек (enhancedWallet)");
      newState.buildings.enhancedWallet.unlocked = true;
    }
  }
  
  // Проверка для Криптобиблиотеки (CryptoLibrary)
  if (newState.upgrades.cryptoCurrencyBasics && newState.upgrades.cryptoCurrencyBasics.purchased) {
    if (newState.buildings.cryptoLibrary) {
      console.log("Принудительно разблокируем Криптобиблиотеку (cryptoLibrary)");
      newState.buildings.cryptoLibrary.unlocked = true;
    }
  }
  
  // Проверка для Системы охлаждения (CoolingSystem)
  if (newState.buildings.homeComputer && newState.buildings.homeComputer.count >= 2) {
    if (newState.buildings.coolingSystem) {
      console.log("Принудительно разблокируем Систему охлаждения (coolingSystem)");
      newState.buildings.coolingSystem.unlocked = true;
    }
  }
  
  // Проверка для Крипто-сообщества (CryptoCommunity)
  if (newState.upgrades.cryptoCurrencyBasics && newState.upgrades.cryptoCurrencyBasics.purchased && 
      newState.resources.usdt && newState.resources.usdt.value >= 30) {
    if (newState.upgrades.cryptoCommunity) {
      console.log("Принудительно разблокируем Крипто-сообщество (cryptoCommunity)");
      newState.upgrades.cryptoCommunity.unlocked = true;
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
  console.log("Запущена полная перепроверка всех разблокировок");
  
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
  // Сохраняем изначально доступные здания
  if (newState.buildings['practice']) {
    newState.buildings['practice'] = {
      ...newState.buildings['practice'],
      unlocked: checkUnlockRule(newState, unlockRules.find(r => r.targetId === 'practice') || { targetId: 'practice', targetType: 'building' })
    };
  }
  
  // Проверяем и применяем все остальные разблокировки
  newState = checkAllUnlocks(newState);
  
  // Принудительно разблокируем критические здания
  newState = forceUnlockCriticalBuildings(newState);
  
  return newState;
};

// Добавим специальные функции для проверки конкретных типов разблокировок
export const checkBuildingUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Фильтруем только правила для зданий
  const buildingRules = unlockRules.filter(rule => rule.targetType === 'building');
  
  for (const rule of buildingRules) {
    const isUnlocked = checkUnlockRule(newState, rule);
    
    if (isUnlocked && newState.buildings[rule.targetId] && !newState.buildings[rule.targetId].unlocked) {
      newState = applyUnlock(newState, rule);
    }
  }
  
  // Принудительно разблокируем критические здания
  newState = forceUnlockCriticalBuildings(newState);
  
  return newState;
};

export const checkResourceUnlocks = (state: GameState): GameState => {
  // В нашей системе нет отдельных правил для ресурсов, но функция нужна
  // для обратной совместимости с unlockSystem.ts
  return state;
};

export const checkUpgradeUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Фильтруем только правила для улучшений
  const upgradeRules = unlockRules.filter(rule => rule.targetType === 'upgrade');
  
  for (const rule of upgradeRules) {
    const isUnlocked = checkUnlockRule(newState, rule);
    
    if (isUnlocked && newState.upgrades[rule.targetId] && !newState.upgrades[rule.targetId].unlocked) {
      newState = applyUnlock(newState, rule);
    }
  }
  
  return newState;
};

export const checkActionUnlocks = (state: GameState): GameState => {
  // В нашей системе действия включены в общие правила, но функция нужна
  // для обратной совместимости с unlockSystem.ts
  return state;
};

export const checkSpecialUnlocks = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Фильтруем только правила для фич
  const featureRules = unlockRules.filter(rule => rule.targetType === 'feature');
  
  for (const rule of featureRules) {
    const isUnlocked = checkUnlockRule(newState, rule);
    
    if (isUnlocked && !newState.unlocks[rule.targetId]) {
      newState = applyUnlock(newState, rule);
    }
  }
  
  return newState;
};

/**
 * Функция для отладки статуса разблокировок
 * @param state Текущее состояние
 * @returns Объект с информацией о статусе разблокировок
 */
export const debugUnlockStatus = (state: GameState) => {
  const unlocked: string[] = [];
  const locked: string[] = [];
  const steps: string[] = [];
  
  steps.push("🔓 Анализ статуса разблокировок:");
  
  // Проверяем здания
  steps.push("🏗️ Здания:");
  for (const rule of unlockRules.filter(r => r.targetType === 'building')) {
    const conditionsMet = checkUnlockRule(state, rule);
    const currentUnlocked = state.buildings[rule.targetId]?.unlocked || false;
    
    steps.push(`• ${rule.targetId}: ${conditionsMet ? '✅' : '❌'} условия, ${currentUnlocked ? '✅' : '❌'} разблокировано`);
    
    if (currentUnlocked) {
      unlocked.push(`Здание: ${rule.targetId}`);
    } else {
      locked.push(`Здание: ${rule.targetId}`);
    }
  }
  
  // Проверяем улучшения
  steps.push("📚 Исследования:");
  for (const rule of unlockRules.filter(r => r.targetType === 'upgrade')) {
    const conditionsMet = checkUnlockRule(state, rule);
    const currentUnlocked = state.upgrades[rule.targetId]?.unlocked || false;
    
    steps.push(`• ${rule.targetId}: ${conditionsMet ? '✅' : '❌'} условия, ${currentUnlocked ? '✅' : '❌'} разблокировано`);
    
    if (currentUnlocked) {
      unlocked.push(`Исследование: ${rule.targetId}`);
    } else {
      locked.push(`Исследование: ${rule.targetId}`);
    }
  }
  
  // Проверяем фичи
  steps.push("📊 Функции:");
  for (const rule of unlockRules.filter(r => r.targetType === 'feature')) {
    const conditionsMet = checkUnlockRule(state, rule);
    const currentUnlocked = state.unlocks[rule.targetId] || false;
    
    steps.push(`• ${rule.targetId}: ${conditionsMet ? '✅' : '❌'} условия, ${currentUnlocked ? '✅' : '❌'} разблокировано`);
    
    if (currentUnlocked) {
      unlocked.push(`Функция: ${rule.targetId}`);
    } else {
      locked.push(`Функция: ${rule.targetId}`);
    }
  }
  
  // Добавляем специальную проверку для криптосообщества
  const isCryptoCommunityUnlocked = state.upgrades['cryptoCommunity']?.unlocked || false;
  steps.push(`• Особая проверка cryptoCommunity: ${isCryptoCommunityUnlocked ? '✅' : '❌'} разблокировано`);
  
  // Проверка статуса проблемных зданий
  steps.push("🔍 Детальная проверка проблемных элементов:");
  
  // EnhancedWallet
  const walletLevel = state.buildings.cryptoWallet?.count || 0;
  steps.push(`• enhancedWallet: уровень кошелька=${walletLevel}, требуется 5, ` + 
             `unlocked=${state.buildings.enhancedWallet?.unlocked ? '✅' : '❌'}`);
  
  // CryptoLibrary
  const cryptoBasics = state.upgrades.cryptoCurrencyBasics?.purchased || false;
  steps.push(`• cryptoLibrary: основы криптовалют куплены=${cryptoBasics ? '✅' : '❌'}, ` + 
             `unlocked=${state.buildings.cryptoLibrary?.unlocked ? '✅' : '❌'}`);
  
  // CoolingSystem
  const computerLevel = state.buildings.homeComputer?.count || 0;
  steps.push(`• coolingSystem: уровень компьютера=${computerLevel}, требуется 2, ` + 
             `unlocked=${state.buildings.coolingSystem?.unlocked ? '✅' : '❌'}`);
  
  // CryptoCommunity
  const usdtAmount = state.resources.usdt?.value || 0;
  steps.push(`• cryptoCommunity: USDT=${usdtAmount}, требуется 30, основы криптовалют=${cryptoBasics ? '✅' : '❌'}, ` + 
             `unlocked=${state.upgrades.cryptoCommunity?.unlocked ? '✅' : '❌'}`);
  
  // Возвращаем результат анализа
  return {
    unlocked,
    locked,
    steps
  };
};

// Экспортируем все необходимые функции
// ВАЖНО: Удалил дублирующийся экспорт в конце файла!
