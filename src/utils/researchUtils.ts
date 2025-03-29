
import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

// Форматирование эффектов улучшений
export const formatEffectName = (effectId: string) => {
  const effectNameMap: { [key: string]: string } = {
    'knowledgeBoost': 'Прирост знаний',
    'knowledgeMaxBoost': 'Максимум знаний',
    'usdtMaxBoost': 'Максимум USDT',
    'miningEfficiencyBoost': 'Эффективность майнинга',
    'electricityEfficiencyBoost': 'Эффективность электричества',
    'computingPowerBoost': 'Вычислительная мощность',
    'knowledgeEfficiencyBoost': 'Эффективность знаний',
  };
  
  return effectNameMap[effectId] || effectId;
};

export const formatEffect = (effectId: string, value: number) => {
  const effectName = formatEffectName(effectId);
  const sign = value >= 0 ? '+' : '';
  
  // Для процентных эффектов форматируем значение как процент
  if (effectId.includes('Boost')) {
    return `${effectName}: ${sign}${(value * 100)}%`;
  }
  
  return `${effectName}: ${sign}${value}`;
};

// Проверка блокировки исследований
export const checkUnlockConditions = (state: GameState, upgradeId: string) => {
  const upgrade = state.upgrades[upgradeId];
  
  if (!upgrade) return false;
  
  // Если уже разблокировано, возвращаем true
  if (upgrade.unlocked) return true;
  
  // Проверяем наличие требуемых исследований
  if (upgrade.requiredUpgrades && upgrade.requiredUpgrades.length > 0) {
    const areRequiredUpgradesPurchased = upgrade.requiredUpgrades.every(
      reqId => state.upgrades[reqId] && state.upgrades[reqId].purchased
    );
    
    if (!areRequiredUpgradesPurchased) return false;
  }
  
  // Проверяем наличие требуемых зданий
  if (upgrade.requirements?.buildings) {
    for (const [buildingId, count] of Object.entries(upgrade.requirements.buildings)) {
      if (!state.buildings[buildingId] || state.buildings[buildingId].count < (count as number)) {
        return false;
      }
    }
  }
  
  // Проверяем наличие требуемых ресурсов
  if (upgrade.requirements?.resources) {
    for (const [resourceId, amount] of Object.entries(upgrade.requirements.resources)) {
      if (!state.resources[resourceId] || state.resources[resourceId].value < (amount as number)) {
        return false;
      }
    }
  }
  
  return true;
};

// Проверка, является ли исследование любой вариацией "Основ блокчейна"
export const isBlockchainBasicsUnlocked = (state: GameState): boolean => {
  return (
    (state.upgrades.blockchainBasics && state.upgrades.blockchainBasics.purchased) ||
    (state.upgrades.blockchain_basics && state.upgrades.blockchain_basics.purchased) ||
    (state.upgrades.basicBlockchain && state.upgrades.basicBlockchain.purchased)
  );
};

// Получение имени специализации
export const getSpecializationName = (specializationId: string): string => {
  const specializationMap: {[key: string]: string} = {
    'miner': 'Майнер',
    'trader': 'Трейдер',
    'investor': 'Инвестор',
    'influencer': 'Инфлюенсер',
    'analyst': 'Аналитик',
    'defi': 'DeFi'
  };
  
  return specializationMap[specializationId] || specializationId;
};

// Новая функция для централизованной разблокировки исследований
export const unlockRelatedUpgrades = (state: GameState, upgradeId: string): GameState => {
  // Создаем новый объект состояния
  let newState = { ...state };
  const upgrade = state.upgrades[upgradeId];
  
  if (!upgrade) return newState;
  
  console.log(`Проверка разблокировки связанных исследований после покупки: ${upgrade.name}`);
  
  // Карта зависимостей исследований
  const dependencyMap: { [key: string]: { relatedUpgrades: string[], message?: string } } = {
    'blockchainBasics': {
      relatedUpgrades: ['cryptoCurrencyBasics'],
      message: "Открыто исследование «Основы криптовалют»"
    },
    'blockchain_basics': {
      relatedUpgrades: ['cryptoCurrencyBasics'],
      message: "Открыто исследование «Основы криптовалют»"
    },
    'basicBlockchain': {
      relatedUpgrades: ['cryptoCurrencyBasics'],
      message: "Открыто исследование «Основы криптовалют»"
    }
  };
  
  // Если у исследования есть связанные исследования для разблокировки
  if (dependencyMap[upgradeId]) {
    const { relatedUpgrades, message } = dependencyMap[upgradeId];
    
    for (const relatedUpgradeId of relatedUpgrades) {
      if (newState.upgrades[relatedUpgradeId] && !newState.upgrades[relatedUpgradeId].unlocked) {
        newState.upgrades[relatedUpgradeId] = {
          ...newState.upgrades[relatedUpgradeId],
          unlocked: true
        };
        
        console.log(`Разблокировано связанное исследование: ${relatedUpgradeId}`);
        
        if (message) {
          safeDispatchGameEvent(message, "success");
        }
      }
    }
  }
  
  return newState;
};

// Новая функция для централизованной разблокировки зданий после исследований
export const unlockRelatedBuildings = (state: GameState, upgradeId: string): GameState => {
  // Создаем новый объект состояния
  let newState = { ...state };
  const upgrade = state.upgrades[upgradeId];
  
  if (!upgrade) return newState;
  
  console.log(`Проверка разблокировки связанных зданий после исследования: ${upgrade.name}`);
  
  // Карта зависимостей исследований → здания
  const buildingDependencyMap: { [key: string]: { buildings: string[], message?: string } } = {
    'blockchainBasics': {
      buildings: ['cryptoWallet'],
      message: "Открыта возможность приобрести «Криптокошелек»"
    },
    'blockchain_basics': {
      buildings: ['cryptoWallet'],
      message: "Открыта возможность приобрести «Криптокошелек»"
    },
    'basicBlockchain': {
      buildings: ['cryptoWallet'],
      message: "Открыта возможность приобрести «Криптокошелек»"
    },
    'walletSecurity': {
      buildings: ['improvedWallet'],
      message: "Открыта возможность приобрести «Улучшенный кошелек»"
    }
  };
  
  // Если у исследования есть связанные здания для разблокировки
  if (buildingDependencyMap[upgradeId]) {
    const { buildings, message } = buildingDependencyMap[upgradeId];
    
    for (const buildingId of buildings) {
      if (newState.buildings[buildingId] && !newState.buildings[buildingId].unlocked) {
        newState.buildings[buildingId] = {
          ...newState.buildings[buildingId],
          unlocked: true
        };
        
        console.log(`Разблокировано связанное здание: ${buildingId}`);
        
        if (message) {
          safeDispatchGameEvent(message, "success");
        }
      }
    }
  }
  
  return newState;
};
