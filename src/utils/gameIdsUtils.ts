
// Типы для игровых идентификаторов
export interface GameIdsType {
  resources: Record<string, string>;
  buildings: Record<string, string>;
  upgrades: Record<string, string>;
  features: Record<string, string>;
}

// Игровые идентификаторы
export const gameIds: GameIdsType = {
  resources: {
    knowledge: 'knowledge',
    usdt: 'usdt',
    electricity: 'electricity',
    computingPower: 'computingPower',
    btc: 'btc'
  },
  buildings: {
    practice: 'practice',
    generator: 'generator',
    homeComputer: 'homeComputer',
    cryptoWallet: 'cryptoWallet',
    internetChannel: 'internetChannel',
    miner: 'miner',
    cryptoLibrary: 'cryptoLibrary',
    coolingSystem: 'coolingSystem',
    improvedWallet: 'improvedWallet'
  },
  upgrades: {
    blockchainBasics: 'blockchainBasics',
    walletSecurity: 'walletSecurity',
    cryptoBasics: 'cryptoBasics',
    algorithmOptimization: 'algorithmOptimization',
    proofOfWork: 'proofOfWork',
    energyEfficientComponents: 'energyEfficientComponents',
    cryptoTrading: 'cryptoTrading',
    tradingBot: 'tradingBot'
  },
  features: {
    research: 'research',
    trading: 'trading',
    specialization: 'specialization',
    autoClick: 'autoClick',
    autoExchange: 'autoExchange'
  }
};

/**
 * Получает безопасный ID игрового элемента
 * @param type Тип элемента (resources, buildings, upgrades, features)
 * @param id ID элемента
 * @param fallback Значение по умолчанию, если ID не найден
 * @returns Безопасный ID элемента
 */
export const getSafeGameId = (
  type: 'resources' | 'buildings' | 'upgrades' | 'features',
  id: string,
  fallback?: string
): string => {
  const category = gameIds[type];
  
  if (!category) {
    return fallback || id;
  }
  
  const safeId = category[id];
  
  return safeId || fallback || id;
};
