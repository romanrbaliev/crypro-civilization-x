
/**
 * Утилита для нормализации ID в состоянии игры
 */

// Карта соответствия старых и новых ID объектов
const idMap = {
  // Исследования
  'basicBlockchain': 'blockchainBasics',
  'blockchain_basics': 'blockchainBasics',
  'algorithmsOptimization': 'algorithmOptimization',
  'cryptoWalletSecurity': 'walletSecurity',
  'cryptoCurrencies': 'cryptoCurrencyBasics',
  'energy_efficient': 'energyEfficientComponents',
  'community': 'cryptoCommunity',
  'socialNetworking': 'cryptoCommunity',
  
  // Здания
  'cooling': 'coolingSystem',
  'coolingSystem': 'coolingSystem',
  'improved_wallet': 'enhancedWallet',
  'enhancedWallet': 'enhancedWallet',
  'crypto_library': 'cryptoLibrary',
  'library': 'cryptoLibrary',
  
  // Функции/фичи
  'trading': 'cryptoTrading',
  'botTrading': 'tradingBot'
};

/**
 * Нормализует ID объекта
 * @param id Исходный ID
 * @returns Нормализованный ID
 */
export const normalizeId = (id: string): string => {
  return idMap[id] || id;
};

/**
 * Проверяет, существует ли ID в старой или новой форме
 * @param id ID для проверки
 * @param targetId Целевой ID
 * @returns Соответствие
 */
export const matchesId = (id: string, targetId: string): boolean => {
  const normalizedId = normalizeId(id);
  return normalizedId === targetId || id === targetId;
};

/**
 * Проверяет, соответствует ли ID исследованию "Основы блокчейна"
 * @param id ID для проверки
 * @returns Соответствие
 */
export const isBlockchainBasics = (id: string): boolean => {
  return matchesId(id, 'blockchainBasics');
};

/**
 * Проверяет, соответствует ли ID исследованию "Крипто-сообщество"
 * @param id ID для проверки
 * @returns Соответствие
 */
export const isCryptoCommunity = (id: string): boolean => {
  return matchesId(id, 'cryptoCommunity');
};
