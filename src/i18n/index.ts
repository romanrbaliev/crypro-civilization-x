
// Базовый экспорт для i18n
export const useTranslation = (key: string): string => {
  return key;
};

// Типы для i18n
export type SupportedLocale = 'ru' | 'en';
export type TranslationValue = string | number;

// Названия локалей
export const localeNames: Record<SupportedLocale, string> = {
  ru: 'Русский',
  en: 'English'
};

// Импорт для gameIds
export const gameIds = {
  features: {},
  resources: {},
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
  upgrades: {}
};

// Утилита для нормализации ID
export const normalizeId = (id: string): string => {
  return id;
};

// Утилита для получения перевода
export const getTranslation = (key: string): string => {
  return key;
};
