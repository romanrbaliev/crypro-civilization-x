
// Типы для i18n
export type SupportedLocale = 'ru' | 'en';
export type TranslationValue = string | number;

// Названия локалей
export const localeNames: Record<SupportedLocale, string> = {
  ru: 'Русский',
  en: 'English'
};

// Утилита для нормализации ID
export const normalizeId = (id: string): string => {
  return id;
};

// Утилита для получения перевода
export const getTranslation = (key: string): string => {
  return key;
};

// Импорт для gameIds
export const gameIds = {
  features: {
    research: 'research',
    trading: 'trading',
    specialization: 'specialization',
    referrals: 'referrals'
  },
  resources: {
    knowledge: 'knowledge',
    usdt: 'usdt',
    bitcoin: 'bitcoin',
    electricity: 'electricity',
    computingPower: 'computingPower'
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
    improvedWallet: 'improvedWallet',
    enhancedWallet: 'enhancedWallet'
  },
  upgrades: {
    blockchainBasics: 'blockchainBasics',
    walletSecurity: 'walletSecurity',
    cryptoBasics: 'cryptoBasics',
    algorithmOptimization: 'algorithmOptimization',
    proofOfWork: 'proofOfWork',
    energyEfficientComponents: 'energyEfficientComponents'
  }
};
