import { UnlockableItem } from './types';

// Централизованный реестр всех разблокируемых элементов
export const unlockableItemsRegistry: { [itemId: string]: UnlockableItem } = {
  // Ресурсы
  'knowledge': {
    id: 'knowledge',
    type: 'resource',
    name: 'Знания о крипте',
    conditions: [], // Знания разблокированы с самого начала
    autoUnlock: true,
    influencesOthers: false
  },
  'usdt': {
    id: 'usdt',
    type: 'resource',
    name: 'USDT',
    conditions: [
      { 
        id: 'apply_knowledge_once', 
        type: 'counter', 
        targetId: 'applyKnowledge', 
        targetValue: 1, 
        operator: 'gte',
        description: 'Применить знания один раз'
      }
    ],
    autoUnlock: true,
    influencesOthers: true
  },
  'electricity': {
    id: 'electricity',
    type: 'resource',
    name: 'Электричество',
    conditions: [
      { 
        id: 'has_generator', 
        type: 'building', 
        targetId: 'generator', 
        targetValue: 1, 
        operator: 'gte',
        description: 'Иметь хотя бы один генератор'
      }
    ],
    autoUnlock: false,
    influencesOthers: false
  },
  'bitcoin': {
    id: 'bitcoin',
    type: 'resource',
    name: 'Bitcoin',
    conditions: [
      {
        id: 'has_miner',
        type: 'building',
        targetId: 'miner',
        targetValue: 1,
        operator: 'gte',
        description: 'Иметь хотя бы один майнер'
      }
    ],
    autoUnlock: true,
    influencesOthers: false
  },
  
  // Здания
  'practice': {
    id: 'practice',
    type: 'building',
    name: 'Практика',
    conditions: [
      { 
        id: 'apply_knowledge_twice', 
        type: 'counter', 
        targetId: 'applyKnowledge', 
        targetValue: 2, 
        operator: 'gte',
        description: 'Применить знания два раза'
      }
    ],
    autoUnlock: true,
    influencesOthers: false
  },
  'generator': {
    id: 'generator',
    type: 'building',
    name: 'Генератор',
    conditions: [
      { 
        id: 'has_enough_usdt_for_generator', 
        type: 'resource', 
        targetId: 'usdt', 
        targetValue: 11, 
        operator: 'gte',
        description: 'Накопить 11 USDT'
      }
    ],
    autoUnlock: true,
    influencesOthers: true
  },
  'homeComputer': {
    id: 'homeComputer',
    type: 'building',
    name: 'Домашний компьютер',
    conditions: [
      { 
        id: 'has_enough_electricity', 
        type: 'resource', 
        targetId: 'electricity', 
        targetValue: 50, 
        operator: 'gte',
        description: 'Достичь 50 ед. электричества'
      }
    ],
    autoUnlock: true,
    influencesOthers: false
  },
  'cryptoWallet': {
    id: 'cryptoWallet',
    type: 'building',
    name: 'Криптокошелек',
    conditions: [
      { 
        id: 'has_blockchain_basics', 
        type: 'upgrade', 
        targetId: 'blockchainBasics', 
        targetValue: true, 
        operator: 'eq',
        description: 'Изучить Основы блокчейна'
      }
    ],
    autoUnlock: true,
    influencesOthers: false
  },
  'internetChannel': {
    id: 'internetChannel',
    type: 'building',
    name: 'Интернет-канал',
    conditions: [
      { 
        id: 'has_home_computer', 
        type: 'building', 
        targetId: 'homeComputer', 
        targetValue: 1, 
        operator: 'gte',
        description: 'Купить домашний компьютер'
      }
    ],
    autoUnlock: true,
    influencesOthers: false
  },
  'miner': {
    id: 'miner',
    type: 'building',
    name: 'Майнер',
    conditions: [
      { 
        id: 'has_crypto_basics', 
        type: 'upgrade', 
        targetId: 'cryptoBasics', 
        targetValue: true, 
        operator: 'eq',
        description: 'Изучить Основы криптовалют'
      }
    ],
    autoUnlock: true,
    influencesOthers: true
  },
  'cryptoLibrary': {
    id: 'cryptoLibrary',
    type: 'building',
    name: 'Криптобиблиотека',
    conditions: [
      { 
        id: 'has_crypto_basics_for_library', 
        type: 'upgrade', 
        targetId: 'cryptoBasics', 
        targetValue: true, 
        operator: 'eq',
        description: 'Изучить Основы криптовалют'
      }
    ],
    autoUnlock: true,
    influencesOthers: false
  },
  'coolingSystem': {
    id: 'coolingSystem',
    type: 'building',
    name: 'Система охлаждения',
    conditions: [
      { 
        id: 'has_enough_computers', 
        type: 'building', 
        targetId: 'homeComputer', 
        targetValue: 2, 
        operator: 'gte',
        description: 'Иметь хотя бы 2 уровня домашнего компьютера'
      }
    ],
    autoUnlock: true,
    influencesOthers: false
  },
  'enhancedWallet': {
    id: 'enhancedWallet',
    type: 'building',
    name: 'Улучшенный кошелек',
    conditions: [
      { 
        id: 'has_enough_wallets', 
        type: 'building', 
        targetId: 'cryptoWallet', 
        targetValue: 5, 
        operator: 'gte',
        description: 'Иметь хотя бы 5 уровней криптокошелька'
      }
    ],
    autoUnlock: true,
    influencesOthers: false
  },
  
  // Исследования
  'blockchainBasics': {
    id: 'blockchainBasics',
    type: 'upgrade',
    name: 'Основы блокчейна',
    conditions: [
      { 
        id: 'has_generator_for_research', 
        type: 'building', 
        targetId: 'generator', 
        targetValue: 1, 
        operator: 'gte',
        description: 'Иметь хотя бы один генератор'
      }
    ],
    autoUnlock: true,
    influencesOthers: true
  },
  'cryptoWalletSecurity': {
    id: 'cryptoWalletSecurity',
    type: 'upgrade',
    name: 'Безопасность криптокошельков',
    conditions: [
      { 
        id: 'has_crypto_wallet', 
        type: 'building', 
        targetId: 'cryptoWallet', 
        targetValue: 1, 
        operator: 'gte',
        description: 'Купить криптокошелек'
      }
    ],
    autoUnlock: true,
    influencesOthers: false
  },
  'cryptoBasics': {
    id: 'cryptoBasics',
    type: 'upgrade',
    name: 'Основы криптовалют',
    conditions: [
      { 
        id: 'has_enough_wallet_levels', 
        type: 'building', 
        targetId: 'cryptoWallet', 
        targetValue: 2, 
        operator: 'gte',
        description: 'Достичь 2 уровня криптокошелька'
      }
    ],
    autoUnlock: true,
    influencesOthers: true
  },
  'algorithmOptimization': {
    id: 'algorithmOptimization',
    type: 'upgrade',
    name: 'Оптимизация алгоритмов',
    conditions: [
      { 
        id: 'has_miner_for_optimization', 
        type: 'building', 
        targetId: 'miner', 
        targetValue: 1, 
        operator: 'gte',
        description: 'Купить майнер'
      }
    ],
    autoUnlock: true,
    influencesOthers: false
  },
  'proofOfWork': {
    id: 'proofOfWork',
    type: 'upgrade',
    name: 'Proof of Work',
    conditions: [
      { 
        id: 'has_algorithm_optimization', 
        type: 'upgrade', 
        targetId: 'algorithmOptimization', 
        targetValue: true, 
        operator: 'eq',
        description: 'Изучить Оптимизацию алгоритмов'
      }
    ],
    autoUnlock: true,
    influencesOthers: false
  },
  'energyEfficientComponents': {
    id: 'energyEfficientComponents',
    type: 'upgrade',
    name: 'Энергоэффективные компоненты',
    conditions: [
      { 
        id: 'has_cooling_system', 
        type: 'building', 
        targetId: 'coolingSystem', 
        targetValue: 1, 
        operator: 'gte',
        description: 'Купить систему охлаждения'
      }
    ],
    autoUnlock: true,
    influencesOthers: false
  },
  'cryptoTrading': {
    id: 'cryptoTrading',
    type: 'upgrade',
    name: 'Криптовалютный трейдинг',
    conditions: [
      { 
        id: 'has_enhanced_wallet', 
        type: 'building', 
        targetId: 'enhancedWallet', 
        targetValue: 1, 
        operator: 'gte',
        description: 'Купить улучшенный кошелек'
      }
    ],
    autoUnlock: true,
    influencesOthers: false
  },
  'tradingBot': {
    id: 'tradingBot',
    type: 'upgrade',
    name: 'Торговый бот',
    conditions: [
      { 
        id: 'has_crypto_trading', 
        type: 'upgrade', 
        targetId: 'cryptoTrading', 
        targetValue: true, 
        operator: 'eq',
        description: 'Изучить Криптовалютный трейдинг'
      }
    ],
    autoUnlock: true,
    influencesOthers: false
  },
  
  // Функции (разделы приложения)
  'equipment': {
    id: 'equipment',
    type: 'feature',
    name: 'Раздел Оборудование',
    conditions: [
      {
        id: 'has_any_building_unlocked',
        type: 'counter',
        targetId: 'buildingsUnlocked',
        targetValue: 1,
        operator: 'gte',
        description: 'Разблокировано хотя бы одно здание'
      }
    ],
    autoUnlock: true,
    influencesOthers: false
  },
  'research': {
    id: 'research',
    type: 'feature',
    name: 'Раздел Исследования',
    conditions: [
      { 
        id: 'has_generator_for_research_tab', 
        type: 'building', 
        targetId: 'generator', 
        targetValue: 1, 
        operator: 'gte',
        description: 'Иметь хотя бы один генератор'
      }
    ],
    autoUnlock: true,
    influencesOthers: false
  },
  'specialization': {
    id: 'specialization',
    type: 'feature',
    name: 'Раздел Специализация',
    conditions: [
      { 
        id: 'has_crypto_basics_for_specialization', 
        type: 'upgrade', 
        targetId: 'cryptoBasics', 
        targetValue: true, 
        operator: 'eq',
        description: 'Изучить Основы криптовалют'
      }
    ],
    autoUnlock: true,
    influencesOthers: false
  },
  'referrals': {
    id: 'referrals',
    type: 'feature',
    name: 'Раздел Рефералы',
    conditions: [
      { 
        id: 'has_crypto_community', 
        type: 'upgrade', 
        targetId: 'cryptoCommunity', 
        targetValue: true, 
        operator: 'eq',
        description: 'Изучить Криптосообщество'
      }
    ],
    autoUnlock: true,
    influencesOthers: false
  },
  'exchangeBtc': {
    id: 'exchangeBtc',
    type: 'feature',
    name: 'Обмен BTC',
    conditions: [
      {
        id: 'has_bitcoin_for_exchange',
        type: 'resource',
        targetId: 'bitcoin',
        targetValue: 0,
        operator: 'gte',
        description: 'Иметь некоторое количество Bitcoin'
      }
    ],
    autoUnlock: true,
    influencesOthers: false
  },
  'trading': {
    id: 'trading',
    type: 'feature',
    name: 'Раздел Трейдинг',
    conditions: [
      {
        id: 'has_crypto_trading_for_tab',
        type: 'upgrade',
        targetId: 'cryptoTrading',
        targetValue: true,
        operator: 'eq',
        description: 'Изучить Криптовалютный трейдинг'
      }
    ],
    autoUnlock: true,
    influencesOthers: false
  }
};

// Функция для получения элементов по типу
export function getUnlockableItemsByType(type: 'resource' | 'building' | 'upgrade' | 'feature'): UnlockableItem[] {
  return Object.values(unlockableItemsRegistry).filter(item => item.type === type);
}

// Функция для получения имени элемента
export function getItemName(itemId: string): string {
  return unlockableItemsRegistry[itemId]?.name || itemId;
}
