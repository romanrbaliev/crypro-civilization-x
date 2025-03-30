
import { GameState } from '@/context/types';

/**
 * Проверяет все условия разблокировок и обновляет состояние
 */
export const checkAllUnlocks = (state: GameState): GameState => {
  console.log("checkAllUnlocks: Проверка всех разблокировок");
  
  // Последовательно проверяем все типы разблокировок
  let updatedState = checkSpecialUnlocks(state);
  updatedState = checkResourceUnlocks(updatedState);
  updatedState = checkBuildingUnlocks(updatedState);
  updatedState = checkUpgradeUnlocks(updatedState);
  updatedState = checkActionUnlocks(updatedState);
  
  return updatedState;
};

/**
 * Проверяет разблокировку кнопки "Применить знания"
 */
const shouldUnlockApplyKnowledge = (state: GameState): boolean => {
  // Проверяем количество кликов на кнопку "Изучить крипту"
  const knowledgeClicks = state.counters.knowledgeClicks?.value || 0;
  
  // Разблокируем после 3-х кликов
  const shouldUnlock = knowledgeClicks >= 3;
  
  console.log(`Проверка разблокировки "Применить знания": клики=${knowledgeClicks}, разблокировать=${shouldUnlock}`);
  
  return shouldUnlock;
};

/**
 * Проверяет разблокировку "Практики"
 */
const shouldUnlockPractice = (state: GameState): boolean => {
  // Проверяем количество применений знаний
  const applyKnowledgeCounter = state.counters.applyKnowledge;
  
  if (!applyKnowledgeCounter) {
    console.log("Счетчик применений знаний не существует");
    return false;
  }
  
  const applyKnowledgeCount = typeof applyKnowledgeCounter === 'object' 
    ? applyKnowledgeCounter.value 
    : applyKnowledgeCounter;
  
  // Проверяем существует ли здание practice и разблокировано ли оно
  const practiceExists = !!state.buildings.practice;
  const practiceUnlocked = practiceExists && state.buildings.practice.unlocked;
  
  // Проверяем разблокировку
  const practiceInUnlocks = state.unlocks.practice === true;
  
  console.log("shouldUnlockPractice:");
  console.log("- applyKnowledge значение:", applyKnowledgeCount);
  console.log("- practice существует:", practiceExists);
  console.log("- practice разблокирован:", practiceUnlocked);
  console.log("- practice в unlocks:", practiceInUnlocks);
  
  // Практика разблокируется после 2-х использований "Применить знания" и если еще не разблокирована
  const shouldUnlock = applyKnowledgeCount >= 2 && !practiceUnlocked && !practiceInUnlocks;
  
  console.log("- Результат проверки разблокировки практики:", shouldUnlock);
  
  return shouldUnlock;
};

/**
 * Проверяет разблокировку "Генератора"
 */
const shouldUnlockGenerator = (state: GameState): boolean => {
  // Генератор разблокируется, когда USDT разблокирован и его значение >= 11
  const usdtResource = state.resources.usdt;
  
  if (!usdtResource || !usdtResource.unlocked) {
    console.log("USDT не разблокирован, генератор недоступен");
    return false;
  }
  
  const generatorUnlocked = state.buildings.generator && state.buildings.generator.unlocked;
  
  console.log("shouldUnlockGenerator:");
  console.log("- USDT значение:", usdtResource.value);
  console.log("- USDT разблокирован:", usdtResource.unlocked);
  console.log("- Генератор разблокирован:", !!generatorUnlocked);
  
  // Генератор разблокируется при наличии 11+ USDT
  const shouldUnlock = usdtResource.value >= 11 && !generatorUnlocked;
  
  console.log("- Результат проверки разблокировки генератора:", shouldUnlock);
  
  return shouldUnlock;
};

/**
 * Проверяет разблокировку "Исследований"
 */
const shouldUnlockResearch = (state: GameState): boolean => {
  // Исследования разблокируются, когда есть Генератор
  const generatorExists = state.buildings.generator && state.buildings.generator.count > 0;
  const researchUnlocked = state.unlocks.research === true;
  
  return generatorExists && !researchUnlocked;
};

/**
 * Проверяет специальные разблокировки, зависящие от счетчиков и других условий
 */
export const checkSpecialUnlocks = (state: GameState): GameState => {
  console.log("checkSpecialUnlocks: Проверка специальных разблокировок");
  
  let updatedState = { ...state };
  let updated = false;
  
  // Проверка разблокировки кнопки "Применить знания"
  if (!updatedState.unlocks.applyKnowledge && shouldUnlockApplyKnowledge(updatedState)) {
    console.log("Разблокировка кнопки 'Применить знания'");
    updatedState = {
      ...updatedState,
      unlocks: {
        ...updatedState.unlocks,
        applyKnowledge: true
      }
    };
    updated = true;
  }
  
  // Проверка разблокировки USDT
  if (!updatedState.resources.usdt?.unlocked && updatedState.counters.applyKnowledge && updatedState.counters.applyKnowledge.value >= 1) {
    console.log("Разблокировка ресурса USDT");
    updatedState = {
      ...updatedState,
      resources: {
        ...updatedState.resources,
        usdt: {
          ...(updatedState.resources.usdt || {
            id: "usdt",
            name: "USDT",
            description: "Стейблкоин, привязанный к доллару США",
            value: 0,
            baseProduction: 0,
            production: 0,
            perSecond: 0,
            max: 50,
            unlocked: true,
            type: "currency",
            icon: "usdt"
          }),
          unlocked: true
        }
      }
    };
    updated = true;
  }
  
  // Проверка разблокировки практики
  if (shouldUnlockPractice(updatedState)) {
    console.log("Разблокировка практики");
    
    // Создаем здание практики, если его нет
    if (!updatedState.buildings.practice) {
      updatedState = {
        ...updatedState,
        buildings: {
          ...updatedState.buildings,
          practice: {
            id: "practice",
            name: "Практика",
            description: "Автоматически генерирует знания о криптовалютах",
            count: 0,
            cost: { usdt: 10 },
            costMultiplier: 1.15,
            production: { knowledge: 0.63 },
            unlocked: true,
            productionBoost: 0,
            unlockedBy: "applyKnowledge"
          }
        },
        unlocks: {
          ...updatedState.unlocks,
          practice: true
        }
      };
    } else {
      // Просто разблокируем существующее здание
      updatedState = {
        ...updatedState,
        buildings: {
          ...updatedState.buildings,
          practice: {
            ...updatedState.buildings.practice,
            unlocked: true
          }
        },
        unlocks: {
          ...updatedState.unlocks,
          practice: true
        }
      };
    }
    updated = true;
  }
  
  // Проверка разблокировки генератора
  if (shouldUnlockGenerator(updatedState)) {
    console.log("Разблокировка генератора");
    
    // Создаем здание генератора, если его нет
    if (!updatedState.buildings.generator) {
      updatedState = {
        ...updatedState,
        buildings: {
          ...updatedState.buildings,
          generator: {
            id: "generator",
            name: "Генератор",
            description: "Производит электричество для ваших устройств",
            count: 0,
            cost: { usdt: 25 },
            costMultiplier: 1.15,
            production: { electricity: 0.5 },
            unlocked: true,
            productionBoost: 0,
            unlockedBy: "usdt"
          }
        }
      };
    } else {
      // Просто разблокируем существующее здание
      updatedState = {
        ...updatedState,
        buildings: {
          ...updatedState.buildings,
          generator: {
            ...updatedState.buildings.generator,
            unlocked: true
          }
        }
      };
    }
    updated = true;
  }
  
  // Проверка разблокировки раздела исследований
  if (shouldUnlockResearch(updatedState)) {
    console.log("Разблокировка раздела исследований");
    updatedState = {
      ...updatedState,
      unlocks: {
        ...updatedState.unlocks,
        research: true
      }
    };
    updated = true;
  }
  
  if (updated) {
    console.log("Обновлены специальные разблокировки");
  } else {
    console.log("Нет новых специальных разблокировок");
  }
  
  return updatedState;
};

/**
 * Проверяет разблокировки ресурсов на основе требований
 */
export const checkResourceUnlocks = (state: GameState): GameState => {
  console.log("checkResourceUnlocks: Проверка разблокировок ресурсов");
  
  // Электричество разблокируется, когда есть генератор
  const shouldUnlockElectricity = state.buildings.generator && 
                                  state.buildings.generator.unlocked && 
                                  !state.resources.electricity?.unlocked;
  
  // Вычислительная мощность разблокируется, когда есть электричество
  const shouldUnlockComputingPower = state.resources.electricity?.unlocked && 
                                    !state.resources.computingPower?.unlocked;
  
  let updatedState = { ...state };
  let updated = false;
  
  if (shouldUnlockElectricity) {
    console.log("Разблокировка ресурса Электричество");
    updatedState = {
      ...updatedState,
      resources: {
        ...updatedState.resources,
        electricity: {
          ...(updatedState.resources.electricity || {
            id: "electricity",
            name: "Электричество",
            description: "Энергия для питания устройств",
            value: 0,
            baseProduction: 0,
            production: 0,
            perSecond: 0,
            max: 1000,
            unlocked: true,
            type: "resource",
            icon: "electricity"
          }),
          unlocked: true
        }
      }
    };
    updated = true;
  }
  
  if (shouldUnlockComputingPower) {
    console.log("Разблокировка ресурса Вычислительная мощность");
    updatedState = {
      ...updatedState,
      resources: {
        ...updatedState.resources,
        computingPower: {
          ...(updatedState.resources.computingPower || {
            id: "computingPower",
            name: "Вычислительная мощность",
            description: "Используется для майнинга и анализа данных",
            value: 0,
            baseProduction: 0,
            production: 0,
            perSecond: 0,
            max: 1000,
            unlocked: true,
            type: "resource",
            icon: "computingPower"
          }),
          unlocked: true
        }
      }
    };
    updated = true;
  }
  
  if (updated) {
    console.log("Обновлены разблокировки ресурсов");
  } else {
    console.log("Нет новых разблокировок ресурсов");
  }
  
  return updatedState;
};

/**
 * Проверяет разблокировки зданий на основе требований
 */
export const checkBuildingUnlocks = (state: GameState): GameState => {
  console.log("checkBuildingUnlocks: Проверка разблокировок зданий");
  
  // Компьютер разблокируется, когда есть электричество и его значение >= 10
  const shouldUnlockComputer = state.resources.electricity?.unlocked && 
                              state.resources.electricity.value >= 10 && 
                              !state.buildings.computer?.unlocked;
  
  // Криптокошелек разблокируется после исследования "Основы блокчейна"
  const shouldUnlockWallet = state.upgrades.blockchainBasics?.purchased && 
                            !state.buildings.cryptoWallet?.unlocked;
  
  let updatedState = { ...state };
  let updated = false;
  
  if (shouldUnlockComputer) {
    console.log("Разблокировка здания Компьютер");
    updatedState = {
      ...updatedState,
      buildings: {
        ...updatedState.buildings,
        computer: {
          ...(updatedState.buildings.computer || {
            id: "computer",
            name: "Домашний компьютер",
            description: "Обеспечивает вычислительную мощность для работы",
            count: 0,
            cost: { usdt: 30 },
            costMultiplier: 1.15,
            production: { computingPower: 2 },
            consumption: { electricity: 1 },
            unlocked: true,
            productionBoost: 0,
            unlockedBy: "electricity"
          }),
          unlocked: true
        }
      }
    };
    updated = true;
  }
  
  if (shouldUnlockWallet) {
    console.log("Разблокировка здания Криптокошелек");
    updatedState = {
      ...updatedState,
      buildings: {
        ...updatedState.buildings,
        cryptoWallet: {
          ...(updatedState.buildings.cryptoWallet || {
            id: "cryptoWallet",
            name: "Криптокошелек",
            description: "Увеличивает максимальное хранение USDT",
            count: 0,
            cost: { usdt: 15, knowledge: 25 },
            costMultiplier: 1.2,
            production: {}, // Пустой объект production, т.к. это обязательное поле
            productionBoost: 0,
            unlocked: true,
            unlockedBy: "blockchainBasics"
          }),
          unlocked: true
        }
      }
    };
    updated = true;
  }
  
  if (updated) {
    console.log("Обновлены разблокировки зданий");
  } else {
    console.log("Нет новых разблокировок зданий");
  }
  
  return updatedState;
};

/**
 * Проверяет разблокировки исследований на основе требований
 */
export const checkUpgradeUnlocks = (state: GameState): GameState => {
  console.log("checkUpgradeUnlocks: Проверка разблокировок исследований");
  
  // "Основы блокчейна" разблокируются, когда есть генератор
  const shouldUnlockBlockchainBasics = state.buildings.generator && 
                                      state.buildings.generator.count > 0 && 
                                      !state.upgrades.blockchainBasics?.unlocked;
  
  let updatedState = { ...state };
  let updated = false;
  
  if (shouldUnlockBlockchainBasics) {
    console.log("Разблокировка исследования Основы блокчейна");
    updatedState = {
      ...updatedState,
      upgrades: {
        ...updatedState.upgrades,
        blockchainBasics: {
          ...(updatedState.upgrades.blockchainBasics || {
            id: "blockchainBasics",
            name: "Основы блокчейна",
            description: "Открывает базовые механики криптовалют и позволяет строить первые здания",
            cost: { knowledge: 50 },
            purchased: false,
            unlocked: true,
            effects: {}, // Пустой объект effects, т.к. это обязательное поле
            effect: {
              maxResources: { knowledge: 50 }
            },
            unlockedBy: "generator"
          }),
          unlocked: true
        }
      }
    };
    updated = true;
  }
  
  if (updated) {
    console.log("Обновлены разблокировки исследований");
  } else {
    console.log("Нет новых разблокировок исследований");
  }
  
  return updatedState;
};

/**
 * Проверяет разблокировки действий на основе требований
 */
export const checkActionUnlocks = (state: GameState): GameState => {
  // Пока нет специфических действий для разблокировки
  return state;
};

export default checkAllUnlocks;
